import type { Layout } from "@neon-spore/render";
import {
  type BossKind,
  instarStep,
  mantleBracing,
  seamLitStep,
  seamWantsShot,
  slingAsks,
  slingLitStep,
  valveFrozen,
  valveMark,
  valveTurning,
  type World,
} from "@neon-spore/sim";
import { capstanCues } from "../../../packages/render/src/boss-cue-read-zl.js";
import { capstanScreenAt } from "../../../packages/render/src/capstan-grip.js";
import { capstanShake } from "../../../packages/render/src/capstan-pose.js";
import { instarMarksUp } from "../../../packages/render/src/instar-marks.js";
import { instarMarkPoint } from "../../../packages/render/src/instar-place.js";
import { instarThreat } from "../../../packages/render/src/instar-shape.js";
import { mantleShudder } from "../../../packages/render/src/mantle-brace.js";
import { mantleKnobCircle } from "../../../packages/render/src/mantle-grip.js";
import { nettleSway } from "../../../packages/render/src/nettle-sway.js";
import { seamArrived, seamLitPoint, seamSplit } from "../../../packages/render/src/seam-pose.js";
import { seamCentre, seamLift, seamLobe } from "../../../packages/render/src/seam-shape.js";
import { seamTurn } from "../../../packages/render/src/seam-story.js";
import { slingGone, slingTension } from "../../../packages/render/src/sling-pose.js";
import {
  slingCupRadius,
  slingHandle,
  slingHome,
} from "../../../packages/render/src/sling-shape.js";
import { valveArrived, valveList } from "../../../packages/render/src/valve-pose.js";
import {
  onBearing,
  valveCentre,
  valveLift,
  valveSocket,
  valveWheel,
} from "../../../packages/render/src/valve-shape.js";
import { valveShake } from "../../../packages/render/src/valve-story.js";
import { DRAWN_B } from "./boss-hush-drawn-b.js";

/**
 * **The drawn-mark readers `boss-hush.test.ts` walks**: a boss's marks placed
 * where no cue reaches, as its draw places them — the functions its draw
 * calls, and the transforms it stands them in. Out of the test on 27
 * September 2026, when the fourth lane's six readers would have taken it
 * past 250 lines.
 *
 * Two of that lane's readers found a motion to hush and hushed it by calling
 * the same function the draw does, given the world: THE VALVE's brace
 * shudder, five a beat under the socket both thumbs hold (`valveShake`), and
 * THE GALL's ripple, until its rework of 8 October 2026 took THE SLOW off
 * its asking windows and its row with it.
 *
 * A reader leaves out motion that *is* the rule: a rock falling to the hull,
 * a cord drawn out by the thumb on it. What is left is where a thumb is asked
 * to go, and that must hold still.
 */

export interface Mark {
  /** Apart from every cue's seed, which are all positive. */
  id: number;
  x: number;
  y: number;
}

export type Drawn = (l: Layout, world: World, beatPhase: number, time: number) => readonly Mark[];

export const DRAWN: Partial<Record<BossKind, Drawn>> = {
  mantle: (l, world, phase, time) => {
    const s = world.boss;
    if (s?.kind !== "mantle" || !mantleBracing(s)) return [];
    const shudder = mantleShudder(l, world, s, world.beat, phase, time);
    return ([-1, 1] as const).map((side, k) => {
      const knob = mantleKnobCircle(l, world.cfg, s, side, world.beat, phase, s.depthMilli[k]);
      return { id: -1 - k, x: knob.x + shudder, y: knob.y };
    });
  },
  // The rub's word stands where the face is before the rattle, which the ends
  // are drawn inside; the lean's horns are drawn before it and the `FIRE` at the hull.
  capstan: (l, world, phase, time) => {
    const s = world.boss;
    if (s?.kind !== "capstan") return [];
    const shake = capstanShake(l, world, s, world.beat, phase, time);
    const at = capstanScreenAt(l, world.cfg, s, { x: 0, y: 0 }, world.beat, phase);
    const [cos, sin] = [Math.cos(shake.roll), Math.sin(shake.roll)];
    const rubs = capstanCues(l, world, s, phase).filter((c) => c.word === "RUB");
    return rubs.map((c) => {
      const [dx, dy] = [c.x - at.x, c.y - at.y];
      const x = at.x + shake.x + dx * cos - dy * sin;
      return { id: -c.seed, x, y: at.y + shake.y + dx * sin + dy * cos };
    });
  },
  // The lit point's ring on the crack, in the ridge's frame: the ridge's
  // centre, lifted as it goes, and the point's lobe down its spine. The
  // ridge's own breathing outline and the ember are skin; the grit and the
  // rock fall to the hull by the rule (`seam-draw.ts`).
  seam: (l, world, phase) => {
    const s = world.boss;
    if (s?.kind !== "seam") return [];
    const step = seamLitStep(s);
    if (step === null || step.ask !== "point" || !seamWantsShot(s)) return [];
    const cfg = world.cfg;
    if (seamSplit(s, cfg, world.beat, phase) > 0) return [];
    if (seamTurn(s, cfg, world.beat, phase) >= 0.5) return [];
    const home = seamCentre(l, cfg);
    const y = home.y - seamLift(l, seamArrived(s, cfg, world.beat, phase));
    const k = seamLitPoint(s);
    return [{ id: -1 - k, x: home.x, y: y + seamLobe(l, k).y }];
  },
  // The cup's ring for a shot, and each asked cord's handle while it hangs
  // slack. A handle being drawn moves with the thumb on it, which is the rule.
  sling: (l, world, phase) => {
    const s = world.boss;
    if (s?.kind !== "sling") return [];
    const step = slingLitStep(s);
    if (step === null) return [];
    const home = slingHome(l, world.cfg, slingGone(s, world.cfg, world.beat, phase));
    if (step.ask === "fire") {
      return [{ id: -1, x: home.x, y: home.y - slingCupRadius(l) * 0.2 }];
    }
    return ([0, 1] as const).flatMap((side) => {
      if (!slingAsks(s, side) || slingTension(world, s, side, world.beat, phase) > 0) return [];
      const at = slingHandle(l, side, 0);
      return [{ id: -2 - side, x: home.x + at.x, y: home.y + at.y }];
    });
  },
  // The socket and the wheel's notch, in the drum's frame: its centre, the
  // brace's shudder (hushed), and the list it leans by.
  valve: (l, world, phase) => {
    const s = world.boss;
    if (s?.kind !== "valve") return [];
    const cfg = world.cfg;
    const home = valveCentre(l, cfg);
    const lift = valveLift(l, valveArrived(s, cfg, world.beat, phase));
    const shake = valveShake(l, s, cfg, world.beat, phase, world);
    const turn = valveList(s, cfg, world.beat, phase);
    const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
    const put = (id: number, p: { x: number; y: number }): Mark => ({
      id,
      x: home.x + shake.x + p.x * cos - p.y * sin,
      y: home.y - lift + shake.y + p.x * sin + p.y * cos,
    });
    const marks = [put(-1, valveSocket(l).at)];
    if (valveTurning(s) || valveFrozen(s)) {
      const { at, r } = valveWheel(l);
      marks.push(put(-2, onBearing(at, r * 1.08, valveMark(s))));
    }
    return marks;
  },
  // Its marks where THE INSTAR's stand (`instar-marks.ts`), carried by the
  // bell's pulse; a swept mark's travel along its track is the gesture.
  nettle: (l, world, phase) => {
    const s = world.boss;
    if (s?.kind !== "nettle" || !instarMarksUp(world, s)) return [];
    const step = instarStep(s);
    if (step === null) return [];
    const sway = nettleSway(s, world.cfg, world, world.beat, phase);
    const along = instarThreat(s, world.beat, phase);
    return step.marks.map((m, k) => ({ id: -1 - k, ...instarMarkPoint(l, m, sway, along) }));
  },
  ...DRAWN_B,
};
