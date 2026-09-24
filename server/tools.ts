import { tool } from "@openai/agents";
import { z } from "zod";

const taskSchema = z.object({ brief: z.string().min(1), launchDate: z.string().optional() });

export const extractLaunchTasks = tool({
  name: "extract_launch_tasks",
  description: "MANDATORY FIRST STEP. Extract concrete, prioritized launch work from the brief before planning. Use for every request.",
  parameters: taskSchema,
  execute: async ({ brief, launchDate }) => {
    const lower = brief.toLowerCase();
    const tasks = [
      ["P0", "Confirm scope, success metric, and go/no-go owner"],
      ["P0", "Complete release candidate, QA regression, and rollback test"],
      ["P0", "Publish support runbook and on-call coverage"],
      ["P1", "Approve launch messaging and channel calendar"],
      ["P1", "Instrument activation and launch health dashboards"],
    ];
    if (lower.includes("api") || lower.includes("integration")) tasks.push(["P0", "Validate API compatibility, rate limits, and migration notes"]);
    return { targetDate: launchDate || "not supplied", tasks: tasks.map(([priority, task]) => ({ priority, task })) };
  },
});

export const checkLaunchReadiness = tool({
  name: "check_launch_readiness",
  description: "Score a launch against the engineering launch-readiness rubric. Use when assessing risks or readiness.",
  parameters: z.object({ brief: z.string(), audience: z.string().optional(), launchDate: z.string().optional(), constraints: z.string().optional(), assets: z.string().optional(), evidence: z.string().optional() }),
  execute: async ({ brief, audience, launchDate, constraints, assets, evidence }) => {
    const combined = `${brief} ${audience || ""} ${launchDate || ""} ${constraints || ""} ${assets || ""} ${evidence || ""}`;
    const missing = [
      !/metric|success|activation|revenue/i.test(brief) && "success metric",
      !/rollback|monitor|alert|qa|test/i.test(combined) && "rollback/monitoring plan",
      !/support|faq|runbook/i.test(combined) && "support material",
      !/legal|privacy|security/i.test(combined) && "security/privacy review status",
    ].filter(Boolean);
    const present = [
      /audience|admin|customer|user|team/i.test(combined) && "target audience or user context",
      /date|launch|ship|release/i.test(combined) && "launch timing or release intent",
      /qa|test|regression/i.test(combined) && "quality or QA signal",
      /rollback|monitor|alert|dashboard/i.test(combined) && "operability or rollback signal",
      /support|faq|runbook|help/i.test(combined) && "support material",
      /security|privacy|legal|soc ?2/i.test(combined) && "security, privacy, or compliance context",
      /screenshot|demo|video|asset|copy|email/i.test(combined) && "launch asset",
    ].filter(Boolean);
    const categories = [
      { name: "Scope & audience", status: audience ? "ready" : "missing", evidence: audience || "No audience supplied" },
      { name: "Launch timing", status: launchDate ? "ready" : "missing", evidence: launchDate || "No launch date supplied" },
      { name: "Quality & release", status: /qa|test|regression|release candidate/i.test(combined) ? "in progress" : "missing", evidence: /qa|test|regression/i.test(combined) ? "QA or testing context supplied" : "No QA evidence supplied" },
      { name: "Operational safety", status: /rollback|monitor|alert|dashboard/i.test(combined) ? "in progress" : "missing", evidence: /rollback|monitor|alert|dashboard/i.test(combined) ? "Monitoring or rollback context supplied" : "No rollback or monitoring evidence supplied" },
      { name: "Support & communications", status: /support|faq|runbook|help/i.test(combined) ? "in progress" : "missing", evidence: /support|faq|runbook|help/i.test(combined) ? "Support material mentioned" : "No FAQ or support runbook supplied" },
    ];
    return { score: Math.max(25, 100 - missing.length * 18), rubric: ["scope", "quality", "operability", "messaging", "measurement"], present, missing, categories };
  },
});

export const generateOwnerChecklist = tool({
  name: "generate_owner_checklist",
  description: "Produce an owner-based checklist for engineering launches. Use after tasks are clear.",
  parameters: z.object({ launchDate: z.string().optional(), teamSize: z.string().optional() }),
  execute: async ({ launchDate, teamSize }) => ({
    launchDate: launchDate || "not specified", teamSize: teamSize || "not specified",
    owners: {
      Engineering: ["Ship release candidate", "Verify telemetry", "Execute rollback drill"],
      Product: ["Approve scope and success metric", "Run go/no-go"],
      Marketing: ["Schedule launch copy", "Monitor channel replies"],
      Support: ["Publish FAQ", "Staff launch window"],
    },
  }),
});

export const draftLaunchCopy = tool({
  name: "draft_channel_copy",
  description: "Draft concise, channel-specific launch copy for release notes, email, and social. Use after audience and assets are known.",
  parameters: z.object({ brief: z.string(), audience: z.string().optional(), assets: z.string().optional() }),
  execute: async ({ brief, audience, assets }) => ({
    releaseNotes: `New: ${brief.slice(0, 140)}. Built for ${audience || "your team"}.`,
    emailSubject: `Now available: a better way to ${brief.slice(0, 55)}`,
    social: `Shipping today ✦ ${brief.slice(0, 120)} ${assets ? "See the launch assets for details." : "More details soon."}`,
  }),
});

export const launchTools = [extractLaunchTasks, checkLaunchReadiness, generateOwnerChecklist, draftLaunchCopy];
