const payload = { brief: "Ship audit logs for enterprise admins with a 2-person engineering team.", audience: "IT admins", launchDate: "2026-10-15", constraints: "No paid media; security review pending", assets: "demo video and screenshots" };
const response = await fetch("http://localhost:8808/api/launch-plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
if (!response.ok || !response.body) throw new Error(`API failed: ${response.status} ${await response.text()}`);
const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "", tool = false, delta = false;
while (true) { const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const messages = buffer.split("\n\n"); buffer = messages.pop() || ""; for (const message of messages) { if (!message.startsWith("data: ")) continue; const event = JSON.parse(message.slice(6)); if (event.type === "tool") tool = true; if (event.type === "delta" && event.text) delta = true; console.log(event.type, event.name || event.text?.slice(0, 70) || ""); } }
if (!tool || !delta) throw new Error(`Stream verification failed: tool=${tool}, text_delta=${delta}`);
console.log("PASS: received tool progress and model text deltas through /api/launch-plan");
