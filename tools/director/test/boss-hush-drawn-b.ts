import { type BossKind, scuttlePartCol } from "@neon-spore/sim";
import { antiphonOrganCircle, antiphonPerch } from "../../../packages/render/src/antiphon-shape.js";
import { tileCX } from "../../../packages/render/src/layout.js";
import { scuttleLockBox } from "../../../packages/render/src/scuttle-lock.js";
import { scuttleRowY, scuttleShiver } from "../../../packages/render/src/scuttle-shape.js";
import { sinewHandleCircle } from "../../../packages/render/src/sinew-handles.js";
import { sinewLanded, sinewMassCentre } from "../../../packages/render/src/sinew-shape.js";
import {
  showsAntiphonOrgan,
  showsAntiphonRail,
  showsScuttleLive,
} from "../../../packages/render/src/view-role-clocks-b.js";
import type { Drawn, Mark } from "./boss-hush-drawn.js";

/**
 * **The second half of `DRAWN`**, out of `boss-hush-drawn.ts` on 27
 * September 2026 when the fifth lane's four readers would have taken it past
 * 250 lines. Same rule: a mark where a thumb is asked to go, placed as the
 * draw places it, less the motion that is the rule.
 */

/** How far under the organ's centre its ring sits (`antiphon-grip.ts`'s `GRIP_DOWN`). */
const ORGAN_GRIP_DOWN = 0.45;

export const DRAWN_B: Partial<Record<BossKind, Drawn>> = {
  // The live part over the column it hangs in, on the screen shown it, and
  // the lock under the next throw's column. The frame's rise and the part's
  // hang are the throw's clock; the shiver is the part's own (`scuttleShiver`).
  scuttle: (l, world, phase, time) => {
    const s = world.boss;
    if (s?.kind !== "scuttle" || !showsScuttleLive(l.role)) return [];
    const cfg = world.cfg;
    const marks: Mark[] = [];
    if (s.live >= 0 && s.loose.includes(s.live) && s.parts[s.live]) {
      const x = tileCX(l, scuttlePartCol(s, cfg, s.live));
      const shiver = scuttleShiver(l, cfg, world, s, world.beat, phase, time);
      marks.push({ id: -1, x: x + shiver, y: scuttleRowY(l, cfg, s.live) });
    }
    const lock = scuttleLockBox(l, cfg, s);
    if (lock !== null) marks.push({ id: -2, x: lock.x, y: lock.y });
    return marks;
  },
  // Each handle's rest, which is where the press is heard, with the mass's
  // fall and its sag under the pulls taken out: both are the rule. Keyed on
  // the column, since the walk is a whole tile a step by the rule too.
  sinew: (l, world, phase) => {
    const s = world.boss;
    if (s?.kind !== "sinew" || sinewLanded(s)) return [];
    const cfg = world.cfg;
    const mass = sinewMassCentre(l, cfg, s, world.beat, phase);
    return ([-1, 1] as const).map((side, k) => {
      const c = sinewHandleCircle(l, cfg, s, world.beat, phase, side);
      return { id: -1 - k - 10 * s.massCol, x: c.x, y: c.y - mass.y };
    });
  },
  // The organ's ring under it on the explainer's screen, a ring on each
  // candidate's perch on the chooser's. Nothing here is on a clock; a level
  // lays a new rail, so a ring is keyed on its column (one candidate a
  // column). A candidate in hand moves with the thumb, which is the rule,
  // so its ring is placed at the perch it was carried from.
  antiphon: (l, world) => {
    const s = world.boss;
    if (s?.kind !== "antiphon" || s.downBeat >= 0) return [];
    const cfg = world.cfg;
    const marks: Mark[] = [];
    if (s.organ !== null && showsAntiphonOrgan(l.role, s)) {
      const c = antiphonOrganCircle(l, cfg);
      marks.push({ id: -1, x: c.x, y: c.y + c.r * ORGAN_GRIP_DOWN });
    }
    if (showsAntiphonRail(l.role, s)) {
      for (const c of s.rail) marks.push({ id: -100 - c.col, ...antiphonPerch(l, cfg, c.col) });
    }
    return marks;
  },
};
