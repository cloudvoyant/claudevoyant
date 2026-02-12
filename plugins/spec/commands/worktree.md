Manage git worktrees for spec-driven development.

## Overview

This command provides subcommands for managing git worktrees:
- `list` - Show all worktrees
- `create` - Create new worktree
- `remove` - Remove worktree
- `prune` - Clean up deleted worktrees

## Step 0: Parse Subcommand

Check for subcommand argument: `/worktree <subcommand> [args]`

Supported subcommands:
- `list` - List all worktrees
- `create <branch-name>` - Create worktree for branch
- `remove <branch-name>` - Remove worktree for branch
- `prune` - Prune stale worktree references

If no subcommand or invalid subcommand, show help:
```
Usage: /worktree <subcommand> [args]

Subcommands:
  list                    List all worktrees
  create <branch-name>    Create worktree for branch
  remove <branch-name>    Remove worktree for branch
  prune                   Clean up deleted worktrees

Examples:
  /worktree list
  /worktree create feature-new-auth
  /worktree remove feature-old-task
  /worktree prune
```

Based on subcommand, continue to appropriate step:
- `list` → Step 1
- `create` → Step 2
- `remove` → Step 3
- `prune` → Step 4

## Step 1: List Worktrees

Show all git worktrees and their status.

**Execute git worktree list:**
```bash
git worktree list
```

**Parse and enhance output:**

For each worktree:
1. Extract path, branch, and commit hash
2. Check if worktree is associated with any plan:
   ```bash
   # Search all plans for worktree path
   for plan_dir in .spec/plans/*/; do
     if grep -q "Worktree.*$worktree_path" "$plan_dir/plan.md" 2>/dev/null; then
       echo "Plan: $(basename $plan_dir)"
     fi
   done
   ```
3. Check worktree status (clean/dirty)

**Display Format:**

```
Git Worktrees
=============

Main Repository
Path: /Users/user/Projects/myproject
Branch: main (abc1234)
Status: Clean

Feature Worktrees:

1. feature-auth 🌿
   Path: .worktrees/feature-auth
   Branch: feature-auth (def5678)
   Status: Clean ✓
   Plan: auth-system
   Commands: cd .worktrees/feature-auth

2. feature-refactor 🌿
   Path: .worktrees/feature-refactor
   Branch: feature-refactor (ghi9012)
   Status: 2 uncommitted changes ⚠️
   Plan: refactor-api
   Commands: cd .worktrees/feature-refactor

3. feature-old-task 🌿
   Path: .worktrees/feature-old-task
   Branch: feature-old-task (jkl3456)
   Status: Clean ✓
   No associated plan
   Commands: cd .worktrees/feature-old-task

Summary:
- Total worktrees: 4 (1 main + 3 features)
- Plans with worktrees: 2

Manage worktrees:
- /worktree create <branch> - Create new worktree
- /worktree remove <branch> - Remove worktree
- /worktree prune - Clean up deleted worktrees
```

**Implementation Notes:**
- Main repository worktree is always shown first
- Feature worktrees shown with branch emoji
- Status includes uncommitted changes count
- Associated plans shown if found
- Summary provides overview

## Step 2: Create Worktree

Create a new git worktree for a branch.

**Parse Arguments:**
```bash
BRANCH_NAME="[argument after 'create']"

if [ -z "$BRANCH_NAME" ]; then
  echo "Error: Branch name required"
  echo "Usage: /worktree create <branch-name>"
  exit 1
fi

# Validate branch name
if ! [[ "$BRANCH_NAME" =~ ^[a-zA-Z0-9/_-]+$ ]]; then
  echo "Error: Invalid branch name"
  echo "Branch names can only contain alphanumeric characters, hyphens, underscores, and slashes"
  exit 1
fi
```

**Check Prerequisites:**
```bash
# Check if in git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: Not in a git repository"
  exit 1
fi

# Get current branch for base
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
WORKTREE_PATH=".worktrees/$BRANCH_NAME"

# Check if worktree already exists
if git worktree list | grep -q "\[$BRANCH_NAME\]"; then
  echo "Error: Worktree for branch '$BRANCH_NAME' already exists"
  git worktree list | grep "\[$BRANCH_NAME\]"
  exit 1
fi

# Check if directory exists
if [ -d "$WORKTREE_PATH" ]; then
  echo "Error: Directory $WORKTREE_PATH already exists"
  exit 1
fi
```

**Create Worktree:**
```bash
# Create .worktrees directory if needed
mkdir -p .worktrees

# Check if branch exists
if git rev-parse --verify "$BRANCH_NAME" >/dev/null 2>&1; then
  # Branch exists, use it
  echo "Using existing branch '$BRANCH_NAME'"
  git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
else
  # Branch doesn't exist, create from current branch
  echo "Creating new branch '$BRANCH_NAME' from '$CURRENT_BRANCH'"
  git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" "$CURRENT_BRANCH"
fi

# Update .gitignore if needed
if [ -f .gitignore ]; then
  if ! grep -qx "\.worktrees/\?" .gitignore; then
    echo "" >> .gitignore
    echo "# Git worktrees" >> .gitignore
    echo ".worktrees/" >> .gitignore
    echo "✓ Added .worktrees/ to .gitignore"
  fi
else
  echo "# Git worktrees" > .gitignore
  echo ".worktrees/" >> .gitignore
  echo "✓ Created .gitignore with .worktrees/ entry"
fi
```

**Report Success:**
```
✓ Worktree created successfully!

Branch: $BRANCH_NAME 🌿
Path: $WORKTREE_PATH
Base: $CURRENT_BRANCH

Next steps:
1. Switch to worktree: cd $WORKTREE_PATH
2. Make changes in isolated environment
3. Create plan for this worktree: /spec:new plan-name --branch $BRANCH_NAME

Or work directly in worktree without creating a plan.
```

**Error Handling:**
- If git commands fail, show error and exit
- If directory collision, show error
- If worktree already exists, show existing location

## Step 3: Remove Worktree

Remove an existing git worktree.

**Parse Arguments:**
```bash
BRANCH_NAME="[argument after 'remove']"

if [ -z "$BRANCH_NAME" ]; then
  echo "Error: Branch name required"
  echo "Usage: /worktree remove <branch-name>"
  exit 1
fi
```

**Find Worktree:**
```bash
# Get worktree path from git worktree list
WORKTREE_PATH=$(git worktree list | grep "\[$BRANCH_NAME\]" | awk '{print $1}')

if [ -z "$WORKTREE_PATH" ]; then
  echo "Error: No worktree found for branch '$BRANCH_NAME'"
  echo "Use /worktree list to see existing worktrees"
  exit 1
fi
```

**Check for Associated Plans:**
```bash
# Search for plans using this worktree
ASSOCIATED_PLANS=()
for plan_dir in .spec/plans/*/; do
  if [ -f "$plan_dir/plan.md" ]; then
    if grep -q "Worktree.*$WORKTREE_PATH" "$plan_dir/plan.md" 2>/dev/null; then
      ASSOCIATED_PLANS+=("$(basename $plan_dir)")
    fi
  fi
done

if [ ${#ASSOCIATED_PLANS[@]} -gt 0 ]; then
  echo "⚠️  Warning: This worktree is associated with active plan(s):"
  for plan in "${ASSOCIATED_PLANS[@]}"; do
    echo "  - $plan"
  done
  echo ""
  echo "Consider completing plans with /spec:done before removing worktree"
fi
```

**Check for Uncommitted Changes:**
```bash
if git -C "$WORKTREE_PATH" status --porcelain | grep -q .; then
  echo "⚠️  Warning: Worktree has uncommitted changes:"
  git -C "$WORKTREE_PATH" status --short
  echo ""
fi
```

**Confirm Removal:**

Use **AskUserQuestion** tool:
```
question: "Remove worktree for branch '$BRANCH_NAME'?"
header: "Remove Worktree"
multiSelect: false
options:
  - label: "Remove worktree, keep branch"
    description: "Remove worktree at '$WORKTREE_PATH', keep branch"
  - label: "Remove worktree and delete branch"
    description: "Remove worktree and delete branch '$BRANCH_NAME'"
  - label: "Cancel"
    description: "Don't remove, keep worktree"
```

**If "Remove worktree, keep branch":**
```bash
git worktree remove "$WORKTREE_PATH" --force
echo "✓ Removed worktree at $WORKTREE_PATH"
echo "  Branch '$BRANCH_NAME' preserved"
```

**If "Remove worktree and delete branch":**
```bash
# Remove worktree
git worktree remove "$WORKTREE_PATH" --force
echo "✓ Removed worktree at $WORKTREE_PATH"

# Delete branch
if git branch --merged | grep -q "^  $BRANCH_NAME$"; then
  git branch -d "$BRANCH_NAME"
  echo "✓ Deleted branch $BRANCH_NAME (was merged)"
else
  echo "⚠️  Warning: Branch '$BRANCH_NAME' is not fully merged"
  read -p "Force delete branch? [y/N]: " confirm
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    git branch -D "$BRANCH_NAME"
    echo "✓ Force deleted branch $BRANCH_NAME"
  else
    echo "  Branch $BRANCH_NAME kept"
  fi
fi
```

**If "Cancel":**
```
Removal cancelled. Worktree preserved.
```

## Step 4: Prune Stale Worktrees

Clean up references to deleted worktrees.

**Explanation:**
Git maintains administrative files for worktrees. If a worktree directory is deleted manually (not via `git worktree remove`), git still tracks it. The `prune` command cleans up these stale references.

**Check for Stale Worktrees:**
```bash
# List worktrees and check if directories exist
STALE_COUNT=0
git worktree list | tail -n +2 | while read line; do
  WORKTREE_PATH=$(echo "$line" | awk '{print $1}')
  if [ ! -d "$WORKTREE_PATH" ]; then
    STALE_COUNT=$((STALE_COUNT + 1))
    echo "Stale: $WORKTREE_PATH"
  fi
done

if [ $STALE_COUNT -eq 0 ]; then
  echo "No stale worktree references found."
  echo "All worktrees are valid."
  exit 0
fi
```

**Confirm Prune:**

Use **AskUserQuestion** tool:
```
question: "Found $STALE_COUNT stale worktree reference(s). Clean them up?"
header: "Prune Worktrees"
multiSelect: false
options:
  - label: "Yes, prune stale references"
    description: "Remove git's tracking of deleted worktrees"
  - label: "No, keep references"
    description: "Don't prune, leave as-is"
```

**If "Yes, prune stale references":**
```bash
git worktree prune --verbose

echo "✓ Pruned stale worktree references"
echo ""
echo "Remaining worktrees:"
git worktree list
```

**If "No, keep references":**
```
Prune cancelled. Stale references preserved.
```

**Notes:**
- Pruning is safe - only removes references to deleted directories
- Does not affect existing worktrees
- Run periodically to keep git metadata clean
