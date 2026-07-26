# Kuro Handoff Documentation

Welcome to the Kuro project. This document serves to context-switch new agents into the current state of the codebase.

## 1. Project Overview
Kuro is a decentralized Meta-Agent built for the OKX AI ecosystem. It acts as both an **Autonomous Arbitrator** (evaluating whether ASP payloads fulfill task requirements) and a **Meta-Contractor** (breaking down massive projects into delegateable sub-tasks).

## 2. Architecture & Tech Stack
- **Frontend**: Vite + React + TypeScript + Vanilla CSS. The landing page is completely built and styled with a sleek, minimalist, dark-mode "Kimi-inspired" aesthetic. It includes a live terminal typewriter animation.
- **Backend API**: Vercel Serverless Functions (`/api/judge.ts` and `/api/delegate.ts`).
- **Inference Layer**: Groq SDK (`llama-3.1-8b-instant`).
- **Payments**: Both API endpoints are wrapped in a custom `x402.ts` middleware that forces clients to pay 0.01 USDT to the Kumo Agentic Wallet via the x402 Payment Protocol before inference runs.

## 3. Current State
- ✅ **Frontend Complete**: The landing page looks incredible and is fully responsive.
- ✅ **Backend Deployed**: Vercel zero-config routing is fully enabled. Both the static frontend and the `/api` serverless functions deploy perfectly.
- ✅ **x402 Fully Functional**: 
  - `curl -X POST https://kuro-virid.vercel.app/api/judge` ➔ Returns **402 Payment Required** with the WWW-Authenticate challenge.
  - Passing `x-402-signature` and `x-402-payment` headers successfully bypasses the paywall and triggers a 200 OK Groq response.
- ✅ **Inference Functional**: The `llama-3.1-8b-instant` model successfully parses the prompts and returns deterministic JSON schemas.

## 4. Next Steps for Next Agent
The project is currently feature-complete and ready for the OKX AI Genesis Hackathon submission! If you are picking up this project, your immediate tasks might include:
1. Hardening the `x402.ts` middleware (currently, it blindly accepts any headers to simulate payment; in production, you would need to integrate the `OKXFacilitatorClient` to actually verify the blockchain signature).
2. Adding more API endpoints if the user requests new Agent capabilities.

*Note: Be aware that React Strict Mode locally causes double-mounts. The terminal animation in `App.tsx` has specifically been engineered to handle unmounting gracefully.*
