## [1.1.2](https://github.com/cloudvoyant/claudevoyant/compare/v1.1.1...v1.1.2) (2025-11-17)

### Bug Fixes

* docs updated

* updated semantic release config based on new dir structure


### Code Refactoring

* move plugins into plugins directory

Restructures repository to match Anthropic's official marketplace
layout with all plugins under a single plugins/ parent directory.
Updates marketplace.json source paths accordingly.

## [1.1.1](https://github.com/cloudvoyant/claudevoyant/compare/v1.1.0...v1.1.1) (2025-11-16)

### Bug Fixes

* use relative paths in marketplace.json for monorepo structure

Changes plugin sources from GitHub object format to relative paths,
following Anthropic's recommended pattern for monorepo marketplaces.
Also corrects outdated plugin name in README installation example.

## [1.1.0](https://github.com/cloudvoyant/claudevoyant/compare/v1.0.3...v1.1.0) (2025-11-16)

### Features

* restructure into three plugins and add repository diff command

Splits monolithic plugin into specialized plugins:
- claudevoyant-adr: Architecture Decision Records
- claudevoyant-dev: Development workflows (docs, review, commits, diff)
- claudevoyant-spec: Specification-driven development

Adds new /diff command to compare repositories and generate
comprehensive diff reports with insights and analysis.

Updates marketplace.json to reference three separate plugins
with individual paths and descriptions.


### Bug Fixes

* remove claudevoyant prefix from plugin names

Fixes plugin installation by ensuring plugin names match between
marketplace.json and individual plugin.json files. Removes the
obsolete root plugin.json as the repository now contains three
separate plugins (adr, dev, spec).

* update semantic-release config for multi-plugin structure

Updates semantic-release to handle three separate plugins (adr, dev, spec)
instead of single root plugin. Simplifies commit command documentation
by removing redundant verification steps.


### Documentation

* improve installation instructions with CLI commands and version-specific installation

## [1.0.3](https://github.com/cloudvoyant/claudevoyant/compare/v1.0.2...v1.0.3) (2025-11-16)

### Bug Fixes

* modifying plugin.json to use https with git repos

## [1.0.2](https://github.com/cloudvoyant/claudevoyant/compare/v1.0.1...v1.0.2) (2025-11-16)

### Bug Fixes

* correct marketplace.json

* correct marketplace.json source

  format for GitHub

## [1.0.1](https://github.com/cloudvoyant/claudevoyant/compare/v1.0.0...v1.0.1) (2025-11-16)

### Bug Fixes

* owner field must be an object in marketplace.json

## 1.0.0 (2025-11-16)

### Features

* initialize claudevoyant plugin

Create Claude Code plugin with professional workflow commands:
- Planning workflow (/plan)
- Conventional commits (/commit)
- Template upgrades (/upgrade, /adapt)
- Documentation (/docs, /adr-new, /adr-capture)
- Code review (/review)

Infrastructure:
- Semantic versioning with semantic-release
- CI/CD with GitHub Actions
- BATS testing framework
- Comprehensive documentation


### Bug Fixes

* correct marketplace.json schema

Add required name and owner fields, fix source path format


### Code Refactoring

* remove unnecessary environment and script dependencies

- Remove .envrc files (not needed for plugin)
- Remove scripts directory (use semantic-release directly)
- Simplify justfile to not require direnv
- Update release workflow to use npx semantic-release
