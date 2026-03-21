---
description: 'Use at session start to load team knowledge into context. Triggers on: "mem list", "load knowledge", "session start", "what does the team know". Fast, non-interactive bulk dump.'
name: mem:list
license: MIT
compatibility: Works on Claude Code, OpenCode, GitHub Copilot (VS Code), and Codex. No platform-specific features used.
argument-hint: ''
---

Session-start bulk index dump. Loads all indexed team knowledge into context.

## Step 1: Run List

```bash
npx @codevoyant/agent-kit mem list
```

## Step 2: Print Output

Print the terse table output directly into context. Do not reformat or add commentary.

## Step 3: Tip (First Run Only)

If `CLAUDE.md` does not contain `mem list` and this appears to be a first run,
append a non-blocking tip:

```
Tip: run /mem:init to configure automatic loading every session.
```

Do NOT ask a blocking question. Keep list fast and non-interactive.
