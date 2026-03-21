#!/usr/bin/env bash
# Detect task runners in the current project root.
# Outputs a summary of available runners and their key commands to stdout.
# Usage: TASK_RUNNER_SUMMARY=$(bash detect-task-runners.sh)

TASK_RUNNERS=()
[ -f justfile ] || [ -f Justfile ]                                                     && TASK_RUNNERS+=("just")
[ -f Makefile ]  || [ -f makefile ]                                                    && TASK_RUNNERS+=("make")
[ -f taskfile.yml ] || [ -f Taskfile.yml ] || [ -f taskfile.yaml ] || [ -f Taskfile.yaml ] && TASK_RUNNERS+=("task")
[ -f mise.toml ] || [ -f .mise.toml ]                                                  && TASK_RUNNERS+=("mise")
[ -f docker-compose.yml ] || [ -f docker-compose.yaml ]                                && TASK_RUNNERS+=("docker-compose")
[ -f package.json ]                                                                     && TASK_RUNNERS+=("npm/yarn/pnpm")
[ -f Rakefile ]                                                                         && TASK_RUNNERS+=("rake")
[ -f build.gradle ] || [ -f build.gradle.kts ]                                         && TASK_RUNNERS+=("gradle")
[ -f pom.xml ]                                                                          && TASK_RUNNERS+=("mvn")

if [ ${#TASK_RUNNERS[@]} -eq 0 ]; then
  echo "none detected"
  exit 0
fi

for runner in "${TASK_RUNNERS[@]}"; do
  echo "=== $runner ==="
  case "$runner" in
    just)         just --list 2>/dev/null ;;
    make)         make help 2>/dev/null || grep -E '^[a-zA-Z][a-zA-Z0-9_-]+:' Makefile 2>/dev/null | head -20 ;;
    task)         task --list 2>/dev/null ;;
    mise)         mise tasks 2>/dev/null ;;
    npm/yarn/pnpm) node -e "const p=require('./package.json'); Object.keys(p.scripts||{}).forEach(k=>console.log(k+': '+p.scripts[k]))" 2>/dev/null ;;
    *)            echo "(check --help or README for commands)" ;;
  esac
  echo ""
done
