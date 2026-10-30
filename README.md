FDE Agent Pipeline

A small full-stack project that turns messy support emails into clean, structured data and pushes it into a mock CRM.

Why I built this

Support teams spend a huge amount of time reading emails just to work out who’s writing, how urgent it is, and where it should go. Normal software can’t read free-form text, and letting an LLM write straight into a database is risky because its output changes from run to run.

I wanted to build the layer in between: something that reads the messy input but only hands strict, validated data to the systems behind it.

What it does

There are two parts.

Agent chat. A conversational agent that can call tools to look things up, like checking a customer’s record. It keeps conversation memory, and every tool call and response is written to an audit log.

Data extractor. You paste in a messy email and the model has to return JSON that matches a Zod schema. If the output doesn’t fit the schema, it doesn’t get through. Valid results are pushed to a mock CRM.

Built with
Next.js (App Router)
Vercel AI SDK
Groq (Llama 3 / GPT-OSS)
Zod for tool schemas and structured outputs
Tailwind CSS
Testing it properly

I didn’t want to just say it works, so I wrote a small golden dataset of 5 edge cases and an eval runner:

npx tsx evals/run-evals.ts

My first version of the system prompt scored 20% on extraction. After tightening the prompt over several rounds, it now passes all 5 cases (100%). It’s a small dataset, so I’m treating that as a solid start rather than a guarantee.

Every tool call and AI response is also logged to agent-audit.log, so you can trace exactly what the agent did and why.

Running it locally
Clone the repo
Run npm install
Create a .env.local file and add your Groq key:
   GROQ_API_KEY=your_key_here
Run npm run dev