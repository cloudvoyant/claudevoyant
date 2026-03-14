# Proposal Template

Each proposal agent writes `$PLAN_DIR/proposals/{approach-slug}.md` using this structure:

```markdown
# {Approach Name}

> {One-sentence verdict: what this approach is best suited for}

## Summary
{2–4 sentences describing the approach and how it fits the existing codebase.}

## Architecture
{Prose. Describe modules, layers, or components and how they relate. Reference
existing code/directories where concrete. 5–10 sentences max.}

## API Surface
{Key interfaces, components, routes, hooks, or data shapes — signatures/shapes
only, no implementations. 10–20 lines.}

## Technical Decisions
| Concern | This approach |
|---|---|
| {e.g., data fetching} | {e.g., server-side with SWR revalidation} |

## Implications
- **DX**: {developer experience — ease of extension, testing, reasoning about}
- **Performance**: {latency, bundle size, query cost, caching characteristics}
- **Security**: {surface area changes, new attack vectors, auth implications}
- **Future work**: {what this opens up or forecloses; migration cost later}

## Trade-offs
{2–3 sentences honestly comparing this to the other proposals. Name the downsides.}
```
