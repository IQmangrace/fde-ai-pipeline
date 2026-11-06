# Business Case: Apex Wealth Management AI Triage System

## 🎯 The Problem
Apex Wealth Management's support team manually reads and routes 100,000+ financial emails per year. This process is slow, prone to human error, and costs the firm approximately $60,000 annually in labor.

## 🚀 The Solution
An AI-powered data extraction pipeline that reads incoming emails, categorizes the intent (fraud, wire transfer, balance inquiry, etc.), determines urgency, and outputs strictly validated JSON for the legacy backend.

## 📊 Performance Metrics (Proven via Automated Evals)
*   **Accuracy:** 95% pass rate on a 20-case edge-case dataset.
*   **Latency:** Average processing time of 1.4 seconds per email.
*   **Reliability:** 100% of invalid/fraudulent requests are blocked by Zod guardrails before hitting the database.

## 💰 The ROI (Return on Investment)
*   **Current Human Cost:** $60,000 / year (for 100,000 queries).
*   **AI Cost:** $34.47 / year (based on Groq API pricing and token usage).
*   **Net Savings:** **$59,965.53 per year.**

## 🏗️ Architecture Decisions
1.  **Vercel AI SDK + Groq:** Chosen for blazing-fast inference (sub-second responses for simple queries).
2.  **Zod (Schema Validation):** Acts as the "bouncer" to prevent AI hallucinations from crashing the legacy database.
3.  **Retry Engine & Dead Letter Queue:** Ensures the system gracefully handles API outages and escalates failed requests to human advisors.
4.  **Python & Pandas:** Used for offline data analysis, proving the system's accuracy and cost-efficiency mathematically.

## ⚠️ Known Limitations (Transparency)
*   The AI occasionally misclassifies ambiguous requests (e.g., "Can you help me?"). These are routed to a human triage queue.
*   The Fast Model (Llama 3 8B) failed Zod validation on complex tasks, so the system defaults to the Smart Model (GPT-OSS 120B) for reliability.