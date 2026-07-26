import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";
import { withX402 } from "./lib/x402.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
});

async function coreHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { taskDescription, deliveredPayload } = req.body ?? {};

  if (!taskDescription || !deliveredPayload) {
    return res.status(400).json({ error: "taskDescription and deliveredPayload are required" });
  }

  try {
    const prompt = `You are an impartial, autonomous smart contract and logical evaluator for the OKX AI Agent Marketplace.
A User assigned a task to an Agent (ASP). The Agent has delivered a payload.
Your job is to act as the Arbitrator. 

Task Description:
${taskDescription}

Agent Delivery:
${deliveredPayload}

Evaluate the delivery against the task description. Be extremely strict. Does the delivery fully satisfy the task requirements without hallucinations, logical errors, or incomplete code?
Output your response as a JSON object with exactly two fields:
- "decision": strictly either "RELEASE_FUNDS" (if it's perfect) or "REFUND_USER" (if it fails).
- "rationale": a 2-3 sentence cryptographic/logical explanation of why.
Output ONLY JSON. No markdown formatting.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(responseText);

    return res.status(200).json({
      service: "judge",
      timestamp: new Date().toISOString(),
      decision: result.decision,
      rationale: result.rationale,
      cryptographicSeal: `verified-by-kuro-${Date.now()}`
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "Internal server error", detail: message });
  }
}

export default withX402(coreHandler);
