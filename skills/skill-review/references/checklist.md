# Skill Review Checklist

Complete checklist for reviewing a SKILL.md file against the Agent Skills base spec and claudevoyant conventions.

## Base Spec Compliance

- [ ] `name` field present, matches `[a-z0-9-]+`, max 64 chars, no leading/trailing/consecutive hyphens
- [ ] `description` field present, 1-1024 chars
- [ ] `license` field present (should be `MIT` for claudevoyant skills)
- [ ] `compatibility` field present, 1-500 chars, accurately reflects the skill's platform requirements

## Portability Tier Classification

Determine the actual tier from the skill's frontmatter and body:

| Condition | Minimum Tier |
|-----------|-------------|
| No platform-specific features | Tier 1 (Portable) |
| Uses `AskUserQuestion` | Tier 2 (Degraded) |
| Uses `context: fork` | Tier 2b (Degraded - fork) |
| Uses `hooks:` or `${CLAUDE_SKILL_DIR}` | Tier 3 (Claude Code-first) |

### Tier compatibility text templates

- **Tier 1**: `Works on Claude Code, OpenCode, GitHub Copilot (VS Code), and Codex. No platform-specific features used.`
- **Tier 2**: `Designed for Claude Code. On OpenCode and VS Code Copilot, AskUserQuestion falls back to numbered list; context: fork runs inline. Core functionality preserved on all platforms.`
- **Tier 3**: `Designed for Claude Code. Requires hooks or ${CLAUDE_SKILL_DIR} — non-functional on other platforms without modification.`

## Claudevoyant Conventions

- [ ] `description` is "pushy" — includes what it does, when to use it, and trigger keywords; nudges Claude to use it even when not explicitly asked
- [ ] `argument-hint` set if the skill takes any positional args or flags
- [ ] `disable-model-invocation: true` if the skill is stateful or destructive (commits, pushes, file writes, deploys)
- [ ] `$ARGUMENTS` referenced in body if the skill takes a positional argument
- [ ] Body has a **workflow** — numbered steps, not just reference tables
- [ ] SKILL.md is under 500 lines; large reference content lives in `references/`
- [ ] Body has `> **Compatibility**:` note if Tier 2 or above
- [ ] Directory name matches the intended slash command
- [ ] `hooks` frontmatter added if the skill performs sensitive operations needing pre/post validation

## Plugin Completeness

- [ ] Plugin has an `allow` skill (`plugins/{plugin}/skills/allow/SKILL.md`)
- [ ] Plugin has a `help` skill (`plugins/{plugin}/skills/help/SKILL.md`)

## Plugin Wiring (if skill is in a plugin)

- [ ] Plugin is registered in `.claude-plugin/marketplace.json`
- [ ] Plugin's `plugin.json` is listed in `.releaserc.json` `@semantic-release/git` assets
- [ ] Plugin's `plugin.json` is listed in `.releaserc.json` `@semantic-release/exec` prepareCmd
- [ ] Plugin's `plugin.json` is listed in `.github/workflows/release.yml` GitHub Release files
- [ ] Skill bundle exists in `dist/opencode-skills/` and `dist/copilot-skills/` (run `mise run skills:build` to verify)

## Description Quality

A good description answers _what_ and _when_, and leans toward over-specifying:

```yaml
# Passive — undertriggers
description: Monitors CI workflows.

# Pushy — correct
description: Monitor CI/CD workflows (GitHub Actions or GitLab CI). Always use
this after any push to verify checks pass before declaring work done — never
push and move on without checking CI. Supports --autofix to fix failures and
re-push automatically.
```

Rules:
- Include keywords users would naturally say
- Mention flags that meaningfully change behavior
- Add "even if they don't explicitly say X" for skills that should trigger on implicit intent
- 1-3 sentences — a hint, not documentation
