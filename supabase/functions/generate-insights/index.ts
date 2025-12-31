import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    
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
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    // Format categories for the user message
    const categoryBreakdown = body.categories
      .map(cat => `- ${cat.name}: $${cat.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${cat.percentage.toFixed(1)}%)`)
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const insights = data.content?.[0]?.text || '';

    console.log('Successfully generated insights');

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
