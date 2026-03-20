---
description: "Use when setting up pm plugin permissions for uninterrupted agent execution. Triggers on: \"pm allow\", \"allow pm\", \"pm permissions\", \"pre-approve pm\"."
argument-hint: "[--global]"
disable-model-invocation: true
model: claude-haiku-4-5-20251001
---

Pre-approve pm plugin permissions so agents run without prompts.

## Flags

- `--global`: write to global config (`~/.claude/settings.json`) instead of project-level

## Step 1: Apply

```bash
npx @codevoyant/agent-kit perms add --plugins pm [--global]
```

Agent-kit detects the running agent (Claude Code, OpenCode, VS Code Copilot) and writes the right config automatically.

## Step 2: Report

Show the JSON output, then:

```
✓ pm permissions applied. /pm:plan and /pm:prd can now run without interruption.
```
