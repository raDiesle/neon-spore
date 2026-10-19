/**
 * **PALM's hand, as a hand is built** (`blister-palm.ts`): a palm wider at the
 * knuckles than at the heel, with a mound under the thumb, going down into a
 * wrist; four fingers of three joints each, the middle one longest and the
 * little one shortest, each narrower at its tip than its root; and a thumb of
 * two, set low on the palm's side and turned out, shorter and thicker than
 * any finger. Everything here is in body radii from the drop's middle, the
 * palm turned to the viewer.
 *
 * The owner, 19 October 2026: *improve graphics of enemy BLISTER:DEATH-HOLD
 * so it looks like a real hand* — the first PALM was a mitten, four even
 * capsules fanned out of an ellipse.
 */

export interface Pt {
  readonly x: number;
  readonly y: number;
}

/** One finger or the thumb: where it leaves the palm, which way it points
 * (radians from straight up, + toward the little finger), how long and how
 * thick it is, and how its length is shared between its bones. */
export interface Digit {
  readonly root: Pt;
  readonly lean: number;
  readonly len: number;
  readonly w: number;
  readonly bones: readonly number[];
  /** How far each joint folds toward the viewer at a full grip, radians. */
  readonly fold: readonly number[];
  /** How far it leans in over the drop at a full grip. */
  readonly closeIn: number;
}

const FINGER_BONES = [0.46, 0.31, 0.23];
const FINGER_FOLD = [0.85, 1.45, 0.9];

/** Index, middle, ring, little — the thumb is on the left. */
export const FINGERS: readonly Digit[] = [
  finger(-0.66, -0.9, -0.2, 1.06, 0.2),
  finger(-0.22, -0.97, -0.05, 1.2, 0.205),
  finger(0.22, -0.94, 0.11, 1.12, 0.19),
  finger(0.63, -0.8, 0.3, 0.86, 0.165),
];

export const THUMB: Digit = {
  root: { x: -0.9, y: -0.05 },
  lean: -0.8,
  len: 1.05,
  w: 0.28,
  bones: [0.52, 0.48],
  fold: [0.2, 0.35],
  closeIn: 0.6,
};

function finger(x: number, y: number, lean: number, len: number, w: number): Digit {
  return {
    root: { x, y },
    lean,
    len,
    w,
    bones: FINGER_BONES,
    fold: FINGER_FOLD,
    closeIn: lean * 0.45,
  };
}

/** One bone as drawn: from `a` to `b`, `w` wide at `a`, and whether it is
 * folded past upright, its back to the viewer, so it is drawn in front. */
export interface Bone {
  readonly a: Pt;
  readonly b: Pt;
  readonly wa: number;
  readonly wb: number;
  readonly folded: boolean;
  /** Last bone of the digit, the one that carries the nail. */
  readonly tip: boolean;
}

/**
 * The bones of a digit curled `curl` of the way to a grip, seen palm-on: each
 * joint folds toward the viewer, so a bone is drawn shortened by the cosine of
 * how far it has turned, and one turned past a right angle points back down
 * over the palm. The thumb does not fold toward the viewer but swings in
 * across the drop, its tip bending toward the fingers.
 */
export function bonesOf(d: Digit, curl: number, thumb: boolean): Bone[] {
  const out: Bone[] = [];
  let p = d.root;
  let turned = 0;
  let lean = d.lean - d.closeIn * curl;
  const bones = d.bones.length;
  for (let k = 0; k < bones; k++) {
    const len = d.len * (d.bones[k] ?? 0);
    const fold = (d.fold[k] ?? 0) * curl;
    let shown: number;
    if (thumb) {
      lean += fold + (k > 0 ? 0.3 : 0);
      shown = len;
    } else {
      turned += fold;
      shown = len * Math.cos(turned);
    }
    const q = { x: p.x + Math.sin(lean) * shown, y: p.y - Math.cos(lean) * shown };
    const taper = 1 - (0.12 * k) / Math.max(1, bones - 1);
    out.push({
      a: p,
      b: q,
      wa: d.w * taper,
      wb: d.w * (taper - 0.1),
      folded: !thumb && turned > Math.PI / 2,
      tip: k === bones - 1,
    });
    p = q;
  }
  return out;
}

/**
 * The palm: up the little finger's edge, across the knuckles in an arch, down
 * past the web of the thumb and round the mound under it to the wrist, which
 * runs on down into the pore. Wound the way `bone` winds a bone, so the
 * nonzero fill is the union.
 */
export function palmPath(p: Path2D, at: (q: Pt) => Pt): void {
  const go = (x: number, y: number) => at({ x, y });
  const c = (ax: number, ay: number, bx: number, by: number, x: number, y: number) => {
    const a = go(ax, ay);
    const b = go(bx, by);
    const e = go(x, y);
    p.bezierCurveTo(a.x, a.y, b.x, b.y, e.x, e.y);
  };
  const s = go(0.6, 1.7);
  p.moveTo(s.x, s.y);
  c(0.66, 1.0, 1.0, 0.45, 0.9, -0.62);
  c(0.6, -1.12, -0.6, -1.16, -0.86, -0.86);
  c(-0.98, -0.62, -1.1, -0.3, -1.16, 0.1);
  c(-1.26, 0.62, -0.72, 0.9, -0.6, 1.7);
  p.closePath();
}

/** One bone, a capsule round at both ends — the round ends are its knuckles —
 * wound up its right side, over its far end and down its left. */
export function bone(p: Path2D, a: Pt, b: Pt, wa: number, wb: number): void {
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const nx = -Math.sin(ang);
  const ny = Math.cos(ang);
  p.moveTo(a.x + nx * wa, a.y + ny * wa);
  p.lineTo(b.x + nx * wb, b.y + ny * wb);
  p.arc(b.x, b.y, wb, ang + Math.PI / 2, ang - Math.PI / 2, true);
  p.lineTo(a.x - nx * wa, a.y - ny * wa);
  p.arc(a.x, a.y, wa, ang - Math.PI / 2, ang + Math.PI / 2, true);
  p.closePath();
}
