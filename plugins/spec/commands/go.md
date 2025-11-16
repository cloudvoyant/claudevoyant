Execute or continue the existing plan using spec-driven development.

## Step 1: Read and Analyze Plan

Read `.claude/plan.md` to understand:

- The objective and full scope
- All phases and their tasks
- Current progress (what's checked vs unchecked)
- Any insights from previous sessicons

## Step 2: Determine Starting Point

1. Find the first unchecked task in the earliest incomplete phase
2. Report where execution will begin

Example:

```
Starting execution from Phase 2 - OAuth Integration
Next task: Configure OAuth providers (Google, GitHub)
```

## Step 3: Set Breakpoints

1. ASK USER if Claude should take breaks periodically for user review.
   Breakpoint options are:

   1. NONE - Fully autonomous execution
   1. PHASE - Ask for user review after every phase
   1. SPECIFIC PHASE - Ask for user review after a specific phase

1. Edit the plan section to add explicit steps requesting user review to pause
   Claude's autonomous execution

## Step 4: Execute Spec-Driven Development Flow

For each task in the plan, follow this workflow:

### 4.1: Before Starting a Task

1. Review the task and understand what needs to be done

2. Review the spec in the "Implementation" section corresponding to the phase
   and task number being implemented

### 4.2: Implement the Task & Update Plan Status In Real-Time

1. Follow the spec precisely

2. Make necessary changes to code, configuration, or documentation

3. **CRITICAL:** Update checkboxes immediately as sub-tasks complete. Use
   TodoWrite tool to track immediate work items (detailed sub-steps).

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

2. Mark phase as complete with ✅:

   ```markdown
   ## Phase 2 - OAuth Integration ✅
   ```

3. Report phase completion:

   ```
   Phase 2 - OAuth Integration complete! ✅

   Progress: 2/4 phases complete (50%)
   Tests: All passing ✅
   ```

## Step 5: Completion

When all phases are complete:

1. Mark plan as complete in Insights section (if it exists)
2. Run `/refresh` to verify all checkboxes
3. NOTIFY user the plan is complete and they can start a new plan with `/new`
