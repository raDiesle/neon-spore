# Decisions

Each entry: what was decided, why, and what would have to change for it to be
reconsidered. Append, do not rewrite — a decision that was reversed is more
useful with its history attached.

## 1. Name: Neon Spore

*August 2026.* Organic and science fiction in two words, without the sea or
flower imagery of the earlier candidates. Working title "Signal Bloom" is
retired; the German spec still uses it throughout and is renamed as it is
translated.

**Reconsider if:** a trademark or app-store search turns up a conflict. That
search has not been done yet.

## 2. The raster control model, not free flight

*August 2026.* Two playable prototypes existed with two different control
models. Raster wins.

The deciding argument is section 4 of the spec: speech runs over Discord or
WhatsApp with 0.5–2 s delay, and a full announcement takes 2.1–3.6 s. Free
flight asks both players to trigger the same action inside 250 ms — the word
"now" is already wrong by the time it arrives. The raster hangs everything on a
shared 96 BPM pulse, so the announcement becomes "column four, I trigger on the
three", which stays valid however long it takes to arrive.

Second argument: in the raster the two players have *different* jobs in the
same defence — one places in space, the other hits in time. That produces more
to talk about, and it is visible afterwards who missed their half.

Third argument, the practical one: the raster state is integers. Determinism,
replay tests and lockstep nearly fall out of it.

**Cost accepted:** the bestiary, the ten acts and the assist mechanics were
designed for free flight. "Keeping watch" (slowing a creature) does not
translate to a beat-based game and needs rethinking rather than porting.

**Reconsider if:** playing both with two people shows the raster feels like a
puzzle rather than a game. The free-flight prototype is kept in `legacy/`.

## 3. Monorepo with workspaces

*August 2026.* `packages/sim`, `packages/render`, `packages/content`,
`apps/game`, `apps/server`. Package boundaries make the import rule structural
instead of advisory: sim cannot reach render because it does not depend on it.

## 4. Bun for everything, no Vite

*August 2026.* Bun is the package manager, the runtime, the test runner and the
bundler. One binary, TypeScript without a build step, and `bun test` runs the
whole suite in milliseconds.

**Cost accepted:** Bun's install is flatter than pnpm's, so an undeclared
dependency is not caught at install time. And `wrangler` (phase 2, Cloudflare)
is Node-oriented; if it misbehaves under Bun, run it through `npx`.

**Reconsider if:** the tuning loop — change a value, see it immediately —
turns out to be worse under Bun's dev server than it was under Vite.

## 5. Canvas 2D for the field, DOM for everything else

*August 2026.* Three layers rather than one technology:

- **Field:** Canvas 2D. Glow comes from layered strokes and one pre-rendered
  additive halo sprite, never from `shadowBlur` — that is the actual frame-rate
  cost on mobile GPUs.
- **HUD, menus, Director Mode:** DOM and CSS. A HUD change then never touches
  renderer code, which is both cheaper to edit and easier to get right.
- **SVG:** authoring format, not a drawing path. The contour maths from the
  style guide lives in `content/` as pure functions and feeds both the canvas
  and an SVG test sheet.

`render/` sits behind a narrow interface, so PixiJS later is a second
implementation rather than a rewrite.

**Reconsider (per spec 12.4) if:** Canvas 2D drops below a stable 60 fps on the
target devices despite pre-rendered sprites; many more than ~52 simultaneous
objects are needed; additive blending gets awkward; or runtime deformation
replaces pre-rendered stages.

## 6. English throughout

*August 2026.* Identifiers, comments, docs and commits. The German spec is
translated topic by topic into `docs/spec/`; the original stays in `legacy/` as
the source of truth until each part has moved.

## 7. Public repository

*August 2026.* Public from the start. No open-source licence is granted yet —
see `LICENSE`. Decide the licence before accepting outside contributions.

## 8. First milestone: port the raster prototype

*August 2026.* Port `legacy/raster-prototype.html` to TypeScript split into
sim/render/content, with the game rules unchanged. Only then the network layer
(clock sync, delayed lockstep, Durable Object), and only then more content.

Network before content, because content built on a timing model that does not
hold is built twice.
