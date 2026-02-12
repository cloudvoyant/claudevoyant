Execute the plan in the background using an autonomous agent.

## Overview

This command launches a long-running agent that executes your plan autonomously while you continue working. The agent updates progress in real-time and pauses on errors.

## Step 0: Select Plan

Check for plan name argument: `/bg plan-name`

If not provided:
1. Read `.spec/plans/README.md` to get all active plans with Last Updated timestamps
2. Sort plans by Last Updated (most recent first)
3. If only one plan exists, auto-select it
4. If multiple plans exist, **auto-select the most recently updated plan**
5. Report to user: "Using plan: {plan-name} (last updated: {timestamp})"
6. If no plans exist, inform user to create with `/new`

## Step 1: Verify Plan Exists

1. Check that `.spec/plans/{plan-name}/plan.md` exists
2. If not found, inform user to create one with `/new` or `/init`

## Step 2: Analyze Plan Scope

Read `.spec/plans/{plan-name}/plan.md` and report:

1. Total number of phases
2. Total number of tasks
3. Starting point (first unchecked task)
4. Estimated complexity

Example:

```
Plan: {plan-name} - Authentication System
- 4 phases, 23 tasks
- Starting from: Phase 1, Task 1
- Complexity: Medium (has test requirements)
```

## Step 2.5: Validate Branch Context

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
    description: "Checkout branch '$PLAN_BRANCH' before background execution"
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
- "Switch to plan's worktree": Report `cd $PLAN_WORKTREE` command and instructions, then exit
- "Continue anyway": Warn user about potential branch issues and continue
- "Cancel": Exit command

**If no mismatch:**
Continue to Step 3 (Validate Implementation Files) normally.

## Step 3: Validate Implementation Files

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

   Cannot proceed with background execution.
   ```

   Exit and do not continue to Step 4.

4. **If all files exist:**
   - Report validation success:
   ```
   ✓ Validated {N} implementation files (phase-1.md through phase-{N}.md)
   ```
   - Continue to Step 4

## Step 4: Confirm Background Execution

Use **AskUserQuestion** tool:

```
question: "Start background execution for plan '{plan-name}' (X phases, Y tasks)?"
header: "Background Execution"
multiSelect: false
options:
  - label: "Start execution"
    description: "Launch autonomous agent to execute all tasks"
  - label: "Cancel"
    description: "Don't start, return to prompt"
```

Inform user about capabilities:
```
The agent will:
✓ Execute all tasks autonomously
✓ Update plan.md checkboxes in real-time
✓ Run tests at phase boundaries
✓ Pause on errors (preserving state)
✓ Create execution log in .spec/plans/{plan-name}/execution-log.md

You can:
- Check progress anytime with /status {plan-name}
- Stop execution with /stop {plan-name}
- Continue other work while it runs
```

## Step 5: Initialize Execution Tracking

1. Create or clear `.spec/plans/{plan-name}/execution-log.md`:

```markdown
# Execution Log - {plan-name}

Started: [timestamp]
Plan: [plan objective]
Status: RUNNING

## Progress
- Current Phase: [phase name]
- Completed Tasks: 0/[total]
- Errors: 0

## Timeline
[timestamp] - Execution started
```

2. Update `.spec/plans/README.md`:
   - Set status to "Executing"
   - Update last updated timestamp

3. Optionally add execution status to plan.md Insights section (if it exists):

```markdown
## Insights

### Background Execution
- Status: RUNNING
- Started: [timestamp]
- Check progress: /status {plan-name}
- Stop execution: /stop {plan-name}
```

## Step 6: Launch Background Agent

Use the Task tool to spawn an autonomous agent with this prompt:

```
Execute the plan in .spec/plans/{plan-name}/plan.md autonomously with these requirements:

## Working Directory Context
You are executing from the project root directory. All file paths below are relative to this directory.
- Project root: [current working directory]
- Plan location: .spec/plans/{plan-name}/
- Branch: {PLAN_BRANCH or current branch}
- Worktree: {PLAN_WORKTREE or "(none)"}

**Branch Awareness:**
- This plan is associated with branch: {PLAN_BRANCH}
- If worktree is set, work should be done in that worktree directory
- All git operations should be aware of branch context
- Ensure changes are committed to the correct branch

## Your Mission
Work through all unchecked tasks in the plan following the Implementation specs exactly. Update progress in real-time and pause on errors.

## Execution Rules

1. **Follow the Spec**:
   - Read the high-level plan from .spec/plans/{plan-name}/plan.md
   - **Before starting each phase**, VALIDATE and read the implementation file:
     1. **Phase Detection**: Extract phase number from the header of the current task's phase (e.g., "### Phase 3 - Name" → phase number is 3)
     2. **Validate File Exists**: Check that `.spec/plans/{plan-name}/implementation/phase-{N}.md` exists
     3. **If file missing**: STOP execution immediately and report error:
        ```
        ERROR: Implementation file missing for Phase {N}
        Expected: .spec/plans/{plan-name}/implementation/phase-{N}.md

        Cannot execute phase without implementation specification.
        Update execution-log.md with this error and set status to PAUSED.
        ```
     4. **If file exists**: Read the entire file to understand detailed implementation requirements
   - Follow the implementation file specs precisely during execution
   - Reference code examples and specifications provided in implementation files

2. **Update Progress in Real-Time**:
   - Check off tasks in .spec/plans/{plan-name}/plan.md as you complete them
   - Mark phases complete with ✅ when all tasks done
   - Update .spec/plans/{plan-name}/execution-log.md with timestamped progress (use ISO 8601 UTC format)
   - Update .spec/plans/README.md with progress stats and last updated timestamp (ISO 8601 UTC)

3. **Run Tests at Phase Boundaries**:
   - After completing each phase, run the test suite
   - Tests must pass before marking phase complete
   - If tests fail, pause execution and report the error

4. **Pause on Errors**:
   - Stop immediately if tests fail or errors occur
   - Update .spec/plans/{plan-name}/execution-log.md with error details
   - Update plan.md Insights with error context
   - Update README.md status
   - Preserve state so user can resume later

5. **Track Sub-Tasks (Optional)**:
   - Use TodoWrite tool if available to track detailed implementation steps
   - If TodoWrite not available, track progress in execution-log.md instead
   - Mark sub-tasks complete as you finish them
   - Clear tracking when moving to next task

6. **Log Everything**:
   - Append to .spec/plans/{plan-name}/execution-log.md after each task
   - Include: timestamp, task completed, files changed, tests run
   - Update README.md progress periodically
   - On completion: add summary with total time and tasks completed

## Success Criteria

Execution is complete when:
- All tasks in all phases are checked ✅
- All phases marked complete ✅
- All tests passing
- Completion summary added to execution-log.md
- README.md updated with final status

## Error Handling

If you encounter errors:
1. Preserve current state in .spec/plans/{plan-name}/plan.md (keep task unchecked)
2. Log error details in .spec/plans/{plan-name}/execution-log.md with:
   - Timestamp
   - Task that failed
   - Error message
   - Stack trace if applicable
   - What needs to be fixed before resuming
3. Update Insights section with error context and next steps
4. Update README.md status to "Paused"
5. Stop execution (don't continue past errors)

## Resumption After Error

When user resumes with `/bg {plan-name}` or `/go {plan-name}` after fixing issues:
1. Start from the first unchecked task (the one that failed previously)
2. Re-read the implementation file for that phase
3. Retry the failed task - do NOT skip it
4. User is responsible for fixing the underlying issue before resuming
5. If task fails again with same error, stop and report persistent failure

## Plan Content

[Full content of .spec/plans/{plan-name}/plan.md will be included here]

## Plan Directory

Plan name: {plan-name}
Plan directory: .spec/plans/{plan-name}/
Implementation files: .spec/plans/{plan-name}/implementation/phase-N.md

For each phase:
1. Read the corresponding implementation file (implementation/phase-N.md)
2. Follow the detailed steps in that file
3. Reference code examples and specifications provided
4. Complete tasks as specified in the implementation

Begin execution now.
```

## Step 7: Notify User

After launching the agent:

```
✓ Background execution started for plan "{plan-name}"!

Agent is now working through your plan autonomously.

Monitor progress:
- /status {plan-name} - Check current progress
- /status - View all plans overview
- Watch .spec/plans/{plan-name}/plan.md - See checkboxes update in real-time
- View .spec/plans/{plan-name}/execution-log.md - See detailed execution log

Control execution:
- /stop {plan-name} - Halt execution gracefully
- /pause {plan-name} - Same as /stop (saves state)

The agent will notify you when complete or if errors occur.
```

## Notes

- The background agent works independently - you can continue chatting
- Progress is saved continuously in .spec/plans/{plan-name}/plan.md and README.md
- If the agent encounters errors, it will pause and preserve state
- Resume with `/bg {plan-name}` again or use `/go {plan-name}` for interactive execution
- Check execution status anytime with `/status {plan-name}` or `/status` for all plans
