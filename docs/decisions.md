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

## 9. The port keeps the prototype's rules, the style guide's shapes

*August 2026.* Milestone 1 draws from two sources, and they do not overlap:
`legacy/raster-prototype.html` supplies the rules, the layout, the radar, the
HUD and the effects; `legacy/style-guide.html` supplies the ship, the creatures
and the shield. Pixel-identical parity with the prototype was never the goal —
the style guide is the newer art direction and supersedes the prototype's
hard-coded silhouettes.

Four places where the sources disagreed, and how it was settled:

- **Guard window: 600 ms.** The prototype runs 600 (`CFG.guardWindow`, commented
  "at least doubled"). The scaffold's `SimConfig` said 260, which came from
  spec 15.3 #18 — a number that was guessed and never in any running code. The
  spec has been corrected. It still wants measuring with two people; it decides
  whether the shared defence feels precise or mean.
- **The hull is row `rows - 1`, not `rows`.** The prototype's `shipRow` is
  `ROWS-1`, and spec 5.8 measures 8.8 s of approach, which is 14 beats at
  96 BPM. The scaffold was off by one.
- **`guard.tries` counts every meteor that reaches the hull**, not only those
  with the shield in the column. That is the denominator the prototype's
  `Abwehr 7/9` shows.
- **`rows` is fixed in `SimConfig`.** The prototype derived it from the tile
  size. Two devices that disagree about the height of the field disagree about
  when a creature reaches the hull, so the tile shrinks to fit instead.

**Also decided here:**

- **The shield is the armour-plate variant.** The style guide offers four; the
  brief says the shield is a lobe of the hull contour, which is `PLATTE`. The
  rim-brightening (`RAND`) is drawn on the same segment when armed, so armed and
  passive differ in silhouette *and* in light — spec 5.8 insists a deflection be
  unmissable, or the pair never learns the timing.
- **Visual variation comes from ids, not from the rng.** Creature motion phase,
  meteor spin, crater placement and scar jitter are derived from `creature.id`
  and `(scar.col, scar.beat)`. Both devices agree without the simulation storing
  a jitter, and the seeded rng stays reserved for things that affect play.
- **The control band is drawn on the canvas**, not in the DOM. Every element of
  it is per-column and has to line up with the grid exactly. This narrows
  decision 5: the *field surface* is canvas, and the band is part of it. Menus,
  the tuning panel and the wave-skip controls remain DOM.
- **Wave progression crosses the boundary by request.** The sim emits
  `needWave` and the app answers with `buildQueue`, because waves live in
  `content/` and nothing may point back into the sim.

**Reconsider if:** playing it with two people shows the style guide's silhouettes
read worse in motion at tile size than the prototype's did. The prototype's
`shapePath` is still in `legacy/` for comparison.

## 10. Proposals, not yet done

*August 2026.* Recorded rather than acted on, per the milestone-1 brief.

- **Split render-only tunables out of `SimConfig`.** `radarLead`,
  `bulletGlideMs`, `bandPct` and `radarHeightPx` sit there today because the
  convention says every tunable is a named field of `SimConfig`. They change no
  rule and enter no hash. A `RenderConfig` would be honest, at the cost of two
  config objects to thread through.
- **A second config preset at 260 ms**, so the guard window can be compared
  side by side without editing code.
