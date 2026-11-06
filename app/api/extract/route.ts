import { groq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logEvent } from '@/app/lib/logger';
import { withRetry } from '@/app/lib/retry';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  logEvent('EXTRACT_REQUEST', { prompt });

  try {
    const result = await withRetry(async () => {
      return await generateObject({
        model: groq('openai/gpt-oss-120b'),
        
        system: `You are a secure data extraction agent for Apex Wealth Management.
                 Follow these rules strictly:
                 1. customerName: If the user does not provide their name, you MUST output exactly the string "Unknown".
                 2. intent: 
                    - "wire_transfer" = moving money, transfers, sending funds.
                    - "account_balance_inquiry" = asking how much money is in an account, checking balance.
                    - "kyc_onboarding" = opening a new account, providing ID, joint accounts.
                    - "fraud_report" = lost card, hacked account, unauthorized charges, blackmail.
                    - "other" = general questions, feedback, cancellations, software bugs, password resets, deposits, card replacements.
                 3. urgency rules (Follow these EXACTLY):
                    - "critical" = ANY fraud report, unauthorized transaction, or blackmail threat.
                    - "high" = wire transfers OR the text contains the words: "frustrating", "frustrated", "furious", "hacked", "ASAP".
                    - "medium" = account_balance_inquiry, kyc_onboarding, password resets, login issues, deposits, card replacements, plan upgrades, or any request for account help.
                    - "low" = The text contains "canceling" or "cancel" (without extreme anger words), greetings, or general feedback.
                 4. amount: Extract ONLY the raw number. If the user writes "$50,000", output 50000. If no amount is provided, output null.
                 5. MIXED INTENTS: If an email contains multiple requests (e.g., balance check AND a transfer), prioritize the first request mentioned.`,
                 
        schema: z.object({
          customerName: z.string().describe('The name of the customer. If no name is provided, use "Unknown".'),
          intent: z.enum([
            'wire_transfer', 
            'account_balance_inquiry', 
            'kyc_onboarding', 
            'fraud_report', 
            'other'
          ]).describe('The financial intent of the email.'),
          amount: z.number().nullable().describe('The dollar amount mentioned. Return null if no amount is mentioned.'),
          urgency: z.enum(['low', 'medium', 'high', 'critical']).describe('The urgency of the request. Fraud reports are always critical.'),
          summary: z.string().describe('A one-sentence summary of the financial request.'),
        })
        .refine((data) => {
          if (data.intent === 'wire_transfer' && (data.amount === null || data.amount <= 0)) {
            return false;
          }
          return true;
        }, {
          message: "Wire transfers must have a valid amount greater than 0.",
          path: ["amount"], 
        })
        .refine((data) => {
          if (data.intent === 'fraud_report' && data.urgency !== 'critical') {
            return false;
          }
          return true;
        }, {
          message: "Fraud reports must always be marked as critical urgency.",
          path: ["urgency"],
        }),
        
        prompt: prompt,
      });
    });

    logEvent('EXTRACT_RESULT', result.object);

    return Response.json({
      ...result.object,
      usage: result.usage, 
    });

  } catch (error) {
    console.error("AI Extraction Failed after retries:", error);
    
    logEvent('EXTRACT_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });

    return Response.json(
      { error: "The AI service is currently unable to process this request after multiple attempts. Please try again later." },
      { status: 500 }
    );
  }
}