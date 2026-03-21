---
name: skill:review
description: Review one or more SKILL.md files against the Agent Skills base spec and claudevoyant conventions. Use this whenever someone wants to audit a skill, check portability, verify wiring, or ensure a skill will trigger correctly. Triggers on "review skill", "audit skill", "check skill", "skill compliance", "is this skill correct".
license: MIT
compatibility: Works on Claude Code, OpenCode, GitHub Copilot (VS Code), and Codex. No platform-specific features used.
argument-hint: '<skill-name|path/to/SKILL.md|plugin-name>'
---

Skill(s) to review: $ARGUMENTS

## Step 1: Resolve Target

Inspect `$ARGUMENTS`:

- **Empty** — ask what skill to review
- **Single `SKILL.md` path** — review that file directly
- **Skill directory** (contains `SKILL.md`) — review that skill
- **Skill name** (e.g., `spec-new`, `dev-commit`) — search `.claude/skills/`, `.agents/skills/`, and `plugins/*/skills/` for a match
- **Plugin directory** — auto-discover all skills:
  ```bash
  find $ARGUMENTS -name "SKILL.md" | sort
  ```
  Show discovered list and confirm with user before proceeding.

## Step 2: Review (parallelise for multiple skills)

For a single skill, run inline. For multiple skills, spawn one subagent per skill simultaneously via the Agent tool. Each subagent receives the SKILL.md path and the checklist from `references/checklist.md`.

For each skill, check:

### 2a — Base Spec Compliance
- [ ] `name` field present, matches `[a-z0-9-]+`, ≤64 chars, no leading/trailing/consecutive hyphens
- [ ] `description` field present, 1–1024 chars
- [ ] `license` field present (should be `MIT` for claudevoyant skills)
- [ ] `compatibility` field present, 1–500 chars, accurately reflects the skill's platform requirements

### 2b — Portability Tier Accuracy
Determine the actual tier from the skill's frontmatter and body:
- Uses `AskUserQuestion`? → Tier 2 minimum
- Uses `context: fork`? → Tier 2b minimum
- Uses `hooks:` or `${CLAUDE_SKILL_DIR}`? → Tier 3
- None of the above → Tier 1

Compare to the declared `compatibility` field. Flag if mismatched.

### 2c — Claudevoyant Conventions
- [ ] `description` is "pushy" — includes what it does, when to use it, trigger keywords
- [ ] `argument-hint` set if skill takes positional args or flags
- [ ] `disable-model-invocation: true` if skill is stateful or destructive
- [ ] `$ARGUMENTS` referenced in body if skill takes a positional argument
- [ ] Body has a **workflow** — numbered steps, not just reference tables
- [ ] SKILL.md is under 500 lines; large content in `references/`
- [ ] Body has `> **Compatibility**:` note if Tier 2 or above

### 2d — Plugin Completeness
- [ ] Plugin has an `allow` skill (`plugins/{plugin}/skills/allow/SKILL.md`)
- [ ] Plugin has a `help` skill (`plugins/{plugin}/skills/help/SKILL.md`)

### 2e — Plugin Wiring (if in a plugin)
Determine which plugin the skill belongs to (from its path or `name` prefix).
- [ ] Plugin is registered in `.claude-plugin/marketplace.json`
- [ ] Plugin's `plugin.json` is listed in `.releaserc.json` `@semantic-release/git` assets
- [ ] Plugin's `plugin.json` is listed in `.releaserc.json` `@semantic-release/exec` prepareCmd
- [ ] Plugin's `plugin.json` is listed in `.github/workflows/release.yml` GitHub Release files
- [ ] Skill bundle for this plugin exists in `dist/opencode-skills/` and `dist/copilot-skills/` (run `mise run skills:build` to verify)

See `references/plugin-wiring.md` for the exact wiring patterns.

## Step 3: Aggregate and Report

```
## Review: {skill-name}

### Base Spec
- 🔴 Blocking: {issue}
- 🟡 Polish: {issue}
- ✅ Good: {what's correct}

### Portability Tier
- Declared: {tier + compatibility text}
- Actual: {tier based on analysis}
- 🔴 Mismatch / ✅ Accurate

### Conventions
- 🔴 / 🟡 / ✅ {each checklist item}

### Plugin Completeness
- 🔴 / ✅ `allow` skill exists at `plugins/{plugin}/skills/allow/SKILL.md`
- 🔴 / ✅ `help` skill exists at `plugins/{plugin}/skills/help/SKILL.md`

### Plugin Wiring
- 🔴 / ✅ {each wiring check}
```

## Step 4: Propose and Apply Fixes

For each 🔴 Blocking issue, propose the exact edit. Apply once approved.
For 🟡 Polish issues, present as optional — apply if user confirms.

After applying: run `mise run skills:validate` to confirm spec compliance.
