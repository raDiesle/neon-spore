import { hydraGone, hydraLapsOf, hydraUnwindWay } from "@neon-spore/sim";
import { drawSerpentHead, drawStumpEnd } from "./hydra-head.js";
import { grown, type HeadsFrame } from "./hydra-heads.js";
import { drawFlesh, drawNeck, type Neck, neckAt } from "./hydra-neck.js";
import {
  type At,
  COIL_CORE_TILES,
  hydraCoilAt,
  hydraCoilRing,
  hydraRoot,
  hydraSideSign,
  hydraWound,
} from "./hydra-shape.js";

/**
 * **THE HYDRA's coils** (§11.64): on each side a neck run down and wound
 * round on itself in a flat spiral, its head biting at the middle, squeezing
 * harder on the beat the longer the window runs.
 *
 * **The spiral is the answer's progress**: one turn of it for every lap still
 * wound, so a lap turned off is a ring fewer and the spiral smaller, and the
 * whole of it turns round the way the thumb carries it — the pilot's
 * anticlockwise, the navigator's clockwise (`hydraUnwindWay`). A coil turned
 * off is a stump hanging, its rings gone falling (`hydra-fx.ts`).
 */

/** Points round a spiral, per turn of it. */
const PER_TURN = 28;

export function drawCoils(f: HeadsFrame): void {
  const { l, cfg, s, p, time } = f;
  const tile = l.tile;
  const laps = hydraLapsOf(s);
  for (const seat of [0, 1] as const) {
    const side = hydraSideSign(l, cfg, seat);
    const root = hydraRoot(p.c, p.rx, side, 0, 1);
    const centre = grown(root, hydraCoilAt(l, cfg, seat), p.grow);
    const wound = hydraWound(cfg, s, seat, laps) * p.grow;
    const way = hydraUnwindWay(seat);
    const spin = way * (laps - wound) * Math.PI * 2;
    const squeeze = 1 - 0.08 * p.pulse * p.threat;
    const outer = (hydraCoilRing(cfg) + 0.3) * tile * squeeze;
    const core = COIL_CORE_TILES * tile;
    const at = (u: number): At => {
      const a = spin - Math.PI / 2 - way * u * wound * Math.PI * 2;
      const r = core + ((outer - core) * u * wound) / laps;
      return { x: centre.x + Math.cos(a) * r, y: centre.y + Math.sin(a) * r * 0.85 };
    };
    const end = at(1);
    const neck: Neck = {
      from: root,
      to: end,
      out: { x: side * tile * 0.8, y: tile * 1.2 },
      into: { x: 0, y: -tile * 1.6 },
      w0: tile * 0.58,
      w1: tile * 0.4,
    };
    if (hydraGone(s, seat)) {
      drawNeck(f.ctx, neck, tile, time, 0.45);
      drawStumpEnd(f.ctx, neckAt(neck, 0.45), tile * 0.2);
      continue;
    }
    drawNeck(f.ctx, neck, tile, time);
    const steps = Math.max(2, Math.ceil(PER_TURN * wound));
    const mid: At[] = [];
    const widths: number[] = [];
    for (let j = steps; j >= 0; j--) {
      const u = j / steps;
      mid.push(at(u));
      widths.push(tile * (0.26 + 0.14 * u));
    }
    drawFlesh(f.ctx, mid, widths, tile);
    // The head at the middle, biting, turned along the last of the spiral.
    const head = at(0);
    const before = at(Math.min(1, 0.08 / Math.max(0.1, wound)));
    const angle = Math.atan2(head.y - before.y, head.x - before.x);
    const gape = 0.25 + 0.35 * p.threat * p.pulse;
    drawSerpentHead(f.ctx, head, angle, tile * 1.0 * p.grow, gape, 0.4 + 0.6 * p.threat);
    f.note(seat, centre, angle);
  }
}
