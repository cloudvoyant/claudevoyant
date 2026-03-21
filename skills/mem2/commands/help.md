# Command: help

Print the following text exactly as written. Do not reformat, add headers, or add commentary.

```
mem2 -- Team knowledge capture and recall via structured markdown docs

  /mem2 help
      List all commands

  /mem2 init  [--hook]
      One-time project bootstrap: writes CLAUDE.md session-start section, optionally adds Claude Code hook

  /mem2 learn  <knowledge or question>
      Capture team knowledge (learn mode) or recall existing knowledge (recall mode)

  /mem2 remember
      Session-start bulk dump: loads all indexed team knowledge into context

  /mem2 index
      Re-index project knowledge docs after manual edits outside of learn

  /mem2 find  [--type <type>] [--tag <tag>] [--json]
      Search indexed project knowledge docs by type and/or tag

All commands also work without the plugin via npx:
  npx @codevoyant/agent-kit mem index
  npx @codevoyant/agent-kit mem find --tag <tag> [--type <type>] [--json]
  npx @codevoyant/agent-kit mem remember
```
