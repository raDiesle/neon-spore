/**
 * **A part that glances** (`.claude/skills/depth`, "A part that glances"): a
 * head, a claw, a turret or a machine's whole shell turns a little to one side
 * and the other, so the eye sees it from a new side. THE INSTAR's head was the
 * first (`instar-turn.ts`); every boss after it turns its part through here.
 *
 * The part is drawn as two planes meeting down its middle, each squeezed or
 * opened by its own affine about the middle's swing, and the two affines are
 * fitted so the points `hold` part radii either side of the centre stay where
 * they are — the two eyes, the two shoulders a crane hangs from, the two marks
 * a thumb is on. **A `hold` of 0 holds the centre instead**: nothing swings,
 * the near half opens and the far half closes about a middle that stays put —
 * a machine's mount turning on the hub a shot is aimed at (`vane-glance.ts`).
 * The side it turns toward opens; the far side closes and goes
 * into the cool dark toward its edge, as dark as the swing is wide. A roll
 * about the centre goes on top. A thumb meets the part where it is drawn by
 * asking `glancedPoint` the same question.
 *
 * **A part may nod as well** (the owner, 15 October 2026: *glance him not only
 * to left and right, but also to top and bottom*). Its middle then swings up
 * or down as well as across, and the turn is the same two planes split along
 * the line square to where the middle has gone (`turnOf`) — a look up, a look
 * down, or one over a shoulder. A part that does not nod is drawn by exactly
 * the calls it always was.
 */

/** Where a part is looking, `time` seconds in on the picture's clock. */
export interface Glance {
  /** How far the part's middle swings, in part radii: + toward the screen's right. */
  swing: (time: number) => number;
  /** How far the part rolls about its centre, radians: + clockwise. */
  roll: (time: number) => number;
  /** How far the part's middle swings up or down, in part radii: + toward the screen's bottom. */
  nod?: (time: number) => number;
}

/** A part that does not glance — what every record ships as until the owner takes one. */
export const STILL_GLANCE: Glance = { swing: () => 0, roll: () => 0 };

/** One frame of a glance, in pixels. */
export interface GlanceFrame {
  /** The part's centre. */
  x: number;
  y: number;
  /** The part's radius: the unit `swing` and `hold` are counted in. */
  r: number;
  /** How far either side of the centre the held points sit, in part radii; 0 holds the centre. */
  hold: number;
  /** How far the middle has swung, pixels. */
  swing: number;
  /** How far the part has rolled, radians. */
  roll: number;
  /** How far the middle has nodded, pixels: + down. Absent, or 0, on a part that only turns across. */
  nod?: number;
}

/** A glance's frame at `time`, with `base` part radii of swing a part carries anyway. */
export function glanceFrame(
  glance: Glance,
  time: number,
  at: { x: number; y: number; r: number; hold: number },
  base = 0,
): GlanceFrame {
  const f = { ...at, swing: (glance.swing(time) + base) * at.r, roll: glance.roll(time) };
  return glance.nod === undefined ? f : { ...f, nod: glance.nod(time) * at.r };
}

/** Whether a frame draws the part exactly as an unturned one. */
export const glanceStill = (f: GlanceFrame): boolean =>
  f.swing === 0 && f.roll === 0 && (f.nod ?? 0) === 0;

/**
 * **Which way a frame turns**: the angle, radians from the screen's right,
 * that its middle has gone, and the frame as it is seen turned to lie along
 * it — all its swing across, none of it a nod. A frame that does not nod is
 * its own, at no angle, so it is drawn exactly as before nodding was.
 */
export function turnOf(f: GlanceFrame): { angle: number; along: GlanceFrame } {
  const nod = f.nod ?? 0;
  if (nod === 0) return { angle: 0, along: f };
  return {
    angle: Math.atan2(nod, f.swing),
    along: { ...f, swing: Math.hypot(f.swing, nod), nod: 0 },
  };
}

/** How half `s` of the part is squeezed (under 1) or opened (over 1), the held point on it staying put. */
export function glanceSqueeze(f: GlanceFrame, s: -1 | 1): number {
  return 1 - (s * f.swing) / ((f.hold || 1) * f.r);
}

/** How far the middle is drawn off the centre: the swing, or nothing where the centre is held. */
export const middleShift = (f: GlanceFrame): number => (f.hold === 0 ? 0 : f.swing);

/** Where `drawGlancedLayer` draws a point `p` of the part — a bolt or a thumb meets it there. */
export function glancedPoint(
  f: GlanceFrame,
  p: { x: number; y: number },
): { x: number; y: number } {
  if ((f.nod ?? 0) !== 0) return noddedPoint(f, p);
  const k = glanceSqueeze(f, p.x < f.x ? -1 : 1);
  const x = middleShift(f) + k * (p.x - f.x);
  const y = p.y - f.y;
  // The roll about the centre, added on so no roll is the point exactly.
  const c = Math.cos(f.roll) - 1;
  const sn = Math.sin(f.roll);
  return { x: f.x + x + (x * c - y * sn), y: p.y + (x * sn + y * c) };
}

/** `glancedPoint` for a part that nods: the point seen along the turn, turned there, and seen back. */
function noddedPoint(f: GlanceFrame, p: { x: number; y: number }): { x: number; y: number } {
  const { angle, along } = turnOf(f);
  const c = Math.cos(angle);
  const sn = Math.sin(angle);
  const dx = p.x - f.x;
  const dy = p.y - f.y;
  const u = glancedPoint(
    { ...along, roll: 0 },
    { x: f.x + dx * c + dy * sn, y: f.y - dx * sn + dy * c },
  );
  const ux = u.x - f.x;
  const uy = u.y - f.y;
  const back = { x: f.x + ux * c - uy * sn, y: f.y + ux * sn + uy * c };
  return glancedPoint({ ...f, swing: 0, nod: 0 }, back);
}
