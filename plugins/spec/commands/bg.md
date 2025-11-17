Execute the plan in the background using an autonomous agent.

## Overview

This command launches a long-running agent that executes your plan autonomously while you continue working. The agent updates progress in real-time and pauses on errors.

## Step 1: Verify Plan Exists

1. Check that `.claude/plan.md` exists
2. If not found, inform user to create one with `/new` or `/init`

## Step 2: Analyze Plan Scope

Read `.claude/plan.md` and report:

1. Total number of phases
2. Total number of tasks
3. Starting point (first unchecked task)
4. Estimated complexity

Example:

```
Plan: Authentication System
- 4 phases, 23 tasks
- Starting from: Phase 1, Task 1
- Complexity: Medium (has test requirements)
```

## Step 3: Confirm Background Execution

ASK USER for confirmation:

```
Start background execution?

The agent will:
✓ Execute all tasks autonomously
✓ Update plan.md checkboxes in real-time
✓ Run tests at phase boundaries
✓ Pause on errors (preserving state)
✓ Create execution log in .claude/execution-log.md

You can:
- Check progress anytime with /status
- Stop execution with /stop
- Continue other work while it runs

Proceed with background execution? [Y/n]
```

## Step 4: Initialize Execution Tracking

1. Create or clear `.claude/execution-log.md`:

```markdown
# Execution Log

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

2. Add execution status to plan.md Insights section (if it exists):

```markdown
## Insights

### Background Execution
- Status: RUNNING
- Started: [timestamp]
- Check progress: /status
- Stop execution: /stop
```

## Step 5: Launch Background Agent

Use the Task tool to spawn an autonomous agent with this prompt:

```
Execute the plan in .claude/plan.md autonomously with these requirements:

## Your Mission
Work through all unchecked tasks in the plan following the Implementation specs exactly. Update progress in real-time and pause on errors.

## Execution Rules

1. **Follow the Spec**: Read the Implementation section for each phase and implement tasks precisely as specified

2. **Update Progress in Real-Time**:
   - Check off tasks in plan.md as you complete them
   - Mark phases complete with ✅ when all tasks done
   - Update .claude/execution-log.md with timestamped progress

3. **Run Tests at Phase Boundaries**:
   - After completing each phase, run the test suite
   - Tests must pass before marking phase complete
   - If tests fail, pause execution and report the error

4. **Pause on Errors**:
   - Stop immediately if tests fail or errors occur
   - Update execution-log.md with error details
   - Update plan.md Insights with error context
   - Preserve state so user can resume later

5. **Use TodoWrite for Sub-Tasks**:
   - Track detailed implementation steps with TodoWrite
   - Mark todos complete as you finish them
   - Clear todo list when moving to next task

6. **Log Everything**:
   - Append to .claude/execution-log.md after each task
   - Include: timestamp, task completed, files changed, tests run
   - On completion: add summary with total time and tasks completed

## Success Criteria

Execution is complete when:
- All tasks in all phases are checked ✅
- All phases marked complete ✅
- All tests passing
- Completion summary added to execution-log.md

## Error Handling

If you encounter errors:
1. Preserve current state in plan.md
2. Log error details in execution-log.md
3. Update Insights section with error context and next steps
4. Stop execution (don't continue past errors)

## Plan Content

[Full content of .claude/plan.md will be included here]

Begin execution now.
```

## Step 6: Notify User

After launching the agent:

```
✓ Background execution started!

Agent is now working through your plan autonomously.

Monitor progress:
- /status - Check current progress
- Watch .claude/plan.md - See checkboxes update in real-time
- View .claude/execution-log.md - See detailed execution log

Control execution:
- /stop - Halt execution gracefully
- /pause - Same as /stop (saves state)

The agent will notify you when complete or if errors occur.
```

## Notes

- The background agent works independently - you can continue chatting
- Progress is saved continuously in plan.md
- If the agent encounters errors, it will pause and preserve state
- Resume with `/bg` again or use `/go` for interactive execution
- Check execution status anytime with `/status`
