Compare the current repository with another repository to identify changes and insights.

## Overview

The `/diff` command enables comparison between the current repository and a target repository specified by URL. It identifies structural similarities, conducts detailed file-by-file analysis, and produces a comprehensive diff report with meaningful insights.

## Command Syntax

```
/diff <repository-url>
```

**Parameters:**

- `repository-url` (required): Git repository URL to compare against (HTTPS or SSH)

## Workflow

### Step 1: Gather Context

1. Ask the user for the diff objective using AskUserQuestion:

   - "What is the purpose of this comparison?"
   - Provide options:
     - "Track changes from template/fork" - Identify modifications made after forking
     - "Architectural comparison" - Compare design patterns and structure
     - "Migration analysis" - Understand differences for migration planning
     - "Code review" - Review changes between similar projects
     - "Custom" - User provides specific objective

2. Store the user's objective for the report

### Step 2: Clone Target Repository

1. Create a temporary directory using system temp location:

   ```bash
   mktemp -d
   ```

2. Clone the target repository into the temp directory:

   ```bash
   git clone <repository-url> <temp-dir>/target-repo
   ```

3. Handle clone errors gracefully:
   - Authentication failures
   - Invalid URLs
   - Network issues
   - Repository not found

### Step 3: Analyze Repository Structure

1. **Map directory structures** for both repositories:

   - Use `find` or directory traversal to build tree structures
   - Identify top-level directories and organization patterns
   - Note framework/language indicators (package.json, Cargo.toml, go.mod, etc.)

2. **Calculate structural similarity**:

   - Compare directory hierarchies
   - Identify common file patterns
   - Determine if repositories share a template/forking relationship

3. **Classification**:
   - **Similar structure** (>60% overlap): Proceed with detailed file-by-file diff
   - **Different structure** (<60% overlap): Focus on architectural comparison

### Step 4: Detailed Analysis

#### For Similar Structures (Template/Fork Relationship)

1. **File-level comparison**:

   - Generate list of all files in both repos
   - Categorize files:
     - Modified files (exist in both, different content)
     - Added files (only in current repo)
     - Removed files (only in target repo)
     - Identical files (same content)

2. **Conduct file-by-file diff**:

   - Use `git diff --no-index` for meaningful files
   - Focus on source code, configuration, and documentation
   - Skip binary files, dependencies (node_modules, vendor, etc.)
   - Capture line-level changes for key files

3. **Group changes meaningfully**:

   - By feature/functionality (auth changes, UI updates, etc.)
   - By file type (configuration, source code, tests, docs)
   - By impact level (breaking, enhancement, refactor, fix)

4. **Extract insights**:
   - Identify patterns in modifications
   - Detect new features or capabilities
   - Note removed functionality
   - Highlight configuration differences

#### For Different Structures (Architectural Comparison)

1. **Architectural analysis**:

   - Identify framework and language differences
   - Compare project organization patterns
   - Note build system differences
   - Identify dependency management approaches

2. **Design pattern comparison**:

   - Frontend architecture (if applicable)
   - Backend architecture (if applicable)
   - State management approaches
   - API design patterns
   - Testing strategies

3. **Coding style analysis**:
   - Language/framework choices
   - Naming conventions
   - Code organization philosophy
   - Documentation approaches
   - Error handling patterns

### Step 5: Generate Diff Report

Create `.claude/diff.md` with the following structure:

````markdown
# Repository Comparison Report

Generated: <timestamp>
Command: `/diff <repository-url>`

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

#### Group 2: <Category Name>

- <Insight point 1>
- <Insight point 2>

<Continue for all groups>

### Key Differences Summary

**Added Features/Files:**

- <Feature/file 1>
- <Feature/file 2>

**Removed Features/Files:**

- <Feature/file 1>
- <Feature/file 2>

**Architectural Differences:**

- <Difference 1>
- <Difference 2>

## Detailed Diff

<For similar structures: File-by-file changes>
<For different structures: Structural comparison>

### Repository Statistics

| Metric        | Source  | Target  |
| ------------- | ------- | ------- |
| Total Files   | <count> | <count> |
| Source Files  | <count> | <count> |
| Config Files  | <count> | <count> |
| Documentation | <count> | <count> |
| Lines of Code | <count> | <count> |

### File Changes

<For similar structures only>

#### Modified Files (<count>)

##### `<file-path-1>`

**Change Summary:** <Brief description>

**Key Changes:**

- <Change 1>
- <Change 2>

<For significant files, include relevant diff snippets>

```diff
<diff content>
```
````

##### `<file-path-2>`

<Continue for all modified files>

#### Added Files (<count>)

- `<file-path>` - <Purpose/description>
- `<file-path>` - <Purpose/description>

#### Removed Files (<count>)

- `<file-path>` - <Purpose/description>
- `<file-path>` - <Purpose/description>

### Architectural Comparison

<For different structures only>

#### Project Structure

**Source:**

```
<Directory tree or key structure>
```

**Target:**

```
<Directory tree or key structure>
```

#### Technology Stack

| Component       | Source      | Target      |
| --------------- | ----------- | ----------- |
| Language        | <lang>      | <lang>      |
| Framework       | <framework> | <framework> |
| Build Tool      | <tool>      | <tool>      |
| Package Manager | <manager>   | <manager>   |

#### Design Patterns

**Source:** [Description of patterns used]

**Target:** [Description of patterns used]

#### Key Architectural Differences

1. <Difference 1 with explanation>
2. <Difference 2 with explanation>

## Recommendations

<Based on the objective and findings, provide actionable recommendations>

1. <Recommendation 1>
2. <Recommendation 2>

## Appendix

**Diff Command:** `<full command used>`
**Generated By:** Claude Code /diff command
**Temp Directory:** `<temp-dir-path>` (cleaned up after analysis)

````

### Step 6: Cleanup

1. Remove the temporary directory:
   ```bash
   rm -rf <temp-dir>
````

2. Confirm successful cleanup

3. Display completion message:

   ```
   ✅ Repository comparison complete!

   Report saved to: .claude/diff.md

   Summary:
   - <X> files analyzed
   - <Y> meaningful change groups identified
   - <Z> key insights extracted
   ```

## Error Handling

1. **Clone failures**:

   - Display clear error message
   - Suggest authentication setup if needed
   - Verify repository URL format

2. **Permission issues**:

   - Check write access to temp directory
   - Verify .claude/ directory exists and is writable

3. **Large repositories**:

   - Warn if repository is very large (>1GB)
   - Ask user to confirm before proceeding
   - Consider shallow clone: `git clone --depth=1`

4. **Binary file handling**:

   - Skip binary files in detailed diff
   - List binary files separately in report

5. **Memory/performance**:
   - Use streaming for large diffs
   - Limit diff context for very large files
   - Sample files if repository has thousands of files

## Implementation Notes

1. **Tool Usage**:

   - Use Bash for git operations and file system commands
   - Use Read tool for file content analysis
   - Use Grep/Glob for file discovery and pattern matching
   - Use Write tool to create the diff.md report

2. **Diff Strategy**:

   - Use `git diff --no-index` for comparing files
   - Use `diff -qr` for quick directory comparison
   - Parse git diff output for structured analysis

3. **Performance**:

   - Parallelize file reading where possible
   - Skip irrelevant directories (node_modules, .git, build, dist)
   - Focus detailed analysis on source code files

4. **Accuracy**:
   - Use git to normalize line endings
   - Ignore whitespace-only changes (configurable)
   - Handle renamed files appropriately

## Examples

### Example 1: Template Comparison

```bash
/diff https://github.com/original/template-repo
```

**User Objective:** "Track changes from template/fork"

**Result:** Detailed file-by-file diff showing customizations made to template

### Example 2: Architectural Study

```bash
/diff https://github.com/competitor/similar-product
```

**User Objective:** "Architectural comparison"

**Result:** High-level comparison of design patterns, tech stack, and organization

### Example 3: Migration Analysis

```bash
/diff https://github.com/company/legacy-app
```

**User Objective:** "Migration analysis"

**Result:** Detailed breakdown of changes needed for migration, grouped by complexity
