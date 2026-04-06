# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run lint     # Run ESLint on src/
npm run build    # Lint + production build → dist/
npm run preview  # Preview production build locally
```

ESLint is configured with `eslint-plugin-svelte`. No test runner is configured.

## Architecture

Heads Up!-style party game: hold phone on forehead, tilt down=correct, tilt up=pass. Built with **Svelte 5**, **Vite 8**, **Tailwind CSS v4**.

### State Management

All game state lives in `src/state.svelte.js` using Svelte 5 runes (`$state`, `$derived`). Reactive values are exported via getter functions (e.g., `getScreen()`, `getCurrentWord()`) because `$state` variables aren't reactive when re-exported directly. Action functions (e.g., `markCorrect()`, `selectCategory()`) are the only way to mutate state.

### Screen Flow

`lang-select → menu → setup → countdown → playing → results`

`src/App.svelte` is a thin router that switches on `getScreen()`. Each screen is a separate Svelte component in `src/screens/`.

### i18n

Translations in `src/i18n/sv.js` and `src/i18n/en.js` as nested objects. Access via `t(lang, 'dotted.key')` from `src/i18n/index.js`. The `tr(key)` helper in `state.svelte.js` binds the current language automatically.

### Dictionaries

Word lists in `src/dictionaries/<category>.js`, each exporting `{ sv: string[], en: string[] }`. To add a category: create a new file, import it in `src/dictionaries/index.js`, add to the `categories` object, add category name translations to both `src/i18n/sv.js` and `src/i18n/en.js`, and add the emoji to the `categoryEmojis` map in `src/i18n/index.js`.

### Device APIs

- **Orientation** (`src/orientation.js`): Uses `beta` axis — |beta| > 130° = correct (tilt down), |beta| < 50° = pass (tilt up). 1.5s cooldown between triggers, including an initial cooldown on game start. iOS 13+ requires `DeviceOrientationEvent.requestPermission()` from a user gesture.
- **Audio** (`src/audio.js`): Lazy-initialized `AudioContext` singleton. Programmatic tones via oscillators (no audio files). All sounds silently fail if unsupported.
- **Wake Lock & Fullscreen**: Acquired on game start, released on game end.

### Tailwind Theme

Custom colors defined in `src/style.css` via `@theme`: `bg` (#1a1a2e), `bg-light` (#16213e), `accent`, `primary`, `correct` (green), `pass` (red). Use as Tailwind utilities (e.g., `bg-correct`, `text-pass`).

## Deployment

Push to `main` triggers GitHub Actions (`actions/deploy-pages`) which runs `npm run build` and deploys `dist/` to GitHub Pages.
