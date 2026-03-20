---
description: "Use when setting up spec plugin permissions for uninterrupted agent execution. Triggers on: \"spec allow\", \"allow spec\", \"spec permissions\", \"spec:bg keeps asking permission\", \"pre-approve spec\"."
argument-hint: "[--global]"
disable-model-invocation: true
model: claude-haiku-4-5-20251001
---

Pre-approve spec plugin permissions so background agents run without prompts.

## Flags

- `--global`: write to global config (`~/.claude/settings.json`) instead of project-level

## Step 1: Apply

```bash
npx @codevoyant/agent-kit perms add --plugins spec [--global]
```

Agent-kit detects the running agent (Claude Code, OpenCode, VS Code Copilot) and writes the right config automatically.

## Step 2: Report

Show the JSON output, then:

```
✓ spec permissions applied. /spec:bg and /spec:go can now run without interruption.
```
