import { loadCheckpoint, clearCheckpoint } from '@/app/lib/checkpoint';

// GET: Load the checkpoint
export async function GET() {
  const state = loadCheckpoint();
  return Response.json({ hasCheckpoint: !!state, state });
}

// DELETE: Clear the checkpoint (once the user is done)
export async function DELETE() {
  clearCheckpoint();
  return Response.json({ success: true });
}