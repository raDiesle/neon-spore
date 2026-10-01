import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type InstarState,
  instarBoss,
  NO_BEARING,
  NOT_DONE,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../../../packages/sim/src/index.js";

/** THE INSTAR's wave for the solid strips, as `packages/render/test/instar-kit.ts` hangs it. */

/** The wave hung, a few beats in — `packages/render/test/instar-kit.ts`'s `hung`. */
export function hung(): World {
  const cfg = DEFAULT_CONFIG;
  const world = createWorld(cfg, 3);
  const index = WAVES.findIndex((w) => w.boss?.kind === "instar");
  startWave(world, index, buildQueue(index, cfg.cols), [], buildBoss(index, cfg.cols));
  for (let i = 0; i < ticksPerBeat(cfg) * 4; i++) step(world, []);
  return world;
}

/** The body acting step `cursor` from `beat`, its marks untouched. */
export function acting(world: World, cursor: number, beat: number): InstarState {
  const s = instarBoss(world);
  if (s === null) throw new Error("the instar wave hung no body");
  s.cursor = cursor;
  s.phase = "act";
  s.phaseBeat = beat;
  const n = s.steps[cursor]?.marks.length ?? 0;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  return s;
}
