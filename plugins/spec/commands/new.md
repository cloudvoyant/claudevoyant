Create a new plan by exploring requirements and building a structured plan. The
goal is to create a high quality implementation plan that can be executed
autonomously.

## Step 0: Parse Arguments

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

**Store parsed values:**
```bash
PLAN_NAME="[parsed-plan-name or empty]"
BRANCH_NAME="[parsed-branch-name or empty]"
```

## Step 0.5: Detect Branch Context

Detect the current git branch and determine target branch for plan:

```bash
# Check if in git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Warning: Not in a git repository. Branch features disabled."
  CURRENT_BRANCH=""
  TARGET_BRANCH=""
  BASE_BRANCH=""
else
  # Get current branch
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

  # Determine target branch for plan
  if [ -n "$BRANCH_NAME" ]; then
    # User provided --branch flag
    TARGET_BRANCH="$BRANCH_NAME"
    SHOULD_CREATE_WORKTREE=true
    BASE_BRANCH="$CURRENT_BRANCH"
  else
    # No --branch flag, use current branch as metadata only
    TARGET_BRANCH="$CURRENT_BRANCH"
    SHOULD_CREATE_WORKTREE=false
    BASE_BRANCH="$CURRENT_BRANCH"
  fi
fi
```

Store these values for use in later steps:
- `CURRENT_BRANCH` - Current git branch (empty if not in git repo)
- `TARGET_BRANCH` - Branch to associate with plan
- `BASE_BRANCH` - Base branch for creating new branches
- `SHOULD_CREATE_WORKTREE` - Whether to create worktree (true if --branch flag used)

## Step 1: Check for Existing Plan

If a specific plan name was provided, check if `.spec/plans/{plan-name}/plan.md` already exists.
If no plan name was provided, check if `.spec/plans/README.md` exists and contains any active plans.

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

- Create `.spec/plans/` directory if it doesn't exist
- Create or update `.spec/plans/README.md` if it doesn't exist (with empty Active/Archived sections)

## Step 2.5: Create Worktree (if requested)

If user provided `--branch` flag, create a git worktree for the plan:

```bash
if [ "$SHOULD_CREATE_WORKTREE" = "true" ] && [ -n "$TARGET_BRANCH" ]; then
  WORKTREE_PATH=".worktrees/$TARGET_BRANCH"

  # Validation: Check if worktree already exists
  if git worktree list | grep -q "\[$TARGET_BRANCH\]"; then
    echo "Error: Worktree for branch '$TARGET_BRANCH' already exists"
    echo "Use: git worktree list to see existing worktrees"
    exit 1
  fi

  # Validation: Check if directory exists
  if [ -d "$WORKTREE_PATH" ]; then
    echo "Error: Directory $WORKTREE_PATH already exists"
    exit 1
  fi

  # Create .worktrees directory if needed
  mkdir -p .worktrees

  # Check if branch exists
  if git rev-parse --verify "$TARGET_BRANCH" >/dev/null 2>&1; then
    # Branch exists, use it
    echo "Using existing branch '$TARGET_BRANCH'"
    git worktree add "$WORKTREE_PATH" "$TARGET_BRANCH"
  else
    # Branch doesn't exist, create from base
    echo "Creating new branch '$TARGET_BRANCH' from '$BASE_BRANCH'"
    git worktree add -b "$TARGET_BRANCH" "$WORKTREE_PATH" "$BASE_BRANCH"
  fi

  # Update .gitignore
  if [ -f .gitignore ]; then
    if ! grep -qx "\.worktrees/\?" .gitignore; then
      echo "" >> .gitignore
      echo "# Git worktrees" >> .gitignore
      echo ".worktrees/" >> .gitignore
      echo "✓ Added .worktrees/ to .gitignore"
    fi
  else
    echo "# Git worktrees" > .gitignore
    echo ".worktrees/" >> .gitignore
    echo "✓ Created .gitignore with .worktrees/ entry"
  fi

  echo "✓ Worktree created at $WORKTREE_PATH"
  echo "  To work in worktree: cd $WORKTREE_PATH"

  # Store worktree path for metadata
  PLAN_WORKTREE="$WORKTREE_PATH"
else
  # No worktree created
  PLAN_WORKTREE=""
fi
```

**Error Handling:**
- If worktree already exists, show error and exit
- If directory collision, show error and exit
- If git commands fail, propagate error

## Step 3: Understand the Goal

```markdown
# [New Plan Name]

## Objective

[What are you trying to accomplish?]

## Design

[High level solution design]

## Plan

### Phase 1 - [Phase Name]

1. [ ] Task 1
2. [ ] Task 2
3. [ ] Task 3

### Phase 2 - [Phase Name]

1. [ ] Task 1
2. [ ] Task 2

## Implementation

[Will be filled in post-planning]

## Resources

1. [Example Resource](example.com/how-to-article.html)
```

Ask: "What are you planning to build, implement, or accomplish?"

Wait for the user's response describing their objective.

## Step 4: Explore Requirements

1. Clarify Requirements

   - Ask follow-up questions to understand scope and constraints
   - Identify key components or areas that need work
   - Identify whether to lean towards lightweight prototyping or hardcore
     enterprise style engineering for the plan
   - Understand dependencies and order of operations

2. Research Context

   - Search codebase for relevant files and patterns
   - Review existing architecture and structure
   - Identify files/systems that will be affected
   - THINK HARD about how to systematically implement the gathered requirements
     - Research existing libraries and solutions that could meet users needs
       based on the project's language/stack
     - Research architectural and design patterns that could be useful for
       implementation
     - Research existing libraries that implement similar solutions
     - Keep track of URLs for any resources you are relying on

3. ASK USER FOLLOW UP QUESTIONS.

   - Ask any questions needed to make architectural or important implementation
     choices.
   - Ask any questions needed to unblock autonomous execution by Claude.

4. Break Down Work

   - Identify logical phases or groupings of work
   - For each phase, identify specific tasks
   - Consider dependencies between phases
   - Estimate complexity and risks

## Step 4.5: Offer Worktree Creation (Optional)

If user did NOT provide `--branch` flag, optionally offer to create a worktree:

**Only ask if:**
- In a git repository (CURRENT_BRANCH is set)
- Not already in a worktree
- No --branch flag was provided

Check if already in worktree:
```bash
# Check if already in worktree
COMMON_DIR=$(git rev-parse --git-common-dir 2>/dev/null)
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)
IN_WORKTREE=false
if [ "$COMMON_DIR" != "$GIT_DIR" ]; then
  IN_WORKTREE=true
fi
```

If conditions are met (in git repo, not in worktree, no --branch flag):
1. Derive suggested branch name from plan name (once determined)
2. Use **AskUserQuestion** tool:

```
question: "Would you like to create a git worktree for this plan?"
header: "Worktree Setup"
multiSelect: false
options:
  - label: "Yes, create worktree"
    description: "Create branch 'feature-{plan-name}' with worktree at .worktrees/feature-{plan-name}"
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
- **Determine check location** based on worktree:
  ```bash
  if [ -n "$PLAN_WORKTREE" ] && [ "$PLAN_WORKTREE" != "(none)" ]; then
    CHECK_DIR="$PLAN_WORKTREE/.spec/plans"
  else
    CHECK_DIR=".spec/plans"
  fi
  ```
- Check for collisions in `$CHECK_DIR` directory
  - If collision exists, try appending -2, -3, ... -10 sequentially
  - Check each candidate until finding available name
  - If all attempts (-10) still collision, report error:
    "Too many plans with similar names. Please choose a more unique name: '{base-name}-X' already exists for X=1 through 10"
  - If name was modified due to collision, inform user:
    "Plan name '{original}' already exists. Using '{modified}' instead."

### 5.2: Create Plan Directory Structure

**Determine plan location based on worktree:**

```bash
if [ -n "$PLAN_WORKTREE" ] && [ "$PLAN_WORKTREE" != "(none)" ]; then
  # Plan goes in worktree for complete isolation
  PLAN_BASE_DIR="$PLAN_WORKTREE/.spec/plans"
  PLAN_IN_WORKTREE=true
else
  # Plan goes in main repo
  PLAN_BASE_DIR=".spec/plans"
  PLAN_IN_WORKTREE=false
fi

PLAN_DIR="$PLAN_BASE_DIR/{plan-name}"
```

**Create directories:**
- Create `$PLAN_BASE_DIR/` (if it doesn't exist)
- Create `$PLAN_DIR/` directory
- Create `$PLAN_DIR/implementation/` directory

**Report location:**
```
✓ Plan directory created at: $PLAN_DIR
{if PLAN_IN_WORKTREE}
  → Plan lives in worktree for complete isolation
  → cd $PLAN_WORKTREE to work on this feature
{else}
  → Plan in main repo, visible from all branches
{endif}
```

### 5.3: Create Plan Files

**a. Create plan.md** at `$PLAN_DIR/plan.md` with high-level structure:

First, prepare metadata values:
```bash
# Get current timestamp in ISO 8601 UTC format
CREATED_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Set metadata values
if [ -n "$TARGET_BRANCH" ]; then
  METADATA_BRANCH="$TARGET_BRANCH"
  METADATA_BASE_BRANCH="${BASE_BRANCH:-main}"
else
  METADATA_BRANCH="(none)"
  METADATA_BASE_BRANCH="main"
fi

if [ -n "$PLAN_WORKTREE" ]; then
  METADATA_WORKTREE="$PLAN_WORKTREE"
else
  METADATA_WORKTREE="(none)"
fi
```

Then create plan.md with metadata:
```markdown
# [Plan Title]

## Metadata
- **Branch**: {METADATA_BRANCH}
- **Base Branch**: {METADATA_BASE_BRANCH}
- **Worktree**: {METADATA_WORKTREE}
- **Created**: {CREATED_TIMESTAMP}

## Objective
[2-4 bullet points summarizing goals]

## Design
[High-level solution architecture - list major classes/functions/concepts]
[Any changes to project or directory structure]

## Plan

### Phase 1 - [Phase Name]
1. [ ] Task 1
2. [ ] Task 2

### Phase 2 - [Phase Name]
1. [ ] Task 1
2. [ ] Task 2

## Resources
1. [Link Title](url)
```

Format Requirements for plan.md:
- Use `### Phase N - Description` for phase headers
- Use `1. [ ]` for unchecked tasks
- Use `1. [x]` for checked tasks (all start unchecked)
- Keep task descriptions concise (one line each)
- Add ✅ to phase header only when all tasks in that phase are complete
- Do NOT include detailed implementation specs in plan.md

**b. Create implementation files** for each phase:

For each phase in the plan, create `.spec/plans/{plan-name}/implementation/phase-N.md`:
- Number phases sequentially (phase-1.md, phase-2.md, phase-3.md, etc.)
- Use this template structure:

```markdown
# Phase N - [Phase Name]

## Overview
[Brief description of what this phase accomplishes]

## Tasks

### Task 1: [Task Description]

**Implementation Steps:**
1. [Detailed step 1]
2. [Detailed step 2]
3. [Detailed step 3]

**Files to Modify:**
- `path/to/file1.ts` - [what changes]
- `path/to/file2.ts` - [what changes]

**Files to Create:**
- `path/to/newfile.ts` - [purpose and content]

**Dependencies:**
- Add: `package-name@version` - [why needed]
- Remove: `old-package` - [why removing]

**Code Examples:**
```typescript
// Example implementation
function example() {
  // ...
}
```
```

**Testing:**
- [ ] Unit tests for [specific functionality]
- [ ] Integration tests for [specific workflow]
- [ ] Manual testing steps:
  1. [Step 1]
  2. [Step 2]

---

### Task 2: [Task Description]
...
```

**IMPORTANT:** Move ALL detailed implementation specifications into the phase-N.md files:
- Dependencies to add/remove
- Code that will be added/removed with target filenames
- Files to create/modify/delete
- Testing requirements
- Detailed execution steps

Keep plan.md concise with only:
- High-level objectives
- Design overview
- Task checklists (one-line items)

### 5.4: Register in README

Update `.spec/plans/README.md`:
- Add plan to Active Plans section
- Include branch and worktree information if applicable
- Set status to "Active"
- Calculate initial task count from plan.md
- Set created and last updated timestamps to current time
- Use this format:

```markdown
### {plan-name}
- **Description**: [extracted from plan objective]
{if METADATA_BRANCH != "(none)"}
- **Branch**: {METADATA_BRANCH} 🌿
{endif}
{if METADATA_WORKTREE != "(none)"}
- **Worktree**: {METADATA_WORKTREE}
{endif}
- **Status**: Active
- **Progress**: 0/X tasks (0%)
- **Created**: {CREATED_TIMESTAMP}
- **Last Updated**: {CREATED_TIMESTAMP}
- **Path**: `.spec/plans/{plan-name}/`
```

**Implementation:**
Only include branch and worktree lines if they have values other than "(none)".

Example with branch and worktree:
```markdown
### my-feature
- **Description**: Add new authentication system
- **Branch**: feature-auth 🌿
- **Worktree**: .worktrees/feature-auth
- **Status**: Active
- **Progress**: 0/10 tasks (0%)
- **Created**: 2026-02-12T12:00:00Z
- **Last Updated**: 2026-02-12T12:00:00Z
- **Path**: `.spec/plans/my-feature/`
```

Example without worktree:
```markdown
### my-fix
- **Description**: Fix bug in payment processing
- **Branch**: main 🌿
- **Status**: Active
- **Progress**: 0/5 tasks (0%)
- **Created**: 2026-02-12T12:00:00Z
- **Last Updated**: 2026-02-12T12:00:00Z
- **Path**: `.spec/plans/my-fix/`
```

### 5.5: Create All Implementation Files

**IMPORTANT:** Create detailed implementation files for ALL phases before proceeding.

1. **Parse the plan.md** to count phases:
   - Read `.spec/plans/{plan-name}/plan.md`
   - Count lines matching pattern: `^### Phase (\d+)`
   - Store the total number of phases

2. **Create implementation file for each phase:**

For each phase number from 1 to total phases:

Create `.spec/plans/{plan-name}/implementation/phase-{N}.md` with this structure:

```markdown
# Phase {N} - {Phase Name}

## Overview
{Brief description of what this phase accomplishes and its role in the overall plan}

## Tasks

{For each task in this phase from plan.md:}

### Task {X}: {Task Description}

**Implementation Steps:**
1. {Detailed step-by-step instructions}
2. {Be specific about what to do}
3. {Include exact commands, file paths, code patterns}

**Files to Modify:**
- `path/to/file.ext` - {Specific changes to make}

**Files to Create:**
- `path/to/newfile.ext` - {Purpose and key content}

**Code Examples:**
```{language}
// Show concrete code examples that should be implemented
```
```

**Testing:**
- [ ] {Specific test to write or run}
- [ ] {Manual verification steps}

**Success Criteria:**
- {How to verify this task is complete}
- {Expected behavior or output}

---

{Repeat for each task in the phase}
```

## Validation

After creating all implementation files:
1. Verify each file exists: `.spec/plans/{plan-name}/implementation/phase-{1..N}.md`
2. Verify each file is not empty (>100 bytes minimum)
3. Report created files to user:
   ```
   Created implementation files:
   ✓ phase-1.md - {Phase Name}
   ✓ phase-2.md - {Phase Name}
   ...
   ```

**If any file creation fails:**
- Report error with specific phase number
- Do not proceed to Step 6
- User must fix before continuing

## Step 5.6: Iterative Plan Validation and Auto-Fix

Immediately after all implementation files are verified, run an automated validation-and-fix loop. Do NOT ask the user — execute all rounds autonomously.

**Run a minimum of 2 validation rounds.** After each round that surfaces issues, automatically apply all fixes before running the next round.

---

### Validation Prompt

For each round, use the **Task tool** with:
- `subagent_type`: `general-purpose`
- `run_in_background`: `true`
- `description`: "Validate spec plan quality (round N)"
- `prompt`:

```
You are validating a software development plan for autonomous execution quality. Read and analyze every plan file, then produce a structured validation report.

Read these files:
1. .spec/plans/{plan-name}/plan.md
2. Every file in .spec/plans/{plan-name}/implementation/

Validate the following quality criteria:

**Task Quality**
- Are all tasks specific and actionable (not vague phrases like "implement X", "update Y")?
- Does each task have an implied or explicit success criterion?
- Are tasks appropriately scoped (not so large they require sub-planning)?

**Implementation Completeness**
- Does each phase file have concrete, step-by-step implementation instructions?
- Are file paths specific and unambiguous (not "relevant files" or "appropriate location")?
- Are code examples present for non-trivial logic?
- Is there enough detail for an autonomous agent to execute without asking clarifying questions?

**Consistency**
- Does each phase file cover all tasks listed in plan.md for that phase?
- Are phase names and task descriptions consistent between plan.md and implementation files?

**Test Coverage**
- Does each task specify what tests to write or run?
- Are acceptance/success criteria testable?

**Dependencies & Risks**
- Are inter-phase dependencies identified?
- Are external package/library dependencies noted?
- Are potential failure points or edge cases addressed?

Respond ONLY in this exact format:

## Validation Report

### Status: [PASS | NEEDS_IMPROVEMENT]

### Issues
[phase-N, task-X] Description of specific issue
(write "none" if no issues)

### Recommendations
- Specific actionable improvement with the exact file and section to change
(write "none" if no recommendations)

### Missing Details
- What is absent from implementation files that would block autonomous execution
(write "none" if nothing is missing)
```

---

### Validation Loop

Repeat the following for **round = 1, 2, ...** (minimum 2 rounds, stop when round ≥ 2 AND status is PASS):

**a. Launch validation agent:**
```
Notify user: "🔍 Validation round {round} running..."
Launch Task tool (run_in_background=true) → store VALIDATION_TASK_ID
Use TaskOutput tool (block=true) to wait for results
```

**b. Parse result:**
- Extract `### Status:` → `PASS` or `NEEDS_IMPROVEMENT`
- Extract issues, recommendations, missing details

**c. If status is NEEDS_IMPROVEMENT, auto-fix before the next round:**
- Work through every issue and recommendation one by one
- Edit the relevant `implementation/phase-N.md` files directly
- If plan.md tasks are too vague, rewrite them to be specific and actionable
- After fixing, report: `🔧 Round {round} — fixed {N} issues: [brief summary of changes]`

**d. If status is PASS and round ≥ 2:**
- Break the loop

**e. Cap at 3 rounds** to avoid infinite loops. After round 3, proceed regardless of status and note any remaining issues in the final summary.

---

### Final Validation Summary

After the loop completes, display a summary:
```
✅ Plan validation complete ({N} rounds)
   Round 1: [PASS|NEEDS_IMPROVEMENT — X issues fixed]
   Round 2: [PASS|NEEDS_IMPROVEMENT — X issues fixed]
   Final status: [PASS | X issues remain (see below)]
   [If issues remain: list them]
```

## Step 6: Review

Present the final validation summary and ask: "Does this plan cover everything? Any changes needed?"

Wait for confirmation or adjustments.

## Best Practices

- Terse but Clear: Tasks should be concise one-liners
- Actionable: Each task should be a specific action, not a vague goal
- Ordered: Tasks within phases should follow logical dependencies
- Grouped: Related tasks should be in the same phase
- Progressive: Phases should build on each other when possible
