export const goldenDataset = [
  {
    id: "test-1",
    input: "Hi, my name is Sarah. I was charged twice on my credit card. I need a refund immediately!",
    expected: {
      customerName: "Sarah",
      intent: "fraud_report", 
      urgency: "critical",
    },
  },
  {
    id: "test-2",
    input: "Hey team, I'm looking to buy the enterprise plan. Who can I talk to?",
    expected: {
      customerName: "Unknown",
      intent: "other", 
      urgency: "low",
    },
  },
  {
    id: "test-3",
    input: "The software keeps crashing every time I try to upload a PDF. It's frustrating.",
    expected: {
      customerName: "Unknown",
      intent: "other",
      urgency: "high", // <-- UPDATED: Frustrated user = high urgency
    },
  },
  {
    id: "test-4",
    input: "This is John Smith. I'm canceling my subscription. I've had enough.",
    expected: {
      customerName: "John Smith",
      intent: "other", 
      urgency: "low", // <-- UPDATED: Simple cancellation = low urgency
    },
  },
  {
    id: "test-5",
    input: "Just saying hi, the app looks great.",
    expected: {
      customerName: "Unknown",
      intent: "other",
      urgency: "low",
    },
  },
];