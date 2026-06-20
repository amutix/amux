# Changelog

## 1.0.0 (2026-06-20)

Initial release.

### Features

- **Core module**: Pi-independent multi-agent coordination library
- **Agent registry**: UUID-based persistent agent identity (online/offline)
- **File-based messaging**: Crash-safe inbox system with fs.watch delivery
- **Task backlog**: Ordered queue with assign/pick/done and auto file reservation
- **File reservations**: Path-prefix locking with advisory warnings
- **Journal**: Append-only decision/learning log with sliding window prompt injection
- **Built-in roles**: developer, architect, reviewer, devops, planner
- **Git workspaces**: Worktree management per agent
- **Three-tier artifacts**: Project and private document sharing with CONTEXT.md auto-injection

### Pi Extension (amux-pi)

- 8 tools: amux_role, amux_list, amux_send, amux_broadcast, amux_artifacts, amux_reserve, amux_task, amux_journal
- Interactive commands: /amux (status, join, leave, manage, workspace)
- System prompt injection: role instructions, project context, journal, agent roster
- Crash-safe message delivery via pi.sendUserMessage()

### CLI

- Basic CLI skeleton (full implementation planned)
