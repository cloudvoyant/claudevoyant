# Command: remember

Session-start bulk index dump. Loads all indexed team knowledge into context.

## Steps

1. Run:
```bash
npx @codevoyant/agent-kit mem remember
```

2. Print the terse table output directly into context. Do not reformat or add commentary.

3. If `CLAUDE.md` does not contain `mem remember` and this appears to be a first run,
append a non-blocking tip:

```
Tip: run /mem2 init to configure automatic loading every session.
```

Do NOT ask a blocking question. Keep remember fast and non-interactive.
