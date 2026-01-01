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

interface RecurringItem {
  merchant: string;
  frequency: string;
  amount: number;
  monthlyEquivalent: number;
}

interface Summary {
  totalMonthly: number;
  itemCount: number;
  annualSubscriptionCount: number;
  quarterlySubscriptionCount: number;
  weeklyContribution: number;
  monthlyContribution: number;
  quarterlyContribution: number;
  annualContribution: number;
}

interface RequestBody {
  summary: Summary;
  items: RecurringItem[];
}

serve(async (req) => {
  // Handle CORS preflight
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
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const { summary, items } = body;

    if (!summary || !items) {
      return new Response(
        JSON.stringify({ error: 'Missing summary or items in request.' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Validate summary fields
    if (
      typeof summary.totalMonthly !== 'number' ||
      typeof summary.itemCount !== 'number' ||
      typeof summary.annualSubscriptionCount !== 'number' ||
      typeof summary.quarterlySubscriptionCount !== 'number' ||
      typeof summary.weeklyContribution !== 'number' ||
      typeof summary.monthlyContribution !== 'number' ||
      typeof summary.quarterlyContribution !== 'number' ||
      typeof summary.annualContribution !== 'number'
    ) {
      return new Response(
        JSON.stringify({ error: 'Invalid summary format. Required numeric fields: totalMonthly, itemCount, annualSubscriptionCount, quarterlySubscriptionCount, weeklyContribution, monthlyContribution, quarterlyContribution, annualContribution.' }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Validate items array
    if (!Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: 'Items must be an array.' }),
        { status: 400, headers: responseHeaders }
      );
    }

    for (const item of items) {
      if (
        typeof item.merchant !== 'string' ||
        typeof item.frequency !== 'string' ||
        typeof item.amount !== 'number' ||
        typeof item.monthlyEquivalent !== 'number'
      ) {
        return new Response(
          JSON.stringify({ error: 'Invalid item format. Each item must have merchant (string), frequency (string), amount (number), and monthlyEquivalent (number).' }),
          { status: 400, headers: responseHeaders }
        );
      }
    }

    // Build the prompt
    const systemPrompt = `You are a friendly, helpful financial advisor assistant. You analyze recurring expenses and provide brief, actionable insights. Keep your tone warm and non-judgmental - never use words like "should" or "need to". Instead, frame suggestions as observations and options.

Your response should be 2-4 short paragraphs (no bullet points or headers). Focus on:
1. One interesting observation about their recurring costs
2. Any potential overlaps or redundancies you notice
3. One gentle suggestion if you see a clear opportunity

Be conversational, like a financially-savvy friend giving advice over coffee.`;

    // Format items for the prompt (sanitize merchant names)
    const itemsList = items
      .slice(0, 25) // Limit to top 25 items
      .map(i => `- ${sanitizeString(i.merchant)}: ${sanitizeString(i.frequency)}, $${i.amount.toFixed(2)} (= $${i.monthlyEquivalent.toFixed(2)}/mo)`)
      .join('\n');

    const userMessage = `Here's a summary of someone's recurring expenses:

Total monthly recurring costs: $${summary.totalMonthly.toFixed(2)}/month
Number of recurring expenses: ${summary.itemCount}
Annual subscriptions: ${summary.annualSubscriptionCount} (contributing $${summary.annualContribution.toFixed(2)}/mo)
Quarterly expenses: ${summary.quarterlySubscriptionCount} (contributing $${summary.quarterlyContribution.toFixed(2)}/mo)

Their recurring expenses:
${itemsList}

Please provide brief, friendly insights about their recurring costs. Look for any patterns, potential overlaps (like multiple streaming services), or opportunities they might want to consider.`;

    console.log('Sending request to Anthropic API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: Deno.env.get('CLAUDE_MODEL') || 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          { role: 'user', content: userMessage }
        ],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.content?.[0]?.text || 'Unable to generate insights at this time.';

    console.log('Successfully generated insights');

    return new Response(
      JSON.stringify({ insights }),
      { headers: responseHeaders }
    );

  } catch (error) {
    console.error('Error in generate-recurring-insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        insights: null 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-RateLimit-Remaining': rateLimitResult.remaining.toString() }
      }
    );
  }
});
