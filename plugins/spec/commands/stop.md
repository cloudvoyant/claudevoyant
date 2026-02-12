Stop background plan execution gracefully.

## Overview

Halts the background agent started with `/bg`, preserving all progress and state so execution can be resumed later.

## Step 0: Select Plan

If argument provided: `/stop plan-name` - use that plan

If no argument:
1. Get list of currently executing plans (status = "Executing" from README.md)
2. If no executing plans, report error:
   ```
   No background execution is currently running.

   Check status with /status
   Start background execution with /bg <plan-name>
   ```
3. If only one executing plan, auto-select it
4. If multiple executing plans, extract branch context for each and use **AskUserQuestion tool**:
   ```bash
   # For each plan, extract branch metadata
   PLAN_BRANCH=$(grep "^- \*\*Branch\*\*:" .spec/plans/{plan-name}/plan.md | sed 's/^- \*\*Branch\*\*: //' | sed 's/ *$//')
   ```

   ```
   question: "Which plan do you want to stop?"
   header: "Stop Execution"
   options:
     - label: "feature-auth (52%) 🌿 feature-auth"
       description: "Branch: feature-auth | Background execution started 30 minutes ago"
     - label: "refactor-api (15%)"
       description: "Branch: main | Background execution started 2 hours ago"
   ```

   **Display Rules:**
   - Add branch emoji 🌿 after progress if plan has branch and branch != "(none)" and branch != "main"
   - Include branch name in description
   - Format: "Branch: {name} | {existing description}"

## Step 1: Check for Background Execution

1. Check `.spec/plans/{plan-name}/execution-log.md` for RUNNING status

2. **Extract branch context:**
```bash
PLAN_BRANCH=$(grep "^- \*\*Branch\*\*:" .spec/plans/{plan-name}/plan.md | sed 's/^- \*\*Branch\*\*: //' | sed 's/ *$//')
PLAN_WORKTREE=$(grep "^- \*\*Worktree\*\*:" .spec/plans/{plan-name}/plan.md | sed 's/^- \*\*Worktree\*\*: //' | sed 's/ *$//')
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
```

3. If not running, report:
   ```
   Plan "{plan-name}" is not currently executing in the background.

   Check status with /status {plan-name}
   Start background execution with /bg {plan-name}
   ```

## Step 2: Confirm Stop Request

Use **AskUserQuestion** tool:

```
question: "Stop background execution for plan '{plan-name}'?"
header: "Stop Execution"
multiSelect: false
options:
  - label: "Stop execution"
    description: "Halt agent gracefully, save progress, can resume later"
  - label: "Let it continue"
    description: "Keep execution running"
```

Inform user about what will be saved, including branch context:
```
Plan: {plan-name} 🌿 {PLAN_BRANCH}
Branch: {PLAN_BRANCH}
{if PLAN_WORKTREE != "(none)"}
Worktree: {PLAN_WORKTREE}
{endif}

Current progress will be saved:
✓ All completed tasks remain checked
✓ Current state preserved in plan.md
✓ Execution log saved
✓ Can resume later with /bg {plan-name} or /go {plan-name}
```

## Step 3: Stop the Agent

Since Claude Code doesn't provide direct agent termination, update the execution state to indicate stop was requested:

1. Update `.spec/plans/{plan-name}/execution-log.md`:

```markdown
[timestamp] - STOP requested by user
Status: STOPPED
```

2. Update `.spec/plans/README.md`:
   - Change status from "Executing" to "Active"
   - Update last updated timestamp

3. Update plan.md Insights section (if it exists):

```markdown
### Background Execution
- Status: STOPPED
- Stopped: [timestamp]
- Reason: User requested stop
- Resume with: /bg {plan-name} or /go {plan-name}
```

4. Note: The background agent may complete its current task before stopping. The stop indicator tells it not to continue to the next task.

## Step 4: Create Stop Report

Generate a pause summary in `.spec/plans/{plan-name}/execution-log.md`:

```markdown
## Execution Stopped

Stopped At: [timestamp]
Duration: [time since start]

Progress Summary:
- Completed: X/Y tasks (Z%)
- Phases Complete: A/B
- Last Completed Task: [task name]
- Next Task: [next unchecked task]

State:
- All progress saved in plan.md
- Tests: [passing/failing]
- No errors at stop time

Resume Execution:
- /bg {plan-name} - Resume in background
- /go {plan-name} - Resume interactively
- /status {plan-name} - Check current state
```

## Step 5: Report Stop Confirmation

Display confirmation to user with branch context:

```
✓ Background execution stopped for plan "{plan-name}"

Branch Context:
- Plan Branch: {PLAN_BRANCH} 🌿
{if CURRENT_BRANCH != PLAN_BRANCH}
- Current Branch: {CURRENT_BRANCH} ⚠️
- Tip: Switch to plan's branch with: git checkout {PLAN_BRANCH}
{else}
- Current Branch: {CURRENT_BRANCH} ✓
{endif}
{if PLAN_WORKTREE != "(none)"}
- Worktree: {PLAN_WORKTREE}
{endif}

Progress saved:
- Completed: 15/23 tasks (65%)
- Phases: 2/4 complete
- Last task: Configure OAuth providers ✅

All progress has been saved to .spec/plans/{plan-name}/plan.md

Resume when ready:
- /bg {plan-name} - Continue in background
- /go {plan-name} - Continue interactively
- /status {plan-name} - Check detailed status

View .spec/plans/{plan-name}/execution-log.md for complete history
```

## Notes

### About Stopping Background Agents

Claude Code's Task tool launches autonomous agents that run independently. This `/stop` command:

1. **Updates state files** to indicate stop was requested
2. **Saves progress** so no work is lost
3. **Provides resume path** for continuing later

The agent may:
- Complete its current task before noticing the stop request
- Take a few moments to finish cleanup operations
- Update the execution log with final status

### Safe to Run

- Stopping is always safe - all progress is preserved
- No work is lost - completed tasks remain checked
- Can resume anytime with /bg or /go

### When to Stop

Stop background execution when you need to:
- Make manual changes to the plan
- Fix an issue the agent encountered
- Review progress before continuing
- Switch to interactive execution with /go
- Pause work for later

### Resuming After Stop

After stopping, you can:

1. **Resume in background**: Run `/bg {plan-name}` again
2. **Resume interactively**: Run `/go {plan-name}` to continue step-by-step
3. **Review and adjust**: Edit plan.md, then resume with either command
4. **Check status**: Run `/status {plan-name}` to see where execution stopped
