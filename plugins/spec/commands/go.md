Execute or continue the existing plan using spec-driven development.

## Overview

This command executes your plan interactively, with configurable breakpoints for user review. For fully autonomous background execution, use `/bg` instead.

## Step 0: Select Plan

Check for plan name argument: `/go plan-name`

If not provided, run plan selection logic:
1. Read `.spec/plans/README.md` to get all active plans with Last Updated timestamps
2. Sort plans by Last Updated (most recent first)
3. If only one plan exists, auto-select it
4. If multiple plans exist, **auto-select the most recently updated plan**
5. Report to user: "Using plan: {plan-name} (last updated: {timestamp})"
6. If no plans exist, inform user to create with `/new`

## Step 1: Read and Analyze Plan

Read `.spec/plans/{plan-name}/plan.md` to understand:

- The objective and full scope
- All phases and their tasks
- Current progress (what's checked vs unchecked)
- Any insights from previous sessions

**Validate Plan Structure:**
- Check phase headers match format: `### Phase \d+ - .+` (e.g., "### Phase 1 - Setup")
- Check task format: `\d+\. \[(x| )\] .+` (e.g., "1. [ ] Task name")
- Verify phase numbers are sequential (1, 2, 3...)
- If validation fails, warn user and suggest using `/refresh` to check structure

## Step 1.5: Validate Branch Context

Check if current branch matches the plan's branch metadata:

```bash
# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# Parse plan metadata to extract branch
PLAN_BRANCH=$(grep "^- \*\*Branch\*\*:" .spec/plans/{plan-name}/plan.md | sed 's/^- \*\*Branch\*\*: //' | sed 's/ *$//')

# Parse worktree path from metadata
PLAN_WORKTREE=$(grep "^- \*\*Worktree\*\*:" .spec/plans/{plan-name}/plan.md | sed 's/^- \*\*Worktree\*\*: //' | sed 's/ *$//')

# Check if branch context matches
if [ -n "$PLAN_BRANCH" ] && [ "$PLAN_BRANCH" != "(none)" ] && [ "$CURRENT_BRANCH" != "$PLAN_BRANCH" ]; then
  # Branch mismatch detected
  BRANCH_MISMATCH=true
else
  BRANCH_MISMATCH=false
fi
```

**If branch mismatch detected:**

Use **AskUserQuestion** tool:
```
question: "Branch mismatch detected. This plan is for branch '$PLAN_BRANCH' but you're on '$CURRENT_BRANCH'."
header: "Branch Validation"
multiSelect: false
options:
  - label: "Switch to plan's branch"
    description: "Checkout branch '$PLAN_BRANCH' before execution"
  - label: "Switch to plan's worktree"
    description: "Change to worktree at '$PLAN_WORKTREE' (if worktree exists)"
    # Only show this option if PLAN_WORKTREE != "(none)" and directory exists
  - label: "Continue anyway"
    description: "Execute on current branch (may cause issues)"
  - label: "Cancel"
    description: "Don't execute, stay on current branch"
```

**Handle user response:**
- "Switch to plan's branch": Run `git checkout $PLAN_BRANCH`, then continue
- "Switch to plan's worktree": Report `cd $PLAN_WORKTREE` command and instructions, then exit (can't change working directory within command)
- "Continue anyway": Warn user and continue execution
- "Cancel": Exit command

**If no mismatch:**
Continue to Step 2 normally.

## Step 2: Determine Starting Point

1. Find the first unchecked task in the earliest incomplete phase
2. Report where execution will begin

Example:

```
Starting execution from Phase 2 - OAuth Integration
Next task: Configure OAuth providers (Google, GitHub)
```

## Step 2.5: Validate Implementation Files

Before starting execution, verify all implementation files exist:

1. **Count phases** in plan.md:
   - Parse `.spec/plans/{plan-name}/plan.md`
   - Count lines matching: `^### Phase (\d+)`
   - Store total phase count

2. **Check each implementation file** exists:
   - For phase 1 to total phases:
     - Check `.spec/plans/{plan-name}/implementation/phase-{N}.md` exists
     - Check file size > 100 bytes (not empty)

3. **If any files missing:**
   ```
   ❌ Cannot start execution - implementation files missing!

   Missing implementation files:
   - phase-3.md
   - phase-5.md

   Implementation files are required for all phases before execution.
   These files should have been created during /spec:new.

   To fix:
   1. Create the missing files in .spec/plans/{plan-name}/implementation/
   2. Use the template structure from /spec:new Step 5.5
   3. Or recreate the plan with /spec:new

   Cannot proceed with execution.
   ```

   Exit and do not continue to Step 3.

4. **If all files exist:**
   - Report validation success:
   ```
   ✓ Validated {N} implementation files (phase-1.md through phase-{N}.md)
   ```
   - Continue to Step 3

## Step 3: Set Breakpoints

Use **AskUserQuestion** tool to configure breakpoints:

```
question: "Should Claude take breaks during execution for your review?"
header: "Breakpoints"
multiSelect: false
options:
  - label: "None (Fully autonomous)"
    description: "Execute entire plan without stopping. Only pause on errors."
  - label: "After every phase"
    description: "Stop after each phase completes for review"
  - label: "After specific phase"
    description: "Stop after a specific phase number (will ask which one)"
```

If user selects "After specific phase", follow up with another AskUserQuestion asking which phase number.

Note the breakpoint selection in the execution plan (no need to edit plan.md)

## Step 4: Execute Spec-Driven Development Flow

For each task in the plan, follow this workflow:

### 4.1: Before Starting a Task

1. Review the task in `.spec/plans/{plan-name}/plan.md`

2. **Identify the current phase number**:
   - Find which phase header the current task is under
   - Extract phase number from header (e.g., "### Phase 3 - Testing" → phase number is 3)

3. **Validate and read the implementation file**:
   - **File path**: `.spec/plans/{plan-name}/implementation/phase-{N}.md`
   - **Validate exists**: Verify file exists before reading
   - **If missing**: This should never happen due to Step 2.5 validation, but if it does:
     ```
     ERROR: Implementation file missing for Phase {N}
     Expected: .spec/plans/{plan-name}/implementation/phase-{N}.md

     Cannot execute phase without implementation specification.
     Please create the missing file or use /spec:refresh to validate plan structure.
     ```
     Stop execution and report the error to user.
   - **If exists**: Read the entire file to understand detailed implementation requirements
   - If implementation file doesn't exist, report error and suggest user create it or check plan structure
   - Read the phase-N.md file for detailed implementation steps
   - Reference the specific task section within the implementation file (match by task number within phase)
   - Understand all requirements, files to modify, dependencies, and testing needs

### 4.2: Implement the Task & Update Plan Status In Real-Time

1. Follow the detailed specs in the implementation file precisely

2. Make necessary changes to code, configuration, or documentation as specified in the implementation file

3. **CRITICAL:** Update checkboxes in `.spec/plans/{plan-name}/plan.md` immediately as tasks complete
   - Use TodoWrite tool to track immediate work items (detailed sub-steps)
   - After updating plan.md, also update `.spec/plans/README.md`:
     - Update progress stats (X/Y tasks, completion %)
     - Update last updated timestamp

### 4.3: Pause at Phase Boundaries

When a phase is complete:

1. **CRITICAL: Run tests to validate phase completion:**

   - Run the project's test suite (`just test`, `just test-template`, or
     equivalent)
   - Verify all tests pass before marking phase complete
   - If tests fail, fix issues before proceeding
   - **Exception**: For complex refactoring, tests may be allowed to fail
     temporarily, but:
     - Document the failure reason in plan.md
     - Create specific tasks to fix tests in the next phase
     - State clearly why tests are allowed to remain broken

2. Mark phase as complete with ✅ in `.spec/plans/{plan-name}/plan.md`:

   ```markdown
   ### Phase 2 - OAuth Integration ✅
   ```

3. Update README.md with new progress and last updated timestamp

4. Before starting next phase, read the next implementation file (phase-N+1.md)

5. Report phase completion:

   ```
   Phase 2 - OAuth Integration complete! ✅

   Progress: 2/4 phases complete (50%)
   Tests: All passing ✅
   ```

## Step 5: Completion

When all phases are complete:

1. Update `.spec/plans/README.md`:
   - Update status field (may set to "Complete" or leave as "Active")
   - Update progress to 100%
   - Update last updated timestamp

2. Run `/refresh {plan-name}` to verify all checkboxes

3. Suggest running `/done {plan-name}` to archive the completed plan

4. Report completion:
   ```
   Plan "{plan-name}" execution complete! ✅

   All phases complete: X/X tasks (100%)

   Next steps:
   - Review the completed work
   - Run /done {plan-name} to archive this plan
   - Start a new plan with /new
   ```
