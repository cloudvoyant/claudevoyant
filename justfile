# justfile - Command runner for Claude Code plugin
# Requires: just (https://github.com/casey/just)

set shell   := ["bash", "-c"]

# Project metadata
PROJECT     := "claudevoyant"
VERSION     := `cat version.txt`

# Color codes for output
INFO        := '\033[0;34m'
SUCCESS     := '\033[0;32m'
WARN        := '\033[1;33m'
ERROR       := '\033[0;31m'
NORMAL      := '\033[0m'

# ==============================================================================
# CORE DEVELOPMENT
# ==============================================================================

# Default recipe (show help)
_default:
    @just --list --unsorted

# ==============================================================================
# TESTING
# ==============================================================================

# Run tests
[group('dev')]
test:
    # TODO: Implement tests
    @echo -e "{{WARN}}No tests configured{{NORMAL}}"

# ==============================================================================
# CI/CD
# ==============================================================================

# Get current version
[group('ci')]
version:
    @echo "{{VERSION}}"

# Create new version (run semantic-release)
[group('ci')]
upversion:
    npx semantic-release

# Publish the plugin (placeholder - plugins don't need traditional publishing)
[group('ci')]
publish:
    @echo -e "{{SUCCESS}}Plugin published via git tag and GitHub release{{NORMAL}}"
    @echo -e "{{INFO}}Users install via: /plugin marketplace add cloudvoyant/claudevoyant{{NORMAL}}"
