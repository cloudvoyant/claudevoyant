Initialize an empty plan template without starting the planning process.

## Step 0: Get Plan Name and Parse Flags

Parse arguments and ask for plan name if not provided:

**Argument Parsing:**
Check for optional --branch flag: `/spec:init plan-name --branch branch-name`
- Plan name (first non-flag argument): `/spec:init my-plan-name`
- Optional --branch flag: `/spec:init my-plan-name --branch feature-branch`
  - Flag can be anywhere: `/spec:init --branch feature-branch my-plan-name`
  - Branch name extracted from argument after `--branch`
  - Branch name validation: alphanumeric, hyphens, underscores, slashes only
  - If branch name invalid, show error and suggest valid format

**Store parsed values:**
```bash
PLAN_NAME="[parsed-plan-name or empty]"
BRANCH_NAME="[parsed-branch-name or empty]"
```

**If plan name not provided in arguments:**
Ask user: "What should this plan be called?"
- Provide example: "e.g., 'add-feature-x' or 'refactor-module-y'"
- Validate and slugify input:
  - Convert to lowercase
  - Replace spaces with hyphens
  - Remove special characters (keep alphanumeric and hyphens only)
  - Truncate to 50 characters max

## Step 0.5: Detect Branch Context

Detect the current git branch and determine target branch for plan:

```bash
# Check if in git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Warning: Not in a git repository. Branch features disabled."
  CURRENT_BRANCH=""
  TARGET_BRANCH=""
else
  # Get current branch
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

  # Determine target branch for plan
  if [ -n "$BRANCH_NAME" ]; then
    # User provided --branch flag
    TARGET_BRANCH="$BRANCH_NAME"
    SHOULD_CREATE_WORKTREE=true
  else
    # No --branch flag, use current branch as metadata only
    TARGET_BRANCH="$CURRENT_BRANCH"
    SHOULD_CREATE_WORKTREE=false
  fi
fi
```

Store these values for use in later steps:
- `CURRENT_BRANCH` - Current git branch (empty if not in git repo)
- `TARGET_BRANCH` - Branch to associate with plan
- `SHOULD_CREATE_WORKTREE` - Whether to create worktree (true if --branch flag used)

## Step 1: Check for Existing Plan

Check if plan with that name exists in `.spec/plans/{plan-name}/`:

If it exists, use **AskUserQuestion** tool:
```
question: "Plan '{plan-name}' already exists. What would you like to do?"
header: "Plan Exists"
multiSelect: false
options:
  - label: "Replace plan"
    description: "Delete existing plan and create new empty template"
  - label: "Capture work first"
    description: "Save existing work via /adr:capture, then replace"
  - label: "Cancel"
    description: "Keep existing plan, don't create new one"
```

Wait for user decision before proceeding

## Step 1.5: Create Worktree (if requested)

If user provided `--branch` flag, create a git worktree for the plan:

```bash
if [ "$SHOULD_CREATE_WORKTREE" = "true" ] && [ -n "$TARGET_BRANCH" ]; then
  BASE_BRANCH="${CURRENT_BRANCH:-main}"
  WORKTREE_PATH=".worktrees/$TARGET_BRANCH"

  # Validation: Check if worktree already exists
  if git worktree list | grep -q "\[$TARGET_BRANCH\]"; then
    echo "Error: Worktree for branch '$TARGET_BRANCH' already exists"
    echo "Use: git worktree list to see existing worktrees"
    exit 1
  fi

  # Validation: Check if directory exists
  if [ -d "$WORKTREE_PATH" ]; then
    echo "Error: Directory $WORKTREE_PATH already exists"
    exit 1
  fi

  # Create .worktrees directory if needed
  mkdir -p .worktrees

  # Check if branch exists
  if git rev-parse --verify "$TARGET_BRANCH" >/dev/null 2>&1; then
    # Branch exists, use it
    echo "Using existing branch '$TARGET_BRANCH'"
    git worktree add "$WORKTREE_PATH" "$TARGET_BRANCH"
  else
    # Branch doesn't exist, create from base
    echo "Creating new branch '$TARGET_BRANCH' from '$BASE_BRANCH'"
    git worktree add -b "$TARGET_BRANCH" "$WORKTREE_PATH" "$BASE_BRANCH"
  fi

  # Update .gitignore
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

  echo "✓ Worktree created at $WORKTREE_PATH"
  echo "  To work in worktree: cd $WORKTREE_PATH"

  # Store worktree path for metadata
  PLAN_WORKTREE="$WORKTREE_PATH"
else
  # No worktree created
  PLAN_WORKTREE=""
fi
```

## Step 2: Create Template

Create directory structure:
- Create `.spec/plans/{plan-name}/` directory
- Create `.spec/plans/{plan-name}/implementation/` directory (empty for now)

**Metadata Field Values:**
```bash
# Get current timestamp in ISO 8601 UTC format
CREATED_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Set metadata values
if [ -n "$TARGET_BRANCH" ]; then
  METADATA_BRANCH="$TARGET_BRANCH"
  METADATA_BASE_BRANCH="${BASE_BRANCH:-main}"
else
  METADATA_BRANCH="(none)"
  METADATA_BASE_BRANCH="main"
fi

if [ -n "$PLAN_WORKTREE" ]; then
  METADATA_WORKTREE="$PLAN_WORKTREE"
else
  METADATA_WORKTREE="(none)"
fi
```

Create `.spec/plans/{plan-name}/plan.md` with the following template structure:

```markdown
# [New Plan Name]

## Metadata
- **Branch**: {METADATA_BRANCH}
- **Base Branch**: {METADATA_BASE_BRANCH}
- **Worktree**: {METADATA_WORKTREE}
- **Created**: {CREATED_TIMESTAMP}

## Objective

[What are you trying to accomplish?]

## Design

[High level solution design]

## Plan

### Phase 1 - [Phase Name]

1. [ ] Task 1
2. [ ] Task 2
3. [ ] Task 3

### Phase 2 - [Phase Name]

1. [ ] Task 1
2. [ ] Task 2

## Resources

1. [Example Resource](example.com/how-to-article.html)
```

**Register in README.md:**
Register the plan in `.spec/plans/README.md`:
- Add plan to Active Plans section
- Include branch and worktree information if applicable
- Set status to "Active"
- Set progress to 0/0 tasks (0%)
- Set created and last updated timestamps to CREATED_TIMESTAMP
- Use this format:

```markdown
### {plan-name}
- **Description**: [New Plan Name]
{if METADATA_BRANCH != "(none)"}
- **Branch**: {METADATA_BRANCH} 🌿
{endif}
{if METADATA_WORKTREE != "(none)"}
- **Worktree**: {METADATA_WORKTREE}
{endif}
- **Status**: Active
- **Progress**: 0/0 tasks (0%)
- **Created**: {CREATED_TIMESTAMP}
- **Last Updated**: {CREATED_TIMESTAMP}
- **Path**: `.spec/plans/{plan-name}/`
```

**Implementation:**
Only include branch and worktree lines if they have values other than "(none)".

## Step 3: Complete

After creating the template, inform the user:

```
Plan template "{plan-name}" created!

Location: .spec/plans/{plan-name}/plan.md

Next steps:
1. Edit plan.md with your objectives and task checklist
2. **REQUIRED**: Create implementation files for ALL phases before execution:
   - Create .spec/plans/{plan-name}/implementation/phase-N.md for each phase
   - Use the template structure from /spec:new Step 5.5
   - Include detailed implementation steps, files to modify, code examples, and tests
   - All implementation files must exist before running /go or /bg
3. Use /go {plan-name} to execute when ready (after creating implementation files)

Your plan is registered in .spec/plans/README.md
```

Do not start the planning process.
