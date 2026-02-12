Help me migrate this project to the latest nv-lib-template version using a spec-driven approach.

## Overview

This workflow helps you systematically upgrade your project to the latest template version by:
1. Detecting your current template version
2. Cloning the latest template for comparison
3. Creating a migration plan with all files to review
4. Working through changes methodically
5. Testing and validating the migration

## Steps

### 1. Detect Current Version

Check the template version this project is currently using:

```bash
grep NV_TEMPLATE_VERSION .envrc
```

If `NV_TEMPLATE_VERSION` doesn't exist in `.envrc`, this project was scaffolded before version tracking was added. Assume an older version and proceed with caution.

### 2. Clone Latest Template

Clone the latest template to `.nv/template-upstream-main` for comparison:

```bash
# Create directory if needed
mkdir -p .nv

# Clone template (or pull if already exists)
if [ -d ".nv/template-upstream-main" ]; then
    cd .nv/template-upstream-main && git pull && cd ../..
else
    git clone https://github.com/cloudvoyant/lib .nv/template-upstream-main
fi
```

### 3. Create Migration Plan

Use `/spec:new template-upgrade` to create a structured migration plan. I'll help you create this plan with:

Plan name: `template-upgrade` (or `template-upgrade-v{version}`)
Location: `.spec/plans/template-upgrade/plan.md`

Structure:
```markdown
# Migration Plan: v<current> → v<target>

## Objective
- Migrate from nv-lib-template v<current> to v<target>
- Update infrastructure files with latest improvements
- Preserve project-specific customizations
- Ensure all tests pass after migration

## Design
Systematic comparison and selective application of template changes

## Plan

### Phase 1 - Critical Infrastructure Files

1. [ ] Review justfile for recipe changes
2. [ ] Check scripts/setup.sh for new dependencies
3. [ ] Check scripts/scaffold.sh for improvements
4. [ ] Check scripts/upversion.sh for versioning updates
5. [ ] Check scripts/utils.sh for utility function updates
6. [ ] Review .github/workflows/ci.yml for workflow updates
7. [ ] Review .github/workflows/release.yml for release changes
8. [ ] Check .envrc.template for new variables

### Phase 2 - Configuration Files

1. [ ] Review .gitignore for new patterns
2. [ ] Check .gitattributes for line ending rules
3. [ ] Check .editorconfig for editor settings
4. [ ] Review .releaserc.json for semantic-release config

### Phase 3 - Claude Code Configuration

1. [ ] Check .claude/instructions.md for instruction updates
2. [ ] Check .claude/workflows.md for workflow improvements
3. [ ] Check .claude/style.md for style guide updates
4. [ ] Check .claude/commands/*.md for new/updated commands

### Phase 4 - IDE Configuration

1. [ ] Review .vscode/settings.json for editor settings
2. [ ] Check .vscode/extensions.json for recommended extensions
3. [ ] Check .devcontainer/* for devcontainer updates

### Phase 5 - Documentation

1. [ ] Review README.template.md for documentation updates
2. [ ] Check docs/architecture.md for architecture changes
3. [ ] Check docs/user-guide.md for user guide updates

### Phase 6 - Testing & Finalization

1. [ ] Run full test suite: just test
2. [ ] Verify builds work
3. [ ] Update NV_TEMPLATE_VERSION in .envrc
4. [ ] Check CI passes (if applicable)
5. [ ] Cleanup: rm -rf .nv/template-upstream-main

## Resources
1. [Template Repository](https://github.com/cloudvoyant/lib)
```

### 4. Work Through Plan Systematically

For each task in the migration plan:

#### a. Compare Files

```bash
# Example: Compare justfile
diff justfile .nv/template-upstream-main/justfile

# Or for directories
diff -r scripts/ .nv/template-upstream-main/scripts/
```

#### b. Review Changes

Determine if changes apply to this project:
- **Infrastructure changes** (workflows, scripts): Usually apply
- **Recipe changes** (justfile): May need customization
- **Configuration** (.envrc.template, .gitignore): Review carefully
- **Claude/IDE configs**: Apply improvements, preserve project-specific settings

#### c. Apply Changes

Apply relevant changes while preserving project-specific customizations:
- Copy improved scripts
- Merge workflow updates
- Update recipes as needed
- Preserve project-specific logic

#### d. Mark Complete

Update `.spec/plans/template-upgrade/plan.md` to mark task as completed, or use `/spec:refresh template-upgrade`.

#### e. Test Incrementally

After applying each significant change:
```bash
just test
```

### 5. Update Version

After all changes applied:

```bash
# Update .envrc with new version
sed -i.bak 's/^export NV_TEMPLATE_VERSION=.*/export NV_TEMPLATE_VERSION=<new-version>/' .envrc && rm .envrc.bak
direnv allow
```

### 6. Final Validation

Run full test suite and verify:

```bash
# Run tests
just test

# Check that all expected files exist
ls -la scripts/ .github/workflows/

# Verify .envrc has correct version
grep NV_TEMPLATE_VERSION .envrc
```

### 7. Cleanup

```bash
# Remove template clone
rm -rf .nv/template-upstream-main

# Archive migration plan
/spec:done template-upgrade
```

This will archive the completed migration plan to `.spec/plans/archive/`.

## Best Practices

- **Create plan first** - Use `/spec:new template-upgrade` before applying changes
- **Review all diffs** - Understand what changed and why
- **Preserve customizations** - Don't blindly copy template files
- **Test incrementally** - Verify after each significant change with `just test`
- **Commit before starting** - Clean working directory for safety
- **Document decisions** - Note in plan.md (Insights section) why you kept/skipped changes
- **Use spec workflow** - Use `/spec:go template-upgrade` to execute the migration plan systematically

## Common Issues

### Missing NV_TEMPLATE_VERSION

If `.envrc` doesn't have `NV_TEMPLATE_VERSION`, add it:

```bash
echo '' >> .envrc
echo '# Nedavellir template tracking' >> .envrc
echo 'export NV_TEMPLATE=nv-lib-template' >> .envrc
echo 'export NV_TEMPLATE_VERSION=<current-version>' >> .envrc
```

### Conflicting Changes

If you've heavily customized files that also changed in the template:
1. Review the template change carefully
2. Manually apply the improvement to your customized version
3. Document the merge in `.spec/plans/template-upgrade/plan.md` (add to Insights section)

### Failed Tests After Migration

If tests fail after applying changes:
1. Review what changed
2. Check if you need to update test configuration
3. Verify all dependencies are installed
4. Consult template's CHANGELOG.md for breaking changes
