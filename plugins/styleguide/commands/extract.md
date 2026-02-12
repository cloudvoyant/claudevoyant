Extract patterns from your codebase and suggest style guide rules.

## Overview

Analyzes your project's code, configs, and history to discover existing patterns and conventions, then suggests rules for CLAUDE.md.

## Step 1: Scan Project Structure

Identify what's in the project:

```bash
# Languages
HAS_TS=$(find . -name "*.ts" -not -path "*/node_modules/*" | head -1)
HAS_JS=$(find . -name "*.js" -not -path "*/node_modules/*" | head -1)
HAS_PY=$(find . -name "*.py" | head -1)

# Build tools
[ -f justfile ] && BUILD_TOOL="justfile"
[ -f Makefile ] && BUILD_TOOL="Makefile"
[ -f package.json ] && BUILD_TOOL="npm"

# Testing
HAS_JEST=$(grep -q "jest" package.json 2>/dev/null && echo "true")
HAS_VITEST=$(grep -q "vitest" package.json 2>/dev/null && echo "true")

# Frameworks
HAS_REACT=$(grep -q "react" package.json 2>/dev/null && echo "true")
HAS_VUE=$(grep -q "vue" package.json 2>/dev/null && echo "true")

# Linting/Formatting
[ -f .eslintrc.* ] && HAS_ESLINT="true"
[ -f .prettierrc.* ] && HAS_PRETTIER="true"
[ -f tsconfig.json ] && HAS_TSCONFIG="true"
```

Report detected technologies:
```
🔍 Scanning project...

Found:
✓ TypeScript (142 files)
✓ justfile (build system)
✓ Prettier (formatting)
✓ Jest (testing)
✓ React (framework)

Analyzing patterns...
```

## Step 2: Extract Build Patterns

### From justfile/Makefile
```bash
# Extract common recipes/targets
just --list 2>/dev/null | grep -v "^Available" | awk '{print $1}' > /tmp/recipes.txt

# Common patterns:
# - test, build, dev, deploy
# - Presence of recipes suggests "use justfile over npm"
```

**Suggested rule:**
```markdown
<!-- @context: build, tools -->
## Build System
Always use justfile recipes instead of direct npm/bash commands.
Common recipes: test, build, dev, deploy
Check: `just --list`
```

### From package.json Scripts
```bash
# If package.json has scripts but justfile also exists
# Suggest: "Prefer justfile recipes over npm scripts"
```

## Step 3: Extract Code Patterns

### TypeScript Patterns
```bash
# Check tsconfig.json for strict mode
STRICT_MODE=$(grep -q '"strict": true' tsconfig.json && echo "true")

# Sample files for patterns
SAMPLE_FILES=$(find . -name "*.ts" -not -path "*/node_modules/*" | head -20)

for file in $SAMPLE_FILES; do
  # Check const vs let usage
  CONST_COUNT=$(grep -c "\\bconst\\b" "$file" || echo 0)
  LET_COUNT=$(grep -c "\\blet\\b" "$file" || echo 0)

  # Check for explicit types
  EXPLICIT_TYPES=$(grep -c ": \\w\\+<.*>" "$file" || echo 0)

  # Check import style
  NAMED_IMPORTS=$(grep -c "import { .* }" "$file" || echo 0)
  DEFAULT_IMPORTS=$(grep -c "import .* from" "$file" || echo 0)
done

# Calculate ratios
CONST_RATIO=$((CONST_COUNT * 100 / (CONST_COUNT + LET_COUNT + 1)))
```

**If CONST_RATIO > 75%:**
```markdown
Pattern detected: Prefer const over let (used 85% of the time)
Confidence: High

Suggested rule:
<!-- @context: code, typescript -->
## TypeScript Style
- Prefer `const` over `let` (use `let` only when reassignment needed)
```

### Import Patterns
```bash
# Analyze import organization
grep -h "^import" $SAMPLE_FILES | head -50 > /tmp/imports.txt

# Check if imports are grouped
# Check if external imports come before internal
```

**If consistent pattern:**
```markdown
Pattern detected: Imports grouped (external → internal → relative)
Confidence: Medium

Suggested rule:
## TypeScript Style
- Group imports: external libraries → internal modules → relative paths
- Use named imports over default when possible
```

### Function Length Pattern
```bash
# Check average function length
for file in $SAMPLE_FILES; do
  awk '/^function|^const.*=.*=>|^export function/ {start=NR} /^}/ {if(start) print NR-start}' "$file"
done | awk '{sum+=$1; count++} END {print sum/count}'
```

**If avg < 50 lines:**
```markdown
Pattern detected: Functions kept under 50 lines (avg: 32 lines)
Confidence: Medium

Suggested rule:
## Code Style
- Keep functions focused and under 50 lines
- Extract helper functions when logic becomes complex
```

## Step 4: Extract Git Patterns

### Commit Message Analysis
```bash
# Analyze last 100 commits
git log -100 --pretty=format:"%s" > /tmp/commits.txt

# Check conventional commits usage
CONVENTIONAL=$(grep -cE "^(feat|fix|chore|docs|refactor|test|style|perf)(\(.+\))?:" /tmp/commits.txt)
TOTAL=$(wc -l < /tmp/commits.txt)
CONVENTIONAL_RATIO=$((CONVENTIONAL * 100 / TOTAL))
```

**If CONVENTIONAL_RATIO > 80%:**
```markdown
Pattern detected: Conventional commits used in 89% of commits
Confidence: High

Suggested rule:
<!-- @context: git, commit -->
## Git Commit Messages
Use Conventional Commits format:
- feat: New feature
- fix: Bug fix
- chore: Maintenance
Subject line max 72 characters
```

### Branch Naming
```bash
# Analyze branch names
git branch -r | sed 's/.*\///' | grep -v HEAD > /tmp/branches.txt

# Common patterns: feature/, fix/, hotfix/
```

### Co-Authorship Pattern
```bash
# Check if Co-Authored-By is commonly used
CO_AUTHOR_COUNT=$(git log -20 --grep="Co-Authored-By" --format="%H" | wc -l)
```

## Step 5: Extract Tool Usage Patterns

Check project configuration for tool preferences:

### ESLint Rules
```bash
if [ -f .eslintrc.json ]; then
  # Extract key rules
  RULES=$(jq -r '.rules | keys[]' .eslintrc.json 2>/dev/null)

  # Common: no-var, prefer-const, quotes
fi
```

### Prettier Config
```bash
if [ -f .prettierrc ]; then
  SEMI=$(jq -r '.semi' .prettierrc 2>/dev/null)
  SINGLE_QUOTE=$(jq -r '.singleQuote' .prettierrc 2>/dev/null)

  # Suggest: Follow Prettier settings for consistency
fi
```

## Step 6: Extract Documentation Patterns

```bash
# Check if README files are common
README_COUNT=$(find . -name "README.md" | wc -l)

# Check if JSDoc/TSDoc is used
JSDOC_COUNT=$(grep -r "\/\*\*" --include="*.ts" | wc -l)

# Check comment style
COMMENT_PATTERN=$(grep -oh "// .*" *.ts | head -20)
```

**If high JSDoc usage:**
```markdown
Pattern detected: JSDoc used for public APIs (78 occurrences)
Confidence: High

Suggested rule:
<!-- @context: docs, code -->
## Documentation
- Use JSDoc/TSDoc for all public APIs
- Document parameters, return types, and examples
```

## Step 7: Generate Extraction Report

```
🔍 Style Guide Extraction Report

Analyzed:
- 142 TypeScript files
- 89 commits
- 1 build system (justfile)
- 3 config files

Patterns Discovered: 12
High Confidence: 5
Medium Confidence: 4
Low Confidence: 3

=== High Confidence Patterns ===

1. ✓ Build System (confidence: 0.95)
   Use justfile recipes instead of direct commands
   Evidence: justfile has 8 recipes, used consistently

   Suggested Rule:
   "Always check `just --list` before running bash commands"
   Contexts: build, tools

2. ✓ TypeScript Style (confidence: 0.90)
   Prefer const over let
   Evidence: const used 85% of the time (234/275 declarations)

   Suggested Rule:
   "Prefer const over let (use let only when reassignment needed)"
   Contexts: code, typescript

3. ✓ Git Commits (confidence: 0.89)
   Conventional commit format
   Evidence: 89% of commits follow format (89/100)

   Suggested Rule:
   "Use conventional commit format: type(scope): subject"
   Contexts: git, commit

4. ✓ Testing (confidence: 0.85)
   Co-locate tests with source
   Evidence: 95% of .ts files have corresponding .test.ts

   Suggested Rule:
   "Co-locate tests: feature.ts → feature.test.ts"
   Contexts: test, code

5. ✓ Imports (confidence: 0.80)
   Named imports preferred
   Evidence: Named imports used 78% over default (156/200)

   Suggested Rule:
   "Prefer named imports over default imports"
   Contexts: code, typescript

=== Medium Confidence Patterns ===

6. ~ Function Length (confidence: 0.65)
   Functions kept under 50 lines
   Evidence: Average 32 lines, 87% under 50

7. ~ Import Grouping (confidence: 0.60)
   External → Internal → Relative
   Evidence: Observed in 65% of files

8. ~ JSDoc Usage (confidence: 0.55)
   Document public APIs
   Evidence: 78 JSDoc blocks found

9. ~ Error Handling (confidence: 0.50)
   Try-catch for async operations
   Evidence: Observed in 55% of async functions

=== Low Confidence Patterns ===

10-12. [Details...]

```

## Step 8: Offer to Apply Rules

Use **AskUserQuestion**:
```
question: "Apply high-confidence patterns to CLAUDE.md?"
header: "Extract to Style Guide"
multiSelect: true
options:
  - label: "All 5 high-confidence rules"
    description: "Add all patterns with >80% confidence"
  - label: "Build system only"
    description: "Just the justfile preference"
  - label: "Code style rules"
    description: "TypeScript patterns (const, imports)"
  - label: "Git rules"
    description: "Commit message format"
  - label: "Review individually"
    description: "I'll ask about each rule"
```

For "Review individually", ask about each high-confidence pattern.

## Step 9: Apply Selected Rules

For each selected pattern:
1. Generate rule text from template
2. Add to appropriate CLAUDE.md section
3. Tag with detected contexts
4. Update `.styleguide/patterns.json` with extraction metadata

## Step 10: Report Results

```
✓ Extraction complete!

Applied to CLAUDE.md:
- 5 high-confidence rules added
- 3 sections created (Build System, TypeScript Style, Git Commits)
- Total contexts: 8 (build, tools, code, typescript, git, commit, test, docs)

Token Impact:
- Before: 0 tokens (no CLAUDE.md)
- After: 650 tokens
- Target: <800 tokens ✓

Next Steps:
1. Review CLAUDE.md for accuracy
2. Customize rules for your team
3. Commit to git to share with team
4. Run /styleguide:learn to continue improving

The style guide now captures your project's established patterns!
```

## Configuration

Control extraction in `.styleguide/config.json`:

```json
{
  "extraction": {
    "minConfidence": 0.75,      // Only suggest rules above this
    "minOccurrences": 10,        // Pattern must appear this many times
    "sampleSize": 50,            // Files to sample for analysis
    "analyzeHistory": 100,       // Commits to analyze
    "skipPatterns": ["*test*"],  // Files to skip
    "customPatterns": []         // Additional patterns to detect
  }
}
```

## Notes

**Confidence Calculation:**
```
confidence = (occurrences / total) * consistency * clarity

where:
- occurrences/total = How often pattern appears
- consistency = How uniform the pattern is
- clarity = How unambiguous the detection is
```

**Best Time to Run:**
- New projects: After ~50 commits or 20+ files
- Existing projects: Anytime to codify existing conventions
- Post-refactor: After major code restructuring
- Team onboarding: To document implicit conventions

**Limitations:**
- Cannot detect context-dependent conventions
- May miss nuanced patterns
- Requires sufficient code samples (>20 files)
- Git history-based patterns need >50 commits
