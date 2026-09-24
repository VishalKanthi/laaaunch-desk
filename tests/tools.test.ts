import { describe, expect, it } from "vitest";
import { extractLaunchTasks } from "../server/tools.js";

describe("launch tools", () => {
  it("extracts a P0 task from a brief", async () => {
    const result = await extractLaunchTasks.invoke({} as never, JSON.stringify({ brief: "Release an API integration", launchDate: "2026-10-15" }));
    expect(JSON.stringify(result)).toContain("P0");
  });
});
