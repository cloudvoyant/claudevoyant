# Plugin Wiring Reference

When a new plugin or skill is added to claudevoyant, four files must be updated:

## 1. `.claude-plugin/marketplace.json`

Add a new entry to the `plugins` array:
```json
{
  "name": "plugin-name",
  "description": "Brief description of what this plugin provides",
  "source": "./plugins/plugin-name"
}
```

## 2. `.releaserc.json` — `@semantic-release/exec` prepareCmd

The inline Node.js script bumps all plugin.json versions on release. Add the new plugin to the array:
```js
// Before:
['dev','em','memory','pm','spec','ux'].forEach(p => { ... })

// After (add 'plugin-name' in alphabetical order):
['dev','em','memory','plugin-name','pm','spec','ux'].forEach(p => { ... })
```

## 3. `.releaserc.json` — `@semantic-release/git` assets

Add the plugin's `plugin.json` to the git commit assets:
```json
"assets": [
  "CHANGELOG.md",
  "version.txt",
  ...,
  "plugins/plugin-name/.claude-plugin/plugin.json",
  "packages/agent-kit/package.json"
]
```

## 4. `.github/workflows/release.yml` — GitHub Release files

Add the plugin's `plugin.json` to the release artifact list:
```yaml
- name: GitHub Release
  uses: softprops/action-gh-release@v1
  with:
    files: |
      CHANGELOG.md
      plugins/dev/.claude-plugin/plugin.json
      ...
      plugins/plugin-name/.claude-plugin/plugin.json
```

## 5. Plugin Completeness

Every claudevoyant plugin must have `allow` and `help` skills:
- `plugins/{plugin}/skills/allow/SKILL.md`
- `plugins/{plugin}/skills/help/SKILL.md`

Copy from `plugins/dev/skills/allow` and `plugins/dev/skills/help` as templates, then update name/description.

## 6. CI Validation

Run to confirm everything passes:
```bash
mise run skills:validate
```
