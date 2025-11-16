# User Guide

> Installation and usage guide for Claudevoyant plugin

## Installation

### From GitHub (Recommended)

Install the latest stable version from GitHub:

```bash
# Add the marketplace
/plugin marketplace add cloudvoyant/claudevoyant

# Install the plugin
/plugin install claudevoyant
```

### From Local Repository

For development or testing with a local clone:

```bash
# Add local marketplace
/plugin marketplace add /path/to/claudevoyant

# Install the plugin
/plugin install claudevoyant
```

## Available Commands

### Planning & Workflow

#### `/plan`

Structured project planning with phases and tasks:

```bash
# Create a new plan
/plan new

# Execute an existing plan
/plan go

# Update plan status
/plan refresh

# Pause with insights
/plan pause

# Complete the plan
/plan done
```

### Git & Version Control

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

#### `/upgrade`

Upgrade project to a newer template version:

```bash
/upgrade
```

#### `/adapt`

Adapt an existing project to a template structure:

```bash
/adapt
```

### Documentation

#### `/docs`

Generate or update project documentation:

```bash
/docs
```

#### `/adr-new`

Create a new Architecture Decision Record:

```bash
/adr-new
```

#### `/adr-capture`

Extract a decision from conversation into an ADR:

```bash
/adr-capture
```

### Code Quality

#### `/review`

Perform structured code review:

```bash
/review
```

## Command Reference

For detailed documentation on each command, see:
- `commands/README.md` in the plugin repository
- `/help` command in Claude Code

## Version Management

### Checking Version

The plugin version follows semantic versioning:

```bash
# View installed version
/plugin list
```

### Updating

```bash
# Update to latest version
/plugin update claudevoyant
```

### Installing Specific Version

```bash
# Install a specific version (future capability)
/plugin install claudevoyant@1.2.0
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
   /plugin uninstall claudevoyant
   /plugin install claudevoyant
   ```

### Commands Not Working

1. Ensure you're in a compatible project structure
2. Check command documentation: `/help`
3. Review command-specific requirements in error messages

### Update Issues

If updates fail:

1. Uninstall and reinstall:
   ```bash
   /plugin uninstall claudevoyant
   /plugin marketplace remove cloudvoyant/claudevoyant
   /plugin marketplace add cloudvoyant/claudevoyant
   /plugin install claudevoyant
   ```

## Best Practices

### Planning

- Use `/plan new` for complex multi-step tasks
- Break work into logical phases
- Update checklist status as you progress

### Commits

- Commit frequently with `/commit`
- Let the command guide conventional format
- Review version impact before confirming

### Documentation

- Update ADRs as decisions are made
- Use `/docs` to keep documentation current
- Capture architectural decisions with `/adr-capture`

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/cloudvoyant/claudevoyant/issues
- Documentation: See `docs/` directory
