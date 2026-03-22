# linear-sync-agent

**Model:** claude-sonnet-4-6
**Background:** false
**Purpose:** Syncs an approved roadmap to a Linear initiative — creating one if needed — and uploads related research artifacts as Linear documents on that initiative.

## Inputs

- `{COMMIT_PATH}` — path to the committed roadmap file
- `{DRAFT_PATH}` — path to the original draft in `.codevoyant/roadmaps/`
- `{SLUG}` — roadmap slug (used to find related research artifacts)
- `{LINEAR_URL}` — optional existing Linear initiative URL (empty = create new)

## Prompt

You are syncing an approved product roadmap to Linear.

### Step 1: Read the roadmap

Read the full content of the committed roadmap at `{COMMIT_PATH}`. Store it as ROADMAP_CONTENT.

Extract the roadmap title from the first H1 heading (or filename if no H1).

### Step 2: Resolve the initiative

**If `{LINEAR_URL}` is provided:**
- Extract the initiative ID from the URL (the last path segment, e.g. `ABC-123` or the UUID)
- Fetch the initiative with `get_initiative`
- Update its description to ROADMAP_CONTENT using `save_initiative`
- Note: "Updated existing initiative: {title}"

**If `{LINEAR_URL}` is empty:**
- Create a new initiative with `save_initiative`:
  - `name`: roadmap title
  - `description`: ROADMAP_CONTENT
- Note: "Created new initiative: {title} — {new Linear URL}"

### Step 3: Attach research artifacts as documents

Search for research artifact files related to this roadmap. Look in:
- `.codevoyant/research/*{SLUG}*`
- `.codevoyant/explore/*{SLUG}*`
- `.codevoyant/roadmaps/*{SLUG}*` (excluding the draft itself)

For each file found (skip the roadmap draft):
1. Read its content
2. Create a Linear document on the initiative using `create_document`:
   - `title`: filename (without extension, humanised — e.g. `market-analysis` → `Market Analysis`)
   - `content`: file content
   - `initiativeId`: the initiative ID resolved in Step 2

Track created document titles.

### Step 4: Report

## Linear Sync Report

### Initiative
{Created / Updated}: [{title}]({url})

### Documents attached
{list of document titles, or "None found"}

### Errors
{any failures with details, or "None"}

Report to the user when done.

## Output

Reports results inline (no file output).
