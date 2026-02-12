Manually archive a plan without marking it complete.

## Overview

Archives a plan that's no longer needed or has been abandoned. Unlike /done, this doesn't require the plan to be complete and doesn't offer to create a commit.

## Step 1: Select Plan

- Check for plan name argument: `/archive plan-name`
- If not provided:
  - Get all active plans
  - If no active plans exist, report error
  - If only one plan, auto-select it
  - If multiple plans, use **AskUserQuestion tool**:
    ```
    question: "Which plan do you want to archive?"
    header: "Archive Plan"
    options:
      - label: "feature-auth (52% complete)"
        description: "Add authentication system. Active."
      - label: "refactor-api (33% complete)"
        description: "Refactor API layer. Paused."
    ```

## Step 2: Confirm Archive

Use **AskUserQuestion** tool:

```
question: "Archive plan '{plan-name}' (X/Y tasks - Z% complete)?"
header: "Confirm Archive"
multiSelect: false
options:
  - label: "Archive plan"
    description: "Move to .spec/plans/archive/ and preserve all files"
  - label: "Cancel"
    description: "Keep plan active, don't archive"
```

Inform user about archive location: `.spec/plans/archive/{plan-name}-{YYYYMMDD-HHMMSS}/`

## Step 3: Archive the Plan

Same logic as `/done` Step 4, but:
- Don't check for completion (can archive incomplete plans)
- Don't offer to commit
- Note in README.md that it was archived, not completed:
  ```markdown
  ### {plan-name} (Archived {YYYY-MM-DD})
  - **Description**: [from plan]
  - **Progress**: X/Y tasks (Z%)
  - **Archive Path**: `.spec/plans/archive/{plan-name}-{YYYYMMDD}/`
  - **Note**: Archived incomplete
  ```

Process:
1. **Determine Archive Path:**
   - Get current date: YYYYMMDD
   - Archive path: `.spec/plans/archive/{plan-name}-{YYYYMMDD}/`

2. **Check for Collision:**
   - If archive directory exists, append time: `{plan-name}-{YYYYMMDD}-HHMM`

3. **Move Plan to Archive:**
   - Move entire directory: `.spec/plans/{plan-name}/` → `.spec/plans/archive/{plan-name}-{YYYYMMDD}/`
   - This includes plan.md, implementation/ directory, and execution-log.md

4. **Update README.md:**
   - Remove plan from Active Plans section
   - Add to Archived Plans section with "Archived incomplete" note

## Step 4: Report Completion

```
Plan "{plan-name}" archived.

Archive Location: .spec/plans/archive/{plan-name}-{YYYYMMDD}/
Final Progress: X/Y tasks (Z%)

View archived plan: cat .spec/plans/archive/{plan-name}-{YYYYMMDD}/plan.md
```
