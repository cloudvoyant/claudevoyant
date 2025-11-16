# User Guide

> Installation and usage guide for Claudevoyant plugins

## Installation

### From GitHub (Recommended)

Install the latest stable version from GitHub:

```bash
# Add the marketplace
/plugin marketplace add cloudvoyant/claudevoyant

# Install the plugins you need
/plugin install claudevoyant-adr
/plugin install claudevoyant-dev
/plugin install claudevoyant-spec
```

### From Local Repository

For development or testing with a local clone:

```bash
# Add local marketplace
/plugin marketplace add /path/to/claudevoyant

# Install the plugins
/plugin install claudevoyant-adr
/plugin install claudevoyant-dev
/plugin install claudevoyant-spec
```

## Available Commands

### ADR Plugin (claudevoyant-adr)

Architecture Decision Record commands:

#### `/new`

Create a new Architecture Decision Record:

```bash
/new
```

#### `/capture`

Extract a decision from conversation into an ADR:

```bash
/capture
```

### Dev Plugin (claudevoyant-dev)

Development workflow commands:

#### `/commit`

Create professional conventional commits:

```bash
/commit
```

The command will:
1. Analyze your changes
2. Generate a conventional commit message
3. Show version impact (MAJOR, MINOR, PATCH)
4. Create the commit after approval

#### `/docs`

Generate or update project documentation:

```bash
/docs
```

#### `/review`

Perform structured code review:

```bash
/review
```

#### `/diff`

Compare current repository with another repository:

```bash
/diff <repository-url>
```

The command will:
1. Ask for the comparison objective
2. Clone the target repository to a temp directory
3. Analyze structural similarities
4. Generate a comprehensive diff report at `.claude/diff.md`
5. Clean up temporary files

Use cases:
- Track changes from a template/fork
- Compare architectures between projects
- Analyze migration differences
- Review changes between similar codebases

### Spec Plugin (claudevoyant-spec)

Specification-driven development commands:

#### `/new`

Create a new plan by exploring requirements:

```bash
/new
```

#### `/init`

Initialize an empty plan template:

```bash
/init
```

#### `/go`

Execute or continue the existing plan:

```bash
/go
```

#### `/refresh`

Update plan status and checkboxes:

```bash
/refresh
```

#### `/pause`

Pause with insights summary:

```bash
/pause
```

#### `/done`

Complete the plan and optionally commit:

```bash
/done
```

#### `/upgrade`

Upgrade project to a newer template version:

```bash
/upgrade
```

## Command Reference

For detailed documentation on each command, see:
- Plugin command files in `adr/commands/`, `dev/commands/`, `spec/commands/`
- `/help` command in Claude Code

## Version Management

### Checking Version

The plugins follow semantic versioning:

```bash
# View installed versions
/plugin list
```

### Updating

```bash
# Update marketplace to get latest versions
/plugin marketplace update cloudvoyant/claudevoyant
```

### Installing Specific Version

```bash
# Install a specific version
/plugin marketplace add cloudvoyant/claudevoyant@v1.0.3
/plugin install claudevoyant-adr
```

## Troubleshooting

### Plugin Not Found

If commands aren't available after installation:

1. Verify installation:
   ```bash
   /plugin list
   ```

2. Check marketplace:
   ```bash
   /plugin marketplace list
   ```

3. Reinstall if needed:
   ```bash
   /plugin uninstall claudevoyant-adr
   /plugin install claudevoyant-adr
   ```

### Commands Not Working

1. Ensure the plugin containing the command is installed
2. Check command documentation: `/help`
3. Review command-specific requirements in error messages

### Update Issues

If updates fail:

1. Update marketplace and reinstall:
   ```bash
   /plugin marketplace update cloudvoyant/claudevoyant
   /plugin uninstall claudevoyant-adr
   /plugin install claudevoyant-adr
   ```

## Best Practices

### Planning (Spec Plugin)

- Use `/new` for complex multi-step tasks
- Break work into logical phases
- Update checklist status as you progress with `/refresh`
- Use `/pause` to capture insights when taking breaks

### Commits (Dev Plugin)

- Commit frequently with `/commit`
- Let the command guide conventional format
- Review version impact before confirming

### Documentation (ADR & Dev Plugins)

- Create ADRs as decisions are made with `/new` (ADR plugin)
- Use `/docs` to keep project documentation current
- Capture architectural decisions from conversations with `/capture`

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/cloudvoyant/claudevoyant/issues
- Documentation: See `docs/` directory
