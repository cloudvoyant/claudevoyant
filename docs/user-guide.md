# User Guide

> Installation and usage guide for Claudevoyant plugins

## Installation

### From GitHub (Recommended)

Install the latest stable version from GitHub:

```bash
# Add the marketplace
/plugin marketplace add cloudvoyant/claudevoyant

# Install the plugins you need
/plugin install adr
/plugin install dev
/plugin install spec
```

### From Local Repository

For development or testing with a local clone:

```bash
# Add local marketplace
/plugin marketplace add /path/to/claudevoyant

# Install the plugins
/plugin install adr
/plugin install dev
/plugin install spec
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

Specification-driven development commands supporting multiple concurrent plans.

#### Plan Structure

Plans are stored in `.spec/plans/{plan-name}/` with:
- `plan.md` - High-level objectives, design, and task checklists
- `implementation/phase-N.md` - Detailed implementation specs per phase
- `execution-log.md` - Background execution history

#### `/new`

Create a new plan by exploring requirements:

```bash
/new                    # Create plan with interactive naming
/new plan-name         # Create plan with specific name
```

Creates structured plan with:
- High-level plan.md with objectives and task checklists
- Separate implementation files for detailed specs per phase
- Registration in .spec/plans/README.md

#### `/init`

Initialize an empty plan template:

```bash
/init                  # Will prompt for plan name
```

#### `/list`

List all active and archived plans:

```bash
/list
```

Shows:
- All active plans with status (Active/Paused/Executing)
- Progress percentage and task counts
- Last updated timestamps
- Archived plans with completion dates

#### `/go`

Execute or continue a plan interactively:

```bash
/go                    # Auto-selects most recently updated plan
/go plan-name         # Execute specific plan
```

Choose your execution mode:
- Fully Autonomous (NONE): Execute entire plan without stops (except errors)
- Phase Review (PHASE): Review progress after each phase
- Targeted Review (SPECIFIC PHASE): Stop at a specific phase for review

#### `/bg`

Execute plan in background with autonomous agent:

```bash
/bg                    # Auto-selects most recently updated plan
/bg plan-name         # Execute specific plan in background
```

The command will:
1. Launch an autonomous agent to execute your plan
2. Agent reads implementation files for detailed specs
3. Updates plan.md checkboxes in real-time
4. Runs tests at phase boundaries
5. Pauses on errors (preserving state)
6. Creates execution log in `.spec/plans/{plan-name}/execution-log.md`

Monitor with `/status`, stop with `/stop`.

#### `/status`

Check progress of plan execution:

```bash
/status                # Show overview of all plans
/status plan-name     # Detailed status of specific plan
```

Shows:
- Completion percentage and task counts
- Current phase and task being executed
- Recent activity and timeline
- Test status and any errors
- Commands to control execution

#### `/stop`

Stop background execution gracefully:

```bash
/stop                  # If only one plan executing
/stop plan-name       # Stop specific plan
```

The command will:
1. Halt the background agent
2. Save all progress to plan.md
3. Create stop report in execution log
4. Allow resuming later with `/bg` or `/go`

#### `/refresh`

Update plan status and checkboxes:

```bash
/refresh               # Auto-selects most recently updated plan
/refresh plan-name    # Refresh specific plan
```

#### `/pause`

Pause with insights summary:

```bash
/pause                 # Auto-selects most recently updated plan
/pause plan-name      # Pause specific plan
```

#### `/done`

Complete the plan and optionally commit:

```bash
/done                  # Shows completion dialog
/done plan-name       # Complete specific plan
```

Archives completed plan to `.spec/plans/archive/{plan-name}-{YYYYMMDD}/`

#### `/archive`

Manually archive an incomplete plan:

```bash
/archive plan-name
```

#### `/delete`

Permanently delete a plan:

```bash
/delete plan-name
```

Requires confirmation by typing plan name.

#### `/rename`

Rename a plan:

```bash
/rename old-name new-name
```

#### `/upgrade`

Upgrade project to a newer template version:

```bash
/upgrade
```

## Command Reference

For detailed documentation on each command, see:

- Plugin command files in `plugins/adr/commands/`, `plugins/dev/commands/`,
  `plugins/spec/commands/`
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
/plugin install adr
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
   /plugin uninstall adr
   /plugin install adr
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
   /plugin uninstall adr
   /plugin install adr
   ```

## Best Practices

### Planning (Spec Plugin)

- Use `/new plan-name` for complex multi-step tasks
- Break work into logical phases
- Implementation details go in separate `implementation/phase-N.md` files
- Update checklist status as you progress with `/refresh`
- Use `/pause` to capture insights when taking breaks
- Manage multiple plans concurrently

### Multi-Plan Workflow

The spec plugin supports multiple concurrent plans:

```bash
# Create plans for different features
/new feature-auth    # Creates .spec/plans/feature-auth/
/new refactor-api    # Creates .spec/plans/refactor-api/

# List all plans
/list

# Work on specific plans
/go feature-auth
/bg refactor-api

# Check status of all plans
/status
# Or specific plan
/status feature-auth

# Complete plans
/done feature-auth
```

**Plan Management:**
- Plans are stored in `.spec/plans/{plan-name}/`
- Each plan has plan.md (high-level) and implementation/*.md (detailed specs per phase)
- Implementation details split into separate files to prevent large monolithic plans
- Each plan has its own execution log
- Track all plans in `.spec/plans/README.md`
- Archive completed plans to `.spec/plans/archive/`

### Background Execution Workflow

- **Planning Phase**: Use `/new plan-name` to create detailed, unambiguous specs
  - High-level objectives go in plan.md
  - Detailed implementation specs go in implementation/phase-N.md files
- **Background Execution**: Use `/bg plan-name` for long-running or routine tasks
- **Interactive Execution**: Use `/go plan-name` for complex tasks needing review
- **Monitoring**: Check `/status` for all plans or `/status plan-name` for specific plan
- **Error Handling**: Agent pauses on errors - review logs and resume
- **Completion**: Run `/done plan-name` after execution finishes to commit and archive

Example workflow:
```bash
/new my-feature        # Create comprehensive plan with implementation files
/bg my-feature         # Start background execution
# ... do other work ...
/status                # Check progress of all plans
/status my-feature     # Detailed status of specific plan
# Execution completes automatically
/done my-feature       # Mark complete, commit, and archive
```

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
