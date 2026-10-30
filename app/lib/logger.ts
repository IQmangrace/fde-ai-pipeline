import fs from 'fs';
import path from 'path';

// We save the log file in the root of your project
const logFilePath = path.join(process.cwd(), 'agent-audit.log');

export function logEvent(eventType: string, data: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  
  // Format the log entry nicely
  const logEntry = `[${timestamp}] [${eventType}] ${JSON.stringify(data)}\n`;

  // Append it to the file (creates the file if it doesn't exist)
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
}