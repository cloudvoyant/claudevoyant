Initialize a context-tagged CLAUDE.md style guide for your project.

## Overview

Creates a CLAUDE.md file at your repository root with intelligent context tagging for contextual rule loading. The file is committed to git and shared with your entire team.

## Step 1: Check Existing CLAUDE.md

Check if `CLAUDE.md` already exists in repo root:

```bash
[ -f CLAUDE.md ] && echo "exists" || echo "not found"
```

If exists, use **AskUserQuestion** tool:
```
question: "CLAUDE.md already exists. What would you like to do?"
header: "Style Guide Exists"
multiSelect: false
options:
  - label: "Merge with existing"
    description: "Add context tags and style features to existing file"
  - label: "Backup and replace"
    description: "Save current as CLAUDE.md.backup and create new tagged version"
  - label: "Cancel"
    description: "Keep existing file, don't modify"
```

## Step 2: Detect Project Context

Analyze the project to pre-populate relevant rules:

```bash
# Detect languages
HAS_TYPESCRIPT=$([ -f tsconfig.json ] && echo "true" || echo "false")
HAS_JAVASCRIPT=$([ -f package.json ] && echo "true" || echo "false")
HAS_PYTHON=$([ -f requirements.txt ] || [ -f pyproject.toml ] && echo "true" || echo "false")

# Detect build tools
HAS_JUSTFILE=$([ -f justfile ] && echo "true" || echo "false")
HAS_MAKEFILE=$([ -f Makefile ] && echo "true" || echo "false")

# Detect frameworks
HAS_REACT=$(grep -q "react" package.json 2>/dev/null && echo "true" || echo "false")
HAS_CLAUDE_CODE=$([ -d plugins ] && echo "true" || echo "false")

# Detect testing
HAS_JEST=$(grep -q "jest" package.json 2>/dev/null && echo "true" || echo "false")
HAS_VITEST=$(grep -q "vitest" package.json 2>/dev/null && echo "true" || echo "false")
```

Report detected technologies:
```
Detected project technologies:
✓ TypeScript
✓ justfile (build system)
✓ Claude Code plugins
✓ Jest testing

I'll create a style guide with relevant sections.
```

## Step 3: Create Initial CLAUDE.md

Create `CLAUDE.md` with context-tagged sections based on detected technologies:

```markdown
# {Project Name} Style Guide

<!-- This file is automatically loaded by Claude Code -->
<!-- Context tags enable smart, contextual rule loading -->
<!-- Format: <!-- @context: tag1, tag2 --> before each section -->

## How to Use This Guide

This style guide uses context tags for efficient loading:
- Rules are only loaded when relevant to your current task
- Add rules with: /style:add "rule description" --context build,code
- Learn automatically: /style:learn
- Validate work: /style:validate

---

{if HAS_JUSTFILE}
<!-- @context: build, tools, shell -->
## Build System

**CRITICAL:** This project uses justfile for all build commands.

**Before running any npm/bash/make command:**
1. Check if a recipe exists: `just --list`
2. Use the justfile recipe if available
3. Only use direct commands if no recipe exists

**Common recipes:**
- `just test` - Run test suite
- `just build` - Build project
- `just dev` - Start development server

**Why:** Justfile ensures consistent commands across team and CI/CD.
{endif}

{if HAS_TYPESCRIPT}
<!-- @context: code, typescript, javascript -->
## TypeScript Style

**Type Safety:**
- Use strict mode (tsconfig.json)
- Prefer `const` over `let`, never use `var`
- Explicit types for function parameters and returns
- Use `unknown` over `any` when type is truly unknown

**Imports:**
- Use named imports over default imports when possible
- Group imports: external → internal → relative
- Remove unused imports before committing

**Code Organization:**
- One exported class/function per file (exceptions for utilities)
- Prefer pure functions over classes when possible
- Keep functions under 50 lines (extract helpers if needed)
{endif}

<!-- @context: git, commit, vcs -->
## Git Commit Messages

**Format:** Use Conventional Commits
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance (deps, config)
- `docs:` - Documentation only
- `refactor:` - Code restructuring
- `test:` - Test changes

**Rules:**
- Subject line max 72 characters
- Use imperative mood ("add feature" not "added feature")
- No period at end of subject
- Reference issues in footer: `Closes #123`

**AI Contributions:**
Always add: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`

{if HAS_CLAUDE_CODE}
<!-- @context: claude-code, plugins -->
## Claude Code Plugins

**Plugin Development:**
- Store plugins in `plugins/{plugin-name}/`
- Use `plugin.json` for metadata
- Command files in `commands/*.md` with clear steps
- Use AskUserQuestion tool for all user prompts (not [Y/n] or numbered lists)

**Testing:**
- Test all commands before committing
- Document examples in plugin README
- Include error handling in command flows
{endif}

<!-- @context: code, edit, tools -->
## File Operations

**Tool Preferences:**
- **Read** files before editing them (required)
- **Edit** tool for modifications (not Write)
- **Write** tool only for new files
- **Grep** for searching content (not bash grep)
- **Glob** for finding files (not bash find)

**Why:** Dedicated tools are faster and more reliable than bash commands.

{if HAS_JEST || HAS_VITEST}
<!-- @context: test, code -->
## Testing

**Coverage Requirements:**
- All new features must have tests
- Aim for >80% coverage on new code
- Test edge cases and error conditions

**Test Organization:**
- Co-locate tests with source: `feature.ts` → `feature.test.ts`
- Use descriptive test names: `it('should handle empty array gracefully')`
- Group related tests with `describe` blocks

**Running Tests:**
- `just test` - Run all tests
- `just test:watch` - Watch mode
- `just test:coverage` - Coverage report
{endif}

<!-- @context: docs, documentation -->
## Documentation

**Code Comments:**
- Document "why" not "what" (code shows what)
- Use JSDoc/TSDoc for public APIs
- Update docs when changing behavior

**README Files:**
- Every plugin/module needs a README
- Include: purpose, usage, examples, API reference
- Keep examples up-to-date with code

---

## Context Tags Reference

Available contexts for this project:
- `build` - Build system and tooling
- `code` - General code style
- `typescript`, `javascript` - Language-specific rules
- `git`, `commit` - Version control
- `test` - Testing practices
- `docs` - Documentation
- `tools` - Tool preferences
- `claude-code` - Claude Code plugin development

Learn more: /style:contexts

---

*Last updated: {timestamp}*
*Managed by: /style plugin*
```

## Step 4: Create Support Directory

Create `.style/` directory for pattern tracking:

```bash
mkdir -p .style
```

Create `.style/config.json`:
```json
{
  "version": "1.0.0",
  "contextual": true,
  "autoLearn": true,
  "tokenBudget": {
    "max": 1500,
    "warn": 1000,
    "target": 800
  },
  "learning": {
    "enabled": true,
    "confidenceThreshold": 0.75,
    "minObservations": 3,
    "autoApply": false
  },
  "contexts": {
    "build": { "priority": "high", "autoDetect": ["justfile", "Makefile", "package.json"] },
    "code": { "priority": "high", "autoDetect": ["*.ts", "*.js", "*.py"] },
    "typescript": { "priority": "medium", "autoDetect": ["*.ts", "*.tsx"] },
    "git": { "priority": "critical", "autoDetect": ["git"] },
    "test": { "priority": "medium", "autoDetect": ["*.test.*", "*.spec.*"] },
    "docs": { "priority": "low", "autoDetect": ["*.md", "docs/"] }
  }
}
```

Create `.style/patterns.json`:
```json
{
  "version": "1.0.0",
  "patterns": [],
  "history": []
}
```

## Step 5: Update .gitignore

Add to `.gitignore`:
```
# Style guide learning data (personal observations)
.style/patterns.json
.style/history.jsonl

# Keep config (team settings)
!.style/config.json
```

Report what was added.

## Step 6: Create Justfile Hooks (Optional)

If justfile exists, offer to add helper recipes:

Use **AskUserQuestion**:
```
question: "Add style recipes to justfile for easy access?"
header: "Justfile Integration"
multiSelect: false
options:
  - label: "Yes, add recipes"
    description: "Add style commands to justfile"
  - label: "No, use /style commands"
    description: "Use Claude Code commands directly"
```

If yes, add to justfile:
```just
# Style guide management
[group('dev')]
style-validate:
    # Validate current work against style guide
    @echo "TODO: Implement validation"

[group('dev')]
style-learn:
    # Analyze patterns and suggest rules
    @echo "TODO: Implement learning"
```

## Step 7: Report Success

```
✓ Style guide initialized successfully!

Created files:
- CLAUDE.md (context-tagged style guide)
- .style/config.json (learning settings)
- .style/patterns.json (pattern tracking)
- Updated .gitignore

Next steps:
1. Review and customize CLAUDE.md for your team
2. Commit to git: git add CLAUDE.md .style/ .gitignore
3. Add rules: /style:add "your rule" --context build
4. Start learning: /style:learn

Your style guide is now active and will be loaded by Claude Code automatically.

Context tags enable smart loading - only relevant rules load per task.
Token usage: ~{estimated} tokens (target: <800)

Commands:
- /style:add - Add new rules
- /style:validate - Check compliance
- /style:learn - Auto-learn from patterns
- /style:optimize - Reduce token usage
```

## Notes

**Team Collaboration:**
- CLAUDE.md is committed to git and shared with team
- Everyone gets the same rules automatically
- .style/config.json is shared (learning settings)
- .style/patterns.json is gitignored (personal observations)

**Context Tags:**
- Format: `<!-- @context: tag1, tag2, tag3 -->`
- Place before each major section
- Multiple tags per section allowed
- Tags enable contextual loading via hooks

**Auto-Detection:**
- Hooks detect current activity context
- Only load relevant rules (saves ~70% tokens)
- See /style:contexts for details
