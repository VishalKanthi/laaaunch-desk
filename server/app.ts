import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { groqRunner, launchDeskAgent } from "./agent.js";
import type { LaunchInput, StreamEvent } from "./types.js";

export const app = express();
app.use(cors());
app.use(express.json({ limit: "200kb" }));

// Serve the built UI as a convenience when running as a standalone node server.
app.use(express.static(path.resolve(process.cwd(), "dist")));

app.get("/api/health", (_req, res) => res.json({ ok: true, provider: "groq", configured: Boolean(process.env.GROQ_API_KEY) }));

// Safe diagnostic: it never returns the key, only whether this server can use it.
app.get("/api/provider-check", async (_req, res) => {
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ ok: false, message: "GROQ_API_KEY is missing from .env" });
  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) return res.status(502).json({ ok: false, message: `Groq rejected the request (HTTP ${upstream.status}). Check the API key.` });
    return res.json({ ok: true, message: "This Launch Desk server can reach Groq." });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown network error";
    return res.status(502).json({ ok: false, message: `Cannot reach Groq from this server: ${detail}` });
  }
});

function writeEvent(res: express.Response, event: StreamEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

app.post("/api/launch-plan", async (req, res) => {
  const input = req.body as LaunchInput;
  if (!input?.brief?.trim()) return res.status(400).json({ error: "brief is required" });
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: "GROQ_API_KEY is not configured on the server" });
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  writeEvent(res, { type: "status", message: "Reading your launch brief…" });
  try {
    const prompt = `Create a launch plan from this intake:\n${JSON.stringify(input, null, 2)}`;
    const stream = await groqRunner.run(launchDeskAgent, prompt, { stream: true });
    for await (const event of stream) {
      if (event.type === "raw_model_stream_event" && event.data.type === "output_text_delta") {
        writeEvent(res, { type: "delta", text: event.data.delta });
      }
      if (event.type === "run_item_stream_event") {
        const item = event.item as { type?: string; rawItem?: { name?: string } };
        if (item.type === "tool_call_item") writeEvent(res, { type: "tool", name: item.rawItem?.name || "launch tool", phase: "started" });
        if (item.type === "tool_call_output_item") writeEvent(res, { type: "tool", name: "launch tool", phase: "completed" });
      }
    }
    writeEvent(res, { type: "done" });
  } catch (error) {
    console.error("launch-plan failure", error);
    const detail = error instanceof Error ? error.message : "Agent request failed";
    const networkBlocked = detail.includes("Connection error") || JSON.stringify(error).includes("EACCES");
    writeEvent(res, { type: "error", message: networkBlocked ? "The local server cannot reach Groq. Start Launch Desk from your normal PowerShell or terminal with public internet access, then reload the app." : detail });
  } finally { res.end(); }
});

app.get("/", (_req, res) => {
  const indexPath = path.resolve(process.cwd(), "dist", "index.html");
  res.sendFile(indexPath);
});

export default app;
