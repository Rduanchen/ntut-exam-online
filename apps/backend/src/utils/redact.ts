import type { ScoreBoardFormat } from "@my-project/types";

export function redactHiddenOutput(
  scoreboard: ScoreBoardFormat,
): ScoreBoardFormat {
  const redacted: ScoreBoardFormat = {};

  for (const [problemId, payload] of Object.entries(scoreboard)) {
    redacted[problemId] = {
      ...payload,
      subtasks: payload.subtasks.map((subtask) => ({
        visible: subtask.visible,
        hidden: subtask.hidden.map((tc) => ({
          ...tc,
          userOutput: "result is hidden",
          expectedOutput: "result is hidden",
        })),
      })),
    };
  }

  return redacted;
}
