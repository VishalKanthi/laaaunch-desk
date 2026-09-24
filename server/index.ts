import { app } from "./app.js";

const port = Number(process.env.PORT || 8787);
const server = app.listen(port, "127.0.0.1", () => console.log(`Launch Desk API listening on http://localhost:${port}`));
server.on("error", (error) => {
  console.error("Launch Desk server failed to start:", error);
  process.exitCode = 1;
});
server.on("close", () => console.error("Launch Desk server stopped."));
