import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_BODY_SIZE = 50 * 1024; // 50KB

// In-memory rate limit store
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();
let requestCount = 0;

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterMinutes?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Cleanup every 100 requests
  requestCount++;
  if (requestCount % 100 === 0) {
    cleanupExpiredEntries();
  }

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const msRemaining = RATE_LIMIT_WINDOW_MS - (now - record.windowStart);
    const minutesRemaining = Math.ceil(msRemaining / 60000);
    return { allowed: false, remaining: 0, retryAfterMinutes: minutesRemaining };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*on\w+\s*=\s*["'][^"']*["'][^>]*>/gi, '')
    .replace(/javascript:/gi, '');
}

interface Category {
  name: string;
  total: number;
  percentage: number;
}

interface RequestBody {
  totalIn: number;
  totalOut: number;
  net: number;
  monthsSpan: number;
  categories: Category[];
  uncategorizedCount: number;
  transactionCount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);

  // Check rate limit
  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfterMinutes} minutes.` }),
      { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const responseHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
  };

  try {
    // Check Content-Length if available
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Request body too large. Maximum size is 50KB.' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Read and validate request body
    let rawBody: string;
    try {
      rawBody = await req.text();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Failed to read request body.' }),
        { status: 400, headers: responseHeaders }
      );
    }

    if (rawBody.length > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Request body too large. Maximum size is 50KB.' }),
        { status: 400, headers: responseHeaders }
      );
    }

    let body: RequestBody;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body.' }),
        { status: 400, headers: responseHeaders }
      );
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: responseHeaders }
      );
    }

    // Validate required fields
    if (
      typeof body.totalIn !== 'number' ||
      typeof body.totalOut !== 'number' ||
      typeof body.net !== 'number' ||
      typeof body.monthsSpan !== 'number' ||
      !Array.isArray(body.categories) ||
      typeof body.uncategorizedCount !== 'number' ||
      typeof body.transactionCount !== 'number'
    ) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body. Required fields: totalIn, totalOut, net, monthsSpan, categories, uncategorizedCount, transactionCount' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Validate categories array
    for (const cat of body.categories) {
      if (typeof cat.name !== 'string' || typeof cat.total !== 'number' || typeof cat.percentage !== 'number') {
        return new Response(
          JSON.stringify({ error: 'Invalid category format. Each category must have name (string), total (number), and percentage (number).' }),
          { status: 400, headers: responseHeaders }
        );
      }
    }

    const systemPrompt = `You are a friendly, non-judgmental financial assistant helping someone understand their spending snapshot. You're warm, supportive, and practical—like a helpful friend who's good with money, not a stern financial advisor.

Keep your response concise (3-4 short paragraphs max). Use a conversational tone. Don't lecture or moralize about spending.

Focus on:
- One interesting observation about their spending patterns
- One thing that seems to be working well (find something positive)
- One gentle suggestion or question to consider

Never say "you should" or "you need to." Instead use phrases like "you might consider" or "one thing that stands out..."

Don't make assumptions about their income, life situation, or goals. Just observe the patterns in the data.

If there's a lot of uncategorized spending, briefly acknowledge it but don't harp on it.`;

    // Format categories for the user message (sanitize category names)
    const categoryBreakdown = body.categories
      .map(cat => `- ${sanitizeString(cat.name)}: $${cat.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${cat.percentage.toFixed(1)}%)`)
      .join('\n');

    const userMessage = `Here's my spending snapshot for the past ${body.monthsSpan} month${body.monthsSpan !== 1 ? 's' : ''}:

Total money in: $${body.totalIn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Total money out: $${body.totalOut.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Net: $${body.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Spending breakdown:
${categoryBreakdown}

${body.transactionCount} total transactions, ${body.uncategorizedCount} uncategorized.

What patterns do you notice?`;

    console.log('Calling Claude API with user message:', userMessage);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate insights' }),
        { status: 500, headers: responseHeaders }
      );
    }

    const data = await response.json();
    const insights = data.content?.[0]?.text || '';

    console.log('Successfully generated insights');

    return new Response(
      JSON.stringify({ insights }),
      { headers: responseHeaders }
    );

  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: responseHeaders }
    );
  }
});
