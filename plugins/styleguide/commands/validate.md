Validate current work against style guide rules.

## Overview

Checks your recent changes, commits, or code against the rules in CLAUDE.md and reports any violations or suggestions.

## Step 1: Determine Validation Scope

If no argument provided, use **AskUserQuestion**:
```
question: "What would you like to validate?"
header: "Validation Scope"
multiSelect: false
options:
  - label: "Recent changes"
    description: "Validate uncommitted changes (git diff)"
  - label: "Last commit"
    description: "Validate most recent commit message and changes"
  - label: "Specific files"
    description: "Validate specific files (will ask which ones)"
  - label: "Full project"
    description: "Comprehensive project audit (slow)"
```

## Step 2: Load Relevant Rules

Based on validation scope, load applicable rules from CLAUDE.md:

### For Git Commit Validation
Load rules with contexts: `git`, `commit`

### For Code Changes
Detect file types and load appropriate contexts:
- `*.ts` → `code`, `typescript`
- `*.md` → `docs`, `documentation`
- `justfile` → `build`, `tools`

### For Build/Tools
Load rules with contexts: `build`, `tools`

## Step 3: Run Validation Checks

### Check 1: Tool Usage Validation
```bash
# Check if bash commands were used when justfile exists
git diff --name-only | while read file; do
  if [ "$file" = "justfile" ] || [ "$file" = "Makefile" ]; then
    # Check recent tool usage
    # Did user use Bash tool for commands that have justfile recipes?
  fi
done
```

**Example violation:**
```
✗ Tool Usage Violation
  Used: npm test
  Should use: just test
  Rule: "Always check justfile before running bash commands"
  Context: build, tools
```

### Check 2: Commit Message Validation
```bash
# Get last commit message
COMMIT_MSG=$(git log -1 --pretty=%B)

# Check conventional commit format
if ! echo "$COMMIT_MSG" | grep -qE '^(feat|fix|chore|docs|refactor|test|style|perf)(\(.+\))?:.+'; then
  echo "✗ Commit message doesn't follow conventional format"
fi

# Check length
SUBJECT=$(echo "$COMMIT_MSG" | head -n1)
LENGTH=${#SUBJECT}
if [ $LENGTH -gt 72 ]; then
  echo "✗ Subject line too long: $LENGTH chars (max 72)"
fi

# Check for Co-Authored-By
if ! echo "$COMMIT_MSG" | grep -q "Co-Authored-By: Claude"; then
  echo "⚠️  Missing Co-Authored-By line for AI assistance"
fi
```

### Check 3: Code Style Validation
```typescript
// For TypeScript files
const violations = [];

// Check: Prefer const over let
if (code.includes('let ') && canBeConst(code)) {
  violations.push({
    type: 'code-style',
    rule: 'Prefer const over let',
    line: lineNumber,
    context: ['code', 'typescript']
  });
}

// Check: No any types
if (code.includes(': any')) {
  violations.push({
    type: 'type-safety',
    rule: 'Avoid any type, use unknown or specific type',
    line: lineNumber,
    context: ['code', 'typescript']
  });
}
```

### Check 4: File Operation Validation
```bash
# Check if Write was used when Edit should have been used
# (Check session history or git diff for overwrites)

# Check if files were edited without being read first
# (Validate against tool usage sequence)
```

### Check 5: Documentation Validation
```bash
# For changed code files, check if comments/docs were updated
# For README changes, check for broken links
# For public API changes, check for JSDoc updates
```

## Step 4: Calculate Compliance Score

```javascript
const score = {
  total: totalChecks,
  passed: passedChecks,
  warnings: warningCount,
  violations: violationCount,
  percentage: (passedChecks / totalChecks) * 100
};
```

## Step 5: Generate Report

### Summary Report
```
📋 Style Guide Validation Report

Scope: Recent changes (3 files, last commit)
Time: 2026-02-12 15:45:00

Overall Score: 85% (17/20 checks passed)

✓ Passed: 17
⚠️  Warnings: 2
✗ Violations: 1

Categories:
✓ Build System: 5/5
⚠️  Code Style: 3/4 (1 warning)
✗ Git Commits: 1/2 (1 violation)
✓ File Operations: 4/4
✓ Documentation: 4/5 (1 warning)
```

### Detailed Violations
```
Violations:

1. ✗ Commit Message Format
   Rule: Use conventional commit format
   Context: git, commit

   Current: "updated the code"
   Expected: "fix: resolve authentication issue"

   Fix: Amend commit with proper format
   Command: git commit --amend -m "fix: resolve authentication issue"
```

### Warnings
```
Warnings:

1. ⚠️  Code Style
   File: src/auth.ts:42
   Rule: Prefer const over let
   Context: code, typescript

   Current: let user = getUser();
   Suggested: const user = getUser();

   Impact: Low (not blocking)

2. ⚠️  Documentation
   File: README.md
   Rule: Update docs when changing behavior
   Context: docs

   Code changed but README not updated
   Consider: Adding usage examples for new feature
```

### Suggestions
```
💡 Suggestions for Improvement:

1. Add Co-Authored-By line to commits
   All commits with AI assistance should include:
   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>

2. Run tests before committing
   Consider adding pre-commit hook: just styleguide-validate

3. Use Edit tool for modifications
   Found 1 instance of Write on existing file
   Rule: Prefer Edit over Write for modifications
```

## Step 6: Offer Auto-Fix

For fixable violations, offer to auto-fix:

Use **AskUserQuestion**:
```
question: "Found 1 fixable violation. Auto-fix?"
header: "Auto-Fix Violations"
multiSelect: true
options:
  - label: "Fix commit message"
    description: "Amend commit with conventional format"
  - label: "Add Co-Authored-By"
    description: "Add AI attribution to commit message"
  - label: "Fix code style issues"
    description: "Apply const over let changes"
```

Execute fixes for selected options.

## Step 7: Update Compliance History

Track validation history in `.styleguide/compliance.json`:

```json
{
  "history": [
    {
      "timestamp": "2026-02-12T15:45:00Z",
      "scope": "recent-changes",
      "score": 0.85,
      "violations": 1,
      "warnings": 2,
      "autoFixed": 0,
      "categories": {
        "build": 1.0,
        "code": 0.75,
        "git": 0.50,
        "tools": 1.0,
        "docs": 0.80
      }
    }
  ],
  "trends": {
    "averageScore": 0.87,
    "improvementRate": 0.05
  }
}
```

## Step 8: Exit Code

Return appropriate exit code for CI/CD integration:

```bash
if [ $VIOLATIONS -gt 0 ]; then
  exit 1  # Fail if violations found
elif [ $WARNINGS -gt 0 ]; then
  exit 0  # Pass with warnings
else
  exit 0  # Perfect compliance
fi
```

## CI/CD Integration

Add to GitHub Actions or CI pipeline:

```yaml
# .github/workflows/validate.yml
- name: Validate Style Guide
  run: |
    # Assumes Claude Code CLI available
    claude-code /styleguide:validate --scope commit
```

Or in pre-commit hook:
```bash
#!/bin/bash
# .git/hooks/pre-commit
just styleguide-validate || exit 1
```

## Configuration

Control validation in `.styleguide/config.json`:

```json
{
  "validation": {
    "enabled": true,
    "strictMode": false,         // Fail on warnings too
    "autoFix": true,             // Offer auto-fix
    "skipPatterns": ["*.test.ts"], // Files to skip
    "customRules": []            // Additional validation rules
  }
}
```

## Notes

**Validation Levels:**
- ✗ Violation: Breaks explicit rule, should be fixed
- ⚠️  Warning: Style suggestion, recommended to fix
- 💡 Suggestion: Best practice, optional improvement

**Performance:**
- Recent changes: Fast (~1 second)
- Last commit: Fast (~1 second)
- Specific files: Fast-Medium (depends on file count)
- Full project: Slow (~10+ seconds for large projects)

**Accuracy:**
- High for: Commit messages, tool usage, file operations
- Medium for: Code style (pattern matching)
- Lower for: Context-dependent rules (may need manual review)
