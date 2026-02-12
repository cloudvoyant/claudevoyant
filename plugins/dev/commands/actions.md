Monitor GitHub Actions workflows to ensure changes pass CI/CD checks.

## Purpose

After making changes and pushing code, verify that all CI/CD workflows complete successfully before declaring work "done". This prevents the common issue where Claude finishes work but doesn't check if tests, builds, or other automated checks actually pass.

## Workflow

### Step 1: Get Workflow Runs

Check the status of recent workflow runs:

```bash
gh run list --limit 10 --json status,conclusion,name,createdAt,databaseId,headBranch
```

Parse the output to identify:
- Which workflows are running
- Which branch they're on
- Current status (queued, in_progress, completed)
- Conclusion (success, failure, cancelled)

### Step 2: Identify Relevant Runs

Filter for workflows that match:
- Current branch
- Recent timestamp (within last 10 minutes)
- Triggered by recent commits

If no relevant workflows found, inform user and exit.

### Step 3: Monitor Progress

For each relevant workflow that's not yet completed:

```bash
gh run watch <run-id>
```

Or poll status every 10-15 seconds:

```bash
gh run view <run-id> --json status,conclusion,name
```

Display progress to user:
```
🔄 Monitoring workflows:
  ✓ Build (completed - success)
  ⏳ Tests (in_progress)
  ⏳ Lint (queued)
```

### Step 4: Handle Results

**All workflows passed:**
```
✅ All CI checks passed!
  ✓ Build - success
  ✓ Tests - success
  ✓ Lint - success

Changes are verified and ready.
```

**Some workflows failed:**
```
❌ CI checks failed:
  ✓ Build - success
  ✗ Tests - failure
  ✓ Lint - success

Fetching failure logs...
```

Fetch logs for failed workflows:
```bash
gh run view <run-id> --log-failed
```

Show relevant error output to user and offer to help fix issues.

**Workflows cancelled/skipped:**
Report status and ask user if they want to re-run or investigate.

### Step 5: Summary

Provide clear summary:
- Total workflows checked
- Pass/fail count
- Time taken
- Next steps if failures occurred

## Options

Support optional flags for different behaviors:

**Wait for completion (default):**
```
Monitor workflows and wait until all complete before returning
```

**Status check only:**
```
Check current status and return immediately without waiting
```

**Specific workflow:**
```
Monitor only a specific workflow by name
```

**Branch:**
```
Check workflows on a different branch
```

## Error Handling

- **No gh CLI:** Inform user they need GitHub CLI installed
- **Not authenticated:** Prompt to run `gh auth login`
- **Not a git repo:** Inform user this only works in git repositories
- **No remote:** Inform user repo must have GitHub remote
- **No workflows found:** Check if repo has GitHub Actions configured
- **API rate limits:** Handle gracefully and inform user

## Integration Points

This skill can be:
1. **Called manually** after pushing: `/dev:actions`
2. **Called from other skills** like `/dev:commit` after push
3. **Used as validation** before marking work complete

## Example Usage

### After pushing changes:
```
User: /dev:actions
```

Output:
```
🔍 Checking GitHub Actions for branch 'main'...

Found 3 workflow runs:
  • Build (#1234) - in_progress
  • Tests (#1235) - queued
  • Lint (#1236) - queued

⏳ Waiting for workflows to complete...

[1m 30s] Build completed - ✓ success
[2m 15s] Tests completed - ✓ success
[2m 45s] Lint completed - ✓ success

✅ All CI checks passed! (took 2m 45s)
```

### When failures occur:
```
❌ Tests workflow failed

Error logs:
===================================
FAIL src/components/Button.test.tsx
  ● Button › renders correctly

    expect(received).toHaveTextContent(expected)

    Expected: "Click me"
    Received: "Clck me"
===================================

Would you like me to investigate and fix this test failure?
```

## Best Practices

1. **Always check CI before declaring done** - Don't say work is complete until CI passes
2. **Show relevant errors only** - Don't dump entire logs, extract the key failure messages
3. **Offer to help** - If failures occur, offer to investigate and fix
4. **Be patient** - Workflows can take time; show progress updates
5. **Handle timeouts** - If workflows take >10 minutes, ask user if they want to continue waiting

## Notes

- Uses `gh` (GitHub CLI) for all GitHub API interactions
- Requires authentication: `gh auth status` to verify
- Works with both public and private repositories
- Respects GitHub API rate limits
