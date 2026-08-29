## `9ee6fce` — the director ships beside the game, read-only, with a phone toggle

> on your phone, can you switch between choosing a wave, playing it, and painting it — and is it clear which things you cannot change from there?

- **badge** implementation
- **subject** `bun run build` bakes a static, read-only director beside the game; a phone gets a WAVE/GAME/MAP toggle
- **changed** `tools/director/build.ts` bundles the client and bakes every GET route the client already calls into a static file at the same path; `main.ts` hides SAVE, TO CHECK and MAIN MENU when `/__director` answers `shipped: true`; `index.html`'s four columns collapse to one of three views under 700px, switched by `#viewToggle` (`?view=` overrides once, a click persists to localStorage)
- **decide** on an actual phone: open the shipped build, switch between WAVE, GAME and MAP without losing your place on reload, and confirm nothing offers a save or a check decide/run that would silently fail
- **before** the director was desktop-only and lived only behind `bun run dev`; `bun run build` shipped only the game
- **after** `bun run build` produces `tools/director/dist` beside `apps/game/dist`; a narrow viewport shows the toggle and one view at a time
- **where** `bun run build`, then serve `tools/director/dist` as static files and open it on a phone; or `bun run dev` and narrow the window below 700px
