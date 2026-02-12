Create a summary section capturing insights from planning.

## Step 0: Select Plan

If argument provided: `/pause plan-name` - use that plan

If no argument:
1. Read `.spec/plans/README.md` to get all active plans with Last Updated timestamps
2. Sort plans by Last Updated (most recent first)
3. If only one plan exists, auto-select it
4. If multiple plans exist, **auto-select the most recently updated plan**
5. Report to user: "Pausing plan: {plan-name} (last updated: {timestamp})"
6. If no plans exist, inform user to create with `/new`

## Step 1: Read Current Plan

Read `.spec/plans/{plan-name}/plan.md` to understand:

- The objective and scope
- All phases and their current status
- What has been completed
- What remains to be done
- Any context from the current session

## Step 2: Generate Insights Summary

Create a comprehensive "Insights" section capturing:

1. Progress Summary

   - What has been accomplished so far
   - Which phases are complete, in progress, or not started
   - Overall completion percentage

2. Key Decisions Made

   - Important choices made during planning or implementation
   - Rationale behind technical decisions
   - Trade-offs considered

3. Context and Findings

   - Important discoveries from codebase exploration
   - Dependencies and relationships identified
   - Constraints or limitations discovered
   - **Branch context**: Plan is for branch '{PLAN_BRANCH}' {if PLAN_BRANCH != CURRENT_BRANCH}(currently on '{CURRENT_BRANCH}'){endif}
   - **Worktree**: {PLAN_WORKTREE or "No worktree"}

4. Next Steps

   - What should be done next when work resumes
   - Current task or phase in progress
   - Any blockers or considerations for continuation

5. Notes
   - Any other important context from the session
   - Tips for picking up work later
   - References to relevant files or documentation

## Step 3: Update Plan and README

1. Add or update the "Insights" section at the end of `.spec/plans/{plan-name}/plan.md` (before any archived sections):

```markdown
## Insights

Last Updated: {ISO 8601 timestamp}

Progress: Phase 2 in progress (8/16 tasks complete, 50%)

Branch Context:
- Plan Branch: {PLAN_BRANCH}
- Current Branch: {CURRENT_BRANCH}
- Worktree: {PLAN_WORKTREE or "No worktree"}
- Status: {if PLAN_BRANCH == CURRENT_BRANCH}On correct branch ✓{else}Branch mismatch - switch before resuming{endif}
{if PLAN_BRANCH != CURRENT_BRANCH}
- Switch command: git checkout {PLAN_BRANCH}
{endif}

Key Decisions:

- Chose JWT for authentication instead of sessions (better for API-first architecture)
- Using bcrypt for password hashing (industry standard, well-tested)
- OAuth providers: Google and GitHub only (most common for our users)

Context:

- Existing user table has email field but needs password_hash column
- Found reusable token generation utility in src/utils/crypto.ts
- Session storage will use Redis (already configured in infrastructure)

Next Steps:

- Complete remaining tasks in Phase 2 (OAuth Integration)
- Test OAuth callback handlers with both providers
- Move to Phase 3 (Session Management)

Notes:

- Password reset emails require SMTP configuration (env vars in .envrc)
- Consider rate limiting for login attempts (add to Phase 5?)
```

2. Update `.spec/plans/README.md`:
   - Set status to "Paused"
   - Update last updated timestamp

## Step 4: Inform User

Report that the plan has been paused with insights captured:

```
Plan "{plan-name}" paused with insights captured.

Insights section added to: .spec/plans/{plan-name}/plan.md
Status updated to: Paused

Resume when ready:
- /go {plan-name} - Continue interactively
- /bg {plan-name} - Continue in background
- /status {plan-name} - Check current status
```
