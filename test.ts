import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { x402ResourceServer } from "@okxweb3/x402-core/server";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";

async function test() {
  const facilitatorClient = new OKXFacilitatorClient({
    apiKey: "98e35605-a888-45ce-bb86-9d63a68d6cba",
    secretKey: "438C685045E4E6AE332B0ACD241CD24F",
    passphrase: "KuroOkx1#",
  });

  const resourceServer = new x402ResourceServer(facilitatorClient)
    .register("eip155:*", new ExactEvmScheme());

  try {
    await resourceServer.initialize();
    console.log("Initialize succeeded!");
  } catch (err) {
    console.error("Initialize failed:", err);
  }
}

test().catch(console.error);
