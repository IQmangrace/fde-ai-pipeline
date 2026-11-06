import fs from 'fs';
import path from 'path';

const DLQ_PATH = path.join(process.cwd(), 'failed_requests.json');

export function escalateToHuman(requestText: string, errorReason: string) {
  let queue = [];

  // Load existing queue if it exists
  if (fs.existsSync(DLQ_PATH)) {
    try {
      queue = JSON.parse(fs.readFileSync(DLQ_PATH, 'utf8'));
    } catch (e) {
      console.error("Failed to parse DLQ", e);
    }
  }

  // Add the new failed request
  const failedItem = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    request: requestText,
    reason: errorReason,
    status: "PENDING_HUMAN_REVIEW"
  };

  queue.push(failedItem);

  // Save back to disk
  fs.writeFileSync(DLQ_PATH, JSON.stringify(queue, null, 2), 'utf8');
  console.log(`🚨 Escalated to DLQ: ${requestText}`);
}