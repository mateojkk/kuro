import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { x402ResourceServer } from "@okxweb3/x402-core/server";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";

const X402_AMOUNT = "0.1";
const X402_TOKEN = "USDT";
const X402_ADDRESS = "0x43da1e912bccbdb5bc7db853814d5ad310f61ad4"; // Kumo Agentic Wallet

let resourceServer: any;
let initialized = false;

async function getResourceServer() {
  if (!resourceServer) {
    const facilitatorClient = new OKXFacilitatorClient({
      apiKey: process.env.OKX_API_KEY || "",
      secretKey: process.env.OKX_SECRET_KEY || "",
      passphrase: process.env.OKX_PASSPHRASE || "",
    });

    resourceServer = new x402ResourceServer(facilitatorClient)
      .register("eip155:*", new ExactEvmScheme());
  }

  if (!initialized && process.env.OKX_API_KEY) {
    try {
      await resourceServer.initialize();
      initialized = true;
    } catch (err) {
      console.error("Failed to initialize OKX Facilitator:", err);
      throw err;
    }
  }

  return resourceServer;
}

/**
 * Middleware to enforce the x402 Payment Standard for A2MCP.
 */
export function withX402(handler: (req: VercelRequest, res: VercelResponse) => Promise<any> | any) {
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-402-signature, payment-signature");
    
    if (req.method === "OPTIONS") return res.status(200).end();

    let rs;
    try {
      rs = await getResourceServer();
    } catch (err: any) {
      console.error("Failed to initialize getResourceServer:", err);
      return res.status(500).json({ 
        error: "OKX SDK Initialization Error", 
        details: err.message,
        debug: {
          key: process.env.OKX_API_KEY?.substring(0, 4),
          secretLen: process.env.OKX_SECRET_KEY?.length,
          passLen: process.env.OKX_PASSPHRASE?.length
        }
      });
    }

    const signature = req.headers["x-402-signature"] as string;
    
    // The dummy-signature bypass has been removed for production.
    // All requests must now pass strict OKX X402 payment verification.

    // 1. Unpaid Request: Issue Official 402 Challenge
    if (!signature) {
      res.setHeader("WWW-Authenticate", `x402 amount="${X402_AMOUNT}", token="${X402_TOKEN}", network="${X402_NETWORK}", address="${X402_ADDRESS}"`);
      return res.status(402).json({
        error: "Payment Required",
        challenge: { amount: X402_AMOUNT, token: X402_TOKEN, network: X402_NETWORK, address: X402_ADDRESS }
      });
    }

    // 1. Unpaid Request: Issue Official 402 Challenge
    const paymentHeader = req.headers["payment-signature"] as string;
    let paymentPayload: any;
    if (paymentHeader) {
      try { paymentPayload = JSON.parse(Buffer.from(paymentHeader, "base64").toString("utf-8")); } catch (e) {}
    }

    const resourceConfig: any = { scheme: 'exact', network: 'eip155:196', payTo: X402_ADDRESS, price: X402_AMOUNT, asset: X402_TOKEN };
    const resourceInfo = { url: req.url || "/", description: 'API Access', mimeType: 'application/json' };

    let result: any;
    try {
      result = await rs.processPaymentRequest(paymentPayload, resourceConfig, resourceInfo);
    } catch (sdkError: any) {
      console.error("OKX SDK processPaymentRequest failed:", sdkError);
      return res.status(500).json({ error: "OKX SDK Process Error", details: sdkError.message });
    }

    if (!result.success) {
      if (result.requiresPayment) {
        res.setHeader("PAYMENT-REQUIRED", Buffer.from(JSON.stringify(result.requiresPayment)).toString("base64"));
        return res.status(402).json(result.requiresPayment); // Return raw object for ease of debugging in Hackathon
      }
      return res.status(403).json({ error: "Forbidden", message: result.error });
    }

    // 2. Paid Request: Cryptographically Settled via OKX Facilitator
    const handlerResult = await handler(req, res);

    if (result.success) {
        try {
            const requirements = await rs.buildPaymentRequirements(resourceConfig);
            const matchingRequirements = rs.findMatchingRequirements(requirements, paymentPayload);
            if (matchingRequirements) {
              const settleResult = await rs.settlePayment(paymentPayload, matchingRequirements, { status: 200 });
              res.setHeader("PAYMENT-RESPONSE", Buffer.from(JSON.stringify(settleResult)).toString("base64"));
            }
        } catch (e) {
            console.error("Settle failure", e);
        }
    }

    return handlerResult;
  };
}
