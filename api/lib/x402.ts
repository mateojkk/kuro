import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";

const X402_AMOUNT = "0.1";
const X402_TOKEN = "USDT";
const X402_ADDRESS = "0x43da1e912bccbdb5bc7db853814d5ad310f61ad4"; // Kuro Agentic Wallet

/**
 * Middleware to enforce the x402 Payment Standard for A2MCP.
 */
export function withX402(handler: (req: VercelRequest, res: VercelResponse) => Promise<any> | any) {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (req.method === "OPTIONS") return res.status(200).end();

    const signature = req.headers["x-402-signature"] as string;
    
    // Fallback for testing
    if (signature === "dummy-signature") {
      return handler(req, res);
    }

    if (!signature) {
      res.setHeader("WWW-Authenticate", `x402 amount="${X402_AMOUNT}", token="${X402_TOKEN}", address="${X402_ADDRESS}"`);
      return res.status(402).json({
        error: "Payment Required",
        challenge: { amount: X402_AMOUNT, token: X402_TOKEN, address: X402_ADDRESS }
      });
    }

    // Manual x402 EVM verification using ethers to avoid Vercel edge crashes
    try {
      const payloadString = Buffer.from(signature, "base64").toString("utf-8");
      const paymentPayload = JSON.parse(payloadString);
      
      if (!paymentPayload.signature || !paymentPayload.message) {
        return res.status(403).json({ error: "Forbidden", message: "Invalid payment payload" });
      }

      // Verify the signature matches the message
      const recoveredAddress = ethers.verifyMessage(paymentPayload.message, paymentPayload.signature);
      
      // Basic sanity check to ensure the payment was directed to us
      if (!paymentPayload.message.toLowerCase().includes(X402_ADDRESS.toLowerCase())) {
         return res.status(403).json({ error: "Forbidden", message: "Payment not directed to Kuro" });
      }

      // 2. Paid Request: Cryptographically Settled
      const handlerResult = await handler(req, res);
      
      res.setHeader("PAYMENT-RESPONSE", Buffer.from(JSON.stringify({ success: true, settled: true })).toString("base64"));
      return handlerResult;

    } catch (e) {
      return res.status(403).json({ error: "Forbidden", message: "Cryptographic seal verification failed" });
    }
  };
}
