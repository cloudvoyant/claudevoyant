# Architecture

> Design and structure of the Claudevoyant plugin

## Overview

Claudevoyant is a Claude Code plugin that provides professional workflow commands for development tasks. It's designed as a lightweight, reusable plugin that can be installed across projects.

## Plugin Structure

```
claudevoyant/
├── .claude-plugin/          # Plugin metadata
│   ├── plugin.json          # Plugin manifest
│   └── marketplace.json     # Marketplace listing
├── .github/workflows/       # CI/CD automation
│   ├── ci.yml              # Test and validation
│   └── release.yml         # Semantic versioning and releases
├── commands/                # Slash commands
│   ├── plan.md             # Project planning workflow
│   ├── commit.md           # Conventional commits
│   ├── upgrade.md          # Template upgrade
│   ├── adapt.md            # Template adaptation
│   ├── docs.md             # Documentation generation
│   ├── review.md           # Code review
│   ├── adr-new.md          # Create ADRs
│   ├── adr-capture.md      # Capture decisions
│   └── README.md           # Command documentation
├── docs/                    # Plugin documentation
│   ├── architecture.md     # This file
│   ├── user-guide.md       # Installation and usage
│   └── decisions/          # Architecture Decision Records
├── scripts/                 # Automation scripts
│   ├── upversion.sh        # Semantic versioning
│   └── utils.sh            # Shared utilities
├── test/                    # Test suite
│   └── commit.bats         # Command tests
├── .envrc                   # Environment configuration
├── .gitignore              # Git exclusions
├── .releaserc.json         # Semantic-release config
├── justfile                # Command runner
├── README.md               # Plugin overview
└── version.txt             # Current version
```

## Design Principles

### 1. Reusability

Commands are designed to work across any project type. No language-specific assumptions are made.

### 2. Convention Over Configuration

Commands follow established patterns (conventional commits, ADRs, semantic versioning) to reduce cognitive load.

### 3. Composability

Commands can be used independently or chained together in workflows.

### 4. Documentation-Driven

All commands include comprehensive inline documentation and examples.

## Component Design

### Slash Commands

Each command is a standalone markdown file in `commands/` following Claude Code's slash command format:

- Clear description and usage instructions
- Step-by-step execution workflow
- Examples and best practices
- Error handling guidance

### Versioning Strategy

- **Semantic versioning** via conventional commits
- Automated releases through GitHub Actions
- Version synchronization across `version.txt` and `plugin.json`
- Changelog generation from commit history

### Testing Approach

- BATS tests for command validation
- Structure validation in CI
- Plugin.json schema validation
- Marketplace.json verification

## Distribution

### Marketplace

Plugin is distributed via Claude Code marketplace:

```bash
/plugin marketplace add cloudvoyant/claudevoyant
/plugin install claudevoyant
```

### Local Development

For development and testing:

```bash
/plugin marketplace add /path/to/claudevoyant
/plugin install claudevoyant
```

## Dependencies

- **just** - Command runner for automation
- **semantic-release** - Automated versioning
- **bats** - Bash testing framework
- **Node.js** - Required for semantic-release

## Extension Points

Future enhancements may include:

- Custom agents for specialized tasks
- MCP server integration for external tools
- Hooks for lifecycle events
- Skills for agent capabilities
