import { type BossKind, midCol, type SimConfig } from "@neon-spore/sim";
import type { Point } from "./boss-strike-look.js";
import { burgeeBlowFrom } from "./burgee-blow.js";
import { capstanBlowFrom } from "./capstan-blow.js";
import { cystBlowFrom } from "./cyst-blow.js";
import { davitHook, davitMast } from "./davit-shape.js";
import { fieldX } from "./field-flip.js";
import { flueBlowFrom } from "./flue-blow.js";
import { gallBlowFrom } from "./gall-blow.js";
import { gimbalCentre } from "./gimbal-shape.js";
import { grindstoneBlowFrom } from "./grindstone-blow.js";
import { halterBlowFrom } from "./halter-blow.js";
import type { Layout } from "./layout.js";
import { ledgerBodyY } from "./ledger-shape.js";
import { mantleCentre } from "./mantle-shape.js";
import { oculusCentre } from "./oculus-shape.js";
import { plumbHook, plumbSacBottom, plumbSacMiddle } from "./plumb-shape.js";
import { ratchetPawlY, ratchetX } from "./ratchet-shape.js";
import { rimeCentre, rimeRadius } from "./rime-shape.js";
import { seamCentre, seamHalfHeight } from "./seam-shape.js";
import { slingBlowFrom } from "./sling-blow.js";
import { spoolHome } from "./spool-shape.js";
import { stareEye } from "./stare-shape.js";
import { trivetCentre, trivetFoot } from "./trivet-shape.js";
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

const FROM: Partial<Record<BossKind, (l: Layout, cfg: SimConfig) => Point>> = {
  oculus: oculusCentre,
  gimbal: gimbalCentre,
  // Out of the bottom lobe, where the ridge's crack ends (`seam-blow.ts`).
  seam: (l, cfg) => {
    const c = seamCentre(l, cfg);
    return { x: c.x, y: c.y + seamHalfHeight(l) * 0.9 };
  },
  valve: valveCentre,
  spool: spoolHome,
  // The hook at the chain's end, stowed — off the same shape the boom draws
  // itself from (`davit-shape.ts`).
  davit: (l, cfg) => {
    const mast = davitMast(l, cfg);
    const hook = davitHook(l, 0, 1);
    return { x: mast.x + hook.x, y: mast.y + hook.y };
  },
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
  // The middle foot, the one never lifted, where the needle drives on from
  // (`trivet-blow.ts`).
  trivet: (l, cfg) => {
    const c = trivetCentre(l, cfg);
    const f = trivetFoot(l, 2, 0, 0);
    return { x: c.x + f.x, y: c.y + f.y };
  },
  // The split at the case's heavy end, where it spits its seed (`vise-blow.ts`).
  vise: (l, cfg) => {
    const c = viseCentre(l, cfg);
    return { x: c.x, y: c.y + viseRadius(l).ry };
  },
  // The foot of the centre's hanging plates, the one it sheds (`halter-blow.ts`).
  halter: halterBlowFrom,
  // The cradle's foot, where the cog it throws falls clear (`capstan-blow.ts`).
  capstan: capstanBlowFrom,
  // The root's underside in the peeled seam, where the seed tears off (`gall-blow.ts`).
  gall: gallBlowFrom,
  // The fly of the flag held over the middle, where the scrap tears off (`burgee-blow.ts`).
  burgee: burgeeBlowFrom,
  // The bottom lobe's tip, the one that spits (`cyst-blow.ts`).
  cyst: cystBlowFrom,
  // The bottom of the wheel, where the chip breaks off (`grindstone-blow.ts`).
  grindstone: grindstoneBlowFrom,
  // The underside of the cup at the crotch, where the ball is flung from (`sling-blow.ts`).
  sling: slingBlowFrom,
  // The damper's underside, where the cinder is coughed out (`flue-blow.ts`).
  flue: flueBlowFrom,
};

/** Where the blow leaves the body. A boss with no row in `FROM` sits where
 * most of them do, over the middle column three rows down the field. */
export function strikeFrom(l: Layout, cfg: SimConfig, by: BossKind): Point {
  const at = FROM[by];
  if (at) return at(l, cfg);
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + 3 * l.tile };
}
