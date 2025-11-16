# Claudevoyant

> Professional workflow commands for Claude Code

A curated collection of slash commands that streamline development workflows in
Claude Code, organized into three specialized plugins:

- **claudevoyant-adr** - Architecture Decision Records
- **claudevoyant-dev** - Development workflow (docs, review, commits, diff)
- **claudevoyant-spec** - Specification-driven development (planning, upgrading)

## Features

### ADR Plugin

- **`/new`** - Create Architecture Decision Records
- **`/capture`** - Capture decisions from conversations

### Dev Plugin

- **`/docs`** - Generate and update project documentation
- **`/review`** - Code review workflows
- **`/commit`** - Conventional commit messages with best practices
- **`/diff`** - Compare current repository with another repository

### Spec Plugin

- **`/new`** - Create a new plan by exploring requirements
- **`/init`** - Initialize an empty plan template
- **`/go`** - Execute or continue the existing plan
- **`/refresh`** - Review and update plan checklist status
- **`/pause`** - Capture insights summary from planning
- **`/done`** - Mark plan as complete and optionally commit
- **`/upgrade`** - Template upgrade workflow for projects

## Installation

### From GitHub (Recommended)

Add the Claudevoyant marketplace:

```bash
claude plugin marketplace add cloudvoyant/claudevoyant
```

Then install the plugins you need:

```bash
# Install all three plugins
claude plugin install adr
claude plugin install dev
claude plugin install spec

# Or install only what you need
claude plugin install dev
```

Or using Claude Code slash commands:

```bash
/plugin marketplace add cloudvoyant/claudevoyant
/plugin install adr
/plugin install dev
/plugin install spec
```

### Install Specific Version

To install a specific version:

```bash
claude plugin marketplace add cloudvoyant/claudevoyant@v1.0.3
claude plugin install adr
```

### From Local Repository

For development or testing:

```bash
claude plugin marketplace add /path/to/claudevoyant
claude plugin install adr
```

### Updating

To update to the latest version:

```bash
claude plugin marketplace update claudevoyant
```

This will pull the latest changes from the marketplace repository.

## Usage

After installation, commands are available globally. Note that command names are
scoped to their plugin:

```bash
# ADR plugin commands (from claudevoyant-adr)
/new       # Create a new ADR
/capture   # Capture decision from conversation

# Dev plugin commands (from claudevoyant-dev)
/commit    # Create professional commits
/docs      # Generate documentation
/review    # Perform code review
/diff      # Compare repositories

# Spec plugin commands (from claudevoyant-spec)
/new       # Create a new plan
/init      # Initialize empty plan template
/go        # Execute the plan
/refresh   # Update plan status
/pause     # Capture insights
/done      # Mark plan complete
/upgrade   # Upgrade template
```

**Note:** Since `/new` exists in both ADR and Spec plugins, Claude will ask
which one you mean when you use it. You can be explicit by saying "create a new
ADR" or "create a new plan".

Run `/help` to see all available commands.

## Commands

### ADR Plugin Commands

- **`/new`** - Create a new Architecture Decision Record
- **`/capture`** - Extract decision from conversation into ADR

### Dev Plugin Commands

- **`/commit`** - Create professional conventional commits
- **`/docs`** - Generate or update project documentation
- **`/review`** - Perform structured code review
- **`/diff`** - Compare current repository with another repository

### Spec Plugin Commands

- **`/new`** - Create a structured implementation plan
- **`/init`** - Initialize an empty plan template
- **`/go`** - Execute an existing plan step-by-step
- **`/refresh`** - Update plan status and checkboxes
- **`/pause`** - Pause planning with insights summary
- **`/done`** - Complete plan and optionally commit changes
- **`/upgrade`** - Upgrade project to newer template version

## Development

See [docs/development-guide.md](docs/development-guide.md) for contributing
guidelines.

## Versioning

This plugin follows [semantic versioning](https://semver.org/). Version numbers
are automatically managed through conventional commits and semantic-release.

## TODO

- [ ] Introduce skills
- [ ] Add logging

## License

MIT © Cloudvoyant
