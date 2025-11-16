# Architecture

> Design and structure of the Claudevoyant plugins

## Overview

Claudevoyant is a collection of Claude Code plugins that provide professional workflow commands for development tasks. It's organized as three specialized plugins that can be installed independently or together.

## Plugins

- claudevoyant-adr - Architecture Decision Records
- claudevoyant-dev - Development workflow (docs, review, commits)
- claudevoyant-spec - Specification-driven development (planning, upgrading)

## Repository Structure

```
claudevoyant/
├── .claude-plugin/          # Marketplace metadata
│   └── marketplace.json     # Lists all three plugins
├── plugins/                 # Plugin collection
│   ├── adr/                 # ADR Plugin
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json  # ADR plugin manifest
│   │   └── commands/
│   │       ├── new.md       # Create ADR
│   │       └── capture.md   # Capture decision
│   ├── dev/                 # Dev Plugin
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json  # Dev plugin manifest
│   │   └── commands/
│   │       ├── commit.md    # Conventional commits
│   │       ├── docs.md      # Documentation generation
│   │       ├── review.md    # Code review
│   │       └── diff.md      # Repository comparison
│   └── spec/                # Spec Plugin
│       ├── .claude-plugin/
│       │   └── plugin.json  # Spec plugin manifest
│       └── commands/
│           ├── new.md       # Create plan
│           ├── init.md      # Initialize plan template
│           ├── go.md        # Execute plan
│           ├── refresh.md   # Update plan status
│           ├── pause.md     # Capture insights
│           ├── done.md      # Complete plan
│           └── upgrade.md   # Template upgrade
├── .github/workflows/       # CI/CD automation
│   ├── ci.yml               # Test and validation
│   └── release.yml          # Semantic versioning and releases
├── docs/                    # Plugin documentation
│   ├── architecture.md      # This file
│   ├── user-guide.md        # Installation and usage
│   └── decisions/           # Architecture Decision Records
├── test/                    # Test suite (empty currently)
├── .gitignore               # Git exclusions
├── .releaserc.json          # Semantic-release config
├── justfile                 # Command runner
├── README.md                # Plugin overview
└── version.txt              # Current version
```

## Design Principles

### 1. Modularity

Plugins are separated by concern (ADR, Dev, Spec) allowing users to install only what they need.

### 2. Reusability

Commands are designed to work across any project type. No language-specific assumptions are made.

### 3. Convention Over Configuration

Commands follow established patterns (conventional commits, ADRs, semantic versioning) to reduce cognitive load.

### 4. Composability

Commands can be used independently or chained together in workflows across plugins.

### 5. Documentation-Driven

All commands include comprehensive inline documentation and examples.

## Component Design

### Slash Commands

Each command is a standalone markdown file in the plugin's `commands/` directory following Claude Code's slash command format:

- Clear description and usage instructions
- Step-by-step execution workflow
- Examples and best practices
- Error handling guidance

Commands are organized by plugin:

- ADR commands (`plugins/adr/commands/`) - Focus on architectural decisions
- Dev commands (`plugins/dev/commands/`) - Focus on development workflow
- Spec commands (`plugins/spec/commands/`) - Focus on planning and execution

### Versioning Strategy

- Semantic versioning via conventional commits
- Automated releases through GitHub Actions
- Version synchronization across `version.txt` and `plugin.json`
- Changelog generation from commit history

### Testing Approach

- Structure validation in CI
- Plugin.json schema validation
- Marketplace.json verification
- Manual testing for command workflows

## Distribution

### Marketplace

Plugins are distributed via Claude Code marketplace:

```bash
# Add marketplace
/plugin marketplace add cloudvoyant/claudevoyant

# Install individual plugins
/plugin install adr
/plugin install dev
/plugin install spec
```

### Local Development

For development and testing:

```bash
# Add local marketplace
/plugin marketplace add /path/to/claudevoyant

# Install plugins from local source
/plugin install adr
/plugin install dev
/plugin install spec
```

## Dependencies

Development dependencies (not required for users):

- just - Command runner for automation tasks
- semantic-release - Automated versioning and releases
- Node.js - Required for semantic-release
- Git - Version control and repository management

## Extension Points

Future enhancements may include:

- Custom agents for specialized tasks
- MCP server integration for external tools
- Hooks for lifecycle events
- Skills for agent capabilities
