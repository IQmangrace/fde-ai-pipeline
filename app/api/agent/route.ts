import { groq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText, stepCountIs, tool, UIMessage } from 'ai';
import { z } from 'zod';
import { logEvent } from '@/app/lib/logger';
import { escalateToHuman } from '@/app/lib/escalation'; // <-- IMPORTED ESCALATION
import fs from 'fs';
import path from 'path';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const historyPath = path.join(process.cwd(), 'chat-history.json');
  let previousMessages: UIMessage[] = [];
  
  if (fs.existsSync(historyPath)) {
    try {
      previousMessages = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {
      console.error("Failed to parse history", e);
    }
  }

  const latestMessage = messages[messages.length - 1];
  const fullHistory = [...previousMessages, latestMessage];
  fs.writeFileSync(historyPath, JSON.stringify(fullHistory, null, 2), 'utf8');
  
  logEvent('USER_PROMPT', { 
    role: latestMessage.role, 
    text: latestMessage.parts?.[0]?.text 
  });

  try {
    

    const result = streamText({
      model: groq('openai/gpt-oss-120b'),
      system: `You are a forward-deployed AI agent for Apex Wealth Management.
               Your goal is to help the user achieve their task. 
               If the user asks about a customer, use the getCustomerRecord tool.
               If a tool fails, apologize to the user and explain the error.
               Think step-by-step before you answer.`,
               
      messages: await convertToModelMessages(fullHistory),
      stopWhen: stepCountIs(5),

      tools: {
        getCustomerRecord: tool({
          description: 'Look up a customer record from the database.',
          inputSchema: z.object({
            customerName: z.string().describe('The full name of the customer'),
          }),
          execute: async ({ customerName }: { customerName: string }) => {
            
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

    result.text.then((finalText) => {
      logEvent('AGENT_RESPONSE', { text: finalText });
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    // 🚨 DAY 13: If the AI fails completely, escalate to a human
    const errorMessage = error instanceof Error ? error.message : 'Unknown AI Error';
    const userText = latestMessage.parts?.[0]?.text || 'Unknown prompt';
    
    // Save to Dead Letter Queue
    escalateToHuman(userText, errorMessage);
    
    // Return a graceful error to the UI
    return Response.json(
      { error: "The AI system is currently unavailable. Your request has been escalated to a human advisor." },
      { status: 503 }
    );
  }
}