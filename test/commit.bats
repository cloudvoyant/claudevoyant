#!/usr/bin/env bats
# Tests for /commit command

setup() {
    # Create a temporary git repository for testing
    TEST_DIR=$(mktemp -d)
    cd "$TEST_DIR"
    git init
    git config user.email "test@example.com"
    git config user.name "Test User"
}

teardown() {
    # Clean up test directory
    if [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ]; then
        cd /
        rm -rf "$TEST_DIR"
    fi
}

@test "/commit command file exists" {
    [ -f "$(dirname "$BATS_TEST_DIRNAME")/commands/commit.md" ]
}

@test "/commit generates conventional commit message format" {
    # This is a placeholder test - actual testing would require
    # Claude Code CLI integration
    # For now, we verify the command file has the required structure

    grep -q "conventional commit" "$(dirname "$BATS_TEST_DIRNAME")/commands/commit.md"
}

@test "/commit mentions semantic versioning" {
    grep -q "version bump" "$(dirname "$BATS_TEST_DIRNAME")/commands/commit.md"
}

@test "/commit includes commit types (feat, fix, docs, etc)" {
    local commit_file="$(dirname "$BATS_TEST_DIRNAME")/commands/commit.md"
    grep -q "feat:" "$commit_file"
    grep -q "fix:" "$commit_file"
    grep -q "docs:" "$commit_file"
}
