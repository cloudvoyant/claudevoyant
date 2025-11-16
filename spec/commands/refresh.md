Review existing plan and update checklist status.

## Step 1: Read Current Plan

Read `.claude/plan.md` and analyze:

- The objective and overall scope
- All phases and their tasks
- Current completion status (checked vs unchecked tasks)
- Phase completion markers (✅)

## Step 2: Verify Checklist Status

For each phase:

1. Count checked `[x]` vs unchecked `[ ]` tasks
2. Verify phase has ✅ marker if and only if all tasks are complete
3. Report any inconsistencies

## Step 3: Update Phase Markers

If status is inconsistent:

- Add ✅ to phase headers where all tasks are complete
- Remove ✅ from phase headers where tasks remain incomplete
- Update the file with corrections

## Step 4: Report Status

Provide a summary:

```
Plan Status:
- Phase 1 - Setup Infrastructure: 5/5 complete ✅
- Phase 2 - Core Features: 3/7 complete (in progress)
- Phase 3 - Testing: 0/4 complete (not started)

Overall: 8/16 tasks complete (50%)

Updated phase markers to reflect current status.
```

If the plan is fully complete, report completion:

```
Plan Status: All phases complete! ✅

Overall: 16/16 tasks complete (100%)

The plan is complete. Use /new to start a new plan.
```
