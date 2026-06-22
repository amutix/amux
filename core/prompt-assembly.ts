/**
 * amux — Agent Prompt Assembly
 *
 * Deliberate, reviewable composition of the coordination block that amux
 * APPENDS to Pi's base system prompt (it never replaces the base prompt).
 *
 * Section order is explicit and documented here so the prompt structure is
 * easy to review and test. Role profiles are one role-specific section, not
 * the whole prompt. Common operating principles, project vision, work state,
 * team context, and interface guidance are separate, ordered sections.
 *
 * Pi-independent and pure: takes pre-fetched section strings, returns the
 * composed block. The adapter gathers data and appends the result.
 */

/**
 * Common amux operating principles — the shared collaboration contract every
 * agent follows, regardless of role. Role-specific behavior lives in role
 * profiles; this section holds only universal coordination rules so the two
 * never conflict.
 */
export const COMMON_PRINCIPLES = `## amux Operating Principles

You are part of a coordinated agent team. Shared operating rules:

- **State is the source of truth.** Derive current truth from the backlog, registry, task comments, reservations, and journal — not from messages. Task assignments appear in your work state, not as inbox instructions.
- **Coordinate like a dev team.** Prefer \`amux_task comment\` for task-scoped discussion; use \`amux_send\` only for exceptional, non-task communication. Claim files via reservations before editing shared code.
- **Work the backlog deliberately.** Use \`amux_task summary\` (or \`/amux progress\`) for a hierarchical overview before choosing work. Items are typed (initiative/milestone/task/bug/chore/spec); initiatives and milestones are context containers — assign and pick executable leaf items, not containers. Inspect parent context with \`amux_task show\` before implementing a child item.
- **Review before done.** Substantive work goes to review before completion. Report outcomes, key decisions, risks, and test status.`;

// ─── Section Composition ─────────────────────────────────────

/**
 * Named prompt sections in deliberate order. Each is optional; empty sections
 * are skipped during assembly.
 */
export interface PromptSections {
  /** 1. Common amux operating principles / collaboration contract. */
  commonPrinciples?: string;
  /** 2. Project vision/context (CONTEXT.md). */
  projectContext?: string;
  /** 3. Role-specific profile/instructions. */
  roleProfile?: string;
  /** 4. Agent identity + workspace. */
  identity?: string;
  /** 5. Current work state: active/assigned/review items, spec, recent comments, journal. */
  workState?: string;
  /** 6. Team/backlog/review/reservation context (agent roster, addressing). */
  teamContext?: string;
  /** 7. Interface/tool guidance and shared artifact paths. */
  interfaceGuidance?: string;
}

/** The deliberate section order. Documented here as the single source of truth. */
const SECTION_ORDER: (keyof PromptSections)[] = [
  "commonPrinciples",
  "projectContext",
  "roleProfile",
  "identity",
  "workState",
  "teamContext",
  "interfaceGuidance",
];

/**
 * Assemble the coordination block from sections in the deliberate order.
 * Empty/whitespace-only sections are skipped. Returns the composed block
 * (without leading/trailing whitespace), or "" if all sections are empty.
 *
 * The caller appends this to Pi's base system prompt — it does not replace it.
 */
export function assembleAgentPrompt(sections: PromptSections): string {
  return SECTION_ORDER.map((key) => sections[key])
    .filter((s): s is string => !!s && s.trim().length > 0)
    .map((s) => s.trim())
    .join("\n\n");
}
