---
description: Create a new spec plan by exploring requirements and building a structured implementation plan. Proactively suggest this when a user describes a feature, refactor, or project they want to build — even if they don't say "plan". Pass --blank to skip planning and create an empty template directly. Pass --bg to automatically launch background execution after the plan is created. Pass a Linear issue URL, Notion page URL, or GitHub/GitLab issue URL to seed requirements automatically. Triggers on keywords like new plan, create plan, plan, spec new, I want to build, let's implement, init plan, initialize plan, create empty plan, plan template, scaffold plan, spec, spec out, spec this, spec it out, let's spec, create a spec, write a spec, spec the, speccing.
argument-hint: "[plan-name|url] [--branch branch-name] [--blank] [--bg] [--silent]"
disable-model-invocation: true
context: fork
agent: spec-planner
model: claude-opus-4-6
---

> **Compatibility**: If `AskUserQuestion` is unavailable, present options as a numbered list and wait for the user's reply. If `Task` is unavailable, run parallel steps sequentially. The `agent: spec-planner` and `context: fork` frontmatter fields are Claude Code-specific — on OpenCode and VS Code Copilot they are ignored and planning runs inline using the current model.

Create a new plan by exploring requirements and building a structured plan. The
goal is to create a high quality implementation plan that can be executed
autonomously.

## Step 0: Parse Arguments

Parse from: `$ARGS` (the full argument string passed to this skill).

Check for plan name and optional --branch flag: `/spec:new plan-name --branch branch-name`

**Argument Parsing:**
- Plan name (first non-flag argument): `/spec:new my-plan-name` (no spaces in plan name)
- Optional --branch flag: `/spec:new my-plan-name --branch feature-branch`
  - Flag can be anywhere: `/spec:new --branch feature-branch my-plan-name`
  - Branch name extracted from argument after `--branch`
  - Branch name validation: alphanumeric, hyphens, underscores, slashes only
  - If branch name invalid, show error: "Invalid branch name. Use only alphanumeric characters, hyphens, underscores, and slashes."
- Plan names use hyphens, not spaces (enforced by slugification)
- Do NOT accept quoted arguments for plan names: `/spec:new "my plan"` is invalid
- If plan name contains spaces, inform user that plan names cannot have spaces
- If plan name provided, validate and slugify it
- If plan name not provided, will derive from objective later in Step 5

**Store parsed values:** `PLAN_NAME`, `BRANCH_NAME`, `BLANK_MODE=false`, `BG_MODE=false`, `SILENT=false`.

**If `--blank` flag present:** Set `BLANK_MODE=true`. After worktree setup (Step 2.5), skip directly to **Step 5.1** — do not ask planning questions (Steps 3–4). Create the empty template and register it. Do not run validation (Step 5.6). Report completion.

**If `--bg` flag present:** Set `BG_MODE=true`. After the plan is fully created and validated (after Step 6 "Looks good"), automatically launch background execution using `spec:go --bg` on the new plan instead of just suggesting it.

**If `--silent` flag present:** Set `SILENT=true`. Pass through to background execution if `BG_MODE=true`.

**Detect external source links:**

Check if any argument (or the full ARGUMENTS string) contains a URL from a supported source:
- Linear issue: `linear.app/*/issue/*` or `app.linear.app/*/issue/*`
- Notion page: `notion.so/*` or `notion.com/*`
- GitHub issue: `github.com/*/issues/*`
- GitLab issue: `gitlab.com/*/issues/*` or `gitlab.*/-/issues/*`

Store as:
- `SOURCE_URL` — the detected URL (empty if none)
- `SOURCE_TYPE` — `linear` | `notion` | `github` | `gitlab` | `none`
- `SOURCE_ID` — extracted issue/page ID (for API lookups)

## Step 0.5: Detect Branch Context

Run `git rev-parse --git-dir` to confirm this is a git repo. If not, disable branch features (`CURRENT_BRANCH=""`, `TARGET_BRANCH=""`, `BASE_BRANCH=""`).

If in a git repo:
- `CURRENT_BRANCH` = `git rev-parse --abbrev-ref HEAD`
- If `--branch` flag given: `TARGET_BRANCH=$BRANCH_NAME`, `SHOULD_CREATE_WORKTREE=true`, `BASE_BRANCH=$CURRENT_BRANCH`
- Otherwise: `TARGET_BRANCH=$CURRENT_BRANCH`, `SHOULD_CREATE_WORKTREE=false`, `BASE_BRANCH=$CURRENT_BRANCH`

Store these values for use in later steps:
- `CURRENT_BRANCH` - Current git branch (empty if not in git repo)
- `TARGET_BRANCH` - Branch to associate with plan
- `BASE_BRANCH` - Base branch for creating new branches
- `SHOULD_CREATE_WORKTREE` - Whether to create worktree (true if --branch flag used)

## Step 0.8: Fetch External Source (if URL provided)

If `SOURCE_TYPE` is `none`, skip this step.

Fetch content from the source and store as `EXTERNAL_CONTEXT` for use in Step 4.

**Linear** (`SOURCE_TYPE=linear`):
Extract the issue ID from the URL (format: `{TEAM}-{NUMBER}`, e.g., `ENG-123`).
Use the `mcp__claude_ai_Linear__get_issue` tool with the extracted issue identifier.
Extract: title → use as candidate PLAN_NAME if not already set; description, comments, labels, priority, assignee.
`EXTERNAL_CONTEXT` = formatted summary of the issue.

**Notion** (`SOURCE_TYPE=notion`):
Extract the page ID from the URL (last path segment or UUID).
Use the `mcp__claude_ai_Notion__notion-fetch` tool with the URL.
Extract: page title → candidate PLAN_NAME; page content as requirements context.
`EXTERNAL_CONTEXT` = page content summary.

**GitHub issue** (`SOURCE_TYPE=github`):
Extract owner, repo, issue number from URL.
Run: `gh issue view {number} --repo {owner}/{repo} --json title,body,labels,comments`
`EXTERNAL_CONTEXT` = issue title + body + relevant comments.

**GitLab issue** (`SOURCE_TYPE=gitlab`):
Extract project path and issue number from URL.
Run: `glab issue view {number} --repo {project-path} --output json`
`EXTERNAL_CONTEXT` = issue title + description + notes.

Report: `✓ Fetched context from {SOURCE_TYPE}: "{title}"`

If fetch fails: warn but continue — the user can provide requirements manually in Step 4.

## Step 1: Check for Existing Plan

If a specific plan name was provided, check if `.codevoyant/plans/{plan-name}/plan.md` already exists.
If no plan name was provided, check if `.codevoyant/spec.json` exists and contains any active plans.

When a matching plan is found, read the plan to check completion status
- Run `/refresh` logic to verify if all tasks are complete
- Based on status:
  - If plan is complete (all phases have ✅):
    - Inform user the plan is complete.
    - Use **AskUserQuestion** tool:
      ```
      question: "Plan '{plan-name}' is complete. What would you like to do?"
      header: "Plan Complete"
      multiSelect: false
      options:
        - label: "Replace with new plan"
          description: "Delete completed plan and create new one"
        - label: "Create ADR first"
          description: "Capture as ADR with /adr:capture, then replace"
        - label: "Cancel"
          description: "Keep existing plan, don't create new one"
      ```
  - If plan is incomplete:
    - Inform user there's an incomplete plan.
    - Use **AskUserQuestion** tool:
      ```
      question: "Plan '{plan-name}' is incomplete (X% done). What would you like to do?"
      header: "Plan Exists"
      multiSelect: false
      options:
        - label: "Replace plan"
          description: "Delete incomplete plan and create new one"
        - label: "Capture work first"
          description: "Save progress via /adr:capture, then replace"
        - label: "Continue existing"
          description: "Resume work on existing plan (run /go)"
        - label: "Cancel"
          description: "Keep existing plan, don't create new one"
      ```
- WAIT FOR USER decision before proceeding

## Step 2: Initialize .spec Structure

- Create `.codevoyant/plans/` directory if it doesn't exist
- Create or update `.codevoyant/spec.json` if it doesn't exist (with empty `activePlans` and `archivedPlans` arrays)

## Step 2.5: Create Worktree (if requested)

If user provided `--branch` flag, create a git worktree for the plan:

Follow the steps in `references/create-worktree-steps.md` (in this skill directory). Variable name here is `TARGET_BRANCH`. After completion, store `PLAN_WORKTREE="$WORKTREE_PATH"` (or `""` if `SHOULD_CREATE_WORKTREE=false`).

**Error Handling:**
- If worktree already exists, show error and exit
- If directory collision, show error and exit
- If git commands fail, propagate error

## Step 3: Understand the Goal

Ask: "What are you planning to build, implement, or accomplish?"

Wait for the user's response describing their objective.

## Step 3.5: Discover Task Runners

Before research, scan the project root for task runners. This determines how the execution agent will build, test, and validate — it MUST use these instead of inventing its own commands.

Run `scripts/detect-task-runners.sh` and store output as `TASK_RUNNER_SUMMARY`. The script checks for `just`, `make`, `task`, `mise`, `docker-compose`, `npm/yarn/pnpm`, `rake`, `gradle`, `mvn` and lists their available commands.

From the output, specifically identify commands for: **build, test, lint, format, typecheck, run/dev**. Note gaps where a category has no dedicated recipe.

**Store as `TASK_RUNNER_SUMMARY`** — embedded in plan metadata and implementation files so execution agents use project commands, not invented ones. If script returns `"none detected"`, proceed.

## Step 3.6: Discover Available Skills

Check for skills that could accelerate or improve execution:

1. **Local skills** — scan `.claude/skills/` and `plugins/*/skills/` for installed skills relevant to this plan's tech stack or objective. Note any that the execution agent should invoke.

2. **Community skills** — based on the project's detected stack, suggest checking [agentskill.sh](https://agentskill.sh/) for community-published skills. Fetch the page if helpful to identify relevant skills (e.g., a skill for the detected framework, language, or CI system).

**Store as `AVAILABLE_SKILLS`** — list of skill names with brief descriptions of when to use them. This gets included in the plan for the execution agent.

## Step 4: Explore Requirements

1. Clarify Requirements

   If `EXTERNAL_CONTEXT` is set, present it to the user and use it to seed requirements:
   - Pre-fill the objective from the source title/description
   - Note the source reference in the plan metadata: `Source: {SOURCE_URL}`
   - Ask only follow-up questions that the external context doesn't already answer
   - Skip redundant clarification if the source is detailed enough

   - Ask follow-up questions to understand scope and constraints
   - Identify key components or areas that need work
   - Identify whether to lean towards lightweight prototyping or hardcore
     enterprise style engineering for the plan
   - Understand dependencies and order of operations

2. Research Context — run in parallel

   Launch three research agents simultaneously via the Task tool (`run_in_background: true`), then collect all results before proceeding:

   **Agent R1 — Codebase scan** (`model: claude-haiku-4-5-20251001`)
   - Glob/Grep the repo for files, patterns, and existing abstractions relevant to the objective
   - Identify files/systems that will be affected
   - Map the existing architecture and note conventions (naming, structure, patterns in use)
   - Save findings to `$PLAN_DIR/research/codebase-analysis.md`

   **Agent R2 — External research** (`model: claude-sonnet-4-6`)
   - Research existing libraries and solutions for the detected stack
   - Research architectural and design patterns applicable to the objective
   - Keep track of URLs for all resources
   - Save findings to `$PLAN_DIR/research/library-research.md`

   **Agent R3 — Skills lookup** (`model: claude-haiku-4-5-20251001`)
   - Check [agentskill.sh](https://agentskill.sh/) for published skills relevant to the tech stack or objective
   - Check local `.claude/skills/` for installed skills that apply
   - Save a brief list to `$PLAN_DIR/research/available-skills.md`

   Wait for all three agents to complete, then synthesize their findings into your planning context. The research files remain available for the execution agent.

3. Ask follow-up questions **only if still needed** after research.

   - If Step 4.3 exploration is planned (see below), hold off — the proposal selection will likely resolve architectural choices.
   - Ask questions whose answers would meaningfully change the plan; skip anything the research already answered.
   - Ask any questions needed to unblock autonomous execution by Claude.

4. Break Down Work — **after Step 4.3 if exploration was done**.

   - Identify logical phases or groupings of work informed by the selected proposal (or the objective if no exploration)
   - For each phase, identify specific tasks
   - Consider dependencies between phases
   - **Always include a final validation phase** that runs the project's actual build/test commands via the detected task runners — never skip this
   - Estimate complexity and risks

## Step 4.3: Offer Architecture Exploration (Optional)

Run this after research (Step 4 item 2) and before breaking down work (Step 4 item 4). Skip if:
- `--blank` flag is set
- Objective is straightforward — simple bug fix, small config change, or clear single-path refactor (use judgment)

**Identify candidate approaches:**

Based on research findings and objective, identify 2–3 genuinely distinct directions worth comparing. Each must differ in structure or trade-offs, not just naming. Examples by task type:

| Task type | Possible approaches |
|---|---|
| Feature (e.g., feed, auth) | Client-driven vs. server-driven vs. hybrid; pull vs. push data model |
| Refactor | Extract service layer vs. functional core vs. domain model |
| Data schema change | Normalised relational vs. denormalised vs. document vs. event-sourced |
| API design | REST vs. GraphQL vs. RPC; monolithic handler vs. resource-based |

**Offer exploration — open-ended:**

Present candidate directions as inline text and ask the user what they want to explore. Do NOT use a structured yes/no select here — the user may want directions the agent didn't identify. Say something like:

```
Based on the research, here are some directions worth exploring before we plan:

  A. {Approach 1 name} — {one sentence: what it is and its key trade-off}
  B. {Approach 2 name} — {one sentence: what it is and its key trade-off}
  C. {Approach 3 name if applicable} — {one sentence}

Want me to generate full proposals for any of these? You can say yes to explore all of them, name specific ones, suggest completely different directions, or skip straight to planning.
```

Wait for the user's free-text response. Parse it for:
- **All / yes / go**: explore all identified directions
- **Subset** (e.g. "A and C", "just the first one"): explore only those
- **Custom directions**: user named approaches not on the list — add them; drop or keep agent-identified ones as the user specifies
- **Skip / no / directly**: proceed to Step 4 item 4 (Break Down Work) immediately

**Build `DIRECTIONS[]`** from the parsed response — the list of directions to explore in parallel. There is no cap; explore whatever the user asks for.

**Generate proposals in parallel:**

For each direction in `DIRECTIONS[]`, launch one Task simultaneously (`subagent_type: spec-explorer`, `run_in_background: true`). Launch ALL before waiting for any:

```
mode: write
objective: {plan objective and requirements gathered so far}
approach-name: {direction name}
approach-description: {one-sentence description of this direction's key structural idea}
codebase-research-path: {absolute path to $PLAN_DIR/research/codebase-analysis.md}
library-research-path: {absolute path to $PLAN_DIR/research/library-research.md}
template-path: {absolute path to references/proposal-template.md}
output-path: {absolute path to $PLAN_DIR/proposals/{approach-slug}.md}

CRITICAL: Read template-path before writing. Write the full proposal to output-path
using the exact section structure from the template. Confirm by printing: "Written: {output-path}"
```

After launching all Tasks, wait for all with `TaskOutput(block=true)`.

**Verify — do not skip this:**
```bash
for f in "$PLAN_DIR/proposals/"*.md; do
  [ -f "$f" ] && echo "✓ $f" || echo "✗ MISSING"
done
```
If any proposal file is missing (agent completed but didn't write), write it directly using the template and the Task's output — do not proceed without all files present.

**Present and choose:**

Read each proposal file. Extract its verdict line (the `> {one-sentence verdict}` at the top). Then ask:

```
AskUserQuestion:
  question: "Proposals ready — which direction should the plan follow?"
  header: "Choose Approach"
  multiSelect: false
  options:
    - label: "{direction-1 name}"
      description: "{verdict from $PLAN_DIR/proposals/{slug-1}.md}"
    - label: "{direction-2 name}"
      description: "{verdict from $PLAN_DIR/proposals/{slug-2}.md}"
    {... one option per proposal ...}
    - label: "Synthesize — blend the best elements"
      description: "Draw from multiple proposals rather than picking one"
    - label: "Update proposals before deciding"
      description: "Refine one or more proposals with additional context, then re-choose"
```

The built-in "Other" option (automatically provided by AskUserQuestion) handles any direction not listed — treat it as `SELECTED_APPROACH` and store it as a short description. The selection is **not limited to the generated proposals**.

- **Direction selected**: store as `SELECTED_APPROACH`, note the proposal file path — the proposal resolves all architectural choices for this plan
- **Synthesize**: launch a `spec-explorer` Task in `mode: synthesize` with all proposal paths and the user's stated intent. Wait for completion, then reference `$PLAN_DIR/proposals/synthesis.md`.
- **Update proposals before deciding**: ask "Which proposals need updating and what should change?" (free-text). Launch `spec-explorer` in `mode: update` (single) or `mode: bulk-update` (multiple). Wait, then re-present.
- **Other / custom text**: store as `SELECTED_APPROACH` description; ask one clarifying question only if the direction is ambiguous.

**The selected approach drives Step 4 item 4 and Step 5.** Plan phases, implementation files, and architecture decisions should reflect it. Add a `Proposal` metadata line to plan.md referencing the chosen file.

## Step 4.5: Offer Worktree Creation (Optional)

If user did NOT provide `--branch` flag, optionally offer to create a worktree:

**Only ask if:**
- In a git repository (CURRENT_BRANCH is set)
- Not already in a worktree
- No --branch flag was provided

Check if already in worktree: run `scripts/check-worktree.sh` — exits 0 if in a worktree, 1 if not. Set `IN_WORKTREE=true/false` accordingly.

If conditions are met (in git repo, not in worktree, no --branch flag):
1. Derive suggested branch name from plan name (once determined)
2. Use **AskUserQuestion** tool:

```
question: "Would you like to create a git worktree for this plan?"
header: "Worktree Setup"
multiSelect: false
options:
  - label: "Yes, create worktree"
    description: "Create branch 'feature-{plan-name}' with worktree at .codevoyant/worktrees/feature-{plan-name}"
  - label: "Custom branch name"
    description: "Create worktree with a different branch name"
  - label: "No, continue on current branch"
    description: "Work on current branch '{CURRENT_BRANCH}' without worktree"
```

Based on user response:
- **"Yes, create worktree"**: Set `BRANCH_NAME="feature-{plan-name}"`, `SHOULD_CREATE_WORKTREE=true`, update `TARGET_BRANCH`
- **"Custom branch name"**: Ask for branch name using another prompt, then set variables
- **"No, continue on current branch"**: Continue with current branch as metadata only (default behavior)

**Note:** This prompt is optional and skipped if:
- User already provided `--branch` flag
- Not in a git repository
- Already working in a worktree

## Step 5: Create Structured Plan

After gathering requirements:

### 5.1: Determine Plan Name

- If plan name was provided as argument in Step 0, use it
- If not provided, derive from objective using these rules:
  - Convert to lowercase
  - Replace spaces with hyphens
  - Remove special characters (keep alphanumeric and hyphens only)
  - Truncate to 50 characters max
  - Example: "Add Authentication System" → "add-authentication-system"
- Validate the name
- `CHECK_DIR` = `$PLAN_WORKTREE/.codevoyant/plans` if worktree set, else `.codevoyant/plans`
- Resolve collisions: run `scripts/resolve-plan-name.sh <base-name> <CHECK_DIR>` — returns a unique name (appends -2 .. -10) or exits 1 if all taken. If name was modified, inform user.

### 5.2: Create Plan Directory Structure

If `PLAN_WORKTREE` is set and not `"(none)"`: `PLAN_BASE_DIR="$PLAN_WORKTREE/.codevoyant/plans"`, else `PLAN_BASE_DIR=".codevoyant/plans"`. `PLAN_DIR="$PLAN_BASE_DIR/{plan-name}"`.

Create: `$PLAN_BASE_DIR/`, `$PLAN_DIR/`, `$PLAN_DIR/implementation/`, `$PLAN_DIR/research/`, `$PLAN_DIR/proposals/` (for exploration artifacts).

Report: `✓ Plan directory created at: $PLAN_DIR` — note if in worktree or main repo.

### 5.3: Create Plan Files

**a. Create plan.md** at `$PLAN_DIR/plan.md` with high-level structure:

Prepare metadata: `CREATED_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")`, `METADATA_BRANCH=$TARGET_BRANCH` (or `"(none)"`), `METADATA_BASE_BRANCH=$BASE_BRANCH` (or `"main"`), `METADATA_WORKTREE=$PLAN_WORKTREE` (or `"(none)"`), `METADATA_TASK_RUNNERS=$TASK_RUNNER_SUMMARY`.

Create plan.md using the template in `references/plan-template.md` (in this skill directory), substituting all `{...}` placeholders with the prepared metadata values. Include `METADATA_TASK_RUNNERS` in the Metadata section. If `SOURCE_URL` is set, include `- **Source**: {SOURCE_URL}` in the Metadata section of plan.md.

**b. Create user-guide.md** at `$PLAN_DIR/user-guide.md`:

**REQUIRED — do not skip.** This documents how to use what will be built — not how it's implemented. Use the template in `references/user-guide-template.md` (in this skill directory). Fill in what is knowable now (overview, intended usage patterns, expected API surface) and mark unknowable sections with `<!-- TODO: fill in during/after execution -->`. The execution agent must keep this file updated as code is built.

Verify immediately after writing: `test -s "$PLAN_DIR/user-guide.md" && echo "✓ user-guide.md" || echo "✗ user-guide.md missing — write it now"`

Format Requirements for plan.md:
- Use `### Phase N - Description` for phase headers
- Use `1. [ ]` for unchecked tasks
- Use `1. [x]` for checked tasks (all start unchecked)
- Keep task descriptions concise (one line each)
- Add ✅ to phase header only when all tasks in that phase are complete
- Do NOT include detailed implementation specs in plan.md

**c. Create implementation files** for each phase:

For each phase in the plan, create `.codevoyant/plans/{plan-name}/implementation/phase-N.md`:
- Number phases sequentially (phase-1.md, phase-2.md, phase-3.md, etc.)
- Use the template structure in `references/implementation-template.md` (in this skill directory)

**IMPORTANT:** Move ALL detailed implementation specifications into the phase-N.md files:
- Dependencies to add/remove
- Code that will be added/removed with target filenames
- Files to create/modify/delete
- Testing requirements and validation steps
- Detailed execution steps

**Task runner constraint (CRITICAL):** Every build, test, lint, and run command in implementation files MUST use the project's task runners (`METADATA_TASK_RUNNERS`). Never invent custom shell commands when a task runner recipe exists. If a needed operation isn't covered by an existing recipe, note it as a gap and suggest adding one. Include the discovered task runner commands in each phase file's header.

**Available skills:** If `AVAILABLE_SKILLS` is non-empty, note relevant skills in the phase files where they apply (e.g., "use `/ci:monitor` after pushing").

Keep plan.md concise with only:
- High-level objectives
- Design overview
- Task checklists (one-line items)

### 5.4: Register in spec.json

Update `.codevoyant/spec.json` (or `$PLAN_WORKTREE/.codevoyant/spec.json` if in a worktree):
- Read the file if it exists; create it with `{ "version": "1.0", "activePlans": [], "archivedPlans": [] }` if not
- Calculate initial task count from plan.md (count `[ ]` items)
- Append the new plan entry to `activePlans`:

```json
{
  "name": "{plan-name}",
  "description": "[extracted from plan objective]",
  "status": "Active",
  "progress": { "completed": 0, "total": X },
  "created": "{CREATED_TIMESTAMP}",
  "lastUpdated": "{CREATED_TIMESTAMP}",
  "path": ".codevoyant/plans/{plan-name}/",
  "branch": "{METADATA_BRANCH or null}",
  "worktree": "{METADATA_WORKTREE or null}"
}
```

Set `branch` and `worktree` to `null` if their values are `"(none)"` or empty.
Write the updated JSON back to the file.

### 5.5: Create All Implementation Files

**IMPORTANT:** Create detailed implementation files for ALL phases before proceeding.

1. **Parse the plan.md** to count phases:
   - Read `$PLAN_DIR/plan.md`
   - Count lines matching pattern: `^### Phase (\d+)`
   - Store the total number of phases

2. **Create implementation file for each phase:**

For each phase number from 1 to total phases:

Create `$PLAN_DIR/implementation/phase-{N}.md` using the template in `references/implementation-template.md` (in this skill directory).

## Validation

After creating all implementation files, verify the complete plan directory:

```bash
echo "=== Plan file check ==="
test -s "$PLAN_DIR/plan.md"       && echo "✓ plan.md"       || echo "✗ MISSING: plan.md"
test -s "$PLAN_DIR/user-guide.md" && echo "✓ user-guide.md" || echo "✗ MISSING: user-guide.md — write it now before proceeding"
for i in $(seq 1 $PHASE_COUNT); do
  f="$PLAN_DIR/implementation/phase-$i.md"
  test -s "$f" && echo "✓ phase-$i.md" || echo "✗ MISSING: phase-$i.md"
done
```

Report to user:
```
Plan files created:
✓ plan.md
✓ user-guide.md
✓ phase-1.md - {Phase Name}
✓ phase-2.md - {Phase Name}
...
```

**If any file is missing or empty:** write it immediately — do not proceed to Step 5.6 until all files pass the check. Missing user-guide.md is a blocking failure; write it using the template before continuing.

## Step 5.6: Iterative Plan Validation and Auto-Fix (parallel with permissions analysis)

Immediately after all implementation files are verified, launch two agents concurrently:

**Agent P — Permissions analysis** (`subagent_type: general-purpose`, `model: claude-haiku-4-5-20251001`, `run_in_background: true`):

```
Analyze the spec plan at {PLAN_DIR} and identify every permission that an autonomous
execution agent will need in order to run it without being interrupted by permission prompts.

Read:
- {PLAN_DIR}/plan.md
- {PLAN_DIR}/implementation/phase-*.md

For each phase, identify:
1. Bash commands used (git ops, task runners, shell utilities, CLIs like gh/glab)
2. File write operations (inferred from "create", "write", "generate" task language)
3. External network access (WebFetch, WebSearch — inferred from "fetch", "download", "research")

Map each to the Claude Code allow entry format:
- Shell commands → Bash({command}:*)  e.g. Bash(git commit:*), Bash(just test:*)
- File writes already covered by Write/Edit baseline — skip unless path-restricted
- Network → WebFetch, WebSearch

Return a JSON object:
{
  "allow": ["Bash(git commit:*)", "Bash(just test:*)", ...],
  "rationale": {"Bash(git commit:*)": "Phase 2 commits after each task", ...}
}

Be specific — use the narrowest command prefix that covers the actual usage.
Do NOT include entries already in the standard baseline (Write, Edit, Read, Glob, Grep,
Bash(mkdir:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Bash(echo:*), Bash(date:*),
Bash(jq:*), Bash(bash:*), Bash(cp:*), Bash(mv:*)).
```

Store the Task ID as `PERMS_TASK_ID`.

**Validation loop** — run the loop mechanics in `references/validation-loop.md` (minimum 2 rounds, cap at 3, auto-fix every `NEEDS_IMPROVEMENT` result before the next round). Do NOT ask the user — execute all rounds autonomously.

After the validation loop finishes, collect the permissions agent result:
```
TaskOutput(id: PERMS_TASK_ID, block: true)
```
Parse the JSON and store as `SUGGESTED_ALLOW` (list of strings) and `PERMS_RATIONALE`.

## Step 6: Review

If `SUGGESTED_ALLOW` is non-empty, present the permission suggestions before the plan review question:

```
🔐 Permissions needed for autonomous execution:

  {for each entry in SUGGESTED_ALLOW}
  • {entry}  ← {rationale}
  {/for}

These can be added to .claude/settings.json now, or later with /dev:allow.
```

Use **AskUserQuestion**:
```
question: "Pre-approve these {N} permissions for this plan?"
header: "Execution Permissions"
multiSelect: false
options:
  - label: "Yes — add to .claude/settings.json"
    description: "Merge these allow entries now so execution runs uninterrupted"
  - label: "No — I'll handle permissions separately"
    description: "Skip for now; use /dev:allow later if needed"
```

If "Yes": read `.claude/settings.json` (start from `{}` if absent), union the `permissions.allow` array with `SUGGESTED_ALLOW` (deduplicate, sort), write back. Report: `✓ Added {N} allow entries to .claude/settings.json`.

Then present the plan review question using **AskUserQuestion**:

```
question: "Does this plan cover everything? Any changes needed?"
header: "Plan Review"
multiSelect: false
options:
  - label: "Looks good — done"
    description: "Plan is ready for execution"
  - label: "Minor adjustments needed"
    description: "I'll describe what to change"
  - label: "Revisit proposals — planning revealed a problem"
    description: "Go back and update proposals with what we discovered, then re-plan"
```

- **Looks good**: if `BG_MODE=true`, immediately launch background execution for the new plan (invoke `spec:go --bg {plan-name}` — pass `--silent` if `SILENT=true`). Report: `→ Launching background execution for "{plan-name}"…` and then notify on completion. If `BG_MODE=false`, report completion and next steps (`/spec:go` or `/spec:go --bg`)
- **Minor adjustments**: accept free-text, apply changes to plan.md and/or implementation files, re-run Step 5.6 validation if structural changes were made, then return to this Step 6 prompt
- **Revisit proposals**: ask "What did planning reveal that should change the proposals?" (free-text). Then:
  1. Launch a `spec-explorer` Task in `mode: bulk-update` with all proposal paths in `$PLAN_DIR/proposals/` and the user's stated new context. Wait for completion.
  2. Report which proposals changed and what was updated.
  3. Re-run **Step 4.3** from "Present and choose" — present the updated proposals for a new selection decision.
  4. Once a new approach is selected, re-run **Step 4 item 4** (Break Down Work) and **Step 5** (Create Structured Plan) — overwriting the previous plan files.

**Note:** "Revisit proposals" is only available if proposals exist in `$PLAN_DIR/proposals/`. If no proposals were generated (user chose "Skip" at Step 4.3), offer free-text plan adjustment only.

## Best Practices and Execution Constraints

See `references/execution-guidelines.md` for task writing best practices and constraints that execution agents (go, bg) must follow.
