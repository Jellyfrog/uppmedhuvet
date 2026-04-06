# Upp med huvudet! 🎉

A **Heads Up!** style party game built with Vite, Tailwind CSS v4, and Svelte 5.

## How to play

1. Pick a language (Swedish or English)
2. Choose a category
3. Hold your phone on your forehead
4. Your friends describe the word on screen
5. **Tilt phone DOWN** (screen faces floor) when you guess correctly
6. **Tilt phone UP** (screen faces ceiling) to pass
7. Score as many as you can in 60 seconds!

No gyroscope? Tap the on-screen buttons instead.

## Categories

- 🐾 Animals / Djur
- 🎬 Movies / Filmer
- 👷 Professions / Yrken
- 🍕 Food & Drink / Mat & Dryck
- ⚽ Sports / Sport
- ⭐ Celebrities / Kändisar

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
```

Pushing to `main` auto-deploys to GitHub Pages via Actions.

## Tech Stack

- [Vite](https://vite.dev) — build tool
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [Svelte 5](https://svelte.dev) — reactivity
- Web Audio API — sound effects
- Device Orientation API — tilt controls
- Screen Wake Lock API — keeps screen on during play
