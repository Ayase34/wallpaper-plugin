# wallpaper-plugin — DSH Beautifier

中文: [README.md](README.md) | English

A third-party plugin for DSH (DeepSeek Harness): **skins + wallpapers + English/Chinese UI**.
After installation a new "Appearance presets" section appears in Settings.

- **Skins**: preset wall + 27 semantic knobs + 369 per-token editors + CSS patches + native theme registration
- **Wallpapers**: asset library / image URLs / built-in gradients / timed rotation / layer collage (multi-GIF timeline)
- **Collaboration & sharing**: 13 AI tools, share links & share codes, full ZIP delivery, zh/en switch

## Features

### Skins

- **Preset wall**: one-click card switching, covers, diff warnings, **favorites / favorites-only / surprise me**
- **Knob layer**: 27 semantic knobs in 6 groups (layout surfaces, layers, accent, typography, feedback, layout).
  Color knobs write **both schemes at once** by default; tick "edit light/dark separately" for side-by-side inputs.
  Tokens hand-edited inside a knob's bundle are marked "per-token override" — never silently overwritten
- **Raw tokens**: 369-token editor with descriptions, group tinting (recolor a whole group), search, undo, safety tiers
- **CSS patches**: `[data-*]` selector whitelist, braces forbidden, inline validation, live preview, undoable
- **Native theme registration**: register a preset as a real DSH theme so it shows up under Settings → Appearance
- **Factory preset "Default"**: 36 tokens covering 20/27 color knobs, full-bleed 3:1 cover, dedicated dark wallpapers

### Wallpapers

- **Asset library**: upload images (≤20MB each, up to 100) → assign to three widgets
  (16:9 chat / 1:1 settings card / 1:5 sidebar poster), fixed-ratio cropping, per-scheme config, opacity
- **Wallpaper 2.0**: each widget can use **a local asset / an image URL (http/https) / one of 8 built-in gradients**.
  URLs and gradients skip cropping (no source-pixel semantics); dark-specific URL and gradient supported
- **Timed rotation**: 2–20 URLs, 5 minutes–7 days; pauses while the window is hidden, catches up when you return,
  and never fires while a draft is being edited. Config stays on this device — **never in the preset or share code**
- **Layer collage**: collage small images; multiple GIFs composed on a shared timeline into a real animated GIF;
  a single animated layer automatically uses **layered output**

### Collaboration & sharing

- **AI tools**: 13 `preset_*` / `asset_*` tools (conversational theming: create / apply / tweak / self-check / revert)
- **Share link / share code**: URL-hash payload that works across machines; carries tokens (light & dark), CSS patches,
  widget crops and theme registration, while assets travel by reference with the missing count made explicit.
  Import only writes to the library — it never applies automatically
- **ZIP bundle**: preset + cover + **all assets embedded**, restoring layered specs on import
- **zh/en UI**: all interface copy switches language (EN / 中文 on the wall, remembered locally);
  content such as Chinese token descriptions stays untranslated

## What's new (v1.1.0)

- **Knob layer restored** (the capability existed, the entry point had been removed)
- **Wallpaper 2.0**: image URLs / built-in gradients / timed rotation
- **Share link & share code**, favorites & surprise-me, imports no longer hijack the open draft
- **zh/en UI** (zh source dictionary + en key-for-key, key parity enforced by tests)
- Factory preset 15 → **36 tokens**, knob coverage 9/27 → **20/27**; brand blue and light tertiary text now meet contrast
- Fixed **cover crop semantics** (the old renderer treated the placement rect as a source rect, zooming and cropping the cover)

## Installation

```sh
# Install into a profile (build artifacts ship in the repo, so GitHub installs work out of the box)
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

## Quick start

1. Settings → "Appearance presets" → apply "Default" (ships three wallpapers and a cover)
2. Change wallpaper: Studio → "Assets & widgets" → upload an image / paste an image URL / pick a gradient → "Set as chat background"
3. Fine-tune: drag knobs at the top; with "Advanced tokens" expanded when you need exact values
4. Share: "Share" on a card → copy the share code; the recipient pastes it under "Import share code"
5. Language: **EN / 中文** on the wall, one click

## Development

```sh
npm run build                # build lib/core.mjs + .dsh-plugin/* (needs DSH_CHECKOUT)
npm run check:client         # artifact consistency guard (--check)
npm test                     # build + unit tests (257 tests)
node scripts/selfcheck.mjs   # one-shot self-check: build/unit/install/data integrity
node scripts/run-regression.mjs  # full e2e suite (31 scripts; needs a spike profile + env vars)
```

- **Build dependency**: `DSH_CHECKOUT` must explicitly point to the deepseek-harness checkout
  (vendor/schemastery + vendor/cosmokit are bundled — static external imports break desktop startup);
  same for catalog generation: `node scripts/gen-catalog.mjs --dsh <checkout>`
- **e2e env vars (required)**: `UIP_PLAYWRIGHT_DIR` (playwright package dir) and `UIP_CHROMIUM` (chromium executable);
  point `DSH_HOME` at an isolated test dir (e2e-home). Tests always use a separate spike profile + port 3180 and
  never touch real profiles
- **Token catalog version**: `src/core/catalog-data.ts` is generated from the DSH 0.1.0-rc.5 token table;
  re-run the generator after a host upgrade and commit the diff

## License

MIT
