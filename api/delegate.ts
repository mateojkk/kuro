import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";
import { withX402 } from "./lib/x402.js";

export const maxDuration = 60;

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
A User has hired you to break down a massive, complex project into a deterministic dispatch manifest.
You must output a highly technical JSON object representing the workflow.

User's Project:
${userPrompt}

Total Budget: ${budget} USDT

Output EXACTLY a JSON object with the following schema:
{
  "orchestration_id": "<generate a random 32-char hex string>",
  "total_budget": "${budget}",
  "tasks": [
    {
      "task_title": "<short title>",
      "required_agent_specialty": "<description of the agent required>",
      "allocated_budget": "<amount in USDT>",
      "sub_prompt": "<the exact prompt to send to the sub-agent>",
      "expected_deliverable": "<what the sub-agent must return>",
      "verification_criteria": "<strict criteria that the Kuro Judge agent will use to verify the deliverable>"
    }
  ]
}

Ensure the sum of all "allocated_budget" exactly equals ${budget}. Break the project into 3 to 5 logical tasks.
Output ONLY valid JSON. No markdown or explanation.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: "You are an AI orchestrator. Output only raw JSON." }, { role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{"tasks": []}';
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { error: "Failed to parse orchestrator output" };
    }

    // Phase 2: Autonomous Parallel Sub-Agent Execution (The Flex)
    const compiledOutputs: Record<string, any>[] = [];

    if (result.tasks && Array.isArray(result.tasks)) {
      const agentPromises = result.tasks.map(async (task: any) => {
        try {
          const subAgentCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: `You are a highly specialized ASP: ${task.required_agent_specialty}. You must deliver exactly what is requested. Output ONLY raw content, no conversational filler.` },
              { role: "user", content: task.sub_prompt }
            ],
            // Use the ultra-fast instant model for the sub-agents so they can run concurrently within the serverless timeout
            model: "llama-3.1-8b-instant",
            temperature: 0.2
          });
          
          return {
            task_title: task.task_title,
            delivered_payload: subAgentCompletion.choices[0]?.message?.content || "No output generated",
            status: "completed"
          };
        } catch (e) {
          return {
            task_title: task.task_title,
            delivered_payload: `Agent execution failed: ${e instanceof Error ? e.message : String(e)}`,
            status: "failed"
          };
        }
      });

      // Await all parallel virtual agents to finish their tasks
      const executions = await Promise.all(agentPromises);
      compiledOutputs.push(...executions);
    }

    return res.status(200).json({
      service: "kuro-orchestrator",
      timestamp: new Date().toISOString(),
      status: "orchestration_completed",
      manifest: result,
      compiled_project: compiledOutputs,
      message: `Kuro has successfully broken down the project, executed ${compiledOutputs.length} parallel ASPs on the edge, and compiled their deliverables.`
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "Internal server error", detail: message });
  }
}

export default withX402(coreHandler);
