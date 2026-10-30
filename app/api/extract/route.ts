import { groq } from '@ai-sdk/groq';
import { generateObject } from 'ai'; // Notice we are using generateObject, not streamText
import { z } from 'zod';
import { logEvent } from '@/app/lib/logger';

export const maxDuration = 30;

export async function POST(req: Request) {
  // We expect a simple string prompt from the user
  const { prompt } = await req.json();

  logEvent('EXTRACT_REQUEST', { prompt });

  // This is the magic function for structured data
    const result = await generateObject({
    model: groq('openai/gpt-oss-120b'),
    
    // NEW: Strict business rules for the AI
    system: `You are a data extraction agent for a SaaS company.
             Follow these rules strictly:
             1. customerName: If the user does not provide their name, you MUST output exactly the string "Unknown". Do not use "Anonymous" or leave it blank.
             2. intent: 
                - "billing" = refunds, charges, invoices.
                - "sales" = asking to buy, upgrade, or talk to sales.
                - "support_request" = bugs, crashes, errors, how-to questions.
                - "other" = cancellations, general feedback, greetings.
             3. urgency: 
                - "high" = angry, losing money, demands immediate action.
                - "medium" = a bug or issue that needs fixing but isn't critical.
                - "low" = casual questions, feedback, or greetings.`,
             
    schema: z.object({
      customerName: z.string().describe('The name of the customer.'),
      intent: z.enum(['support_request', 'billing', 'sales', 'other']).describe('The main reason they are contacting us.'),
      urgency: z.enum(['low', 'medium', 'high']).describe('How urgent the request seems based on the tone.'),
      summary: z.string().describe('A one-sentence summary of what they want.'),
    }),
    
    prompt: prompt,
  });

  // 3. We log the clean JSON output
  logEvent('EXTRACT_RESULT', result.object);

  // 4. Return the raw JSON to the frontend
  return Response.json(result.object);
}