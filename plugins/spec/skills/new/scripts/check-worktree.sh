#!/usr/bin/env bash
# Detect whether the current directory is inside a git worktree (not the main repo).
# Exits 0 (true) if in a worktree, exits 1 if in the main repo or not in git at all.

COMMON_DIR=$(git rev-parse --git-common-dir 2>/dev/null) || exit 1
GIT_DIR=$(git rev-parse --git-dir 2>/dev/null)           || exit 1

[ "$COMMON_DIR" != "$GIT_DIR" ]
