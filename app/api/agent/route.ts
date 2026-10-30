import { groq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText, stepCountIs, tool } from 'ai';
import { z } from 'zod';
import { logEvent } from '@/app/lib/logger'; // <-- Import our new logger

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Get the latest message the user just sent
  const latestMessage = messages[messages.length - 1];
  
  // 1. AUDIT TRAIL: Log the user's input
  logEvent('USER_PROMPT', { 
    role: latestMessage.role, 
    text: latestMessage.parts[0]?.text 
  });

  const result = streamText({
    model: groq('openai/gpt-oss-120b'),
    system: `You are a forward-deployed AI agent...`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),

    tools: {
      getCustomerRecord: tool({
        description: 'Look up a customer record from the database.',
        inputSchema: z.object({
          customerName: z.string().describe('The full name of the customer'),
        }),
        execute: async ({ customerName }: { customerName: string }) => {
          
          // 2. AUDIT TRAIL: Log when the tool is triggered
          logEvent('TOOL_CALL', { tool: 'getCustomerRecord', args: { customerName } });

          if (customerName.toLowerCase() === 'crash') {
            logEvent('TOOL_ERROR', { error: 'Database timeout' });
            throw new Error('Database connection timeout. The service is currently unavailable.');
          }

          if (customerName.toLowerCase().includes('john')) {
            return { name: 'John Doe', status: 'Active', plan: 'Enterprise' };
          }
          return { error: 'Customer not found in the database.' };
        },
      }),
    },
  });

  // 3. AUDIT TRAIL: Log the AI's final text response
  result.text.then((finalText) => {
    logEvent('AGENT_RESPONSE', { text: finalText });
  });

  return result.toUIMessageStreamResponse();
}