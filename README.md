# Mo'Help

Contextual Molang assistant plugin for [Blockbench](https://github.com/JannisX11/blockbench). See `about.md` for usage.

Plugin id: `mo_help` (IDs must be snake_case, so the apostrophe is only in the display title).

## Development

```bash
npm install
npm test          # unit tests (data integrity, fuzzy search, context matrix)
npm run build     # bundles src/ -> dist/mo_help.js (readable, not minified)
npm run watch
```

Load `dist/mo_help.js` in Blockbench with **File → Plugins → Load Plugin from File**.

## Layout

```
src/index.js       plugin registration, panel, context watcher, toggle action
src/panel.js       Vue component (search, chips, groups, learn mode)
src/contexts.js    context -> categories matrix + detection
src/insert.js      insertion into the focused field
src/search.js      fuzzy scoring
src/data/*.js      one file per category (add a file + register in data/index.js)
```

## CI / releases

`.github/workflows/build.yml` runs tests and the build on every push/PR and uploads `mo_help` as an artifact. Pushing a tag `vX.Y.Z` (matching `package.json`) also creates a GitHub Release with `mo_help.js`, `about.md` and `icon.png`.
For submission to `blockbench-plugins`, copy `dist/mo_help.js`, `about.md`, `icon.png`, `members.yml`, `LICENSE.MD` into `plugins/mo_help/` and add the entry to `plugins.json`; the bundle is unminified and the source is public, as that repo requires.

## Notes

* Undo: edits go through the field's own events, so Blockbench's native Undo handling applies (keyframe edits are committed when the field loses focus).
* The proposal's `change_panel` / `open_molang_editor` events do not exist in Blockbench; context is detected from focus, `Prop.active_panel`, the open Molang dialog and selection events instead.
