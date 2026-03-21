---
description: "Use when setting up ux plugin permissions for uninterrupted agent execution. Triggers on: \"ux allow\", \"allow ux\", \"ux permissions\", \"pre-approve ux\"."
name: ux:allow
license: MIT
compatibility: Works on Claude Code, OpenCode, GitHub Copilot (VS Code), and Codex. No platform-specific features used.
argument-hint: "[--global]"
disable-model-invocation: true
model: claude-haiku-4-5-20251001
---

Pre-approve ux plugin permissions so agents run without prompts.

## Flags

- `--global`: write to global config (`~/.claude/settings.json`) instead of project-level

## Step 1: Apply

```bash
npx @codevoyant/agent-kit perms add --plugins ux [--global]
```

Agent-kit detects the running agent (Claude Code, OpenCode, VS Code Copilot) and writes the right config automatically.

## Step 2: Report

Show the JSON output, then:

```
✓ ux permissions applied. /ux:style-synthesize can now run without interruption.
```
