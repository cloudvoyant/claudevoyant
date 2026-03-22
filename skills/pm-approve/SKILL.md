---
description: 'Promote a draft roadmap from .codevoyant/roadmaps/ to docs/product/roadmaps/. Optionally syncs to Linear. Triggers on: "pm approve", "approve roadmap", "commit roadmap", "publish roadmap", "promote draft".'
name: pm:approve
license: MIT
compatibility: 'Designed for Claude Code. On OpenCode and VS Code Copilot, AskUserQuestion falls back to numbered list; context: fork runs inline.'
argument-hint: '[roadmap-slug] [--push [initiative-url]] [--silent]'
disable-model-invocation: true
model: claude-opus-4-6
---

> **Compatibility**: AskUserQuestion falls back to numbered list on non-Claude-Code platforms.

## Skill Requirements

```bash
command -v npx >/dev/null 2>&1 || echo "MISSING: npx"
```

## Critical Rules

- Always run pm:review before promoting — do not skip
- The draft in `.codevoyant/roadmaps/` remains after promotion (source of truth for history)
- Linear sync is always optional and always last
- Never force-overwrite an existing committed roadmap without user confirmation

## Step 0: Parse arguments

```bash
SLUG="${1:-}"
LINEAR_SYNC=false; LINEAR_URL=""; SILENT=false
if [[ "$*" =~ --push ]]; then
  LINEAR_SYNC=true
  # Capture optional URL immediately following --push
  if [[ "$*" =~ --push[[:space:]]+(https://linear\.app/[^[:space:]]+) ]]; then
    LINEAR_URL="${BASH_REMATCH[1]}"
  fi
fi
[[ "$*" =~ --silent ]] && SILENT=true
```

## Step 1: Locate draft

If SLUG provided, resolve to `.codevoyant/roadmaps/{SLUG}.md` or the most recent file matching `*{SLUG}*`.

If no SLUG, list files in `.codevoyant/roadmaps/` sorted by modification time and ask:

```
AskUserQuestion:
  question: "Which draft roadmap do you want to approve?"
  header: "Draft"
  options:
    - label: "Most recent draft"
    - label: "I'll specify the filename"
```

Read the selected roadmap. Set DRAFT_PATH and FILENAME.

## Step 2: Run pm:review

Run `/pm:review` on the draft. If critical issues are found, surface them and ask:

```
AskUserQuestion:
  question: "pm:review found critical issues. How do you want to proceed?"
  header: "Review result"
  options:
    - label: "Fix issues first (use pm:update)"
    - label: "Approve anyway — I'll address issues later"
    - label: "Cancel"
```

If fix or cancel, stop here.

## Step 3: Confirm promotion

Determine COMMIT_PATH = `docs/product/roadmaps/{FILENAME}`.

Check if COMMIT_PATH already exists. If it does, warn:

```
AskUserQuestion:
  question: "A committed roadmap already exists at {COMMIT_PATH}. Overwrite?"
  header: "Overwrite?"
  options:
    - label: "Yes — overwrite"
    - label: "Save as new version (add date suffix)"
    - label: "Cancel"
```

Ask for final confirmation:

```
AskUserQuestion:
  question: "Promote draft to {COMMIT_PATH}?"
  header: "Confirm promotion"
  options:
    - label: "Promote"
    - label: "Cancel"
```

## Step 4: Promote

Copy draft to COMMIT_PATH. Ensure `docs/product/roadmaps/` directory exists.

Report: "Roadmap promoted to `{COMMIT_PATH}`."

## Step 5: Linear sync (optional)

If `--push` flag not passed, ask:

```
AskUserQuestion:
  question: "Sync this roadmap to Linear?"
  header: "Linear sync"
  options:
    - label: "Yes — create a new Linear initiative"
    - label: "Yes — use an existing initiative (I'll provide the URL)"
    - label: "No — skip Linear sync"
```

If "use an existing initiative", ask:

```
AskUserQuestion:
  question: "Paste the Linear initiative URL:"
  header: "Initiative URL"
  freeform: true
```

Set LINEAR_URL to the provided value.

If syncing, launch the linear-sync-agent:

- **linear-sync-agent** (see `agents/linear-sync-agent.md`) — creates or updates a single Linear initiative, copies the roadmap into the initiative description, and uploads research artifacts as Linear documents

Pass to the agent: COMMIT_PATH, DRAFT_PATH, SLUG, LINEAR_URL (empty string if creating new).

Wait for completion. Report sync results.

## Step 6: Notify

```bash
if [ "$SILENT" != "true" ]; then
  npx @codevoyant/agent-kit notify \
    --title "pm:approve complete" \
    --message "Roadmap committed to {COMMIT_PATH}"
fi
```

Report: "Done. Roadmap is now at `{COMMIT_PATH}`."
