import { bossFromWave, guideSteps, podsFromWave, queueFromWave } from "@neon-spore/content";
import { createWorld, type SimConfig, startWave, type World } from "@neon-spore/sim";
import { currentWave, type Store } from "./state.js";

/**
 * A fresh run of the wave being edited, stood up the way the game stands one up.
 *
 * Its own file beside `stage.ts`, which is at the ceiling `CLAUDE.md` sets, and
 * along a seam that was already there: everything in `stage.ts` is about a run
 * that is *going* — the loop, the transport, the finger on the canvas, the
 * beat the grid is marked on — and this is the one question of where a run
 * comes from. It reads the draft in `store` and never the shipped `WAVES`, so
 * nothing here waits for a save.
 *
 * **The world is thrown away and built again rather than reused.**
 * `createWorld` always returns a fresh `Briefings` (`met: 0`), so every
 * `↺ WAVE` asks "what would a pair who has met nothing see", never "what has
 * this run already taught" — which is also why editing wave 9 alone can show a
 * card wave 2 already raised: no `met` bitmask carries forward.
 */
export function buildStageWorld(store: Store, cfg: SimConfig): World {
  const wave = currentWave(store);
  const world = createWorld(cfg, store.index);
  if (!wave) return world;
  startWave(
    world,
    store.index,
    queueFromWave(wave, cfg.cols),
    podsFromWave(wave, cfg.cols),
    bossFromWave(wave, cfg.cols),
    wave.guide !== undefined,
    // How many pages that guide is read in, and the fault the wave carries.
    // Both come off the wave being *edited*, so neither waits for a save.
    guideSteps(wave.guide),
    wave.malfunction ?? null,
  );
  return world;
}
