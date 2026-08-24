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

*Amended August 2026:* `bun --hot` watches only files under the directory it
was **started from**. Started in `apps/game`, it bundled all three workspace
packages but watched none of them — every file in `sim`, `render` and `content`
drew "is not in the project directory and will not be watched", and editing a
renderer meant restarting the server. So `dev` runs from the repository root
(`bun --hot apps/game/index.html`) and `apps/game` no longer carries a `dev`
script of its own, because running one there would silently reintroduce it.

The cwd is the whole mechanism — not the workspace symlinks, which are what
made it look like a resolution problem. `build` and `preview` are unaffected:
neither watches.

*Amended 2026-08-24:* `dev` now launches the director instead of the game —
that is the one being edited and reloaded on every cycle, so it is the one
that must not need a manual restart. The same cwd-from-the-repository-root
rule applies to it for the same reason: started inside `tools/director`,
`--hot` would bundle `sim`, `render` and `content` without watching them,
exactly as it once did for `apps/game`. The game's own hot dev server moved
to `dev:game`, otherwise unchanged.

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

*Amended August 2026:* every part has moved. `docs/spec/` is the specification;
the German original was deleted and lives in the git history — see decision 12.

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

## 11. The setting is space

*August 2026.* Neon Spore takes place in space, not underwater. The nearest
comparable game is Spaceteam: two people, two devices, and the order arrives at
the person who cannot carry it out.

This was implicit in the name from decision #1 — chosen for organic plus
science fiction, "without the sea or flower imagery of the earlier
candidates" — but the German spec was written for an ocean and nobody had said
out loud that the fiction had moved with the name.

**What is unaffected:** the three couplings, the beat, the raster, the ten
pillars and the wave design. None of them depends on what the backdrop is.

**What is affected and not yet resolved:** the marine fiction was carrying real
argumentative weight. Colour is bioluminescence, matching ammunition shatters
the light organ by resonance, the rock is indestructible because it does not
live, and "you are a bubble in an ocean full of animals — not the warriors, but
the fragile thing." Each of those needs a reason that fits a void. The bestiary
is sea life, and `manta` and `jelly` are `CreatureKind` values in the
simulation, so that question is a code change whichever way it goes.
`packages/render/src/field.ts` still calls its background "deep-water".

These are written up as S1–S5 in `docs/spec/open-questions.md` rather than
answered here. An alien ecosystem drifting through a void is a coherent answer
that costs nothing and renames nothing; it is the leading candidate, not a
decision.

**Reconsider if:** the fiction pass finds that the creature vocabulary cannot
be justified in space at all. Then the bestiary is redrawn, which is a bigger
change than the setting was.

## 12. The spec is design intent, marked with build status

*August 2026.* The German original has been translated and split into
`docs/spec/`. It says what the game is *for*, not what it currently does, and
every file carries a status marker: built, partly built, not built, superseded.

The alternative — keeping the spec in permanent sync with the running game —
was rejected. It would turn every gameplay commit into a docs commit, and it
would delete the part of the spec that is most valuable: ninety unbuilt waves,
seventeen unbuilt creatures and eleven bosses that the prototype says nothing
about. Splitting into `built/` and `planned/` trees was rejected too: sections
like "systems" are half of each, and entries would migrate between files as
they land, which is churn without a reader.

**The order of authority when sources disagree:** `docs/decisions.md` decides;
the code is the truth for numbers; the spec says what the thing is for. A
section that is merely unbuilt is fine and says so. A section that is *wrong* —
contradicted by a decision or by the code — gets fixed in the same commit,
with the reasoning recorded here.

Where the original assumed free flight, the translation keeps the passage and
marks what no longer applies, rather than quietly rewriting it. The
communication idea inside a mechanic usually survives the change of control
model even when the gesture does not, and that is worth being able to see.

**Cost accepted:** the status markers go stale unless they are touched when
something ships. They are one line per file, and `docs/spec/README.md` collects
them in a table, so the staleness is at least visible in one place.

**Reconsider if:** the markers are found to be wrong more than once. At that
point they are worse than nothing and the sync-always option gets a second
hearing.

## 13. The bestiary is blob and slime, not sea life

*August 2026.* This answers the open item left by decision 11. (That entry
names the creatures `manta` and `jelly`; those are the old names, renamed
here.)

In the code: `manta` → **`slick`**, `jelly` → **`bulb`**. `meteor` is
unchanged — it is already space-native, and its job is to be the one thing that
is *not* a blob: angular, `crystalPath` rather than `blobPath`, indestructible
because it does not live. That contrast is what teaches the rule visually, so
the non-living family (meteor, crystal) deliberately keeps its own register.

`slick` is `lobes: 2`, `rx 68 × ry 34` — wide and flat, tilts and ripples.
`bulb` is `lobes: 9`, round, pumps and sways. The names describe the shapes
that were already there.

**Three naming rules, in priority order** — written up in
`docs/spec/bestiary.md`:

1. Blob and slime, not sea life.
2. The name says the behaviour or the shape.
3. **Distinct when spoken over a laggy voice channel** — this one overrides the
   other two.

Rule 3 is the one that does real work, and it is a consequence of the core
sentence rather than a style preference: names are said out loud across a
0.5–2 s delay, so two creatures must not share an onset, a vowel and a syllable
count. `/slɪk/`, `/bʌlb/` and `/ˈmiːtiər/` share none of the three.

Rule 3 is also why the flat one is not called a *glider*, which was the obvious
name: "glide" is already the fixed term for how every creature moves, one tile
per beat, and overloading it is exactly the synonym drift `CLAUDE.md` forbids.

**Scope:** only the three names above are committed, because only they are
`CreatureKind` values. The other seventeen creatures and the eleven bosses were
renamed in `docs/spec/` in the same pass so the page is not half marine, but
those are labels on unbuilt designs — proposals, one edit each. Rule 3 is
likely to bind before rule 1 does: twenty names that stay distinct over a voice
channel is the harder constraint, and it should be checked against the whole
set before the bestiary grows.

**Reconsider if:** saying a name out loud in play turns out to be rare — if
pairs point at columns instead ("column four") and never name the creature,
rule 3 is over-weighted and rule 2 should lead.

## 14. The window is not the stage

*August 2026.* The game is portrait mobile web, and a browser window on a
desktop is nothing like a phone. Drawing into the whole window made the hull as
wide as the desk: a shape nobody will ever be shown, judged on a screen nobody
will ever play on.

So the window is not the stage. `computeStage` in `packages/render/src/layout.ts`
returns a portrait rectangle, at most 0.56 as wide as it is tall, centred; the
renderer clips and translates into it and everything a player sees lives inside
it. Input subtracts the same offset, so a control is never drawn in one place
and answered in another — the reason the layout was shared in the first place.
Only the test chrome, which no player gets, is allowed outside.

**The view switch** follows from the same worry. The finished game is one role
per device, so a screen showing both halves of the control band is not the
game's layout: it has controls the real screen does not carry, and the field is
correspondingly smaller. `P1` and `P2` show one role's half and hide the rig;
`TEST` shows everything. The band's share of the height is a named field either
way — `bandPct` and `bandSoloPct` — never a literal.

Two smaller things came with it. The layout is now derived per frame rather
than cached, because a tuning slider moves `bandPct` between two frames and a
cached layout would ignore it until the next resize. And `hullInvulnerable` is
a `SimConfig` field rather than an app flag: it belongs to the run, and a
replay has to record that the run was played with the hull holding.

**Reconsider if:** a landscape or tablet layout is ever wanted. The stage is
one aspect ratio by choice; making it a range is a change to `computeStage` and
nothing else.
