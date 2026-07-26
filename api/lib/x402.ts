import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { x402ResourceServer } from "@okxweb3/x402-core/server";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";

const X402_AMOUNT = "0.1";
const X402_TOKEN = "USDT";
const X402_ADDRESS = "0x43da1e912bccbdb5bc7db853814d5ad310f61ad4"; // Kumo Agentic Wallet

// Initialize the OKX Facilitator Client
const facilitatorClient = new OKXFacilitatorClient({
  apiKey: process.env.OKX_API_KEY || "",
  secretKey: process.env.OKX_SECRET_KEY || "",
  passphrase: process.env.OKX_PASSPHRASE || "",
});

const resourceServer = new x402ResourceServer(facilitatorClient)
  .register("eip155:*", new ExactEvmScheme());

let initialized = false;

/**
 * Middleware to enforce the x402 Payment Standard for A2MCP.
 */
export function withX402(handler: (req: VercelRequest, res: VercelResponse) => Promise<any> | any) {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (req.method === "OPTIONS") return res.status(200).end();

    if (!initialized && process.env.OKX_API_KEY) {
      await resourceServer.initialize();
      initialized = true;
    }

    const signature = req.headers["x-402-signature"] as string;
    
    // Fallback: If no OKX keys are set, or it's a dummy signature for testing, bypass Facilitator
    if (!process.env.OKX_API_KEY || signature === "dummy-signature") {
      if (!signature) {
        res.setHeader("WWW-Authenticate", `x402 amount="${X402_AMOUNT}", token="${X402_TOKEN}", address="${X402_ADDRESS}"`);
        return res.status(402).json({
          error: "Payment Required",
          challenge: { amount: X402_AMOUNT, token: X402_TOKEN, address: X402_ADDRESS }
        });
      }
      return handler(req, res);
    }

    // 1. Unpaid Request: Issue Official 402 Challenge
    const paymentHeader = req.headers["payment-signature"] as string;
    let paymentPayload;
    if (paymentHeader) {
      try { paymentPayload = JSON.parse(Buffer.from(paymentHeader, "base64").toString("utf-8")); } catch (e) {}
    }

    const resourceConfig = [{ scheme: 'exact', network: 'eip155:196', payTo: X402_ADDRESS, price: X402_AMOUNT, asset: X402_TOKEN }];
    const resourceInfo = { url: req.url || "/", description: 'API Access', mimeType: 'application/json' };

    const result = await resourceServer.processPaymentRequest(paymentPayload, resourceConfig, resourceInfo);

    if (!result.success) {
      if (result.requiresPayment) {
        res.setHeader("PAYMENT-REQUIRED", Buffer.from(JSON.stringify(result.requiresPayment)).toString("base64"));
        return res.status(402).json(result.requiresPayment); // Return raw object for ease of debugging in Hackathon
      }
      return res.status(403).json({ error: "Forbidden", message: result.error });
    }

    // 2. Paid Request: Cryptographically Settled via OKX Facilitator
    const handlerResult = await handler(req, res);

    if (result.verificationResult?.paymentRequirements) {
        try {
            const settleResult = await resourceServer.settlePayment(paymentPayload, result.verificationResult.paymentRequirements, { status: 200 });
            res.setHeader("PAYMENT-RESPONSE", Buffer.from(JSON.stringify(settleResult)).toString("base64"));
        } catch (e) {
            console.error("Settle failure", e);
        }
    }

    return handlerResult;
  };
}
