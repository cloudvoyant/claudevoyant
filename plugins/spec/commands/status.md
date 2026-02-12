Check the progress of background plan execution.

## Overview

Reports current status of background execution started with `/bg`, showing progress, current task, and any errors.

Supports two modes:
- **Single Plan Mode**: Show detailed status for a specific plan
- **All Plans Mode**: Show overview of all plans

## Step 0: Determine Scope

Check for plan name argument: `/status plan-name`

- If provided: Show status for that specific plan (Single Plan Mode)
- If not provided: Show status for all active plans (All Plans Mode)

## Step 1: Check for Active Plan(s)

### Single Plan Mode:
- Check if `.spec/plans/{plan-name}/plan.md` exists
- If not found, report error with suggestion to use `/list` to see available plans

### All Plans Mode:
- Read `.spec/plans/README.md`
- List all plans with their status
- If no plans exist, report:
```
No active plans found.

Create a plan with:
- /new - Create plan interactively
- /init - Initialize empty template
```

## Step 2: Read Execution Status

For each plan being reported:

1. Read `.spec/plans/{plan-name}/plan.md` - Check task completion status
2. Read `.spec/plans/{plan-name}/execution-log.md` if exists - Get execution details
3. Read status from `.spec/plans/README.md` - Get current status (Active/Paused/Executing)

## Step 3: Analyze Progress

Calculate and report:

1. **Completion Stats**:
   - Count checked vs total tasks across all phases
   - Count completed vs total phases
   - Calculate percentage complete

2. **Current State**:
   - Which phase is currently active
   - Which task is currently being worked on (first unchecked task)
   - Any errors or paused state

3. **Execution Info** (from execution-log.md if exists):
   - Start time
   - Duration so far
   - Last update timestamp
   - Execution status (RUNNING, PAUSED, COMPLETED, ERROR)

4. **Branch Context** (from plan.md metadata):
   - Extract branch name
   - Extract worktree path
   - Detect current git branch
   - Compare to identify branch mismatch

```bash
# Extract from plan metadata
PLAN_BRANCH=$(grep "^- \*\*Branch\*\*:" .spec/plans/{plan-name}/plan.md | sed 's/^- \*\*Branch\*\*: //' | sed 's/ *$//')
PLAN_WORKTREE=$(grep "^- \*\*Worktree\*\*:" .spec/plans/{plan-name}/plan.md | sed 's/^- \*\*Worktree\*\*: //' | sed 's/ *$//')
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
```

5. **Relative Time Display**:
   Convert ISO 8601 timestamps to human-friendly format:
   - < 1 minute: "just now"
   - < 60 minutes: "X minutes ago" (round to nearest minute)
   - < 24 hours: "X hours ago" (round to nearest hour)
   - < 7 days: "X days ago"
   - >= 7 days: Absolute date "Feb 10, 2026" or "2026-02-10"
   - Parse timestamp as UTC, compare to current UTC time

## Step 4: Report Status

Format and display status report based on mode:

### All Plans Mode:

Show overview of all plans with branch context:

```
Plans Overview
==============

feature-auth (Executing) ⚙️ 🌿 feature-auth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 52%
- 12/23 tasks complete
- Phase 2 in progress
- Branch: feature-auth | Worktree: .worktrees/feature-auth
- Last update: 5 minutes ago

refactor-api (Paused) ⏸
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 33%
- 5/15 tasks complete
- Phase 1 in progress
- Branch: main
- Last update: 2 days ago

add-tests (Active) 🌿 feature-tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 10%
- 2/20 tasks complete
- Phase 1 in progress
- Branch: feature-tests | Worktree: .worktrees/feature-tests
- Last update: 1 hour ago

Commands:
- /status <plan> - Detailed status for specific plan
- /go <plan> - Continue a plan
- /bg <plan> - Execute in background
```

**Display Rules:**
- Show branch emoji 🌿 after status if plan has branch
- Include branch name and worktree path on one line
- Only show worktree if it's set
- Format: "Branch: {name} | Worktree: {path}"

### Single Plan Mode:

Show detailed status for specific plan.

#### If Execution is Running:

```
Background Execution Status: RUNNING ⚙️

Plan: feature-auth - Authentication System
Started: 2 hours ago (14:30)
Last Update: 2 minutes ago

Branch Context:
- Plan Branch: feature-auth 🌿
- Current Branch: feature-auth ✓
- Worktree: .worktrees/feature-auth

Progress:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 65%
- Completed: 15/23 tasks
- Phases: 2/4 complete ✅

Current Phase: Phase 3 - Testing ⚙️
Current Task: Write integration tests for OAuth flow

Recent Activity:
✓ 14:45 - Completed: Configure OAuth providers
✓ 15:02 - Completed: Implement token refresh
⚙️ 15:15 - Started: Write integration tests

Tests: All passing ✅
Errors: None

Commands:
- /stop feature-auth - Halt execution
- View .spec/plans/feature-auth/execution-log.md for detailed log
```

#### If Execution is Paused/Errored:

```
Background Execution Status: PAUSED ⚠️

Plan: feature-auth - Authentication System
Started: 2 hours ago (14:30)
Paused: 5 minutes ago (16:25)

Branch Context:
- Plan Branch: feature-auth 🌿
- Current Branch: feature-auth ✓
- Worktree: .worktrees/feature-auth

Progress:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%
- Completed: 10/23 tasks
- Phases: 1/4 complete ✅

Last Completed: Configure database schema
Failed At: Phase 2, Task 3 - Run database migrations

Error:
Migration failed: Column 'email' already exists in users table

Next Steps:
1. Review error in .spec/plans/feature-auth/execution-log.md
2. Fix the issue manually
3. Resume with /bg feature-auth or /go feature-auth

Commands:
- /go feature-auth - Resume execution interactively
- /bg feature-auth - Resume in background
- View .spec/plans/feature-auth/execution-log.md for error details
```

#### If Execution is Complete:

```
Background Execution Status: COMPLETED ✅

Plan: feature-auth - Authentication System
Started: 3 hours ago (14:30)
Completed: Just now (17:45)
Duration: 3h 15m

Branch Context:
- Plan Branch: feature-auth 🌿
- Current Branch: feature-auth ✓
- Worktree: .worktrees/feature-auth

Final Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
- Completed: 23/23 tasks ✅
- Phases: 4/4 complete ✅

All tests passing ✅

Summary:
✓ All OAuth providers configured
✓ Token refresh implemented
✓ Integration tests passing
✓ Documentation updated

Next Steps:
- Review changes
- Run /done feature-auth to mark plan complete and archive

View .spec/plans/feature-auth/execution-log.md for complete execution history
```

#### If No Background Execution:

```
No background execution detected for plan "feature-auth".

The plan exists but isn't currently executing in the background.

Branch Context:
- Plan Branch: feature-auth 🌿
- Current Branch: main ⚠️
- Worktree: .worktrees/feature-auth
- Tip: Switch to worktree with: cd .worktrees/feature-auth

To start execution:
- /bg feature-auth - Execute plan in background
- /go feature-auth - Execute plan interactively

Current Plan: feature-auth - Authentication System
Progress: 5/23 tasks complete (22%)
```

## Step 5: Additional Details (Optional)

If requested or helpful, also show:

1. **Files Changed**: List files modified during execution
2. **Test Results**: Summary of test runs
3. **Time Breakdown**: Time spent per phase
4. **Resource Usage**: If available from execution log

## Notes

- This command is read-only and safe to run anytime
- It reads from plan.md, execution-log.md, and README.md but doesn't modify them
- Can be run repeatedly to monitor ongoing execution
- Useful for checking progress without interrupting the agent
- Use `/status` (no argument) to see overview of all plans
- Use `/status plan-name` to see detailed status of a specific plan
