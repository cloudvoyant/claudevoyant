---
description: 'Team knowledge capture, recall, and search. Triggers on: "mem2", "mem2 find", "mem2 learn", "mem2 remember", "mem2 index", "mem2 init", "mem2 help", "what does the team know", "remember this", "search knowledge", "our rule is".'
name: mem2
license: MIT
compatibility: "Designed for Claude Code. On OpenCode and VS Code Copilot, AskUserQuestion falls back to numbered list. Core functionality preserved on all platforms."
argument-hint: '<command> [args]'
---

> **Compatibility**: If `AskUserQuestion` is unavailable, present options as a numbered list and wait for the user's reply.

Team knowledge management — single skill, multiple commands.

## Commands

| Command | Description |
|---------|-------------|
| `help` | List available commands (default) |
| `init [--hook]` | One-time project bootstrap |
| `learn <knowledge or question>` | Capture or recall team knowledge |
| `remember` | Session-start bulk dump |
| `index` | Re-index knowledge docs |
| `find [--type] [--tag] [--json]` | Search knowledge docs |

## Step 0: Parse Command

Extract the first argument as `<command>`. Default to `help` if absent or unrecognized.

Detect intent from natural language even without explicit subcommand:
- "remember this", "learn this", "our rule is X", "from now on X" → `learn`
- "remind me about X", "what did we decide on X" → `learn` (recall mode)
- "what does the team know" → `remember`
- "search for X", "find docs about X" → `find`

## Step 1: Load Command

Read the matching command file from the `commands/` subdirectory adjacent to this SKILL.md:

```
commands/help.md
commands/init.md
commands/learn.md
commands/remember.md
commands/index.md
commands/find.md
```

## Step 2: Execute

Follow the instructions in the loaded command file exactly.
