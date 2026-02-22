List and manage rule contexts for contextual loading.

## Overview

Contexts enable smart, contextual loading of style guide rules. This command helps you view, add, and configure contexts for optimal token efficiency.

## Step 1: List All Contexts

Read `.style/config.json` and CLAUDE.md to compile context information:

```bash
# Extract contexts from config
CONFIGURED_CONTEXTS=$(jq -r '.contexts | keys[]' .style/config.json)

# Extract contexts from CLAUDE.md
USED_CONTEXTS=$(grep -o "@context: [^-]*" CLAUDE.md | cut -d: -f2 | tr ',' '\n' | sort -u)

# Find active contexts (used in CLAUDE.md)
# Find configured but unused contexts
# Find used but not configured contexts
```

Display contexts:
```
📋 Style Guide Contexts

Active Contexts (8):
Used in CLAUDE.md and configured for auto-detection

1. build
   Priority: high
   Auto-detect: justfile, Makefile, package.json
   Rules: 3
   Sections: Build System
   Avg tokens: 150
   Load frequency: 35%

2. code
   Priority: high
   Auto-detect: *.ts, *.js, *.py
   Rules: 8
   Sections: Code Style, TypeScript Style
   Avg tokens: 320
   Load frequency: 45%

3. typescript
   Priority: medium
   Auto-detect: *.ts, *.tsx
   Rules: 5
   Sections: TypeScript Style
   Avg tokens: 200
   Load frequency: 30%

4. git
   Priority: critical
   Auto-detect: git commands
   Rules: 4
   Sections: Git Commit Messages
   Avg tokens: 120
   Load frequency: 25%

5. commit
   Priority: critical
   Auto-detect: commit operations
   Rules: 4
   Sections: Git Commit Messages
   Avg tokens: 120
   Load frequency: 25%

6. test
   Priority: medium
   Auto-detect: *.test.*, *.spec.*
   Rules: 3
   Sections: Testing
   Avg tokens: 150
   Load frequency: 20%

7. tools
   Priority: high
   Auto-detect: Tool usage (Bash, Edit, etc.)
   Rules: 4
   Sections: File Operations, Build System
   Avg tokens: 130
   Load frequency: 40%

8. docs
   Priority: low
   Auto-detect: *.md, docs/
   Rules: 2
   Sections: Documentation
   Avg tokens: 80
   Load frequency: 15%

Configured but Unused (2):
- javascript (configured for *.js but no rules tagged)
- deploy (configured but no rules tagged)

Used but Not Configured (0):
None - all contexts properly configured ✓

Summary:
- Total contexts: 8 active, 2 unused
- Total rules: 33
- Total tokens: 1,270 (full load)
- Avg contextual load: ~250 tokens (80% savings)
- Most common context: code (45% of loads)
```

## Step 2: Show Context Details

If user provides context name as argument: `/style:contexts build`

Display detailed information for that context:

```
📋 Context: build

Configuration:
- Priority: high
- Auto-detect: justfile, Makefile, package.json
- Load strategy: hook-based
- Token budget: 200 (current: 150 ✓)

Rules (3):
1. "Use justfile recipes"
   Section: Build System
   Tokens: ~80
   Co-contexts: tools

2. "Check `just --list` before bash"
   Section: Build System
   Tokens: ~40
   Co-contexts: tools

3. "Prefer justfile over npm scripts"
   Section: Build System
   Tokens: ~30
   Co-contexts: none

Loading Behavior:
- Triggered by: Bash tool usage, editing justfile
- Loads with: tools context (80% of time)
- Frequency: 35% of sessions
- Avg load time: <1ms

Token Efficiency:
- Full CLAUDE.md: 1,270 tokens
- This context only: 150 tokens
- Savings: 88%

Usage Examples:
✓ Running `just test` → build context loaded
✓ Using Bash tool → build + tools contexts loaded
✗ Editing TypeScript → build context NOT loaded (relevant contexts: code, typescript)

Related Contexts:
- tools (80% co-occurrence)
- code (10% co-occurrence)
```

## Step 3: Add New Context

If user wants to add context: `/style:contexts add my-context`

Use **AskUserQuestion**:
```
question: "Configure new context 'my-context'"
header: "Context Configuration"
multiSelect: false
options:
  - label: "Manual configuration"
    description: "I'll specify all settings"
  - label: "Quick setup"
    description: "Use defaults, customize later"
```

### For Manual Configuration:

Ask for each setting:

**Priority:**
```
question: "What priority for this context?"
header: "Priority Level"
options:
  - label: "critical"
    description: "Always load (e.g., security rules)"
  - label: "high"
    description: "Load for common tasks"
  - label: "medium"
    description: "Load for specific tasks"
  - label: "low"
    description: "Load rarely"
```

**Auto-detection:**
```
What should trigger this context?
Examples:
- File patterns: *.tsx, *.spec.ts
- Tools: Bash, Edit
- Commands: git, npm
- Directories: src/, tests/
- Custom: [your pattern]

Enter patterns (comma-separated): _____
```

**Token budget:**
```
Maximum tokens for this context: _____ (default: 200)
```

### Add to Config

Update `.style/config.json`:

```json
{
  "contexts": {
    "my-context": {
      "priority": "medium",
      "autoDetect": ["*.custom", "custom/"],
      "tokenBudget": 200,
      "enabled": true
    }
  }
}
```

Report:
```
✓ Context 'my-context' added

Configuration:
- Priority: medium
- Auto-detect: *.custom, custom/
- Token budget: 200
- Status: Active

Next steps:
1. Tag rules in CLAUDE.md with <!-- @context: my-context -->
2. Test with /style:validate
3. Monitor loading with /style:contexts my-context
```

## Step 4: Remove Context

If user wants to remove: `/style:contexts remove unused-context`

Check if context is in use:
```bash
USED=$(grep -c "@context:.*unused-context" CLAUDE.md)
```

If used, warn:
```
⚠️  Context 'unused-context' is used by 3 rules in CLAUDE.md

Rules using this context:
- Build System: "Rule 1"
- Code Style: "Rule 2"
- Testing: "Rule 3"

Removing this context will:
- Keep the rules in CLAUDE.md
- Remove auto-detection for this context
- Rules will only load as part of full CLAUDE.md

Continue? [Yes/No]
```

If not used or confirmed, remove from config:
```json
{
  "contexts": {
    // "unused-context": { removed }
  }
}
```

## Step 5: Analyze Context Efficiency

Show token savings analysis:

```
📊 Context Efficiency Analysis

Scenario Analysis:
Without contextual loading (traditional):
- Every interaction loads: 1,270 tokens
- 100 interactions: 127,000 tokens used

With contextual loading (current setup):
Common scenarios:
- Code editing (45%): 320 tokens × 45 = 14,400 tokens
- Build tasks (35%): 280 tokens × 35 = 9,800 tokens
- Git commits (25%): 240 tokens × 25 = 6,000 tokens
- Documentation (15%): 200 tokens × 15 = 3,000 tokens

Total for 100 interactions: 33,200 tokens
Savings: 93,800 tokens (74% reduction)

Context Overlap Analysis:
Most common combinations:
1. code + typescript (30% of loads) = 520 tokens
2. build + tools (28% of loads) = 280 tokens
3. git + commit (25% of loads) = 240 tokens
4. code + test (20% of loads) = 470 tokens

Optimization Opportunities:
1. ✓ Well-optimized: git + commit contexts (high overlap, appropriate)
2. ⚠️  Consider merging: build and tools contexts (98% overlap)
3. ✓ Good separation: code vs docs (5% overlap)

Recommendations:
- Current setup is efficient (74% savings)
- Consider merging build + tools → buildtools
- All contexts are actively used ✓
```

## Step 6: Export Context Map

Generate documentation of context system:

```markdown
# Context Map for {Project Name}

Generated: 2026-02-12T16:30:00Z

## Overview
This project uses 8 contexts for smart rule loading, achieving 74% token savings.

## Context Definitions

### build
**Purpose:** Build system and tooling rules
**Priority:** high
**Triggers:** justfile, Makefile, package.json, Bash tool
**Rules:** 3
**Tokens:** ~150

### code
**Purpose:** General code style and patterns
**Priority:** high
**Triggers:** *.ts, *.js, *.py, code editing
**Rules:** 8
**Tokens:** ~320

[... etc for all contexts ...]

## Usage Guide

### For Developers
When you work on different tasks, only relevant rules load:

**Editing code:**
Loads: code, typescript contexts (~520 tokens)
Rules: Type safety, const over let, import style, etc.

**Running builds:**
Loads: build, tools contexts (~280 tokens)
Rules: Use justfile, check recipes, tool preferences

**Making commits:**
Loads: git, commit contexts (~240 tokens)
Rules: Conventional format, 72 char limit, Co-Authored-By

### For Admins
**Add new context:**
```
/style:contexts add context-name
```

**Tag rules with context:**
```markdown
<!-- @context: your-context -->
## Section Name
```

**Monitor efficiency:**
```
/style:contexts
```

## Token Efficiency
- Full guide: 1,270 tokens
- Typical load: 250-500 tokens (60-80% savings)
- Auto-detected based on file types and tool usage
```

Save to `docs/style-guide/contexts.md`.

## Configuration

Manage global context settings in `.style/config.json`:

```json
{
  "contextual": true,              // Enable contextual loading
  "contexts": {
    "build": {
      "priority": "high",
      "autoDetect": ["justfile"],
      "tokenBudget": 200,
      "enabled": true
    }
  },
  "contextDetection": {
    "filePatterns": true,           // Detect from file types
    "toolUsage": true,              // Detect from tools used
    "commands": true,               // Detect from commands
    "directories": true,            // Detect from working dir
    "learned": false                // Learn patterns (future)
  }
}
```

## Notes

**Context Best Practices:**
- Use specific contexts (typescript vs code)
- Avoid too many contexts (diminishing returns)
- Group related rules under same context
- Test context detection with real workflows
- Review usage stats quarterly

**Priority Levels:**
- **critical**: Security, compliance (always load)
- **high**: Common tasks (load frequently)
- **medium**: Specific workflows (load as needed)
- **low**: Rare situations (load seldom)

**Token Budgets:**
- Aim for <200 tokens per context
- If exceeding budget, split context or optimize rules
- Monitor total contextual load (should be <500 tokens typically)
