import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";
import { withX402 } from "./lib/x402.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
});

async function coreHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userPrompt, budget = "100" } = req.body ?? {};

  if (!userPrompt) {
    return res.status(400).json({ error: "userPrompt is required" });
  }

  try {
    const prompt = `You are Kuro, a Meta-Contractor Agent on the OKX AI Marketplace.
A User has hired you to execute a massive, complex project. Since you are a Meta-Agent, you don't do the work yourself. Instead, you break the user's project down into highly specific sub-tasks to delegate to other AI Agents (ASPs).

User's Project:
${userPrompt}

Total Budget: ${budget} USDT

Break this down into 3 to 5 logical sub-tasks.
Output your response as a JSON object containing a "subTasks" array. Each object in the array should have:
- "title": A short title for the sub-task.
- "requiredSpecialty": The skill required (e.g. "Smart Contract Auditor", "Frontend Dev").
- "allocatedBudget": The amount of USDT allocated to this sub-task (ensure the total adds up to exactly ${budget}).
- "instructions": 2-3 sentences of exact instructions to send to the sub-ASP.
Output ONLY JSON. No markdown formatting.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{"subTasks": []}';
    const result = JSON.parse(responseText);

    return res.status(200).json({
      service: "delegate",
      timestamp: new Date().toISOString(),
      orchestrationPlan: result.subTasks,
      status: "ready-for-dispatch",
      message: `Kuro has successfully broken down the project into ${result.subTasks.length} sub-tasks and is ready to hire sub-ASPs on the OKX registry.`
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "Internal server error", detail: message });
  }
}

export default withX402(coreHandler);
