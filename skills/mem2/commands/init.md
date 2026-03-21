# Command: init

One-time project bootstrap. Sets up `CLAUDE.md` (and optionally `AGENTS.md`) so that
team knowledge loads automatically at session start.

## Step 1: Check if Already Configured

Search `CLAUDE.md` for `mem remember` or `## Team Knowledge`. If found, report:
```
Already configured -- CLAUDE.md already has a mem section.
```
Stop here.

## Step 2: Write CLAUDE.md Block

Append to `CLAUDE.md` (create if missing):

```markdown
## Team Knowledge

At the start of every session, load project knowledge into context:

\`\`\`bash
npx @codevoyant/agent-kit mem remember
\`\`\`
```

## Step 3: Ask About AGENTS.md

```
AskUserQuestion:
  question: "Also add to AGENTS.md for OpenCode/Copilot compatibility?"
  options:
    - "Yes -- add to AGENTS.md too"
    - "No -- CLAUDE.md only"
```

If yes, write the same block to `AGENTS.md`.

## Step 4: Ask About Claude Code Hook

```
AskUserQuestion:
  question: "Add a Claude Code hook to auto-load team knowledge on session start?"
  options:
    - "Yes -- add to .claude/settings.json"
    - "No -- I'll call it manually or via CLAUDE.md"
```

If hook selected, merge into `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "npx @codevoyant/agent-kit mem remember 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

## Step 5: Report

```
mem2 init complete

CLAUDE.md updated -- team knowledge will load every session.
Run /mem2 learn to add your first piece of knowledge.
Or: npx @codevoyant/agent-kit mem learn
```
