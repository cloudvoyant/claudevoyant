Mark current plan as complete and optionally commit changes.

## Step 1: Verify Plan Completion

Read `.claude/plan.md` and verify completion status:

1. Run `/refresh` logic to check all tasks
2. Verify all phases have ✅ markers
3. Count total completed vs total tasks

If plan is not fully complete:

- Report incomplete status
- Ask user if they want to mark it done anyway or continue working
- Wait for confirmation

## Step 2: Offer to Commit Changes

Ask the user: "Would you like to commit the changes from this plan?"

Options:

- Yes - Proceed to create a commit
- No - Skip to Step 4 (Archive and Reset)
- Cancel - Exit without changes

## Step 3: Create Git Commit (if requested)

If user wants to commit:

1. Check git status to see what changed:

   ```bash
   git status
   git diff
   ```

2. Draft a commit message based on the plan objective and completed tasks:

   - Use the plan's objective as the basis for the commit message
   - Summarize the key changes from all phases
   - Follow conventional commit format if appropriate
   - Include the standard footer

3. Show the proposed commit message to the user

4. Ask: "Does this commit message look good?"

   - If yes: Create the commit
   - If no: Ask user for preferred message
   - If cancel: Skip to Step 4

5. Create the commit with all changes from the plan

## Step 4: Archive Completed Plan

Archive the current plan with completion date:

1. Suggest filename: `.claude/plan-completed-YYYYMMDD.md`
2. Ask: "Archive the completed plan to this file?"

   - If yes: Move plan.md to archive file
   - If no: Ask for preferred filename
   - If skip: Delete plan.md without archiving

3. Archive or delete the completed plan

## Step 5: Initialize Fresh Template

Create a new empty plan template:

```markdown
# Plan

## Objective

[What are you trying to accomplish?]

## Phase 1 - [Phase Name]

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Phase 2 - [Phase Name]

- [ ] Task 1
- [ ] Task 2
```

## Step 6: Confirm Completion

Report to user:

```
Plan marked as complete! ✅

Commit: [Created/Skipped]
Archive: [filename or skipped]
New plan template ready at .claude/plan.md

Ready to start your next plan with /new or /go
```
