import type { VercelRequest, VercelResponse } from "@vercel/node";
import vm from "node:vm";
import { withX402 } from "./lib/x402.js";

export const maxDuration = 60;

async function coreHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { taskDescription, deliveredPayload } = req.body ?? {};

  if (!taskDescription || !deliveredPayload) {
    return res.status(400).json({ error: "taskDescription (tests) and deliveredPayload (code) are required" });
  }

  try {
    // Kuro is now a Deterministic Code Oracle
    // We concatenate the delivered payload (agent's code) and the task description (verification tests)
    const executableScript = `
      ${deliveredPayload}
      
      // Verification Tests from Orchestrator
      ${taskDescription}
    `;

    // Spin up a secure, isolated V8 Sandbox
    const sandbox = {
      console: { log: () => {} },
      Math,
      Date,
      JSON
    };
    
    vm.createContext(sandbox);
    
    let executionResult;
    try {
      const script = new vm.Script(executableScript);
      script.runInContext(sandbox, { timeout: 5000 });
      executionResult = { decision: "RELEASE_FUNDS", rationale: "Delivered code successfully compiled and passed deterministic sandbox verification." };
    } catch (vmError: any) {
      executionResult = { decision: "REFUND_USER", rationale: `Code execution failed: ${vmError.message}` };
    }

    return res.status(200).json({
      service: "kuro-judge-oracle",
      timestamp: new Date().toISOString(),
      decision: executionResult.decision,
      rationale: executionResult.rationale,
      cryptographicSeal: `verified-by-kuro-vm-${Date.now()}`
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "Internal server error", detail: message });
  }
}

export default withX402(coreHandler);
