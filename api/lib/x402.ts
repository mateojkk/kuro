import type { VercelRequest, VercelResponse } from "@vercel/node";

export function withX402(handler: (req: VercelRequest, res: VercelResponse) => Promise<any> | any) {
  return async (req: VercelRequest, res: VercelResponse) => {
    if (req.method === "OPTIONS") return res.status(200).end();
    return handler(req, res);
  };
}
