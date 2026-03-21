import type { VercelRequest, VercelResponse } from "@vercel/node";

const VPN_BASE = "https://193-108-112-87.nip.io";
const VPN_USER = "shalos";
const VPN_PASS = "DkA8j-ddV_fN";
const SERVER_ID = "4a2b39";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, duration } = req.body ?? {};
  if (!name || !duration) {
    return res.status(400).json({ error: "name and duration are required" });
  }

  const auth = Buffer.from(`${VPN_USER}:${VPN_PASS}`).toString("base64");

  try {
    const upstream = await fetch(
      `${VPN_BASE}/api/servers/${SERVER_ID}/clients`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({ name, duration }),
      },
    );

    const body = await upstream.text();

    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/json");
    return res.send(body);
  } catch (err) {
    console.error("VPN proxy error:", err);
    return res.status(502).json({ error: "Failed to reach VPN server" });
  }
}
