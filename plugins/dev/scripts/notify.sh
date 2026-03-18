#!/usr/bin/env bash
# Redirects to utils/scripts/notify.sh — kept for backwards compatibility
_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bash "$_DIR/../../utils/scripts/notify.sh" "$@"
