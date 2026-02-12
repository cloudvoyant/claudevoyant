Permanently delete a plan and all its files.

## Overview

Completely removes a plan from the system. This is destructive and cannot be undone.

## Step 1: Select Plan

- Check for plan name argument: `/delete plan-name`
- If not provided:
  - Get all plans (active and archived)
  - If no plans exist, report error
  - If only one plan, auto-select it
  - If multiple plans, use **AskUserQuestion tool**:
    ```
    question: "Which plan do you want to permanently delete?"
    header: "Delete Plan"
    options:
      - label: "feature-auth (Active - 52%)"
        description: "⚠️ Destructive: Cannot be undone"
      - label: "old-plan (Archived - 100%)"
        description: "⚠️ Destructive: Cannot be undone"
    ```

## Step 2: Confirm Deletion

First, use **AskUserQuestion** tool to get initial confirmation:

```
question: "⚠️ PERMANENTLY DELETE plan '{plan-name}' (X/Y tasks - Z%)?"
header: "Confirm Deletion"
multiSelect: false
options:
  - label: "Yes, delete permanently"
    description: "⚠️ DESTRUCTIVE: Cannot be undone. All files will be deleted."
  - label: "Cancel"
    description: "Keep the plan, don't delete"
```

If user selects "Cancel", exit immediately.

If user selects "Yes, delete permanently", require **strong confirmation** by asking user to type the plan name:

```
⚠️ This action CANNOT be undone!

All files will be permanently deleted:
- plan.md
- implementation/ directory with all phase files
- execution-log.md
- All plan metadata

Type the plan name exactly to confirm: _____
```

Only proceed to Step 3 if user types the plan name exactly (case-sensitive match).

## Step 3: Delete the Plan

If confirmed:
1. Delete plan directory: `.spec/plans/{plan-name}/` or archive directory
2. Update README.md:
   - Remove plan entry from Active or Archived section
3. If plan was executing, note that execution was stopped

## Step 4: Report Completion

```
Plan "{plan-name}" permanently deleted.

All files removed:
✓ .spec/plans/{plan-name}/ deleted
✓ README.md updated

Create a new plan: /new
```
