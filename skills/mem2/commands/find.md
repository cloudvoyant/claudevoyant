# Command: find

Search indexed project knowledge docs by type and/or tag.

## Steps

1. Extract `--type`, `--tag`, and `--json` from the user's request. Infer type/tag from
natural language if not explicitly provided.

2. Run:
```bash
npx @codevoyant/agent-kit mem find [--type <type>] [--tag <tag>] [--json]
```

3. Print matching paths (or full JSON entries if `--json` was specified).

If no matches, suggest broadening the search or using `/mem2 learn` to capture new knowledge.
