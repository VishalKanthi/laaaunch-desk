export type LaunchInput = {
  brief: string;
  audience: string;
  launchDate: string;
  constraints: string;
  assets: string;
  evidence?: string;
};

export type StreamEvent =
  | { type: "status"; message: string }
  | { type: "tool"; name: string; phase: "started" | "completed"; summary?: string }
  | { type: "delta"; text: string }
  | { type: "error"; message: string }
  | { type: "done" };
