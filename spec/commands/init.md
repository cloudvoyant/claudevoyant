Initialize an empty plan template without starting the planning process.

## Step 1: Check for Existing Plan

Check if `.claude/plan.md` already exists:

- If it exists, inform the user and ask whether to:
  - Archive the existing plan (suggest filename:
    `.claude/plan-archived-YYYYMMDD.md`)
  - Overwrite the existing plan
  - Cancel the operation
- Wait for user decision before proceeding

## Step 2: Create Template

Create `.claude/plan.md` with the following template structure:

```markdown
# [New Plan Name]

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

## Implementation

[Will be filled in post-planning]

## Resources

1. [Example Resource](example.com/how-to-article.html)
```

## Step 3: Complete

After creating the template, inform the user and exit. Do not start the planning
process.
