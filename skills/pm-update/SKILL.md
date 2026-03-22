---
description: 'Update a draft product roadmap in .codevoyant/roadmaps/. Triggers on: "pm update", "update roadmap", "revise roadmap", "edit draft roadmap", "change the plan".'
name: pm:update
license: MIT
compatibility: 'Designed for Claude Code. On OpenCode and VS Code Copilot, AskUserQuestion falls back to numbered list; context: fork runs inline.'
argument-hint: '[roadmap-slug] [change description]'
disable-model-invocation: true
model: claude-opus-4-6
---

> **Compatibility**: AskUserQuestion falls back to numbered list on non-Claude-Code platforms.

## Skill Requirements

```bash
command -v npx >/dev/null 2>&1 || echo "MISSING: npx"
```

## Critical Rules

- Only updates draft roadmaps in `.codevoyant/roadmaps/` — not committed docs
- To update a committed roadmap, use pm:approve to re-draft and re-approve
- No markdown tables in output — use bullets, definition lists, or Mermaid
- Never overwrite without showing a diff or summary of changes first

## Step 0: Parse arguments

```bash
SLUG="${1:-}"
CHANGE_DESCRIPTION="${@:2}"
```

## Step 1: Locate draft

If SLUG provided, resolve to `.codevoyant/roadmaps/{SLUG}.md` or the most recent file matching `*{SLUG}*`.

If no SLUG, list all files in `.codevoyant/roadmaps/` sorted by modification time and ask:

```
AskUserQuestion:
  question: "Which draft roadmap do you want to update?"
  header: "Draft"
  options:
    - label: "Most recent draft"
    - label: "I'll specify the filename"
```

Read the selected roadmap as CURRENT_ROADMAP.

## Step 2: Understand the change

If CHANGE_DESCRIPTION is empty, ask:

```
AskUserQuestion:
  question: "What changes do you want to make to this roadmap?"
  header: "Change scope"
  options:
    - label: "Reprioritize capabilities across tiers"
    - label: "Add or remove a capability"
    - label: "Update strategic goal or rationale"
    - label: "I'll describe the change below"
```

## Step 3: Confirm proposed changes

Based on CURRENT_ROADMAP and CHANGE_DESCRIPTION, articulate the specific edits you will make (which sections change, what is added/removed/moved, how tier assignments shift).

Ask:

```
AskUserQuestion:
  question: "Does this capture the changes you want?"
  header: "Direction check"
  options:
    - label: "Yes — apply changes"
    - label: "No — I want something different (describe below)"
```

If the user wants changes, apply and re-confirm once before continuing.

## Step 4: Apply changes

Apply the described changes to the roadmap file. Preserve all sections not mentioned in the change description. Maintain capability tier format and no-tables rule.

Report a brief summary of what changed (sections touched, capabilities moved or added).

## Step 5: Run pm:review

Offer to run pm:review on the updated draft:

```
AskUserQuestion:
  question: "Run pm:review on the updated draft?"
  header: "Review"
  options:
    - label: "Yes — review now"
    - label: "Skip — I'll review later"
```

If yes, run `/pm:review` on the updated draft path.

Report: "Updated draft at `.codevoyant/roadmaps/{filename}`. Run `/pm:approve` when ready to commit."
