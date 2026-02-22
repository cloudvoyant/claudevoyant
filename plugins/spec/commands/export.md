Copy a plan from a worktree's `.spec/plans/` into the main repo's `.spec/plans/` so it is visible from the root of the repository.

This is a one-way copy. The worktree remains the source of truth; re-run `/spec:export` to push updates.

## Usage

```
/spec:export                   # auto-select most recent plan in current worktree
/spec:export plan-name         # export a specific plan
/spec:export plan-name --force # overwrite if the plan already exists in main repo
```

## Step 0: Parse Arguments

```bash
PLAN_NAME=""      # from first non-flag argument, or auto-detected
FORCE=false       # set true if --force flag present
```

## Step 1: Find the Plan

If `PLAN_NAME` not provided:
1. Read `.spec/plans/README.md` in the current directory
2. Sort active plans by Last Updated (most recent first)
3. Auto-select the most recently updated plan
4. Report: `Exporting plan: {plan-name}`
5. If no plans found, report error:
   ```
   Error: No plans found in .spec/plans/
   Run /spec:new to create a plan, or cd into a worktree that contains one.
   ```

Verify the plan exists at `.spec/plans/{plan-name}/plan.md`. If not, report:
```
Error: Plan '{plan-name}' not found at .spec/plans/{plan-name}/plan.md
```

## Step 2: Resolve the Main Repo Root

```bash
# Works from anywhere — main repo or any worktree
COMMON_GIT_DIR=$(git rev-parse --git-common-dir 2>/dev/null)

if [ -z "$COMMON_GIT_DIR" ]; then
  echo "Error: Not in a git repository."
  exit 1
fi

# Main repo root is one level up from the .git directory
MAIN_REPO_ROOT=$(cd "$COMMON_GIT_DIR/.." && pwd)
MAIN_SPEC_DIR="$MAIN_REPO_ROOT/.spec/plans"
CURRENT_SPEC_DIR=".spec/plans"
```

**Verify this is actually a worktree export** (not a no-op copy):

```bash
CURRENT_DIR=$(pwd)
if [ "$CURRENT_DIR" = "$MAIN_REPO_ROOT" ]; then
  echo "Warning: You are already in the main repo root."
  echo "The plan is already at .spec/plans/{plan-name}/."
  echo "Nothing to export."
  exit 0
fi
```

## Step 3: Check for Collision in Main Repo

```bash
DEST_PLAN_DIR="$MAIN_SPEC_DIR/{plan-name}"

if [ -d "$DEST_PLAN_DIR" ]; then
  if [ "$FORCE" = "false" ]; then
    echo "Error: Plan '{plan-name}' already exists in the main repo at:"
    echo "  $DEST_PLAN_DIR"
    echo ""
    echo "Options:"
    echo "  /spec:export {plan-name} --force   overwrite with current worktree version"
    exit 1
  else
    echo "⚠️  Overwriting existing plan in main repo (--force)"
  fi
fi
```

## Step 4: Copy Plan Files

```bash
# Create main spec dir if it doesn't exist
mkdir -p "$MAIN_SPEC_DIR"

# Copy the entire plan directory
cp -r "$CURRENT_SPEC_DIR/{plan-name}" "$MAIN_SPEC_DIR/"

echo "✓ Copied .spec/plans/{plan-name}/ → $MAIN_SPEC_DIR/{plan-name}/"
```

Files copied:
- `plan.md`
- `implementation/phase-*.md` (all phase files)
- `execution-log.md` (if present)

## Step 5: Update Main Repo README

Read `$MAIN_SPEC_DIR/README.md` if it exists; create it if not.

Check whether `{plan-name}` already has an entry:
- **If entry exists** (e.g. from a previous export): update the Progress, Status, and Last Updated fields to match the current plan.md values
- **If no entry**: append a new entry to the Active Plans section:

```markdown
### {plan-name}
- **Description**: {extracted from plan objective}
- **Branch**: {METADATA_BRANCH} 🌿
- **Worktree**: {METADATA_WORKTREE}
- **Status**: {current status from plan.md}
- **Progress**: {X/Y tasks (Z%)}
- **Created**: {CREATED_TIMESTAMP from plan.md}
- **Last Updated**: {now, ISO 8601 UTC}
- **Path**: `.spec/plans/{plan-name}/`
- **Exported From**: `{CURRENT_SPEC_DIR}/{plan-name}/`
```

Only include Branch/Worktree lines if they have values other than `(none)`.

## Step 6: Report

```
✓ Exported plan: {plan-name}

  From : {CURRENT_SPEC_DIR}/{plan-name}/
  To   : {MAIN_SPEC_DIR}/{plan-name}/

  Files copied:
    plan.md
    implementation/phase-1.md
    implementation/phase-2.md
    ...
    {execution-log.md if present}

  Main repo README updated.

  Note: The worktree copy remains the source of truth.
  Re-run /spec:export to push future updates.
```
