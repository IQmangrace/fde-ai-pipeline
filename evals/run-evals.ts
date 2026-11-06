import { goldenDataset } from './golden-dataset';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api/extract';
const DLQ_PATH = path.join(process.cwd(), 'failed_requests.json');

interface EvalFailure {
  id: string;
  expected?: { customerName: string; intent: string; urgency: string };
  actual?: { customerName: string; intent: string; urgency: string };
  error?: unknown;
}

async function runEvals() {
  console.log("🚀 Starting Week 2 Reliability Evals...\n");
  
  let passed = 0;
  const totalTests = goldenDataset.length + 2; // +2 for the new system tests
  const failures: EvalFailure[] = [];

  // ==========================================
  // TEST GROUP 1: AI Accuracy & Validation (Days 8-9)
  // ==========================================
  console.log("--- Testing AI Extraction Accuracy ---");
  for (const testCase of goldenDataset) {
    process.stdout.write(`Testing ${testCase.id}... `);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testCase.input }),
      });

      const aiOutput = await response.json();

      const nameMatch = aiOutput.customerName === testCase.expected.customerName;
      const intentMatch = aiOutput.intent === testCase.expected.intent;
      const urgencyMatch = aiOutput.urgency === testCase.expected.urgency;

      if (nameMatch && intentMatch && urgencyMatch) {
        passed++;
        console.log("✅ PASS");
      } else {
        console.log("❌ FAIL");
        failures.push({ id: testCase.id, expected: testCase.expected, actual: aiOutput });
      }
    } catch (error) {
      console.log("💥 ERROR");
      failures.push({ id: testCase.id, error });
    }
  }

  // ==========================================
  // TEST GROUP 2: System Resilience (Days 10-14)
  // ==========================================
  console.log("\n--- Testing System Resilience & State ---");
  
  // Test: Checkpoint File Exists (Day 11 & 12)
  process.stdout.write("Checking if Chat History state persists on disk... ");
  const historyPath = path.join(process.cwd(), 'chat-history.json');
  if (fs.existsSync(historyPath)) {
    console.log("✅ PASS (chat-history.json found)");
    passed++;
  } else {
    console.log("❌ FAIL (No chat history found. Did you test the agent?)");
    failures.push({ id: 'system-history', error: 'chat-history.json missing' });
  }

  // Test: DLQ Escalation (Day 13)
  process.stdout.write("Checking if Failure DLQ file exists... ");
  if (fs.existsSync(DLQ_PATH)) {
    console.log("✅ PASS (failed_requests.json found)");
    passed++;
  } else {
    console.log("❌ FAIL (No DLQ found. Did you trigger a failure?)");
    failures.push({ id: 'system-dlq', error: 'failed_requests.json missing' });
  }

  // ==========================================
  // FINAL REPORT
  // ==========================================
  const passRate = ((passed / totalTests) * 100).toFixed(1);
  
  console.log("\n==========================================");
  console.log(`📊 WEEK 2 RELIABILITY REPORT: ${passed}/${totalTests} Passed (${passRate}%)`);
  console.log("==========================================\n");

  if (failures.length > 0) {
    console.log("⚠️ FAILURE CATEGORIES:\n");
    failures.forEach((f) => {
      console.log(`- Test: ${f.id}`);
      if (f.expected) console.log(`  Expected:`, f.expected);
      if (f.actual) console.log(`  Actual:  `, f.actual);
      if (f.error) console.log(`  Error:   `, f.error);
      console.log("");
    });
  } else {
    console.log("🎉 PERFECT SCORE! Your system is production-ready and resilient.");
  }
}

runEvals();