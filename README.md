# Launch Desk

Launch Desk is a full-stack launch-planning agent for engineering teams. Submit a product brief, audience, date, constraints, and assets; it first audits what is already present versus missing, then streams an actionable release plan with priorities, risks, owner checklists, launch copy, and decision-critical follow-up questions.

## Stack and architecture

```text
src/             React + Vite launch-intake UI and streamed-response renderer
server/index.ts  Express API; Server-Sent Events bridge
server/agent.ts  OpenAI Agents SDK agent, model, instructions
server/tools.ts  Local function tools and their Zod input schemas
tests/           Fast tool behavior tests
scripts/         End-to-end stream verifier
```

It uses the current `@openai/agents` SDK (`Agent`, `tool`, and `run(..., { stream: true })`) for orchestration and local function tools. The model provider is Groq via its OpenAI-compatible Chat Completions endpoint; it deliberately does not use the deprecated Assistants API. The SDK's OpenAI tracing is not sent when Groq is the model provider.

## Tools

- `extract_launch_tasks` — mandatory first step; converts a brief into P0/P1 work.
- `check_launch_readiness` — applies a scope, quality, operability, messaging, and measurement rubric.
- `generate_owner_checklist` — turns the plan into Engineering, Product, Marketing, and Support actions.
- `draft_channel_copy` — drafts release notes, email, and social copy.

To extend, add a Zod-backed `tool()` in `server/tools.ts`, append it to `launchTools`, and teach its purpose in `server/agent.ts`. For specialist handoffs, define a focused `Agent` in `server/agent.ts` and add it as a handoff once the workflow needs one.

## Local setup

1. Install Node 20+ and dependencies: `npm install`
2. Copy `.env.example` to `.env`.
3. Set `GROQ_API_KEY` in `.env` to a server-side Groq key. Do not prefix it with `VITE_` and do not commit `.env`.
4. Optionally set `GROQ_MODEL`. The default is `openai/gpt-oss-20b`; choose a tool-capable Groq model that your account can access.
5. Run `npm run dev`, then open `http://localhost:5173`. Or run only `npm start` and open `http://localhost:8808` for the self-contained production build.

On Windows, you can also double-click `start-launch-desk.cmd` in this project folder. Keep its terminal window open while using Launch Desk.

The API listens on `http://localhost:8808`; Vite proxies `/api` during development. To run just the backend, use `npm start`.

## Verification

```bash
npm run build
npm test
npm run dev:server
# in another terminal, with the same OPENAI_API_KEY environment
npm run verify:stream
```

`verify:stream` posts a representative launch brief to `/api/launch-plan`, reads the full SSE stream, and fails unless it sees both a real function-tool progress event and a model text delta. This verifies server-to-Groq connectivity, not merely local health or Vite startup.

## Validation checklist

See [VALIDATION.md](VALIDATION.md) for a hands-on behavior, tool, frontend, and end-to-end checklist.
