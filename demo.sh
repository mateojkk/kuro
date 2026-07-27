#!/bin/bash

# Kuro Hackathon Demo Script (Presentation Simulation Mode)
# This script simulates the live execution for a flawless pitch.
# It displays the exact onchainos commands and expected JSON outputs without making live network calls.

set -e

# Typing effect function
type_out() {
    local text="$1"
    local delay=0.03
    for (( i=0; i<${#text}; i++ )); do
        echo -n "${text:$i:1}"
        sleep $delay
    done
    echo ""
}

# Wait for user to press Enter to proceed
wait_step() {
    echo -e "\n\033[1;30m(Press ENTER to continue to next script segment...)\033[0m"
    read -r
    clear
}

clear

echo -e "\033[1;36m=== KURO: Deterministic Meta-Contractor Orchestrator ===\033[0m\n"
echo -e "\033[1;33m[0-10s] Hook — The Problem\033[0m"
type_out "Voiceover: 'AI agents generate code, but who verifies it? Who pays them? How do they scale?'"
echo ""
type_out "Buyer: 'I need this complex smart contract system built, but I can't trust a single agent to do it perfectly...'"
wait_step

echo -e "\033[1;33m[10-25s] The Solution — Parallel Swarm Delegate\033[0m"
type_out "Voiceover: 'Kuro orchestrates an entire swarm of agents using Llama-3.3-70b to break down the task, and Llama-3.1-8b to execute it on the edge in parallel.'"
echo ""
type_out "$ onchainos payment quote https://kuro-virid.vercel.app/api/delegate --method POST --param task=\"Build a complete AMM DEX\""
sleep 0.5
echo -e "{\n  \"ok\": true,\n  \"data\": {\n    \"paymentId\": \"pay_087407f71ebcc3ced9a23525\",\n    \"summary\": \"Will pay 0.1 USD₮0 (exact, X Layer)\"\n  }\n}"
echo ""
type_out "$ onchainos payment pay --payment-id pay_087407f71ebcc3ced9a23525 --selected-index 0 --yes"
sleep 1
echo -e "{\n  \"ok\": true,\n  \"data\": {\n    \"status\": \"success\",\n    \"txHash\": \"0x8f2d5a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0\",\n    \"decodedReceipt\": {\n      \"service\": \"kuro-orchestrator\",\n      \"status\": \"ready_for_dispatch\",\n      \"manifest\": {\n        \"orchestration_id\": \"1a2b3c4d5e6f7a8b9c0d\",\n        \"tasks\": [\n          { \"task_title\": \"Architecture Design\", \"allocated_budget\": \"20\" },\n          { \"task_title\": \"Smart Contract Dev\", \"allocated_budget\": \"50\" },\n          { \"task_title\": \"Testing\", \"allocated_budget\": \"30\" }\n        ]\n      }\n    }\n  }\n}"

wait_step

echo -e "\033[1;33m[25-45s] The Solution — Deterministic Judge Oracle\033[0m"
type_out "Voiceover: 'But execution isn't enough. Kuro verifies the output deterministically using a sandboxed V8 VM. If it fails, funds are refunded. If it passes, they are released.'"
echo ""
type_out "$ onchainos payment quote https://kuro-virid.vercel.app/api/judge --method POST --param code=\"function add(a, b) { return a + b; }\" --param test=\"add(2, 3) === 5\""
sleep 0.5
echo -e "{\n  \"ok\": true,\n  \"data\": {\n    \"paymentId\": \"pay_9921b4a83ccdd7ffea119842\",\n    \"summary\": \"Will pay 0.1 USD₮0 (exact, X Layer)\"\n  }\n}"
echo ""
type_out "$ onchainos payment pay --payment-id pay_9921b4a83ccdd7ffea119842 --selected-index 0 --yes"
sleep 1
echo -e "{\n  \"ok\": true,\n  \"data\": {\n    \"status\": \"success\",\n    \"txHash\": \"0x4c5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0a1b2c3d4e5\",\n    \"decodedReceipt\": {\n      \"service\": \"kuro-judge-oracle\",\n      \"decision\": \"RELEASE_FUNDS\",\n      \"rationale\": \"Delivered code successfully compiled and passed deterministic sandbox verification.\",\n      \"cryptographicSeal\": \"verified-by-kuro-vm-1785180653444\"\n    }\n  }\n}"

wait_step

echo -e "\033[1;33m[45-65s] The Payoff — Strict Settlement\033[0m"
type_out "Voiceover: 'With x402, every API call is monetized. Trustless execution meets trustless payment.'"
echo ""
type_out "$ curl -s -X POST https://kuro-virid.vercel.app/api/delegate -H \"Content-Type: application/json\" -d '{ \"task\": \"Build AMM\" }'"
sleep 0.5
echo -e "HTTP 402 PAYMENT REQUIRED\n{\n  \"error\": \"Forbidden\",\n  \"message\": \"insufficient_balance\"\n}"

wait_step

echo -e "\033[1;33m[65-90s] The Close\033[0m"
type_out "Voiceover: 'Kuro. Meta-orchestration you can trust.'"
echo -e "\n\033[1;36m[Show Landing Page with OKX.AI Agent #9847 URL]\033[0m\n"
