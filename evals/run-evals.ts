import { goldenDataset } from './golden-dataset';

// We define exactly what a failure looks like so ESLint is happy
interface EvalFailure {
  id: string;
  expected?: { customerName: string; intent: string; urgency: string };
  actual?: { customerName: string; intent: string; urgency: string };
  error?: unknown;
}

const API_URL = 'http://localhost:3000/api/extract';

async function runEvals() {
  console.log("🚀 Starting Evaluations...\n");
  
  let passed = 0;
  const failures: EvalFailure[] = []; // <-- Applied the strict type here

  for (const testCase of goldenDataset) {
    process.stdout.write(`Testing ${testCase.id}... `);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testCase.input }),
      });

      const aiOutput = await response.json();

      // The Grading Logic
      const nameMatch = aiOutput.customerName === testCase.expected.customerName;
      const intentMatch = aiOutput.intent === testCase.expected.intent;
      const urgencyMatch = aiOutput.urgency === testCase.expected.urgency;

      if (nameMatch && intentMatch && urgencyMatch) {
        passed++;
        console.log("✅ PASS");
      } else {
        console.log("❌ FAIL");
        failures.push({
          id: testCase.id,
          expected: testCase.expected,
          actual: aiOutput,
        });
      }
    } catch (error) {
      console.log("💥 ERROR");
      failures.push({ id: testCase.id, error });
    }
  }

  // Print the Final Report
  const passRate = ((passed / goldenDataset.length) * 100).toFixed(1);
  
  console.log("\n==========================================");
  console.log(`📊 FINAL REPORT: ${passed}/${goldenDataset.length} Passed (${passRate}%)`);
  console.log("==========================================\n");

  if (failures.length > 0) {
    console.log("⚠️ FAILURE CATEGORIES:\n");
    failures.forEach((f) => {
      console.log(`- Test: ${f.id}`);
      console.log(`  Expected:`, f.expected);
      console.log(`  Actual:  `, f.actual || f.error);
      console.log("");
    });
  } else {
    console.log("🎉 PERFECT SCORE! The agent is completely reliable.");
  }
}

runEvals();