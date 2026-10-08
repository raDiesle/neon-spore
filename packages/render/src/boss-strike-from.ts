import { type BossKind, midCol, type SimConfig } from "@neon-spore/sim";
import type { Point } from "./boss-strike-look.js";
import { capstanBlowFrom } from "./capstan-blow.js";
import { fieldX } from "./field-flip.js";
import { flueBlowFrom } from "./flue-blow.js";
import { gallBlowFrom } from "./gall-blow.js";
import { gimbalCentre } from "./gimbal-shape.js";
import { governorBlowFrom } from "./governor-blow.js";
import { lampreyBlowFrom } from "./lamprey-blow.js";
import { latchBlowFrom } from "./latch-blow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { ledgerBodyY } from "./ledger-shape.js";
import { mantleCentre } from "./mantle-shape.js";
import { mimicBlowFrom } from "./mimic-blow.js";
import { oculusCentre } from "./oculus-shape.js";
import { plumbHook, plumbSacBottom, plumbSacMiddle } from "./plumb-shape.js";
import { ratchetPawlY, ratchetX } from "./ratchet-shape.js";
import { rimeCentre, rimeRadius } from "./rime-shape.js";
import { seamCentre, seamHalfHeight } from "./seam-shape.js";
import { slingBlowFrom } from "./sling-blow.js";
import { spoolHome } from "./spool-shape.js";
import { stareEye } from "./stare-shape.js";
import { trapezeBlowFrom } from "./trapeze-blow.js";
import { valveCentre } from "./valve-shape.js";
import { viseCentre, viseRadius } from "./vise-shape.js";

/**
 * **Where a boss's blow at the hull leaves its body** (`boss-strike-look.ts`
 * is what the blow looks like). `FROM` is the boss's own centre, or the part
 * of it the blow is thrown by, off the same function its drawer places it
 * with, so the blow cannot come out of somewhere the body is not. Cut out of
 * `boss-strike-look.ts` on 26 September 2026 when THE HALTER's row would have
 * put that file past its ceiling.
 */

const FROM: Partial<
  Record<BossKind, (l: Layout, cfg: SimConfig, col: number, row: number) => Point>
> = {
  oculus: oculusCentre,
  // The tile the line stood still at, or faulted on: the vein snaps there
  // (`filament-blow.ts`), so the blow leaves wherever the sim struck from.
  filament: (l, _cfg, col, row) => ({ x: tileCX(l, col), y: tileCY(l, row) }),
  gimbal: gimbalCentre,
  // Out of the bottom lobe, where the ridge's crack ends (`seam-blow.ts`).
  seam: (l, cfg) => {
    const c = seamCentre(l, cfg);
    return { x: c.x, y: c.y + seamHalfHeight(l) * 0.9 };
  },
  valve: valveCentre,
  spool: spoolHome,
  mantle: mantleCentre,
  // The body's underside, where the cord leaves it: the side the plate is
  // wrenched toward (`ledger-blow.ts`).
  ledger: (l, cfg) => ({ x: fieldX(l, midCol(cfg)), y: ledgerBodyY(l).bottom }),
  // The sac's low end, where the plumb line leaves it (`plumb-blow.ts`).
  plumb: (l, cfg) => {
    const h = plumbHook(l, cfg);
    return { x: h.x, y: h.y + plumbSacMiddle(l).y + plumbSacBottom(l) };
  },
  // The pawl's seam, where the jammed rack lets its head plate go
  // (`ratchet-blow.ts`).
  ratchet: (l, cfg) => ({ x: ratchetX(l, cfg), y: ratchetPawlY(l) }),
  // The lens's underside, where a frosted sheet lets go (`rime-blow.ts`).
  rime: (l, cfg) => {
    const c = rimeCentre(l, cfg);
    return { x: c.x, y: c.y + rimeRadius(l).ry };
  },
  // The eye itself, where the look leaves the socket (`stare-blow.ts`).
  stare: (l, cfg) => {
    const e = stareEye(l, cfg);
    return { x: e.cx, y: e.cy };
  },
  // The split at the case's heavy end, where it spits its seed (`vise-blow.ts`).
  vise: (l, cfg) => {
    const c = viseCentre(l, cfg);
    return { x: c.x, y: c.y + viseRadius(l).ry };
  },
  // The cradle's foot, where the cog it throws falls clear (`capstan-blow.ts`).
  capstan: capstanBlowFrom,
  // The seam's underside over the middle, where the seed tears off (`gall-blow.ts`).
  gall: gallBlowFrom,
  // The fly of the flag held over the middle, where the scrap tears off (`trapeze-blow.ts`).
  trapeze: trapezeBlowFrom,
  // The underside of the cup at the crotch, where the ball is flung from (`sling-blow.ts`).
  sling: slingBlowFrom,
  // The flue's underside under the sight, where the cinder is coughed out (`flue-blow.ts`).
  flue: flueBlowFrom,
  // The flywheel's near edge, where the shard shears off (`governor-blow.ts`).
  governor: governorBlowFrom,
  // The mouth itself, on the tile it bit (`lamprey-blow.ts`).
  lamprey: lampreyBlowFrom,
  // Under the mantle, where the reaching arm roots (`mimic-blow.ts`).
  mimic: mimicBlowFrom,
  // The core, where the tendril grows out of the colony (`latch-blow.ts`).
  latch: latchBlowFrom,
};

/** Where the blow leaves the body — for THE FILAMENT, the tile it struck from
 * (`col`, `row`, the `breach` event's). A boss with no row in `FROM` sits
 * where most of them do, over the middle column three rows down the field. */
export function strikeFrom(
  l: Layout,
  cfg: SimConfig,
  by: BossKind,
  col = midCol(cfg),
  row = 0,
): Point {
  const at = FROM[by];
  if (at) return at(l, cfg, col, row);
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + 3 * l.tile };
}
