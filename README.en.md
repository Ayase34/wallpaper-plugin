# wallpaper-plugin — DSH Wallpaper Plugin

A third-party plugin for DSH (DeepSeek Harness): theme preset management and a wallpaper system. Adds an "Appearance Presets" entry in Settings plus a full-screen Studio — a wallpaper asset library (chat background / settings card / sidebar poster) and layer-composited wallpapers (multi-image collage, multi-GIF animation composition, layered output).

- Version: **1.0.0** (final release, formerly ui-presets)
- Factory preset: "默认" (Default, ocean blue style, 15 tokens, preset_check clean)
- License: MIT ｜ 中文: [README.md](README.md)

## Features

- **Preset wall**: one-click card switching + covers + diff warnings; deep editing in the Studio (raw tokens / CSS patches / theme registration / asset widgets)
- **Wallpaper library**: upload images (≤20MB each, up to 100) → assign to three widgets (16:9 chat background / 1:1 settings card / 1:5 sidebar poster), fixed-ratio cropping, per-scheme (light/dark) configuration, opacity
- **Layer-composited wallpaper**: collage multiple images (drag / scale / rotate / opacity / z-order / undo); multiple GIFs are composed on a shared timeline into a real animated GIF; a single animated layer automatically uses **layered output** (static base + native animation — photos are never baked into the GIF, keeping files small)
- **AI tools**: 12 `preset_*` / `asset_*` tools (conversational theming: create / apply / tweak / self-correct)
- **Sharing**: zip export (preset + cover + **all assets embedded**) and full import restore (including layered specs)

## Installation

### Requirements

- A DSH desktop or web profile (must include `@deepseek-ai/dsh-web-app`; headless profiles have no UI)
- Node.js ≥ 20.11 (required for building)

### Steps

```sh
# 1) Build — DSH_CHECKOUT must point to your deepseek-harness checkout
#    (the build bundles its vendor/schemastery + vendor/cosmokit; see "Development")
#    Windows PowerShell:
#    $env:DSH_CHECKOUT = "C:/path/to/deepseek-harness"
cd wallpaper-plugin
npm install          # or: pnpm install (installs the esbuild devDependency)
npm run build

# 2) Install into a profile
dsh plugin --profile <name> add <this-directory>
```

Manual install (equivalent): edit `$DSH_HOME/profiles/<name>/package.json` — add `"wallpaper-plugin": "link:<this-directory>"` to `dependencies`, append `wallpaper-plugin` to the `dsh.profile.bundles` list, then run `pnpm install` inside that profile directory.

### If the app fails to start

The plugin has zero-throw guards, but if the app still won't start (same fail-loud semantics as official plugins):

1. Edit `$DSH_HOME/profiles/<name>/cordis.patch.yml` and add:
   ```yaml
   - id: wallpaper-plugin
     disabled: true
   ```
2. Restart the app — it should boot normally.
3. Report the issue to the author, then remove those two lines to re-enable.

### Optional config

In the profile's `cordis.patch.yml`:

```yaml
- id: wallpaper-plugin
  config:
    presetsDir: C:/your-presets-dir   # optional; default <dshHome>/.ui-presets
    assetsDir: C:/your-assets-dir     # optional; default <presetsDir>/assets
```

⚠️ A wrong config type (e.g. a number) fails the plugin → the app won't start.

## Quick Start

1. Settings → "Appearance Presets" → apply the factory preset "默认" (ocean blue theme)
2. In the Studio's "Assets & Widgets" section, upload an image → click "Set as chat background" (auto-crops at 16:9)
3. For animation/collage: open "Layer-composited wallpaper" → add layers from the palette, arrange → "Compose & upload" → pick it in the widget dropdown
4. Sharing: "Export ZIP" → send it to someone → they "Import" it in the Studio / preset wall

## Development

```sh
npm run build                # build lib/core.mjs + .dsh-plugin/* (needs DSH_CHECKOUT)
npm run check:client         # artifact consistency guard (--check)
npm test                     # build + unit tests (183 tests)
node scripts/selfcheck.mjs   # one-shot self-check: build/unit/install/data integrity
node scripts/run-regression.mjs  # full e2e suite (31 scripts; needs a spike profile + env vars)
```

- **Build dependency**: `DSH_CHECKOUT` must explicitly point to the deepseek-harness checkout (vendor/schemastery + vendor/cosmokit are bundled — static external imports break desktop startup); same for catalog generation: `node scripts/gen-catalog.mjs --dsh <checkout>`
- **e2e env vars (required)**: `UIP_PLAYWRIGHT_DIR` (playwright package dir) and `UIP_CHROMIUM` (chromium executable); point `DSH_HOME` at an isolated test dir (e2e-home). Tests always use a separate spike profile + port 3180 and never touch real profiles

## License

MIT
