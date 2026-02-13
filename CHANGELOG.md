## [1.6.1](https://github.com/cloudvoyant/claudevoyant/compare/v1.6.0...v1.6.1) (2026-02-13)

### Bug Fixes

* remove redundant questions from commit CI monitoring

Automatically monitor CI after push without asking additional questions.
User gets one prompt (push + verify?) then monitoring happens automatically.

Before: Ask to push → ask to monitor → monitor
After: Ask to push → automatically monitor

Reduces friction and makes workflow faster.

## [1.6.0](https://github.com/cloudvoyant/claudevoyant/compare/v1.5.0...v1.6.0) (2026-02-13)

### Features

* optimize commit command and add automatic CI verification

Speed improvements:
- Use conversation context instead of re-reading git logs
- Skip redundant file reads when context is available
- Eliminate unnecessary git log lookups

New functionality:
- Automatically offer to push and verify CI after commit
- Monitor GitHub Actions workflows to ensure changes pass
- Only declare work complete after CI validates changes
- Gracefully handle repos without CI or gh CLI

This addresses the issue where Claude declares work "done" without
verifying that tests, builds, and other automated checks actually pass.

## [1.5.0](https://github.com/cloudvoyant/claudevoyant/compare/v1.4.2...v1.5.0) (2026-02-12)

### Features

* add GitHub Actions monitoring skill to dev plugin

Add /dev:actions command that monitors CI/CD workflows to verify
changes pass automated checks. Prevents declaring work "done" when
tests, builds, or other workflows are failing.

Features:
- Check status of recent workflow runs
- Wait for in-progress workflows to complete
- Display pass/fail status with timing
- Fetch and show error logs on failure
- Offer to help fix issues when workflows fail

## [1.4.2](https://github.com/cloudvoyant/claudevoyant/compare/v1.4.1...v1.4.2) (2026-02-12)

### Bug Fixes

* remove invalid commands field from styleguide plugin manifest

Commands are auto-discovered from the commands/ directory and should
not be declared in plugin.json. This was causing validation errors
during plugin installation.

## [1.4.1](https://github.com/cloudvoyant/claudevoyant/compare/v1.4.0...v1.4.1) (2026-02-12)

### Bug Fixes

* move styleguide plugin to correct structure for marketplace

Moves plugin.json to .claude-plugin/ subdirectory and adds styleguide
to marketplace index. Plugin was not discoverable due to incorrect
file structure.

## [1.4.0](https://github.com/cloudvoyant/claudevoyant/compare/v1.3.0...v1.4.0) (2026-02-12)

### Features

* add styleguide plugin with contextual loading and auto-learning

Introduces intelligent style guide management that learns from user
corrections and loads rules contextually to minimize token usage.

Key features:
- Contextual rule loading (74% token savings)
- Automatic pattern learning from corrections
- Team-wide CLAUDE.md for shared conventions
- Validation and auto-fix capabilities
- Pattern extraction from existing codebase
- Token optimization strategies

Commands:
- /styleguide:init - Initialize CLAUDE.md with context tags
- /styleguide:add - Add rules manually with contexts
- /styleguide:learn - Auto-learn from work patterns
- /styleguide:validate - Check compliance
- /styleguide:extract - Discover existing patterns
- /styleguide:optimize - Reduce token usage
- /styleguide:contexts - Manage context system

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>

## [1.3.0](https://github.com/cloudvoyant/claudevoyant/compare/v1.2.0...v1.3.0) (2026-02-12)

### Features

* add implementation validation and worktree support to spec plugin

Enhances spec plugin with upfront implementation file validation and
git worktree integration for branch-based plan isolation.

Key improvements:
- Require all phase implementation files created before execution
- Validate files exist and meet size requirements pre-execution
- Add --branch flag to auto-create worktrees for plan isolation
- Track branch/worktree metadata in plan files
- Add branch validation to all execution commands
- Introduce /spec:worktree command for manual worktree management
- Migrate from .claude/plan.md to .spec/plans/{plan-name}/ structure
- Support multiple concurrent plans with independent contexts

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>

## [1.2.0](https://github.com/cloudvoyant/claudevoyant/compare/v1.1.2...v1.2.0) (2025-11-17)

### Features

* add background execution commands to spec plugin

Adds /bg, /status, and /stop commands enabling autonomous plan execution
using Claude Code's agent system. Users can now start background execution,
monitor progress, and control execution while continuing other work.

Also removes markdown linting configs and updates documentation.

## [1.1.2](https://github.com/cloudvoyant/claudevoyant/compare/v1.1.1...v1.1.2) (2025-11-17)

### Bug Fixes

* docs updated

* updated semantic release config based on new dir structure


### Code Refactoring

* move plugins into plugins directory

Restructures repository to match Anthropic's official marketplace
layout with all plugins under a single plugins/ parent directory.
Updates marketplace.json source paths accordingly.

## [1.1.1](https://github.com/cloudvoyant/claudevoyant/compare/v1.1.0...v1.1.1) (2025-11-16)

### Bug Fixes

* use relative paths in marketplace.json for monorepo structure

Changes plugin sources from GitHub object format to relative paths,
following Anthropic's recommended pattern for monorepo marketplaces.
Also corrects outdated plugin name in README installation example.

## [1.1.0](https://github.com/cloudvoyant/claudevoyant/compare/v1.0.3...v1.1.0) (2025-11-16)

### Features

* restructure into three plugins and add repository diff command

Splits monolithic plugin into specialized plugins:
- claudevoyant-adr: Architecture Decision Records
- claudevoyant-dev: Development workflows (docs, review, commits, diff)
- claudevoyant-spec: Specification-driven development

Adds new /diff command to compare repositories and generate
comprehensive diff reports with insights and analysis.

Updates marketplace.json to reference three separate plugins
with individual paths and descriptions.


### Bug Fixes

* remove claudevoyant prefix from plugin names

Fixes plugin installation by ensuring plugin names match between
marketplace.json and individual plugin.json files. Removes the
obsolete root plugin.json as the repository now contains three
separate plugins (adr, dev, spec).

* update semantic-release config for multi-plugin structure

Updates semantic-release to handle three separate plugins (adr, dev, spec)
instead of single root plugin. Simplifies commit command documentation
by removing redundant verification steps.


### Documentation

* improve installation instructions with CLI commands and version-specific installation

## [1.0.3](https://github.com/cloudvoyant/claudevoyant/compare/v1.0.2...v1.0.3) (2025-11-16)

### Bug Fixes

* modifying plugin.json to use https with git repos

## [1.0.2](https://github.com/cloudvoyant/claudevoyant/compare/v1.0.1...v1.0.2) (2025-11-16)

### Bug Fixes

* correct marketplace.json

* correct marketplace.json source

  format for GitHub

## [1.0.1](https://github.com/cloudvoyant/claudevoyant/compare/v1.0.0...v1.0.1) (2025-11-16)

### Bug Fixes

* owner field must be an object in marketplace.json

## 1.0.0 (2025-11-16)

### Features

* initialize claudevoyant plugin

Create Claude Code plugin with professional workflow commands:
- Planning workflow (/plan)
- Conventional commits (/commit)
- Template upgrades (/upgrade, /adapt)
- Documentation (/docs, /adr-new, /adr-capture)
- Code review (/review)

Infrastructure:
- Semantic versioning with semantic-release
- CI/CD with GitHub Actions
- BATS testing framework
- Comprehensive documentation


### Bug Fixes

* correct marketplace.json schema

Add required name and owner fields, fix source path format


### Code Refactoring

* remove unnecessary environment and script dependencies

- Remove .envrc files (not needed for plugin)
- Remove scripts directory (use semantic-release directly)
- Simplify justfile to not require direnv
- Update release workflow to use npx semantic-release
