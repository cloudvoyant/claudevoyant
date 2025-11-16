# Claudevoyant

> Professional workflow commands for Claude Code

A curated collection of slash commands that streamline development workflows in Claude Code, including project planning, git commits, documentation, and code review.

## Features

- **`/plan`** - Structured project planning with phases and tasks
- **`/commit`** - Conventional commit messages with best practices
- **`/upgrade`** - Template upgrade workflow for projects
- **`/adapt`** - Adapt existing projects to new templates
- **`/docs`** - Generate and update project documentation
- **`/review`** - Code review workflows
- **`/adr-new`** - Create Architecture Decision Records
- **`/adr-capture`** - Capture decisions from conversations

## Installation

### From GitHub

```bash
/plugin marketplace add cloudvoyant/claudevoyant
/plugin install claudevoyant
```

### From Local Repository

For development or testing:

```bash
/plugin marketplace add /path/to/claudevoyant
/plugin install claudevoyant
```

## Usage

After installation, all commands are available globally across your projects:

```bash
# Start a new plan
/plan new

# Create a conventional commit
/commit

# Generate documentation
/docs

# Create an ADR
/adr-new
```

Run `/help` to see all available commands.

## Commands

### Planning & Workflow

- **`/plan new`** - Create a structured implementation plan
- **`/plan go`** - Execute an existing plan step-by-step
- **`/plan refresh`** - Update plan status and checkboxes
- **`/plan pause`** - Pause planning with insights summary
- **`/plan done`** - Complete plan and optionally commit changes

### Git & Version Control

- **`/commit`** - Create professional conventional commits
- **`/upgrade`** - Upgrade project to newer template version
- **`/adapt`** - Adapt existing project to a template structure

### Documentation

- **`/docs`** - Generate or update project documentation
- **`/adr-new`** - Create a new Architecture Decision Record
- **`/adr-capture`** - Extract decision from conversation into ADR

### Code Quality

- **`/review`** - Perform structured code review

## Development

See [docs/development-guide.md](docs/development-guide.md) for contributing guidelines.

## Versioning

This plugin follows [semantic versioning](https://semver.org/). Version numbers are automatically managed through conventional commits and semantic-release.

## License

MIT © Cloudvoyant
