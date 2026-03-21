---
name: skill:create
description: Create a new Claude Code / Agent Skills compatible skill from scratch. Guides through writing SKILL.md, choosing frontmatter, assigning a portability tier, and wiring the skill into the release lifecycle (marketplace.json, releaserc, CI/CD). Use this whenever someone wants to make a new skill, even if they just say "make a skill for X" or "add a slash command for Y".
license: MIT
compatibility: Works on Claude Code, OpenCode, GitHub Copilot (VS Code), and Codex. No platform-specific features used.
argument-hint: '[skill-name]'
---

New skill name (if provided): $ARGUMENTS

## Step 1: Clarify Intent

Ask (if not already clear from context):
1. What should the skill do? What problem does it solve?
2. When should it trigger? What would a user say to invoke it?
3. Does it take arguments or flags?
4. Is it stateful or destructive? (commits, pushes, file writes, deploys)
5. Should it run in an isolated subagent, or inline in the main conversation?
6. Which plugin should it live in? (spec, dev, em, pm, ux, memory, or a new plugin)

Derive a skill name if not provided:
- Lowercase, hyphens only, max 64 chars, no leading/trailing/consecutive hyphens
- Should be descriptive: `spec-new`, `dev-ci`, `memory-learn`

## Step 2: Choose Frontmatter

Based on the answers, determine:

| Question | Frontmatter |
|----------|------------|
| Stateful or destructive? | `disable-model-invocation: true` |
| Long-running or isolated? | `context: fork` |
| Takes arguments? | `argument-hint: '<arg> [--flag]'` |
| Specific subagent? | `agent: spec-planner` (Claude Code only) |
| Model override needed? | `model: claude-opus-4-6` |
| Pre/post validation? | `hooks:` block |

**Assign portability tier:**
- No platform-specific features → Tier 1: `compatibility: Works on Claude Code, OpenCode, GitHub Copilot (VS Code), and Codex. No platform-specific features used.`
- Uses `AskUserQuestion` or `context: fork` → Tier 2: `compatibility: Designed for Claude Code. On OpenCode and VS Code Copilot, AskUserQuestion falls back to numbered list; context: fork runs inline. Core functionality preserved on all platforms.`
- Uses hooks or `${CLAUDE_SKILL_DIR}` → Tier 3: `compatibility: Designed for Claude Code. Requires hooks or ${CLAUDE_SKILL_DIR} — non-functional on other platforms without modification.`

## Step 3: Write SKILL.md

Create `plugins/{plugin}/skills/{skill-name}/SKILL.md` with:

1. **Frontmatter** — in this order:
   ```yaml
   ---
   description: {pushy, trigger-rich description}
   name: {plugin}-{skill-name}
   license: MIT
   compatibility: {tier text}
   argument-hint: {if applicable}
   disable-model-invocation: {if applicable}
   context: fork  # if applicable
   agent: {if applicable}
   model: {if applicable}
   ---
   ```

2. **Compatibility note** (Tier 2+ only) — first line after frontmatter:
   ```
   > **Compatibility**: {prose explanation of graceful degradation}
   ```

3. **Workflow** — numbered steps describing what the skill does:
   - Step 0: Parse arguments
   - Step 1-N: Core logic
   - Final step: Report to user

4. **Keep under 500 lines** — move reference material to `references/` directory

After writing, show the full SKILL.md to the user for review. Apply any requested changes.

## Step 4: Wire into Plugin Lifecycle

If the skill is part of an **existing plugin**, only step 4e applies (ensure allow/help exist).

If the skill is in a **new plugin**, complete all steps:

### 4a — Create `plugin.json` (new plugin only)
Create `plugins/{plugin}/.claude-plugin/plugin.json`:
```json
{
  "name": "{plugin}",
  "version": "0.0.0",
  "description": "{plugin description}",
  "author": { "name": "codevoyant", "url": "https://github.com/codevoyant" },
  "homepage": "https://github.com/codevoyant/claudevoyant",
  "repository": "https://github.com/codevoyant/claudevoyant",
  "license": "MIT",
  "keywords": ["claude-code", "{plugin}"]
}
```

### 4b — Update `.claude-plugin/marketplace.json` (new plugin only)
Add entry to the `plugins` array (alphabetical order):
```json
{
  "name": "{plugin}",
  "description": "{plugin description}",
  "source": "./plugins/{plugin}"
}
```

### 4c — Update `.releaserc.json` (new plugin only)
1. In `@semantic-release/exec` `prepareCmd` — add plugin name to the array (alphabetical)
2. In `@semantic-release/git` `assets` — add `plugins/{plugin}/.claude-plugin/plugin.json`

### 4d — Update `.github/workflows/release.yml` (new plugin only)
In the `GitHub Release` step `files` block — add:
```
plugins/{plugin}/.claude-plugin/plugin.json
```

### 4e — Ensure `allow` and `help` skills exist (all plugins)

Every claudevoyant plugin must have two meta-skills: `allow` (grants Claude permission to auto-approve operations in this plugin without prompting) and `help` (lists available skills and their purpose).

Check if they exist:
```bash
ls plugins/{plugin}/skills/allow/SKILL.md 2>/dev/null || echo "MISSING: allow"
ls plugins/{plugin}/skills/help/SKILL.md 2>/dev/null || echo "MISSING: help"
```

If either is missing, create it by copying the pattern from an existing plugin:
```bash
# Use dev plugin as reference
cp -r plugins/dev/skills/allow plugins/{plugin}/skills/allow
cp -r plugins/dev/skills/help plugins/{plugin}/skills/help
```

Then update the copied SKILL.md files:
- `allow`: update `name`, `description` to reference the new plugin's commands
- `help`: update `name`, `description`, and the skills list to match the new plugin's actual skills

See `references/plugin-wiring.md` for the exact wiring patterns.

## Step 5: Validate

Run spec validation:
```bash
mise run skills:validate
```

If validation fails, fix the reported issues and re-run.

Show the user the final skill path and how to invoke it:
```
Skill created: plugins/{plugin}/skills/{skill-name}/SKILL.md
Spec validation: passed

Invoke with: /{plugin}:{skill-name}
Cross-platform name: {plugin}-{skill-name}
```
