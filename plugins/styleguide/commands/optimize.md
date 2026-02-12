Optimize CLAUDE.md to reduce token usage while maintaining effectiveness.

## Overview

Analyzes CLAUDE.md and applies optimization strategies to keep token count low while preserving all important rules.

## Step 1: Analyze Current State

Read CLAUDE.md and calculate metrics:

```bash
# Token estimation (rough: 4 chars ≈ 1 token)
TOTAL_CHARS=$(wc -c < CLAUDE.md)
ESTIMATED_TOKENS=$((TOTAL_CHARS / 4))

# Count sections
SECTION_COUNT=$(grep -c "^## " CLAUDE.md)

# Count rules
RULE_COUNT=$(grep -c "^- \|^\* \|^[0-9]" CLAUDE.md)

# Detect long sections
grep -n "^## " CLAUDE.md | while read line; do
  SECTION_START=$(echo "$line" | cut -d: -f1)
  NEXT_SECTION=$(grep -n "^## " CLAUDE.md | grep -A1 "^$SECTION_START:" | tail -1 | cut -d: -f1)
  SECTION_SIZE=$((NEXT_SECTION - SECTION_START))

  if [ $SECTION_SIZE -gt 50 ]; then
    echo "Large section at line $SECTION_START ($SECTION_SIZE lines)"
  fi
done
```

Report current state:
```
📊 CLAUDE.md Analysis

Current State:
- Token Count: 1,245 tokens (target: <800)
- Sections: 8
- Rules: 34
- Average per section: 156 tokens

Issues Detected:
⚠️  Exceeds target by 445 tokens (56% over)
⚠️  3 sections exceed 200 tokens
⚠️  Redundant rules detected (2 duplicates)
⚠️  Verbose explanations in Build System section

Optimization Potential: ~500 tokens (40% reduction)
```

## Step 2: Identify Optimization Opportunities

### Check for Redundancy
```bash
# Find duplicate or similar rules
# Look for repeated phrases across sections
```

**Example redundancy:**
```
Section 1: "Always use justfile recipes"
Section 3: "Check justfile before running commands"
→ Can consolidate into one rule
```

### Check for Verbosity
```bash
# Find long explanations that could be shortened
# Look for examples that could be links to docs
```

**Example verbosity:**
```
Before (150 tokens):
"This project uses justfile which is a command runner similar to make
but with a better syntax. The reason we use justfile is because it
provides cross-platform compatibility and better error messages. To use
justfile, first check the available recipes with `just --list`, then
run the appropriate recipe..."

After (30 tokens):
"Use justfile recipes. Check: `just --list`"
Details: [docs/style-guide/build.md]
```

### Check for Low-Value Rules
```bash
# Rules with generic advice that doesn't add value
# Rules that duplicate tool documentation
```

**Example low-value:**
```
"Write clean code" → Too vague, remove
"Use meaningful variable names" → Generic, remove
```

### Check Context Tag Coverage
```bash
# Rules without context tags can't be contextually loaded
# Rules with too many contexts are loaded too often
```

## Step 3: Propose Optimization Strategy

Generate optimization plan:

```
🔧 Optimization Strategy

Priority 1: Move Details to Docs (Save ~300 tokens)
- Build System explanations → docs/style-guide/build.md
- TypeScript style examples → docs/style-guide/typescript.md
- Testing guidelines → docs/style-guide/testing.md

Priority 2: Consolidate Redundant Rules (Save ~100 tokens)
- Merge 2 justfile rules into 1
- Combine 3 TypeScript type rules

Priority 3: Shorten Verbose Rules (Save ~80 tokens)
- 5 rules can be condensed
- Remove redundant explanations

Priority 4: Remove Low-Value Rules (Save ~40 tokens)
- 2 generic rules add no value
- 1 rule duplicates ESLint config

Total Potential Savings: ~520 tokens (42% reduction)
Target Achievement: 725 tokens (9% under target ✓)
```

## Step 4: Confirm Optimization

Use **AskUserQuestion**:
```
question: "Optimize CLAUDE.md? This will reduce from 1,245 to ~725 tokens."
header: "Optimize Style Guide"
multiSelect: true
options:
  - label: "Move details to docs/"
    description: "Extract detailed explanations (save ~300 tokens)"
  - label: "Consolidate redundant rules"
    description: "Merge similar rules (save ~100 tokens)"
  - label: "Shorten verbose rules"
    description: "Make rules more concise (save ~80 tokens)"
  - label: "Remove low-value rules"
    description: "Delete generic rules (save ~40 tokens)"
  - label: "Auto-optimize (all)"
    description: "Apply all optimizations automatically"
```

## Step 5: Execute Optimizations

### Move Details to Docs
```bash
# Create docs/style-guide/ if it doesn't exist
mkdir -p docs/style-guide

# Extract Build System details
sed -n '/## Build System/,/^## /p' CLAUDE.md > docs/style-guide/build.md

# Update CLAUDE.md with link
# Replace long explanation with:
## Build System
Use justfile recipes. [Details](docs/style-guide/build.md)
```

### Consolidate Rules
```markdown
Before:
- Always use justfile recipes
- Check `just --list` before bash commands
- Prefer justfile over npm scripts

After:
- Use justfile recipes (check `just --list`). [Why](docs/style-guide/build.md#justfile)
```

### Shorten Rules
```markdown
Before:
"When modifying existing files, always use the Edit tool instead of the
Write tool because Edit is designed for modifications and will fail if
the file doesn't exist, preventing accidental overwrites."

After:
- Prefer Edit over Write for modifications
```

### Remove Low-Value
```markdown
Remove:
- "Write clean, maintainable code" (too generic)
- "Use TypeScript strict mode" (duplicate of tsconfig.json)
```

## Step 6: Verify Context Tags

Ensure all sections have appropriate context tags:

```bash
# Find sections without tags
grep -B1 "^## " CLAUDE.md | grep -v "@context" | grep "^## "

# Add tags where missing
```

**Before optimization:**
```markdown
## Build System
Use justfile...
```

**After optimization:**
```markdown
<!-- @context: build, tools -->
## Build System
Use justfile recipes. [Details](docs/style-guide/build.md)
```

## Step 7: Reorder by Priority

Organize sections by loading frequency/importance:

```markdown
1. Critical rules (loaded most often)
2. High-priority rules (common contexts)
3. Medium-priority rules
4. Low-priority rules (rare contexts)
```

**Reordered CLAUDE.md:**
```markdown
# Project Style Guide

<!-- @context: build, tools -->
## Build System
[Critical - loaded often]

<!-- @context: code, typescript -->
## Code Style
[High priority - loaded for all code]

<!-- @context: git, commit -->
## Git Commits
[High priority - loaded for commits]

<!-- @context: docs -->
## Documentation
[Lower priority - loaded for docs only]
```

## Step 8: Create Documentation Structure

Create detailed docs that CLAUDE.md links to:

```bash
docs/style-guide/
├── README.md          # Overview of all rules
├── build.md           # Build system details
├── typescript.md      # TypeScript style guide
├── git.md             # Git workflow details
├── testing.md         # Testing practices
└── tools.md           # Tool usage guide
```

Each doc file contains:
- Full explanations
- Examples and counter-examples
- Rationale for rules
- Links to external resources

## Step 9: Measure Results

```bash
# Calculate new metrics
NEW_TOKENS=$(($(wc -c < CLAUDE.md) / 4))
SAVINGS=$((ESTIMATED_TOKENS - NEW_TOKENS))
SAVINGS_PERCENT=$((SAVINGS * 100 / ESTIMATED_TOKENS))
```

Report optimization results:
```
✓ Optimization Complete!

Before:
- Tokens: 1,245
- Sections: 8
- Rules: 34
- Issues: 4

After:
- Tokens: 725 (↓ 520 tokens, 42% reduction)
- Sections: 8 (reorganized by priority)
- Rules: 28 (↓ 6 redundant/low-value)
- Issues: 0

Performance:
✓ Under target (725 < 800)
✓ Context tags complete (8/8 sections)
✓ Documentation links added
✓ Priority ordering applied

Token Savings Breakdown:
- Moved to docs: 300 tokens
- Consolidated rules: 100 tokens
- Shortened text: 80 tokens
- Removed low-value: 40 tokens

Created Documentation:
- docs/style-guide/build.md (detailed build rules)
- docs/style-guide/typescript.md (code style examples)
- docs/style-guide/git.md (git workflow)

Next Steps:
1. Review optimized CLAUDE.md
2. Commit both CLAUDE.md and docs/
3. Team will get concise rules + detailed docs

Your style guide is now lean and efficient!
```

## Step 10: Update Config

Update `.styleguide/config.json` with optimization metadata:

```json
{
  "optimization": {
    "lastRun": "2026-02-12T16:00:00Z",
    "beforeTokens": 1245,
    "afterTokens": 725,
    "savings": 520,
    "savingsPercent": 42,
    "method": "auto",
    "docFiles": [
      "docs/style-guide/build.md",
      "docs/style-guide/typescript.md",
      "docs/style-guide/git.md"
    ]
  }
}
```

## Configuration

Control optimization in `.styleguide/config.json`:

```json
{
  "optimization": {
    "enabled": true,
    "autoRun": false,              // Auto-optimize when over target
    "targetTokens": 800,
    "maxTokens": 1200,             // Auto-optimize at this threshold
    "strategies": {
      "moveToDoc": true,
      "consolidate": true,
      "shorten": true,
      "removeLowValue": true
    },
    "preserve": [
      "critical-rules",            // Never optimize these
      "build-system"
    ]
  }
}
```

## Notes

**Safe Optimization:**
- Never removes rules, only moves or shortens them
- Detailed information preserved in docs/
- All optimizations are reversible
- Context tags ensure right rules load at right time

**When to Optimize:**
- CLAUDE.md exceeds 1,000 tokens
- Adding many new rules
- After extraction or bulk learning
- Quarterly maintenance

**Best Practices:**
- Keep CLAUDE.md as quick reference
- Move explanations/examples to docs/
- Use links liberally
- Maintain context tags for smart loading
- Test after optimization to ensure rules still work
