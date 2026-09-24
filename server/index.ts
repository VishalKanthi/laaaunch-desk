import { app } from "./app.js";

const port = Number(process.env.PORT || 8787);
const server = app.listen(port, "0.0.0.0", () => console.log(`Launch Desk API listening on port ${port}`));
server.on("error", (error) => {
  console.error("Launch Desk server failed to start:", error);
  process.exitCode = 1;
});
server.on("close", () => console.error("Launch Desk server stopped."));
