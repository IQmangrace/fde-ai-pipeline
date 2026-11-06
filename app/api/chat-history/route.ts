import fs from 'fs';
import path from 'path';

const HISTORY_PATH = path.join(process.cwd(), 'chat-history.json');

// GET: Load the history
export async function GET() {
  if (fs.existsSync(HISTORY_PATH)) {
    const data = fs.readFileSync(HISTORY_PATH, 'utf8');
    return Response.json(JSON.parse(data));
  }
  return Response.json([]); // Return an empty array if no history exists
}

// POST: Save the history
export async function POST(req: Request) {
  const messages = await req.json();
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(messages, null, 2), 'utf8');
  return Response.json({ success: true });
}

// DELETE: Clear the history (for a "New Chat" button)
export async function DELETE() {
  if (fs.existsSync(HISTORY_PATH)) {
    fs.unlinkSync(HISTORY_PATH);
  }
  return Response.json({ success: true });
}