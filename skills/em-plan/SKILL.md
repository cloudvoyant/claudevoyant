---
description: "Use when planning a project (epic) or initiative with Linear as tracker.
  Triggers on: \"em plan\", \"plan an engineering project\", \"plan a tech project\", \"plan an epic\", \"engineering planning\",
  \"initiative planning\", \"eng plan\", \"engineering roadmap\". Produces local milestone-grouped task
  plan then pushes to Linear on user confirmation."
name: em:plan
license: MIT
compatibility: "Designed for Claude Code. On OpenCode and VS Code Copilot, AskUserQuestion falls back to numbered list; context: fork runs inline. Core functionality preserved on all platforms."
argument-hint: "[project-description|linear-url] [--delegate] [--continue <id>] [--push <slug>] [--bg]"
disable-model-invocation: true
context: fork
agent: general-purpose
model: claude-opus-4-6
---

> **Compatibility**: If `AskUserQuestion` is unavailable, present options as a numbered list and wait for the user's reply. If `Task` is unavailable, run parallel steps sequentially. The `context: fork` and `agent:` frontmatter fields are Claude Code-specific — on OpenCode and VS Code Copilot they are ignored and the skill runs inline using the current model.

---

## Critical Principles

- "Outcomes, not deliverables." — The objective must state what changes for users or the business, not what gets built. "Ship the auth refactor" is a deliverable. "Reduce auth-related support tickets by 30%" is an outcome. If you cannot state the outcome, flag it before planning tasks.
- "Capacity is already allocated." — A plan at 100% capacity is a plan that cannot absorb a single interrupt, bug, or scope discovery. Leave 20–30% unplanned. If the user insists on full allocation, flag it explicitly rather than silently accepting it.
- "Every dependency is a schedule bet." — Any task blocked on another team, external API, or unresolved design decision is a risk multiplier, not just a sequencing note. Name the dependency, name who owns it, and name what happens if it slips.

## Anti-Patterns

- ❌ **Objective stated as a feature list**: Writing the objective as a list of things to build ("Add SSO, add MFA, add session management") rather than a goal. → Ask: what user problem or business metric does this change? Restate as outcome before proceeding.
- ❌ **Tasks generated before design/SA is resolved**: Creating implement-phase tasks when Design/SA status is still open. → Design and SA decisions gate implementation scope. If design is deferred, create a design milestone task first; do not generate develop.md tasks that assume a design that hasn't been made.
- ❌ **Full-capacity milestone planning**: Filling every sprint or milestone to 100% of estimated capacity. → Apply the 70% rule: plan to 70% of capacity, leave 30% for discovered work. Flag to the user if their scope requires >80% utilization.
- ❌ **Acceptance criteria that cannot be verified in under 5 minutes**: ACs like "the feature works correctly" or "performance is acceptable." → Each AC must name a specific, observable condition a human can check in under 5 minutes without specialized tooling. Rewrite vague ACs before writing to disk.
- ❌ **Treating the codebase scan as optional research**: Skipping or summarizing Agent R1 when the project description seems self-contained. → Always complete the codebase scan. The most common planning waste is building something that already exists or that conflicts with an existing pattern.

---

Plan a project or initiative with Linear as tracker. Local-first: all artifacts land in `.codevoyant/em/plans/{slug}/`, then push to Linear on confirmation.

## Step 0: Parse Args

Extract flags:
```
DELEGATE    = true if --delegate present
CONTINUE_ID = value after --continue (Linear project ID or URL)
PUSH_SLUG   = value after --push (existing local plan slug to re-push)
BG_MODE     = true if --bg present
```

- If `PUSH_SLUG` set: read `.codevoyant/em/plans/{PUSH_SLUG}/` local files and jump directly to **Step 8 (Push to Linear)**.
- If `CONTINUE_ID` set: jump to **Step 0.5 (Continue Mode)**.
- Detect Linear URL or issue ID in remaining args -> `SOURCE_ID`.
- Derive `SLUG` from description or SOURCE_ID; check `.codevoyant/em/plans/{slug}/` for collision (append `-2`, `-3`, etc.).

Set `PLAN_DIR=".codevoyant/em/plans/{SLUG}"`.

## Step 0.5: Continue Mode (only if --continue)

Extract project ID from `CONTINUE_ID` (strip URL prefix if a Linear URL was provided).

### Fetch Linear state (in sequence):

1. `mcp__claude_ai_Linear__get_project(id=CONTINUE_ID)` -- get project name, description, status. Derive `SLUG` from project name.
2. `mcp__claude_ai_Linear__list_milestones` filtered by `projectId=CONTINUE_ID` -- get milestone names and sort orders.
3. `mcp__claude_ai_Linear__list_issues` filtered by `projectId=CONTINUE_ID`, `includeArchived=false` -- get all active/completed/cancelled issues with their milestone assignments.

Set `PLAN_DIR=".codevoyant/em/plans/{SLUG}"`.

### Map Linear state to local plan:

**If local plan files do NOT exist yet** (first `--continue` run):
- Create `PLAN_DIR` directory structure (`tasks/`, `research/`)
- Write `plan.md` from project description using `references/plan-template.md`
- Create milestone files (`tasks/design.md`, `tasks/develop.md`, `tasks/deploy.md`) from Linear milestones, populating tasks using `references/task-template.md`
- Record Linear IDs in `linear-ids.json`

**If local plan files already exist** (reconciliation):
- **Local is source of truth for:** requirements, ACs, design/SA notes (do not overwrite from Linear)
- **Linear is source of truth for:** issue status, new issues added by team members
- Completed issues in Linear -> mark as `[x]` in the relevant milestone file
- Cancelled issues in Linear -> note as `~~dropped~~` with cancellation reason if available
- New issues in Linear (not in local files) -> append to the relevant milestone file using `references/task-template.md`
- Update `plan.md` milestone status table with current completion counts

### Resume planning:

After reconciliation, proceed to **Step 7 (Scope Confirmation Loop)** for the user to review the updated state.

On confirmation: push only changed items back to Linear via `mcp__claude_ai_Linear__save_issue` for any locally modified issues (updated requirements, ACs, or design notes). Do not re-push items whose only change came from Linear.

## Step 1: System Audit

Run the following bash commands and store all findings as `AUDIT_CONTEXT`:

```bash
git log --oneline -10
ls .codevoyant/em/plans/*/plan.md 2>/dev/null || echo "(no existing plans)"
ls docs/architecture/ 2>/dev/null && echo "arch docs present" || echo "no arch docs"
```

If existing plans are found, surface them:
```
Found existing plans: {list}
-> This will create a NEW plan ({SLUG}). If you meant to update an existing one, say "update {slug}" instead.
```

## Step 2: Gather Planning Context

AskUserQuestion:
```
question: "What are we planning?"
header: "Scope"
options:
  - label: "Single project (epic, 1-2 weeks)"
    description: "One bounded deliverable -- becomes a Linear Project"
  - label: "Initiative (multiple projects, possibly multiple teams)"
    description: "Larger goal spanning several epics -- becomes a Linear Initiative"
  - label: "Pull from Linear"
    description: "Fetch an existing Linear project or initiative to plan from"
```

If "Pull from Linear": ask for the URL or ID, then fetch using the appropriate MCP call based on the input:
- Issue URL or ID (e.g. `ENG-42`, contains `/issue/`): `mcp__claude_ai_Linear__get_issue`
- Project URL (contains `/project/`): `mcp__claude_ai_Linear__get_project`
- Initiative URL (contains `/initiative/`): `mcp__claude_ai_Linear__get_initiative`

Store the fetched title, description, and status as `SOURCE_CONTEXT`.

Second question -- team context:
```
question: "Which team owns this?"
header: "Team"
```
Fetch teams: `mcp__claude_ai_Linear__list_teams`. Present as options. Store as `TEAM_ID`, `TEAM_NAME`.

## Step 2.5: Fetch Requirements Context (if URL/ID provided)

- `mcp__claude_ai_Linear__get_issue` or `mcp__claude_ai_Linear__get_project`
- Store title, description, labels -> `SOURCE_CONTEXT`

## Step 3: Define Requirements

If `DELEGATE=true`: skip detailed requirements -- ask only for a 1-paragraph summary per project; proceed to Step 6 (Delegate).

Otherwise, gather:
- Functional requirements (what the system must do)
- Non-functional requirements (performance, security, scale)
- Acceptance criteria (how we know it's done)
- Design/SA status: already decided (describe it) | deferred (note what needs deciding)

AskUserQuestion after user describes the project:
```
question: "Is design/architecture already decided?"
header: "Design status"
options:
  - label: "Yes -- I'll describe the high-level design"
    description: "No code yet, but architecture is known"
  - label: "Deferred -- needs a design milestone"
    description: "Design work is part of this plan"
  - label: "Simple -- no design needed"
    description: "Straightforward task, no architecture decision"
```

## Step 4: Parallel Research

Launch two background agents (`model: claude-haiku-4-5-20251001`, `run_in_background: true`):

**Agent R1 -- Codebase Scan:** Glob/Grep for files relevant to this project. Identify affected systems, existing patterns, test coverage. Save to `.codevoyant/em/plans/{slug}/research/codebase.md`. Each finding must follow the format in `skills/shared/references/research-standards.md`.

**Agent R2 -- Linear Context:** Fetch related projects in the same team (`mcp__claude_ai_Linear__list_projects`), any matching issues (`mcp__claude_ai_Linear__list_issues` with text filter), existing labels. Save to `.codevoyant/em/plans/{slug}/research/linear-context.md`. Each finding must follow the format in `skills/shared/references/research-standards.md`.

Wait for both. Synthesize: flag anything that already exists or overlaps with active projects.

## Step 4.5: Quality Checkpoint

Before writing plan.md, run a structured self-check against these criteria. Output a Quality Checkpoint block as shown.

**Criteria:**

1. **Objective framing** — Does the objective describe a user/business outcome, not a deliverable list?
   - PASS: at least one bullet names a measurable outcome (metric, user behavior change, system property)
   - WARN: objective is ambiguous but not purely a feature list — note and proceed
   - BLOCK: objective is entirely a list of deliverables ("build X, add Y, implement Z") with no outcome → ask the user: "What changes for users or the business if this ships successfully?"

2. **Codebase scan completed** — Was Agent R1 run and did it produce findings?
   - PASS: R1 findings are present and non-empty
   - BLOCK: R1 was skipped or returned no findings → re-run R1 before proceeding

3. **Dependencies named** — Are external dependencies (other teams, external APIs, unresolved design decisions) explicitly named?
   - PASS: at least one dependency named with owner, or explicitly confirmed there are none
   - WARN: dependencies likely exist but were not surfaced — add a note in the plan's Open Questions

4. **Capacity headroom noted** — Is there any indication the plan accounts for buffer (not 100% allocated)?
   - PASS: user mentioned capacity constraints or the plan scope is clearly partial
   - WARN: no mention — add a reminder comment in the plan's milestone section

5. **Acceptance criteria measurable** — Are the stated ACs specific enough to verify in under 5 minutes?
   - PASS: each AC names a specific observable condition
   - WARN: one or more ACs are vague — flag them with inline comments in plan.md
   - BLOCK: all ACs are vague or absent → ask the user for at least one concrete, verifiable AC before proceeding

**Output format:**
```
## Quality Checkpoint

✅ Objective is outcome-framed (not a deliverable list)
✅ Codebase scan completed with findings
✅ 3 dependencies named with owners
⚠️  WARN: Capacity buffer not mentioned — will note in plan
❌ BLOCK: All ACs are vague — need at least one concrete, verifiable AC
   → Resolve: ask the user for specific acceptance criteria before writing

Quality Brief:
- Building X for Y to achieve Z (outcome confirmed)
- Key dependencies: [list]
- Gap: capacity buffer not mentioned — adding reminder in milestone section
- BLOCK: ACs need user input before proceeding
```

**BLOCK behavior:** If one or more BLOCKs are found, do not proceed to Step 5. Present the BLOCK items to the user with specific questions and wait for resolution. After resolution, re-run the checkpoint.

After running the checkpoint, write the Quality Brief (3–5 bullets) and use it as the grounding context for Step 5.

## Step 5: Build Milestone Task Plan

If `DELEGATE=true`: skip this step entirely -- proceed to **Step 6 (Delegate Mode)**.

Create plan directory:
```bash
mkdir -p .codevoyant/em/plans/{slug}/tasks
mkdir -p .codevoyant/em/plans/{slug}/research
```

Write `.codevoyant/em/plans/{slug}/plan.md` using the plan template at `references/plan-template.md`.

After writing plan.md, scan the Objective bullets. If any bullet's primary verb is a delivery verb (ship / build / implement / deliver / release / complete):
  Insert an inline comment: `<!-- RIGOR: reframe as outcome — what changes for users/team? -->`
  and flag in the scope confirmation summary: "1 objective bullet uses output framing — see plan.md comment."

Generate the three milestone files inline:
- `tasks/design.md` -- design, UX, architecture, product research tasks
- `tasks/develop.md` -- implementation tasks (only after design is defined/deferred)
- `tasks/deploy.md` -- staging + prod deployment, smoke tests, rollback plan

Each task file uses the template at `references/task-template.md`. Requirements and ACs must be spelled out per task. Design/SA must be specified or explicitly marked deferred.

## Step 6: Delegate Mode (only if DELEGATE=true)

Create plan directory and write lightweight stubs instead of full milestone breakdown:

```bash
mkdir -p .codevoyant/em/plans/{slug}/tasks
mkdir -p .codevoyant/em/plans/{slug}/research
```

Write `.codevoyant/em/plans/{slug}/plan.md` using `references/plan-template.md` (mark milestones as "delegated").

Write `tasks/stubs.md`:
```markdown
# Delegation Stubs — {project name}

These issues will be created in Linear for the relevant teams to detail.

## PM Stub
**Title:** PM: {project} — define requirements and acceptance criteria
**Description:** Scope: {1-paragraph summary}. Owner: PM team.

## UX Stub
**Title:** UX: {project} — design exploration and wireframes
**Description:** Scope: {1-paragraph summary}. Owner: UX team. Starts after PM stub resolved.

## DEV Stub
**Title:** DEV: {project} — architecture spike
**Description:** Scope: {1-paragraph summary}. Owner: Engineering. Starts after PM + UX stubs.
```

Proceed to Step 7 (confirmation) with delegate context flagged.

## Step 7: Scope Confirmation Loop

Show plan summary. If `DELEGATE=true`: show stub titles from `tasks/stubs.md` (not full task list). If `CONTINUE_ID` was set: show reconciliation diff (new issues, status changes).

AskUserQuestion:
```
question: "Does this plan cover everything?"
header: "Plan Review"
options:
  - label: "Confirm -- push to Linear"
    description: "Create project, milestones, and issues in Linear"
  - label: "Adjust scope"
    description: "Change what's in the plan before pushing"
  - label: "Save locally only"
    description: "Keep as local draft, don't push to Linear yet"
```

Loop on adjustments until "Confirm" or "Save locally only".

## Step 8: Push to Linear

Only runs if user selected "Confirm -- push to Linear" (or `--push` flag).

Follow the MCP call sequence in `references/linear-push-guide.md`:

1. If initiative-level: `mcp__claude_ai_Linear__save_initiative` -> store `INITIATIVE_ID`
2. `mcp__claude_ai_Linear__save_project` with `teamId`, `name`, description (from plan.md objective), `initiativeId` if set -> store `PROJECT_ID`
3. For each milestone (design / develop / deploy):
   `mcp__claude_ai_Linear__save_milestone` with `projectId=PROJECT_ID`, name, sortOrder -> store `MILESTONE_IDs`
4. For each task in each milestone file:
   `mcp__claude_ai_Linear__save_issue` with `teamId`, `projectId`, `projectMilestoneId`, title, description (requirements + ACs)

If `DELEGATE=true`: skip milestone creation (steps 2-3 above). Create only the project and the 3 stub issues from Step 6 (PM, UX, DEV). No milestones are created.

Record all created IDs in `.codevoyant/em/plans/{slug}/linear-ids.json`.

Report: `Pushed to Linear: {project-url}. {N} milestones, {M} issues created.`

## Step 9: Notification

If `BG_MODE`:

```bash
npx @codevoyant/agent-kit notify --title "em:plan complete" --message "Plan '{slug}' confirmed and pushed to Linear: {M} issues across 3 milestones."
```
