Analyze patterns from your interactions and automatically suggest or apply style guide rules.

## Overview

The learn command observes patterns in how you work and suggests rules for CLAUDE.md. It can run automatically via hooks or manually when you want to capture recent patterns.

## Step 1: Read Learning Database

Read `.style/patterns.json` to analyze accumulated observations:

```json
{
  "patterns": [
    {
      "id": "use-justfile",
      "type": "tool-correction",
      "pattern": "bash → justfile",
      "observations": [
        {"from": "npm test", "to": "just test", "timestamp": "..."},
        {"from": "npm build", "to": "just build", "timestamp": "..."},
        {"from": "bash command", "to": "just recipe", "timestamp": "..."}
      ],
      "count": 3,
      "confidence": 0.85,
      "contexts": ["build", "tools"],
      "status": "ready"
    }
  ]
}
```

## Step 2: Analyze Patterns

For each pattern, calculate:

### Confidence Score
```javascript
confidence = (observations / (observations + 1)) * contextRelevance

where:
- observations = number of times pattern observed
- contextRelevance = 1.0 if contexts are consistent, 0.5 if mixed
```

### Pattern Categories
- **tool-correction**: User corrects tool choice (bash → justfile)
- **code-pattern**: Consistent code style (const over let)
- **workflow**: Repeated action sequences (edit → test → commit)
- **error-avoidance**: User fixes same mistake multiple times

### Status Determination
```javascript
if (confidence > 0.75 && observations >= 3) {
  status = "ready" // Ready to apply
} else if (observations >= 2) {
  status = "candidate" // Suggest to user
} else {
  status = "observing" // Keep watching
}
```

## Step 3: Filter Actionable Patterns

Group patterns by status:

```javascript
{
  "ready": [/* High-confidence patterns (auto-apply) */],
  "candidates": [/* Medium-confidence (ask user) */],
  "observing": [/* Low-confidence (keep tracking) */]
}
```

## Step 4: Process Ready Patterns

For patterns with `status: "ready"` and config `autoApply: true`:

### Generate Rule Text
```javascript
patterns = {
  "use-justfile": {
    rule: "Always check `just --list` before running bash/npm commands",
    section: "Build System",
    contexts: ["build", "tools"],
    examples: ["Use `just test` not `npm test`"]
  },
  "prefer-edit-tool": {
    rule: "Use Edit tool for file modifications instead of Write",
    section: "File Operations",
    contexts: ["tools", "edit"]
  }
}
```

### Auto-Apply to CLAUDE.md
```bash
# Find or create section with matching contexts
# Add rule to section
# Update patterns.json with status: "applied"
```

Report what was applied:
```
✓ Auto-applied 2 rules from patterns:

1. Build System
   "Always check `just --list` before running bash/npm commands"
   Confidence: 0.85 (3 observations)

2. File Operations
   "Use Edit tool for file modifications instead of Write"
   Confidence: 0.90 (4 observations)
```

## Step 5: Present Candidates

For patterns with `status: "candidate"`, ask user:

Use **AskUserQuestion**:
```
question: "Found pattern: You've corrected 'npm test' to 'just test' 2 times. Add this rule?"
header: "Learn from Pattern"
multiSelect: false
options:
  - label: "Yes, add rule"
    description: "Add 'Use justfile recipes' to style guide"
  - label: "Not yet"
    description: "Keep observing (need more confidence)"
  - label: "Never"
    description: "This is an exception, don't track this pattern"
```

For each "Yes" response:
- Generate appropriate rule text
- Add to CLAUDE.md with detected contexts
- Update pattern status to "applied"

For "Never" responses:
- Remove pattern from patterns.json
- Add to ignore list

## Step 6: Observe Learning Opportunities

Scan recent work for new patterns to track:

### Check Git History
```bash
# Recent commits
git log --oneline -20 --pretty=format:"%s"

# Analyze commit message patterns
# Example: All use "feat:", "fix:", "chore:" → conventional commits
```

### Check File Edits
```bash
# What files were edited recently
# What patterns emerge (always Edit before commit, etc.)
```

### Check Tool Usage
```bash
# From session history
# Which tools are used most
# Which sequences repeat (Read → Edit → test)
```

Add new observations to patterns.json:
```json
{
  "id": "conventional-commits",
  "type": "git-pattern",
  "pattern": "commit messages follow conventional format",
  "observations": [
    {"commit": "feat: add feature", "timestamp": "..."},
    {"commit": "fix: resolve bug", "timestamp": "..."}
  ],
  "count": 2,
  "confidence": 0.40,
  "contexts": ["git", "commit"],
  "status": "observing"
}
```

## Step 7: Report Learning Summary

```
📚 Learning Summary

Auto-Applied Rules: 2
✓ Use justfile recipes (build, tools)
✓ Prefer Edit tool (tools, edit)

Suggested Rules: 1
? Conventional commit format (git) [Asked for confirmation]

Still Observing: 3
◦ Prefer const over let (1 observation, need 2 more)
◦ Test after code changes (2 observations, need 1 more)
◦ Group imports by type (1 observation, need 2 more)

Total Patterns Tracked: 6
CLAUDE.md Size: 850 tokens (target: <800)

Next Steps:
- Review auto-applied rules in CLAUDE.md
- Run /style:validate to test new rules
- Keep working - I'll keep learning!

The more you work, the better I understand your preferences.
```

## Step 8: Update Config Stats

Update `.style/config.json` with learning statistics:

```json
{
  "learning": {
    "lastRun": "2026-02-12T15:30:00Z",
    "totalPatterns": 6,
    "appliedRules": 2,
    "candidateRules": 1,
    "observingPatterns": 3,
    "successRate": 0.85
  }
}
```

## Configuration

Control learning behavior in `.style/config.json`:

```json
{
  "learning": {
    "enabled": true,
    "confidenceThreshold": 0.75,
    "minObservations": 3,
    "autoApply": false,          // true = auto-add rules
    "maxPatternsTracked": 50,
    "patternExpiry": "30d",      // Forget old patterns
    "ignorePatterns": []         // Patterns to never track
  }
}
```

## Automatic Learning via Hooks

Set up hooks in justfile for automatic learning:

```just
# Called after session or periodically
style-auto-learn:
    @echo "Learning from recent patterns..."
    # Runs /style:learn in background
    # Only auto-applies if configured
```

Configure in Claude Code settings:
```json
{
  "hooks": {
    "on-session-end": "just style-auto-learn",
    "on-commit": "just style-track-commit"
  }
}
```

## Notes

**Privacy:**
- Patterns are stored locally in `.style/patterns.json`
- This file is gitignored by default
- Only the resulting CLAUDE.md rules are shared with team
- You control what gets applied

**Confidence Levels:**
- 0.9+ : Very high confidence (5+ consistent observations)
- 0.75-0.9: High confidence (3-4 observations)
- 0.5-0.75: Medium confidence (2 observations, ask user)
- <0.5: Low confidence (1 observation, keep observing)

**Pattern Types:**
- **tool-correction**: You correct Claude's tool choice
- **code-pattern**: Consistent code style emerges
- **workflow**: Repeated action sequences
- **git-pattern**: Commit message formats
- **error-avoidance**: You fix same issue repeatedly

**Learning Best Practices:**
- Run /style:learn weekly to review patterns
- Set autoApply: false initially, review suggestions
- Enable autoApply: true once you trust the system
- Periodically audit CLAUDE.md for outdated rules
