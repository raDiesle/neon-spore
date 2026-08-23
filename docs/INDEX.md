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

## Specification

The design lives in `docs/spec/`, split by topic. The German original is in
`legacy/spec-de-original.md` and is the source of truth until each part is
translated. See `docs/spec/README.md` for the split plan and its status.

## Code

| Path | One line |
|---|---|
| `packages/sim/src/config.ts` | every tunable number, plus `ticksPerBeat` |
| `packages/sim/src/rng.ts` | the only permitted source of randomness |
| `packages/sim/src/types.ts` | creatures, bullets, scars, commands |
| `packages/sim/src/world.ts` | the world and the single `step` function |
| `packages/sim/src/hash.ts` | world fingerprint — desync detection |
| `packages/sim/src/replay.ts` | the test format: inputs in, fingerprint out |
| `packages/content/src/creatures.ts` | bestiary and control-visibility table |
| `packages/content/src/waves.ts` | authored waves, 7-column coordinates |
| `packages/content/src/queue.ts` | wave to spawn queue, seeded per wave |
| `packages/render/src/palette.ts` | style guide as values |
| `packages/render/src/glow.ts` | glow without shadowBlur |
| `packages/render/src/canvas2d.ts` | the renderer |
| `packages/render/src/renderer.ts` | the interface a PixiJS version would implement |
| `apps/game/src/main.ts` | wiring: world, renderer, input, loop |
| `apps/game/src/loop.ts` | fixed timestep; the only place wall-clock time exists |
| `apps/game/src/input.ts` | commands from touch and keyboard |
