---
description: "Use when setting up dev plugin permissions for uninterrupted agent execution. Triggers on: \"dev allow\", \"allow dev\", \"dev permissions\", \"dev:commit keeps asking permission\", \"pre-approve dev\"."
name: dev:allow
license: MIT
compatibility: Works on Claude Code, OpenCode, GitHub Copilot (VS Code), and Codex. No platform-specific features used.
argument-hint: "[--global]"
disable-model-invocation: true
model: claude-haiku-4-5-20251001
---

Pre-approve dev plugin permissions so agents run without prompts.

## Flags

- `--global`: write to global config (`~/.claude/settings.json`) instead of project-level

## Step 1: Apply

```bash
npx @codevoyant/agent-kit perms add --plugins dev [--global]
```

Agent-kit detects the running agent (Claude Code, OpenCode, VS Code Copilot) and writes the right config automatically.

## Step 2: Report

Show the JSON output, then:

```
✓ dev permissions applied. /dev:commit and /dev:ci can now run without interruption.
```
