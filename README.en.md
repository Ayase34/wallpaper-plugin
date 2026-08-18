# wallpaper-plugin — DSH Wallpaper Plugin

中文: [README.md](README.md) | English

A third-party plugin for DSH (DeepSeek Harness): theme preset management and a wallpaper system. After installation, a new "Appearance Presets" option appears in the Settings page.

## Features

- **Preset wall**: one-click card switching + covers + diff warnings; deep editing in the Studio (raw tokens / CSS patches / theme registration / asset widgets)
- **Wallpaper library**: upload images (≤20MB each, up to 100) → assign to three widgets (16:9 chat background / 1:1 settings card / 1:5 sidebar poster), fixed-ratio cropping, per-scheme (light/dark) configuration, opacity
- **Layer-composited wallpaper**: collage multiple images; multiple GIFs are composed on a shared timeline into a real animated GIF; a single animated layer automatically uses **layered output**
- **AI tools**: 12 `preset_*` / `asset_*` tools (conversational theming: create / apply / tweak / self-correct)
- **Sharing**: zip export (preset + cover + **all assets embedded**) and full import restore (including layered specs)

## Installation

### Steps

```sh
# Install into a profile
dsh plugin --profile <name> add github:Ayase34/wallpaper-plugin
```

### Optional config

In the profile's `cordis.patch.yml`:

```yaml
- id: wallpaper-plugin
  config:
    presetsDir: C:/your-presets-dir   # optional; default <dshHome>/.ui-presets
    assetsDir: C:/your-assets-dir     # optional; default <presetsDir>/assets
```

## Quick Start

1. Settings → "Appearance Presets" → apply the factory preset
2. In the Studio's "Assets & Widgets" section, upload an image → click "Set as chat background" (auto-crops at 16:9)
3. Sharing: "Export ZIP" → send it to someone → they "Import" it in the Studio / preset wall

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
