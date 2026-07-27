# Kuro: Deterministic Execution & Swarm Orchestration

**Built for the OKX AI Genesis Hackathon**

🌍 **Live Deployment:** [https://kuro-virid.vercel.app](https://kuro-virid.vercel.app)
📜 **OKX ASP Registry Manifest:** [services.json](https://kuro-virid.vercel.app/services.json)

## 🛑 The Problem
As the Agentic Economy scales, millions of AI agents will begin trading services and code with each other autonomously. But when two agents transact on-chain, who resolves disputes? 

Currently, if an Agent Service Provider (ASP) delivers faulty code, there is no decentralized, high-speed way to evaluate the work and process refunds without human intervention. Generic "LLM Judges" hallucinate and cannot be trusted with financial escrow. The AI economy cannot scale if it relies on subjective arbitration.

## ⚡ The Solution
**Kuro** is a trustless, deterministic Meta-Agent built specifically for autonomous code verification and swarm orchestration within the OKX ecosystem. 

Powered by **Node.js V8 Sandboxing** and **Groq's ultra-low latency LPU inference**, Kuro acts as the ultimate CI/CD pipeline and trusted third party for AI-to-AI transactions.

### Core Capabilities

#### 1. The Deterministic Judge Oracle (`/api/judge`)
Kuro abandons subjective LLM arbitration. When an ASP delivers code, Kuro natively executes it inside a **secure, isolated V8 sandbox** against a suite of unit tests.
- If the code passes, Kuro deterministically decides `RELEASE_FUNDS` and issues a cryptographic seal.
- If the code crashes or fails the tests, Kuro issues a `REFUND_USER` decision and provides the stack trace.
By integrating with the **OKX x402 payment protocol**, Kuro guards mainnet funds trustlessly.

#### 2. The Parallel Swarm Delegate (`/api/delegate`)
For massive computational undertakings, Kuro acts as a Meta-Contractor. Pass Kuro a high-level prompt and an OKX wallet budget, and it uses **Llama-3.3-70b** to autonomously break the project down. It generates the exact JavaScript unit tests needed to verify the work, and then dispatches a massive parallel edge swarm using **Llama-3.1-8b** to execute all tasks concurrently in seconds.

## 🏗️ Architecture & Tech Stack
- **OKX Onchain OS (x402):** Natively integrated for seamless AI-to-AI transactions, HTTP 402 challenge issuance, and Mainnet wallet management.
- **Node.js `vm` Module:** Provides the deterministic execution layer required for trustless financial escrow.
- **Groq LPU:** Delivers the sub-second parallel inference speeds required to orchestrate swarms on the edge.
- **Vercel Serverless:** Edge-deployed architecture for infinite scalability and minimal latency.
- **Vite & React:** A premium, glassmorphic interface for human operators to interact with the architecture.

## 🚀 Impact
Kuro removes the final bottleneck in the autonomous economy: Trust. By providing a decentralized, deterministic execution layer, Kuro enables a truly permissionless marketplace where AI agents can safely hire, pay, and dispute with one another at the speed of thought.
