Stop background plan execution gracefully.

## Overview

Halts the background agent started with `/bg`, preserving all progress and state so execution can be resumed later.

## Step 1: Check for Background Execution

1. Look for `.claude/execution-log.md`
2. Check if execution status is RUNNING

If no background execution detected:

```
No background execution is currently running.

Check status with /status
Start background execution with /bg
```

## Step 2: Confirm Stop Request

ASK USER for confirmation:

```
Stop background execution?

Current progress will be saved:
✓ All completed tasks remain checked
✓ Current state preserved in plan.md
✓ Execution log saved
✓ Can resume later with /bg or /go

Stop execution now? [Y/n]
```

## Step 3: Stop the Agent

Since Claude Code doesn't provide direct agent termination, update the execution state to indicate stop was requested:

1. Update `.claude/execution-log.md`:

```markdown
[timestamp] - STOP requested by user
Status: STOPPED
```

2. Update plan.md Insights section:

```markdown
### Background Execution
- Status: STOPPED
- Stopped: [timestamp]
- Reason: User requested stop
- Resume with: /bg or /go
```

3. Note: The background agent may complete its current task before stopping. The stop indicator tells it not to continue to the next task.

## Step 4: Create Stop Report

Generate a pause summary in `.claude/execution-log.md`:

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
- /bg - Resume in background
- /go - Resume interactively
- /status - Check current state
```

## Step 5: Report Stop Confirmation

Display confirmation to user:

```
✓ Background execution stopped

Progress saved:
- Completed: 15/23 tasks (65%)
- Phases: 2/4 complete
- Last task: Configure OAuth providers ✅

All progress has been saved to plan.md

Resume when ready:
- /bg - Continue in background
- /go - Continue interactively
- /status - Check detailed status

View .claude/execution-log.md for complete history
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

1. **Resume in background**: Run `/bg` again
2. **Resume interactively**: Run `/go` to continue step-by-step
3. **Review and adjust**: Edit plan.md, then resume with either command
4. **Check status**: Run `/status` to see where execution stopped
