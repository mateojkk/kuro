import vm from "node:vm";
import Groq from "groq-sdk";

async function testJudge() {
  console.log("=== TESTING DETERMINISTIC JUDGE ===");
  const deliveredPayload = `
    function add(a, b) { return a + b; }
    // A bug: subtract doesn't work!
    function subtract(a, b) { return a + b; } 
  `;
  const taskDescription = `
    if (add(2, 2) !== 4) throw new Error("Add failed!");
    if (subtract(5, 2) !== 3) throw new Error("Subtract failed!");
  `;

  const executableScript = `
    ${deliveredPayload}
    ${taskDescription}
  `;

  const sandbox = { console: { log: () => {} }, Math, Date, JSON };
  vm.createContext(sandbox);

  try {
    const script = new vm.Script(executableScript);
    script.runInContext(sandbox, { timeout: 5000 });
    console.log("Judge Result: RELEASE_FUNDS");
  } catch (err: any) {
    console.log("Judge Result: REFUND_USER");
    console.log("Rationale:", err.message);
  }
}

async function testDelegate() {
  console.log("\n=== TESTING SWARM DELEGATE ===");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const userPrompt = "Build a React login form with a CSS file";
  const budget = "100";

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

  console.log("Phase 1: Generating Manifest...");
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "system", content: "You are an AI orchestrator. Output only raw JSON." }, { role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const responseText = chatCompletion.choices[0]?.message?.content || '{"tasks": []}';
  const result = JSON.parse(responseText);
  console.log("Manifest generated. Tasks:", result.tasks.length);

  console.log("Phase 2: Spawning Swarm...");
  const compiledOutputs: Record<string, any>[] = [];

  const agentPromises = result.tasks.map(async (task: any) => {
    try {
      const subAgentCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: `You are a highly specialized ASP: ${task.required_agent_specialty}. You must deliver exactly what is requested. Output ONLY raw content, no conversational filler.` },
          { role: "user", content: task.sub_prompt }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.2
      });
      return {
        task_title: task.task_title,
        delivered_payload: subAgentCompletion.choices[0]?.message?.content || "No output generated",
        status: "completed"
      };
    } catch (e) {
      return { task_title: task.task_title, status: "failed" };
    }
  });

  const executions = await Promise.all(agentPromises);
  compiledOutputs.push(...executions);

  console.log("Phase 3: Compilation Complete!");
  console.log(JSON.stringify(compiledOutputs, null, 2));
}

async function runAll() {
  await testJudge();
  await testDelegate();
}

runAll();
