#!/usr/bin/env bash
# Cross-platform desktop notification for Claude Code background agents.
# Usage: notify.sh <title> <message>
# Exits 0 on success, 1 if no notification method available (bell fallback always fires).

TITLE="${1:-Claude Code}"
MESSAGE="${2:-Task complete}"

# Sanitise for safe embedding
TITLE="${TITLE//\"/\\\"}"
MESSAGE="${MESSAGE//\"/\\\"}"

_notify_macos() {
  if command -v terminal-notifier &>/dev/null; then
    terminal-notifier -title "$TITLE" -message "$MESSAGE" -sound default 2>/dev/null && return 0
  fi
  osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" sound name \"default\"" 2>/dev/null
}

_notify_linux() {
  if command -v notify-send &>/dev/null; then
    notify-send -a "Claude Code" "$TITLE" "$MESSAGE" 2>/dev/null && return 0
  fi
  if command -v kdialog &>/dev/null; then
    kdialog --passivepopup "$TITLE: $MESSAGE" 5 2>/dev/null & return 0
  fi
  if command -v zenity &>/dev/null; then
    zenity --notification --text="$TITLE: $MESSAGE" 2>/dev/null & return 0
  fi
  return 1
}

_notify_windows_powershell() {
  # Works on native Windows (Git Bash / MSYS2 / Cygwin) and WSL
  command -v powershell.exe &>/dev/null || return 1
  # Try Windows toast notification (Windows 10+)
  powershell.exe -WindowStyle Hidden -NonInteractive -Command "
    try {
      \$null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
      \$tpl  = [Windows.UI.Notifications.ToastTemplateType]::ToastText02
      \$xml  = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent(\$tpl)
      \$nodes = \$xml.GetElementsByTagName('text')
      \$nodes[0].AppendChild(\$xml.CreateTextNode('$TITLE'))  | Out-Null
      \$nodes[1].AppendChild(\$xml.CreateTextNode('$MESSAGE')) | Out-Null
      [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Claude Code').Show(
        [Windows.UI.Notifications.ToastNotification]::new(\$xml)
      )
    } catch {
      # Fallback: legacy message box (blocking — only as last resort)
      msg '\''%username%'\'' '$TITLE: $MESSAGE' 2>NUL
    }
  " 2>/dev/null
}

_is_wsl() {
  grep -qi microsoft /proc/version 2>/dev/null
}

case "${OSTYPE:-}" in
  darwin*)
    _notify_macos || printf '\a'
    ;;
  linux*)
    if _is_wsl; then
      _notify_windows_powershell || _notify_linux || printf '\a'
    else
      _notify_linux || printf '\a'
    fi
    ;;
  msys*|cygwin*|mingw*)
    _notify_windows_powershell || printf '\a'
    ;;
  *)
    # Unknown OS — try everything
    _notify_macos 2>/dev/null || _notify_windows_powershell 2>/dev/null || _notify_linux 2>/dev/null || printf '\a'
    ;;
esac
