---
type: styleguide
tags: [docs, frontmatter, convention, memory]
description: Frontmatter convention for project knowledge docs — defines how agents index and find documents
---

# Docs Frontmatter Convention

Agents look up docs by tag and type, not by path. Directory layout is the human's choice — agents don't care. The only convention that matters is frontmatter.

## Required Fields

```yaml
---
type: architecture | styleguide | prd | roadmap | reference | recipe
tags: [comma, separated, tags]
---
```

- **type** — categorizes the document for filtering. Use one of the listed values.
- **tags** — freeform labels for search. Use lowercase, hyphenated slugs.

Both `type` and `tags` are required for a doc to be indexed. Docs without frontmatter (or missing type/tags) are simply not indexed — no error is raised.

## Recommended Fields

```yaml
description: One sentence — helps LLMs judge relevance without reading the file
```

- **description** — included in `mem.json` so agents can judge relevance from the index alone, without opening the file. Strongly recommended.

## Optional Fields

```yaml
date: YYYY-MM-DD
status: draft | active | archived
```

- **date** — include for PRDs and roadmaps; omit for evergreen docs.
- **status** — defaults to `active` if omitted.
  - `draft` — indexed but marked as incomplete.
  - `active` — indexed (default).
  - `archived` — excluded from `mem.json` entirely.

## Type Reference

| Type | Use for |
|------|---------|
| `architecture` | System design, component relationships, data flow |
| `styleguide` | Conventions, coding standards, this document |
| `prd` | Product requirements, feature specs |
| `roadmap` | Timelines, milestones, release plans |
| `reference` | API docs, config options, lookup tables |
| `recipe` | How-to guides, common tasks, patterns, runbooks |

## Example

```yaml
---
type: recipe
tags: [deployment, staging, docker]
description: Step-by-step guide to deploy the staging environment using Docker Compose
date: 2026-03-15
---
```
