# Repository Comparison Report Template

Use this structure when writing `.claude/diff.md`. Fill in all placeholder values — don't leave `<angle bracket>` tokens in the output.

---

# Repository Comparison Report

Generated: <timestamp>
Skill: `/diff <repository-url>`

## Objective

<User's stated objective>

**Source Repository:** <current repo path/name>
**Target Repository:** <cloned repo URL>
**Relationship:** <Similar Structure | Different Structure>

## Executive Summary

<2-3 sentence overview of key findings>

## Insights

### Meaningful Change Groups

<For similar structures: Group changes by theme/feature/type>
<For different structures: Key architectural and design differences>

#### Group 1: <Category Name>

- <Insight point 1>
- <Insight point 2>
- <Insight point 3>

<Continue for all groups>

### Key Differences Summary

**Added Features/Files:**

- <Feature/file 1>

**Removed Features/Files:**

- <Feature/file 1>

**Architectural Differences:**

- <Difference 1>

## Detailed Diff

### Repository Statistics

| Metric        | Source  | Target  |
| ------------- | ------- | ------- |
| Total Files   | <count> | <count> |
| Source Files  | <count> | <count> |
| Config Files  | <count> | <count> |
| Documentation | <count> | <count> |
| Lines of Code | <count> | <count> |

---

## For Similar Structures: File Changes

### Modified Files (<count>)

#### `<file-path>`

**Change Summary:** <Brief description>

**Key Changes:**
- <Change 1>
- <Change 2>

```diff
<diff content for significant files>
```

### Added Files (<count>)

- `<file-path>` — <purpose>

### Removed Files (<count>)

- `<file-path>` — <purpose>

---

## For Different Structures: Architectural Comparison

### Project Structure

**Source:**
```
<directory tree>
```

**Target:**
```
<directory tree>
```

### Technology Stack

| Component       | Source      | Target      |
| --------------- | ----------- | ----------- |
| Language        | <lang>      | <lang>      |
| Framework       | <framework> | <framework> |
| Build Tool      | <tool>      | <tool>      |
| Package Manager | <manager>   | <manager>   |

### Key Architectural Differences

1. <Difference 1 with explanation>
2. <Difference 2 with explanation>

---

## Recommendations

1. <Recommendation 1>
2. <Recommendation 2>

## Appendix

**Temp Directory:** `<temp-dir-path>` (cleaned up after analysis)
