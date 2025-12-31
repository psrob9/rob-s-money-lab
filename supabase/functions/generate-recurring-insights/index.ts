import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const { summary, items }: RequestBody = await req.json();

    if (!summary || !items) {
      throw new Error('Missing summary or items in request');
    }

    // Build the prompt
    const systemPrompt = `You are a friendly, helpful financial advisor assistant. You analyze recurring expenses and provide brief, actionable insights. Keep your tone warm and non-judgmental - never use words like "should" or "need to". Instead, frame suggestions as observations and options.

Your response should be 2-4 short paragraphs (no bullet points or headers). Focus on:
1. One interesting observation about their recurring costs
2. Any potential overlaps or redundancies you notice
3. One gentle suggestion if you see a clear opportunity

Be conversational, like a financially-savvy friend giving advice over coffee.`;

    // Format items for the prompt
    const itemsList = items
      .slice(0, 25) // Limit to top 25 items
      .map(i => `- ${i.merchant}: ${i.frequency}, $${i.amount.toFixed(2)} (= $${i.monthlyEquivalent.toFixed(2)}/mo)`)
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
        model: 'claude-sonnet-4-20250514',
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
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
