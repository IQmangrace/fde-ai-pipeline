export const goldenDataset = [
  {
    id: "test-1",
    input: "Hi, my name is Sarah. I was charged twice on my credit card. I need a refund immediately!",
    expected: {
      customerName: "Sarah",
      intent: "billing",
      urgency: "high",
    },
  },
  {
    id: "test-2",
    input: "Hey team, I'm looking to buy the enterprise plan. Who can I talk to?",
    expected: {
      customerName: "Unknown", // The AI should infer this or put a default
      intent: "sales",
      urgency: "low",
    },
  },
  {
    id: "test-3",
    input: "The software keeps crashing every time I try to upload a PDF. It's frustrating.",
    expected: {
      customerName: "Unknown",
      intent: "support_request",
      urgency: "medium",
    },
  },
  {
    id: "test-4",
    input: "This is John Smith. I'm canceling my subscription. I've had enough.",
    expected: {
      customerName: "John Smith",
      intent: "other", // Cancellation isn't billing, sales, or support
      urgency: "high",
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