import {
  instarStep,
  type NettlePart,
  type NettlePose,
  type NettleState,
  type SceneMark,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { INSTAR_FLIGHT_ENDS } from "./instar-shape.js";
import { BEATEN, ENTER, placed } from "./nettle-poses.js";
import { phaseInto } from "./phase-into.js";

type NettleMark = SceneMark<NettlePart>;

/**
 * **THE NETTLE's own body**, next to its own poses table
 * (`nettle-poses.ts`) rather than a branch in `instar-shape.ts` — THE
 * INSTAR's `Figure` is a dragon's; this one is a jellyfish's, and the two
 * share nothing but the engine that morphs one figure into the next.
 *
 * A pose is a figure and a morph is a lerp, the same as THE INSTAR
 * (`docs/spec/bosses.md` §11.32): each of the eight poses is one `Figure`
 * (`nettle-poses.ts`), the body between two of them is the straight blend,
 * eased, over the part of the step's `morphBeats` the flight takes, and
 * while the marks are up the figure is the pose's, deformed by how far each
 * mark has got — an arm drawn back in as it is pulled up, an eyespot dimmed
 * as it is shot, the sac spent as it is tapped, a spore sucked off the
 * curtain per press, the iris eased shut by the turn, a glob glued down per
 * press, a strip of the frill lifted per swipe, the core dimmed shot by
 * shot.
 */

export interface Figure {
  /** The bell's centre and radius, thousandths of the field's width. */
  bellX: number;
  bellY: number;
  bellR: number;
  /** How far the body has turned to show its underside, 0..1: 0 is the bell
   * face-on, 1 the iris and the curtain bared at the ship. */
  side: number;
  /** How far each stinging arm is drawn out to sting, 0..1, left and right. */
  armL: number;
  armR: number;
  /** How bright each eyespot on the rim glows, 0..1, left and right. */
  spotL: number;
  spotR: number;
  /** How swollen the brood sac stands, 0..1. */
  sac: number;
  /** Spores still clinging to the sac, 0..1, one cluster a side. */
  sporeL: number;
  sporeR: number;
  /** How open the iris of the mouth stands, 0..1. */
  mouth: number;
  /** Each glob still held at the curtain's rim, 0..1, left, middle, right. */
  globL: number;
  globM: number;
  globR: number;
  /** How much of the oral-arm curtain still hangs down, 0..1. */
  frill: number;
  /** How bright the core burns inside the bell, 0..1. */
  coreGlow: number;
  /** How far the bell has opened to bare the core, 0..1. */
  coreOpen: number;
}

/** The pose's figure after its marks are done: the parts the pair undid. */
function landed(pose: NettlePose, marks: readonly NettleMark[]): Figure {
  return deformed(placed(pose, marks), marks, () => 1);
}

/** One mark's part eased back by how far along it is, 0..1: the pose's
 * figure is what the pair walks in on, and every mark undoes its own share
 * of it. */
export function deformed(
  f: Figure,
  marks: readonly NettleMark[],
  along: (i: number) => number,
): Figure {
  const g = { ...f };
  marks.forEach((m, i) => {
    const p = Math.max(0, Math.min(1, along(i)));
    const left = m.xMilli < 500;
    if (m.part === "arm") {
      if (left) g.armL = f.armL * (1 - p);
      else g.armR = f.armR * (1 - p);
    } else if (m.part === "spot") {
      if (left) g.spotL = f.spotL * (1 - p);
      else g.spotR = f.spotR * (1 - p);
    } else if (m.part === "sac") {
      g.sac = f.sac * (1 - p);
    } else if (m.part === "spore") {
      if (left) g.sporeL = f.sporeL * (1 - p);
      else g.sporeR = f.sporeR * (1 - p);
    } else if (m.part === "mouth") {
      g.mouth = f.mouth * (1 - p);
    } else if (m.part === "glob") {
      if (m.xMilli < 400) g.globL = f.globL * (1 - p);
      else if (m.xMilli > 600) g.globR = f.globR * (1 - p);
      else g.globM = f.globM * (1 - p);
    } else if (m.part === "frill") {
      g.frill = f.frill * (1 - p);
    } else if (m.part === "core") {
      g.coreGlow = f.coreGlow * (1 - p);
    }
  });
  return g;
}

function lerp(a: Figure, b: Figure, t: number): Figure {
  const out = { ...a };
  for (const k of Object.keys(a) as (keyof Figure)[]) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/** The figure the body stands in this frame. */
export function nettleFigure(s: NettleState, beat: number, beatPhase: number): Figure {
  const at = phaseInto(s, beat, beatPhase);
  const step = instarStep(s);
  const prev = s.steps[s.cursor - 1];
  const from = prev === undefined ? ENTER : landed(prev.pose, prev.marks);
  if (s.phase === "down" || step === null) {
    return lerp(from, BEATEN, smoothstep(at / 2));
  }
  if (s.phase === "morph") {
    const t = at / (step.morphBeats * INSTAR_FLIGHT_ENDS);
    return lerp(from, placed(step.pose, step.marks), smoothstep(Math.min(1, t)));
  }
  const pose = placed(step.pose, step.marks);
  return deformed(pose, step.marks, (i) => {
    const need = step.marks[i]?.need ?? 1;
    return (s.progress[i] ?? 0) / need;
  });
}
