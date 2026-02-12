List all plans with their current status and progress.

## Overview

Shows a comprehensive view of all active and archived plans, including progress, status, and last update times.

## Step 1: Check for Plans Directory

Check if `.spec/plans/` exists:
- If not found, report: "No plans found. Create one with /new"
- If found, continue

## Step 2: Read README.md

Read `.spec/plans/README.md` to get plan metadata.

If README.md doesn't exist or is empty:
- Scan `.spec/plans/` for plan directories (exclude `archive/` and `README.md`)
- For each directory found, auto-generate metadata:

  **Auto-Generation Rules:**
  1. Plan name: directory name
  2. Read `plan.md` in that directory:
     - Extract objective for description (first bullet under ## Objective)
     - Count total tasks (all `[ ]` and `[x]` items)
     - Count completed tasks (all `[x]` items)
     - Calculate progress percentage
  3. Status: Default to "Active" (cannot detect Paused/Executing without execution-log)
  4. Created: Use directory creation time (filesystem mtime)
  5. Last Updated: Use plan.md modification time (filesystem mtime)
  6. Path: `.spec/plans/{directory-name}/`

- Write generated README.md with warning comment:
  ```markdown
  # Plans

  <!-- AUTO-GENERATED from filesystem scan - metadata may be approximate -->
  <!-- Created: [timestamp] -->
  ```

- Report to user: "Generated README.md from discovered plans. Verify accuracy with /refresh."

## Step 3: Parse and Display Plans

Parse README.md and display plans in formatted output.

**Extract Branch Context:**
For each plan, extract branch and worktree information from plan.md metadata:
```bash
PLAN_BRANCH=$(grep "^- \*\*Branch\*\*:" .spec/plans/{plan-name}/plan.md | sed 's/^- \*\*Branch\*\*: //' | sed 's/ *$//')
PLAN_WORKTREE=$(grep "^- \*\*Worktree\*\*:" .spec/plans/{plan-name}/plan.md | sed 's/^- \*\*Worktree\*\*: //' | sed 's/ *$//')
```

Display plans with branch context:

```
📋 Plans Overview
================

## Active Plans (3)

✅ feature-auth (Executing) 🌿 feature-auth
   Description: Add authentication system
   Progress: ━━━━━━━━━━━━━━━━━━━━ 52% (12/23 tasks)
   Branch: feature-auth
   Worktree: .worktrees/feature-auth
   Last Updated: 5 minutes ago
   Path: .spec/plans/feature-auth/
   Commands: /go feature-auth | /status feature-auth | /stop feature-auth

⏸ refactor-api (Paused)
   Description: Refactor API layer
   Progress: ━━━━━━━━━━━━━━━━━━━━ 33% (5/15 tasks)
   Branch: main
   Last Updated: 2 days ago
   Path: .spec/plans/refactor-api/
   Commands: /go refactor-api | /bg refactor-api

📝 add-tests (Active) 🌿 feature-tests
   Description: Add comprehensive test coverage
   Progress: ━━━━━━━━━━━━━━━━━━━━ 10% (2/20 tasks)
   Branch: feature-tests
   Worktree: .worktrees/feature-tests
   Last Updated: 1 hour ago
   Path: .spec/plans/add-tests/
   Commands: /go add-tests | /bg add-tests

## Archived Plans (2)

✓ feature-login (Completed 2025-02-08)
   Progress: 100% (15/15 tasks)
   Archive: .spec/plans/archive/feature-login-20250208/

✓ fix-bug-123 (Completed 2025-02-05)
   Progress: 100% (5/5 tasks)
   Archive: .spec/plans/archive/fix-bug-123-20250205/
```

**Display Rules:**
- Show branch emoji 🌿 after plan name if plan has branch metadata (and branch != "(none)")
- Include "Branch:" line if branch is set
- Include "Worktree:" line if worktree is set and != "(none)"
- Don't show branch/worktree info for archived plans
- Format matches existing style

## Step 4: Provide Quick Actions

Show helpful commands at bottom:

```
Quick Actions:
- /new - Create new plan
- /go <plan> - Execute a plan
- /status <plan> - Check plan status
- /done <plan> - Complete and archive a plan
```
