Rename a plan and update all references.

## Overview

Renames a plan's directory and updates README.md. Useful for clarifying plan purpose or fixing typos in plan names.

## Step 1: Select Plan

- Check for arguments: `/rename old-name new-name`
- If only one argument, treat as old name and prompt for new name
- If no arguments:
  - Get all plans
  - If no plans exist, report error
  - If only one plan, auto-select it
  - If multiple plans, use **AskUserQuestion tool**:
    ```
    question: "Which plan do you want to rename?"
    header: "Rename Plan"
    options:
      - label: "feature-auth (Active - 52%)"
        description: "Add authentication system"
      - label: "refactor-api (Paused - 33%)"
        description: "Refactor API layer"
    ```

## Step 2: Get New Name (if not provided)

If new name wasn't provided as argument, ask user:
"What should the new name be for plan '{old-name}'?"

## Step 3: Validate New Name

1. Slugify the new name (lowercase, hyphens, alphanumeric)
2. Check if new name already exists
3. If collision, offer to append -2, -3, etc. or let user choose different name

## Step 4: Confirm Rename

Use **AskUserQuestion** tool:

```
question: "Rename plan '{old-name}' to '{new-name}'?"
header: "Confirm Rename"
multiSelect: false
options:
  - label: "Rename plan"
    description: "Update directory name and README.md, preserve all files"
  - label: "Cancel"
    description: "Keep original name"
```

## Step 5: Perform Rename

1. Rename directory: `.spec/plans/{old-name}/` → `.spec/plans/{new-name}/`
2. Update README.md:
   - Find plan entry for old-name
   - Update plan name and path to new-name
3. Check plan.md for any self-references and update (rare but possible)

## Step 6: Report Completion

```
Plan renamed successfully!

Old name: {old-name}
New name: {new-name}
Location: .spec/plans/{new-name}/

Continue execution: /go {new-name}
Check status: /status {new-name}
```
