import {
  antiphonCrossed,
  type BossKind,
  burgeeCatching,
  burgeeLitStep,
  davitLitStep,
  scuttlePartCol,
} from "@neon-spore/sim";
import { antiphonOrganCircle, antiphonPerch } from "../../../packages/render/src/antiphon-shape.js";
import { burgeeMarks } from "../../../packages/render/src/burgee-marks.js";
import { burgeeArrived } from "../../../packages/render/src/burgee-pose.js";
import { burgeeSpindleAt } from "../../../packages/render/src/burgee-shape.js";
import { davitAngle } from "../../../packages/render/src/davit-pose.js";
import { DAVIT_SAG, davitHook, davitMast } from "../../../packages/render/src/davit-shape.js";
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
/** How far the body drops in from above on arrival, in tiles (`burgee-draw.ts`'s `ARRIVE`). */
const BURGEE_ARRIVE = 3;

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
  // The organ's ring under each twin on one screen, a ring on each
  // candidate on the rail on the other. Nothing here is on a clock; a cycle
  // lays a new rail and grows new twins, so a ring is keyed on its column
  // (one candidate a column) and on how many twins stand.
  antiphon: (l, world) => {
    const s = world.boss;
    if (s?.kind !== "antiphon" || s.downBeat >= 0) return [];
    const cfg = world.cfg;
    const marks: Mark[] = [];
    if (showsAntiphonOrgan(l.role)) {
      const n = s.organs.length;
      for (let i = 0; i < n; i++) {
        const c = antiphonOrganCircle(l, cfg, i, n);
        marks.push({ id: -1 - i - 10 * n, x: c.x, y: c.y + c.r * ORGAN_GRIP_DOWN });
      }
    }
    if (showsAntiphonRail(l.role)) {
      s.rail.forEach((c, i) => {
        if (antiphonCrossed(s, i)) return;
        marks.push({ id: -100 - c.col, ...antiphonPerch(l, c.col) });
      });
    }
    return marks;
  },
  // The spindle while a fire is asked of it, and the catch's ring at the lit
  // step's mark with the track's head under it, all in the body's drop. The
  // flag's lay swings only the canvas.
  burgee: (l, world, phase) => {
    const s = world.boss;
    if (s?.kind !== "burgee") return [];
    const step = burgeeLitStep(s);
    if (step === null) return [];
    const cfg = world.cfg;
    const dy = -(1 - burgeeArrived(s, cfg, world.beat, phase)) * BURGEE_ARRIVE * l.tile;
    const marks: Mark[] = [];
    if (step.ask === "fire" && s.spindleLit) {
      const at = burgeeSpindleAt(l, cfg);
      marks.push({ id: -3, x: at.x, y: at.y + dy });
    }
    if (burgeeCatching(s)) {
      const { ring, to } = burgeeMarks(l, cfg, step);
      marks.push({ id: -1, x: ring.x, y: ring.y + dy });
      marks.push({ id: -2, x: to.x, y: to.y + dy });
    }
    return marks;
  },
  // The hook while a fire step asks for it, at the end of its chain off the
  // boom's angle; both screens draw it the same. With nobody steering the
  // boom swings back toward hanging by the rule, eased through the beat
  // (`davitAngle`), so it is left in.
  davit: (l, world, phase) => {
    const s = world.boss;
    if (s?.kind !== "davit" || davitLitStep(s)?.ask !== "fire") return [];
    const mast = davitMast(l, world.cfg);
    const hook = davitHook(l, davitAngle(s, world.cfg, phase), DAVIT_SAG);
    return [{ id: -1, x: mast.x + hook.x, y: mast.y + hook.y }];
  },
};
