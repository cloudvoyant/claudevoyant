---
description: "Use when writing a PRD for a single feature or initiative. Triggers on: \"write prd\", \"create prd\", \"product requirements\", \"requirements doc\", \"pm prd\", \"feature spec\". Produces PRD with problem statement, goals, requirements tables, acceptance criteria, and non-goals. Can seed from a ticket URL."
name: pm:prd
license: MIT
compatibility: "Designed for Claude Code. On OpenCode and VS Code Copilot, AskUserQuestion falls back to numbered list; context: fork runs inline. Core functionality preserved on all platforms."
argument-hint: "[ticket-url|feature-description] [--bg] [--silent]"
disable-model-invocation: true
context: fork
agent: general-purpose
model: claude-opus-4-6
---

> **Compatibility**: If `AskUserQuestion` is unavailable, present options as a numbered list and wait for the user's reply. If `Task` is unavailable, run parallel steps sequentially. The `context: fork` and `agent:` frontmatter fields are Claude Code-specific — on OpenCode and VS Code Copilot they are ignored and the skill runs inline using the current model.

---

## Critical Principles

- "Goals describe outcomes, not features." — A goal is not "add notification preferences." It is "reduce notification-related support tickets by 40% within 60 days of launch." If the stated goal cannot have a baseline and a target, it is a feature description, not a goal. Reframe it before writing the Goals section.
- "A non-goal without rationale will be re-opened." — Every non-goal needs a one-phrase reason: scope, timeline, dependency, risk. Without it, stakeholders will challenge it in every review. Rationale turns a list into a decision.
- "Unmeasured requirements get built wrong." — Acceptance criteria that cannot be verified produce disagreement at ship time, not before. Every AC must describe an observable condition with a threshold or a binary pass/fail. "Fast enough" is not an AC; "p95 response time < 200ms under load test" is.

## Anti-Patterns

- ❌ **Problem statement that describes the solution**: Opening the Problem section with "We need to build X" rather than "Users cannot do Y, which causes Z." → The Problem section must name the user, their context, and the pain — not the solution. The solution emerges from requirements, not from the problem statement.
- ❌ **Goals without a baseline**: Writing goals like "increase retention" with no current baseline or time horizon. → Every measurable goal needs: current state, target state, and the time window. Without a baseline, the team cannot know if they succeeded. If the baseline is unknown, state that explicitly and add it as an Open Question with an owner.
- ❌ **Non-Functional Requirements left empty or generic**: Writing NFR tables with rows like "the system should be fast" or leaving the table empty. → Non-functional requirements must have a Target column with a measurable threshold: latency in ms/percentile, throughput in requests/sec, availability in percentage. An NFR without a target is a wish.
- ❌ **Dependencies listed without directionality**: Naming dependent systems without specifying whether they are blockers (upstream) or downstream. → Each dependency must be labeled: `upstream` (blocks this), `downstream` (impacted by this), or `external` (third-party with no internal owner). Unlabeled dependencies create ambiguous ownership.
- ❌ **Acceptance Criteria written in future tense without conditions**: ACs like "the user will be able to filter results" instead of "given a result set of 20 items, applying a category filter reduces displayed results to only matching items." → ACs must name a starting condition, an action, and an observable result. Rewrite any AC that omits the condition or the observable outcome.

---

Generate a structured PRD for a single feature or initiative.

## Step 0: Parse arguments

Parse the user's input for:
- A URL (Linear, GitHub, Notion) — if detected, fetch via the ticket-fetch pattern (same as spec:new Step 0.8)
- A feature description string
- Flags: `--bg` (background notification on completion), `--silent` (suppress output)

Derive:
- `DATE_PREFIX = $(date +%y%m%d)` (YYMMDD format)
- `SCOPE` = slugified feature/initiative name (from ticket title or user input, lowercase, hyphens, no special chars)
- `OUTPUT_FILE = docs/prd/{DATE_PREFIX}-{SCOPE}-prd.md`

Create directory: `mkdir -p docs/prd/`

## Step 1: Load feature context

If a ticket URL was provided, use the fetched ticket content as the feature context.

Otherwise, ask the user:
> Describe the feature or problem this PRD addresses.

## Step 2: Clarify requirements (standalone only)

**Skip this step if called from pm:plan's inline PRD generation with sufficient context.**

Ask the user with AskUserQuestion:
> A few quick questions to shape the PRD:

Then ask as follow-ups:
1. "Who is the primary user?" (free-text answer)
2. "Engineering scope?" — options: `Small (days)` | `Medium (weeks)` | `Large (months)`
3. "Requirement confidence?" — options: `High` | `Medium (some unknowns)` | `Low (exploratory)`

## Step 3: Draft the PRD

Generate a PRD document using the structure from `references/prd-template.md`:

### Problem
What problem does this solve, for whom, and why now? (1-3 sentences)

### Goals
Measurable outcomes. Include baseline and target where known.

### Non-Goals
Explicit out-of-scope items with rationale — one line each.

### Users
Primary user persona in one sentence. Secondary personas if relevant.

### Requirements — Functional
Table with columns: #, Requirement, Priority (P0/P1/P2), Notes.

### Requirements — Non-Functional
Table with columns: #, Requirement, Target (measurable).

### Acceptance Criteria
Checklist of verifiable conditions.

### Open Questions
Table with columns: Question, Owner, Due.

### Dependencies
Upstream and downstream systems, teams, and external services.

## Step 4: Preview and confirm (standalone only)

**If called from pm:plan's inline PRD generation, skip this step and write directly.**

Show a one-paragraph summary of the PRD and ask with AskUserQuestion:
> Does this PRD capture the requirements?

Options:
- `Looks good — write it`
- `Adjust problem statement`
- `Adjust requirements`
- `Adjust non-goals`

If the user requests adjustments, revise the relevant section and re-present. Loop until "Looks good — write it".

## Step 4.5: Quality Checkpoint

Before writing the PRD, run a structured self-check. Output a Quality Checkpoint block.

**Criteria:**

1. **Problem statement is a problem** — Does the problem statement describe user pain, not a solution?
   - PASS: the problem names a user, their context, and the pain
   - WARN: the problem is partially solution-framed — note and reframe in the PRD Problem section
   - BLOCK: the problem statement is entirely solution-framed ("We need to build X") → ask: "What can users not do today, and what does that cost them?"

2. **Goals have baselines** — Does each goal have a current-state baseline and a time-bound target?
   - PASS: at least one goal has baseline + target + timeline
   - WARN: goals are directional but lack baselines — add as Open Question with owner in PRD
   - BLOCK: all goals lack baselines and no baseline information was provided → ask for the current state of the primary metric before proceeding

3. **Leading and lagging indicators both present** — Are there both short-term (days/weeks) and long-term (weeks/months) success signals?
   - PASS: at least one leading and one lagging indicator identified
   - WARN: only one type present — note the gap in the PRD; add placeholder for the missing type
   - BLOCK: not applicable (warn only)

4. **NFRs have targets** — Do non-functional requirements have measurable thresholds (not just labels)?
   - PASS: each NFR has a specific target (latency in ms, availability in %, throughput in req/s)
   - WARN: NFRs named but not quantified — add as Open Questions with owners
   - BLOCK: not applicable (warn only)

5. **Dependencies labeled** — Are dependencies labeled as upstream / downstream / external?
   - PASS: each dependency has directionality
   - WARN: dependencies listed without direction — add direction labels in the PRD Dependencies section

**Output format:**
```
## Quality Checkpoint

✅ Problem statement names user pain, not a solution
⚠️  WARN: Goals are directional but lack baselines — adding as Open Questions
✅ Leading and lagging indicators both identified
⚠️  WARN: NFRs named but not quantified — adding as Open Questions
✅ Dependencies labeled with directionality

Quality Brief:
- PRD for [feature] solving [user pain]
- Key goal: [goal with baseline/target if available]
- Gap: goal baselines missing — added as Open Questions with owner
- Gap: NFR targets need quantification — added as Open Questions
```

**BLOCK behavior:** If one or more BLOCKs are found, do not proceed to Step 5. Present the BLOCK items to the user with specific questions and wait for resolution. After resolution, re-run the checkpoint.

After running the checkpoint, write the Quality Brief and use it as the grounding context for the PRD write step. Any BLOCK items must be resolved by the user before the PRD is written.

## Step 5: Write the PRD

Write the PRD to `{OUTPUT_FILE}` using the structure from `references/prd-template.md`.

Report: `PRD written to {OUTPUT_FILE}`

## Step 5.5: Linear Attachment (standalone only)

Skip this step if called from pm:plan's inline PRD generation.

AskUserQuestion:
  question: "Attach PRD to Linear?"
  header: "Linear"
  multiSelect: false
  options:
    - label: "Yes — attach to a project"
      description: "Attach to an existing or new Linear project"
    - label: "Yes — attach to an initiative"
      description: "Attach to an existing Linear initiative"
    - label: "No — repo only"

If "Yes — attach to a project":
  1. `mcp__linear-server__list_projects` — user selects or creates new
  2. If creating new: `mcp__linear-server__save_project` — store PROJECT_ID
  3. `mcp__linear-server__create_document`:
       title: "{DATE_PREFIX} {SCOPE} PRD"
       content: (full Markdown content of OUTPUT_FILE)
       projectId: PROJECT_ID

If "Yes — attach to an initiative":
  1. `mcp__linear-server__list_initiatives` — user selects — store INITIATIVE_ID
  2. `mcp__linear-server__create_document`:
       title: "{DATE_PREFIX} {SCOPE} PRD"
       content: (full Markdown content of OUTPUT_FILE)
       initiativeId: INITIATIVE_ID

If "No — repo only": skip. Report: "PRD saved to {OUTPUT_FILE}."

## Step 6: Notify

If `--bg`, notify:

```bash
npx @codevoyant/agent-kit notify --title "pm:prd complete" --message "PRD written to {OUTPUT_FILE}"
```
