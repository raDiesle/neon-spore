# Context map

One line per file, so a session can open the two it needs instead of searching.
Keep this current — it is the cheapest file in the repo and it saves the most.

## Decisions and architecture

| File | Read it when |
|---|---|
| `docs/decisions.md` | you are about to change a technology or a structural rule |
| `docs/architecture.md` | you touch the sim/render boundary, determinism or the tick |
| `docs/working-with-claude.md` | you are setting up a session, a skill or a hook |
| `docs/token-budget.md` | you wonder why files are small and docs are split |
| `docs/delegating.md` | you hand implementation to the cheap worker model |

## Specification

The design lives in `docs/spec/`, translated and split by topic. Start at
`docs/spec/README.md`: it carries the status vocabulary and says which parts
are built. The spec is design intent — `docs/decisions.md` decides when it and
the code disagree, and the code is the truth for numbers.

| File | Read it when |
|---|---|
| `docs/spec/overview.md` | you need the core sentence, the speech rule or the setting |
| `docs/spec/roles.md` | you touch what either player can operate |
| `docs/spec/couplings.md` | you are designing something two people must do together |
| `docs/spec/latency.md` | you change a speed, a distance or the beat |
| `docs/spec/systems.md` | you touch control visibility, damage, shots or the grid |
| `docs/spec/assists.md` | you work on helping a weaker partner |
| `docs/spec/structure.md` | you touch waves, score, saving or randomness |
| `docs/spec/wave-design.md` | you author a wave or an act |
| `docs/spec/graphics.md` | you draw anything |
| `docs/spec/bestiary.md` | you add or change a creature |
| `docs/spec/bosses.md` | you build a boss |
| `docs/spec/open-questions.md` | you hit something the design has not decided |
| `docs/spec/ideas.md` | you are looking for what to build next |

The German original has been translated in full and deleted; it is in the git
history if the wording of a rejected idea is ever needed.

## Code

| Path | One line |
|---|---|
| `packages/sim/src/config.ts` | every tunable number, `ticksPerBeat`, `hullRow` |
| `packages/sim/src/rng.ts` | the only permitted source of randomness |
| `packages/sim/src/types.ts` | creatures, bullets, scars, commands |
| `packages/sim/src/world.ts` | the world and the single `step` function |
| `packages/sim/src/beat.ts` | the beat: spawning, gliding, the hull, the guard rule |
| `packages/sim/src/bullets.ts` | firing and tile-wise travel |
| `packages/sim/src/pods.ts` | pods: hanging, shot loose, falling, taken in |
| `packages/sim/src/hash.ts` | world fingerprint — desync detection |
| `packages/sim/src/replay.ts` | the test format: inputs in, fingerprint out |
| `packages/content/src/creatures.ts` | bestiary and control-visibility table |
| `packages/content/src/waves.ts` | authored waves, 7-column coordinates |
| `packages/content/src/queue.ts` | wave to spawn queue, seeded per wave |
| `packages/content/src/shapes.ts` | contour maths, shared by canvas and SVG |
| `packages/content/src/silhouettes.ts` | the style guide's tuned shape parameters |
| `packages/render/src/palette.ts` | style guide as values |
| `packages/render/src/glow.ts` | glow without shadowBlur |
| `packages/render/src/layout.ts` | screen geometry, shared with input hit-testing |
| `packages/render/src/field.ts` | background, grid pulse, radar strip |
| `packages/render/src/hull.ts` | the ship; cannon and shield as lobes of one contour |
| `packages/render/src/maw.ts` | swallowing a pod: the skin coming apart, then the flash |
| `packages/render/src/pods.ts` | the pod, hanging and as a burning wreck |
| `packages/render/src/creatures.ts` | silhouettes and their own-motion |
| `packages/render/src/bullets.ts` | shots and their tails |
| `packages/render/src/effects.ts` | deflection, shockwave, DEFLECTED, the swallow's timing |
| `packages/render/src/sparks.ts` | the particles every impact spends, thrown out or drawn in |
| `packages/render/src/hud.ts` | hull, score, beat, the guard balance, overlays |
| `packages/render/src/band.ts` | the two control strips, trigger and colours |
| `packages/render/src/canvas2d.ts` | the renderer, orchestrating the above |
| `packages/render/src/renderer.ts` | the interface a PixiJS version would implement |
| `apps/game/src/main.ts` | wiring: world, renderer, input, loop, wave progression |
| `apps/game/src/loop.ts` | fixed timestep; the only place wall-clock time exists |
| `apps/game/src/input.ts` | commands from touch and keyboard |
| `apps/game/src/testing.ts` | pause, wave skip and the tuning sliders |
