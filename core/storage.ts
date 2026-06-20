/**
 * amux — Shared Storage Layer
 *
 * Single source of truth for session directory resolution and atomic file I/O.
 * All core modules import path helpers and I/O functions from here.
 *
 * Session root priority:
 *   1. AMUX_SESSIONS_DIR  — explicit sessions directory path
 *   2. AMUX_HOME/sessions — custom amux home with /sessions appended
 *   3. ~/.amux/sessions   — default
 *
 * Environment variables are read on every call so tests and embedders
 * can override the root at any point before calling core functions.
 */

import { readFile, writeFile, rename, mkdir, readdir } from "node:fs/promises";
import { readFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { randomBytes } from "node:crypto";

// ─── Session Root Resolution ────────────────────────────────

/**
 * Resolve the amux sessions directory.
 *
 * Reads environment variables on every call so callers can
 * set `AMUX_SESSIONS_DIR` or `AMUX_HOME` before invoking
 * any core function (useful for tests and embedded usage).
 *
 * Priority:
 *   1. AMUX_SESSIONS_DIR  — full path to sessions directory
 *   2. AMUX_HOME/sessions — custom amux home root
 *   3. ~/.amux/sessions   — default
 */
export function getSessionsDir(): string {
  if (process.env.AMUX_SESSIONS_DIR) return process.env.AMUX_SESSIONS_DIR;
  if (process.env.AMUX_HOME) return join(process.env.AMUX_HOME, "sessions");
  return join(homedir(), ".amux", "sessions");
}

/** Get the directory path for a specific session. */
export function sessionDir(session: string): string {
  return join(getSessionsDir(), session);
}

/** Get the path to a file (or nested path) within a session directory. */
export function sessionFile(session: string, ...segments: string[]): string {
  return join(getSessionsDir(), session, ...segments);
}

// ─── Async JSON I/O ─────────────────────────────────────────

/** Read and parse a JSON file, returning fallback on any error. */
export async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Atomically write JSON to a file (write to tmp, then rename). */
export async function atomicWriteJson(path: string, data: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tmp = path + "." + randomBytes(4).toString("hex") + ".tmp";
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, path);
}

// ─── Sync JSONL I/O ─────────────────────────────────────────

/**
 * Read a JSONL file and return parsed entries.
 * Skips malformed lines. Returns empty array if the file doesn't exist.
 */
export function readJsonlSync<T>(path: string): T[] {
  let lines: string[];
  try {
    lines = readFileSync(path, "utf8").split("\n").filter(Boolean);
  } catch {
    return [];
  }
  return lines
    .map((line) => {
      try {
        return JSON.parse(line) as T;
      } catch {
        return null;
      }
    })
    .filter((e): e is T => e !== null);
}

/**
 * Append a JSON entry as a line to a JSONL file.
 * Creates parent directories if needed.
 */
export function appendJsonlSync(path: string, entry: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(entry) + "\n", "utf8");
}

/** Ensure a directory exists (synchronous). */
export function ensureDirSync(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}

// ─── Session Discovery ──────────────────────────────────────

/** List all session directory names. Returns [] if sessions dir doesn't exist. */
export async function listSessions(): Promise<string[]> {
  try {
    const entries = await readdir(getSessionsDir(), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}
