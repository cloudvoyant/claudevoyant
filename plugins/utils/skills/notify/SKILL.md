---
description: Send a cross-platform desktop notification with automatic [project @ branch] context prefix. Invoked by em, pm, and other plugins when background tasks complete. Never auto-trigger from user messages — only called by other skills.
argument-hint: "<title> <message>"
user-invocable: false
model: claude-haiku-4-5-20251001
---

Send a desktop notification using the Bash tool. Run the following, substituting `<title>` and `<message>` with the first and second arguments:

```bash
_TITLE="<title>"
_MESSAGE="<message>"
_GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
_PROJECT="$(basename "${_GIT_ROOT:-$(pwd)}")"
_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
if [ -n "$_BRANCH" ] && [ "$_BRANCH" != "HEAD" ]; then
  _CONTEXT="[$_PROJECT @ $_BRANCH]"
else
  _CONTEXT="[$_PROJECT]"
fi
case "${OSTYPE:-}" in
  darwin*)
    if command -v terminal-notifier >/dev/null 2>&1; then
      terminal-notifier -title "$_CONTEXT" -subtitle "$_TITLE" -message "$_MESSAGE" -sound default 2>/dev/null
    else
      osascript -e "display notification \"$_MESSAGE\" with title \"$_CONTEXT — $_TITLE\" sound name \"default\"" 2>/dev/null
    fi
    ;;
  linux*)
    _FULL="$_CONTEXT — $_TITLE"
    if command -v notify-send >/dev/null 2>&1; then
      notify-send "$_FULL" "$_MESSAGE" 2>/dev/null
    elif command -v kdialog >/dev/null 2>&1; then
      kdialog --passivepopup "$_FULL: $_MESSAGE" 5 2>/dev/null
    elif command -v zenity >/dev/null 2>&1; then
      zenity --notification --text="$_FULL: $_MESSAGE" 2>/dev/null
    else
      printf '\a'
    fi
    ;;
  msys*|cygwin*)
    _FULL="$_CONTEXT — $_TITLE"
    powershell.exe -WindowStyle Hidden -Command "msg '%username%' '$_FULL: $_MESSAGE'" 2>/dev/null || printf '\a'
    ;;
  *)
    if grep -qi microsoft /proc/version 2>/dev/null; then
      _FULL="$_CONTEXT — $_TITLE"
      powershell.exe -WindowStyle Hidden -Command "msg '%username%' '$_FULL: $_MESSAGE'" 2>/dev/null || printf '\a'
    else
      printf '\a'
    fi
    ;;
esac
```

After running the bash block, output nothing further.
