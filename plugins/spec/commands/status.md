Check the progress of background plan execution.

## Overview

Reports current status of background execution started with `/bg`, showing progress, current task, and any errors.

## Step 1: Check for Active Plan

Look for `.claude/plan.md` - if not found, report:

```
No active plan found.

Create a plan with:
- /new - Create plan interactively
- /init - Initialize empty template
```

## Step 2: Read Execution Status

Read the following files to determine status:

1. `.claude/plan.md` - Check for execution status in Insights section
2. `.claude/execution-log.md` - Read latest execution log entries

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

## Step 4: Report Status

Format and display comprehensive status report:

### If Execution is Running:

```
Background Execution Status: RUNNING ⚙️

Plan: Authentication System
Started: 2 hours ago (14:30)
Last Update: 2 minutes ago

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
- /stop - Halt execution
- View .claude/execution-log.md for detailed log
```

### If Execution is Paused/Errored:

```
Background Execution Status: PAUSED ⚠️

Plan: Authentication System
Started: 2 hours ago (14:30)
Paused: 5 minutes ago (16:25)

Progress:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%
- Completed: 10/23 tasks
- Phases: 1/4 complete ✅

Last Completed: Configure database schema
Failed At: Phase 2, Task 3 - Run database migrations

Error:
Migration failed: Column 'email' already exists in users table

Next Steps:
1. Review error in .claude/execution-log.md
2. Fix the issue manually
3. Resume with /bg or /go

Commands:
- /go - Resume execution interactively
- /bg - Resume in background
- View .claude/execution-log.md for error details
```

### If Execution is Complete:

```
Background Execution Status: COMPLETED ✅

Plan: Authentication System
Started: 3 hours ago (14:30)
Completed: Just now (17:45)
Duration: 3h 15m

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
- Run /done to mark plan complete and commit

View .claude/execution-log.md for complete execution history
```

### If No Background Execution:

```
No background execution detected.

The plan exists but isn't currently executing in the background.

To start execution:
- /bg - Execute plan in background
- /go - Execute plan interactively

Current Plan: Authentication System
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
- It reads from plan.md and execution-log.md but doesn't modify them
- Can be run repeatedly to monitor ongoing execution
- Useful for checking progress without interrupting the agent
