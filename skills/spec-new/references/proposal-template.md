# Proposal Template

Each proposal agent writes `$PLAN_DIR/proposals/{approach-slug}.md` using this structure.

> **Annotation syntax**: Proposals live in the plan dir and can be refined inline using `>` for a comment (observation or question) and `>>` for a decision (a choice that has been locked in). This lets reviewers annotate the proposal without rewriting it.

> **Diagrams**: When explaining flows, data movement, or component relationships, use text-based diagrams — ASCII art or mermaid fenced code blocks. Do not use tables to represent sequential steps or system flows.

> **Stay current**: If subsequent implementation decisions diverge from this proposal, the agent working on the plan should prompt to update this document so it remains an accurate record.

```markdown
# {Approach Name}

> {One-sentence verdict: what this approach is best suited for. Name the primary trade-off in the same sentence.}

## Introduction
{2–4 sentences describing the approach and how it fits the existing codebase.}

## Requirements
{Constraints and quality bar this approach must satisfy. Reference the specific problem it is solving.}

## Design
{Prose. Describe modules, layers, or components and how they relate. Reference existing code/directories where concrete. 5–10 sentences max.}

### API Surface
{Key interfaces, components, routes, hooks, or data shapes — signatures/shapes only, no implementations. 10–20 lines.}

### Technical Decisions

**{Concern 1 — e.g., data fetching}**
{Prose explanation of the decision and rationale. 1–3 sentences.}

### Flow Diagram
```mermaid
flowchart TD
    A[{entry point}] --> B[{step}]
    B --> C[{outcome}]
```

## Implementation
{Show the key directories/files this approach would create or modify.}

```
{project-root}/
├── {key-dir}/
│   └── {module-a}/   # {what it does}
```

## Future Work
- **DX**: {developer experience — ease of extension, testing}
- **Performance**: {latency, bundle size, query cost}
- **Security**: {surface area changes}
- **Trade-offs**: {2–3 sentences honestly naming the downsides of this approach vs. alternatives}
- **Open questions**: {what this opens up or forecloses}

## References
- {Link to ADR, related plan, external doc, or prior art}
```
