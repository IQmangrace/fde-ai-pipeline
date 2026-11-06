import fs from 'fs';
import path from 'path';

// We will store the state in a local JSON file
const DB_PATH = path.join(process.cwd(), 'checkpoint.json');

export function saveCheckpoint(state: Record<string, unknown>) {
  // Add a timestamp to the state
  const dataToSave = {
    ...state,
    lastUpdated: new Date().toISOString(),
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2), 'utf8');
  console.log('💾 State Checkpoint Saved!');
}

export function loadCheckpoint() {
  if (fs.existsSync(DB_PATH)) {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  }
  return null; // No checkpoint found
}

export function clearCheckpoint() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH); // Delete the file
    console.log('🗑️ Checkpoint Cleared.');
  }
}