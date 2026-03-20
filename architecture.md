---
type: architecture
tags: [plugins, repository-structure, design-principles, agent-kit]
description: High-level architecture of the codevoyant plugin collection — plugin layout, design principles, distribution model
---

# Architecture

Design and structure of the codevoyant plugins.

## Overview

codevoyant is a collection of plugins for AI coding agents (Claude Code, OpenCode, Copilot) that provide professional workflow commands for development tasks. It's organized as specialized plugins that can be installed independently or together.

## Plugins

- **spec** — Specification-driven development (planning, execution, review)
- **dev** — Development workflow (commits, review, docs)
- **em** — Engineering management (experimental)
- **pm** — Product management (experimental)
- **ux** — UX design workflows (experimental)
- **style** — Code style synthesis (experimental)

## Repository Structure

```
codevoyant/
├── .claude-plugin/          # Marketplace metadata
│   └── marketplace.json     # Lists all plugins
├── plugins/                 # Plugin collection
│   ├── dev/                 # Dev plugin
│   ├── spec/                # Spec plugin
│   ├── em/                  # EM plugin
│   ├── pm/                  # PM plugin
│   ├── ux/                  # UX plugin
│   └── style/               # Style plugin
├── packages/
│   └── agent-kit/           # CLI toolkit (plans, settings, mem)
├── scripts/                 # Install scripts per client
├── docs/                    # Public VitePress documentation site
├── e2e/                     # End-to-end tests
└── .codevoyant/             # Project metadata (spec.json, plans/)
```

Each plugin follows the structure:

```
plugins/{name}/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
└── skills/
    └── {skill-name}/
        ├── SKILL.md          # Skill definition
        └── references/       # Supporting docs for the skill
```

## Design Principles

1. **Modularity** — Plugins are separated by concern, installable independently.
2. **Reusability** — Skills work across any project type with no language-specific assumptions.
3. **Convention Over Configuration** — Follow established patterns (conventional commits, semantic versioning).
4. **Composability** — Skills can be used independently or chained together across plugins.
5. **Documentation-Driven** — All skills include comprehensive inline documentation and examples.

## Spec Plugin: Multi-Plan Architecture

Plans are stored under `.codevoyant/plans/` with a registry at `.codevoyant/spec.json`:

```
.codevoyant/
├── spec.json                        # Plan registry, statuses, variables
└── plans/
    ├── {plan-name}/
    │   ├── plan.md
    │   ├── implementation/          # Per-phase specs
    │   │   ├── phase-1.md
    │   │   └── phase-N.md
    │   └── execution-log.md
    └── archive/
        └── {plan-name}-{YYYYMMDD}/
```

## Distribution

Plugins are distributed via install scripts per client:

```bash
# Claude Code
./scripts/install-claude.sh

# OpenCode
./scripts/install-opencode.sh

# VS Code Copilot
./scripts/install-vscode.sh
```
