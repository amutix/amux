/**
 * amux — Task-Scoped Comments and Activity
 *
 * Append-only JSONL history per task, stored under `task-comments/<TASK-ID>.jsonl`.
 * Used for task-related discussion (like PR comments) and lifecycle activity.
 * Keeps discussion off the inbox and out of backlog.json.
 *
 * Pi-independent — no framework or adapter dependencies.
 */

import {
  sessionFile,
  readJsonlSync,
  appendJsonlSync,
} from "./storage.ts";

// ─── Types ───────────────────────────────────────────────────

export interface TaskComment {
  timestamp: string; // ISO 8601
  agent: string; // display name of author
  agentId: string; // UUID of author
  type: "comment" | "activity"; // comment = discussion, activity = lifecycle event
  text: string;
}

// ─── Paths ───────────────────────────────────────────────────

function commentsPath(session: string, taskId: string): string {
  return sessionFile(session, "task-comments", `${taskId}.jsonl`);
}

// ─── Operations ──────────────────────────────────────────────

/**
 * Append a comment or activity record to a task's history.
 * Creates the task-comments directory and JSONL file on first write.
 */
export function appendTaskComment(
  session: string,
  taskId: string,
  entry: TaskComment,
): void {
  appendJsonlSync(commentsPath(session, taskId), entry);
}

/**
 * Read all comments/activity for a task in chronological order.
 * Returns [] if no comments exist yet.
 */
export function readTaskComments(
  session: string,
  taskId: string,
): TaskComment[] {
  return readJsonlSync<TaskComment>(commentsPath(session, taskId));
}

/**
 * Format a comment for display.
 * Returns a single line like:
 *   [2026-06-20 14:00] Alice (comment): Looks good, one suggestion on error handling.
 *   [2026-06-20 14:05] system (activity): Assigned to Bob by Alice
 */
export function formatTaskComment(entry: TaskComment): string {
  const date = entry.timestamp.slice(0, 16).replace("T", " ");
  return `[${date}] ${entry.agent} (${entry.type}): ${entry.text}`;
}
