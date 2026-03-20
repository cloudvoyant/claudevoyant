---
description: "Use when setting up em plugin permissions for uninterrupted agent execution. Triggers on: \"em allow\", \"allow em\", \"em permissions\", \"pre-approve em\"."
argument-hint: "[--global]"
disable-model-invocation: true
model: claude-haiku-4-5-20251001
---

Pre-approve em plugin permissions so agents run without prompts.

## Flags

- `--global`: write to global config (`~/.claude/settings.json`) instead of project-level

## Step 1: Apply

```bash
npx @codevoyant/agent-kit perms add --plugins em [--global]
```

Agent-kit detects the running agent (Claude Code, OpenCode, VS Code Copilot) and writes the right config automatically.

## Step 2: Report

Show the JSON output, then:

```
✓ em permissions applied. /em:plan can now run without interruption.
```
