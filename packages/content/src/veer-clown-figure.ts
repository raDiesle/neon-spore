import type { Point } from "./shapes.js";
import type { ClownDisc, ClownFigure, ClownSilhouette } from "./veer-clown-shape.js";

/**
 * THE VEER's rider **placed**: where every disc of the clown falls on a rock
 * of a given centre and radius, and the closed loops all of it comes to.
 *
 * Its own file beside `veer-clown-shape.ts`, split when that one reached the
 * 250-line ceiling, along the seam it already had. Next door is the *shape* —
 * four interfaces and one record of multipliers, every number a fraction of a
 * head or a rock, describing a clown at no size and in no place. Here is the
 * arithmetic that gives it one. The shape is argued over by an eye; this is
 * argued over by a caller, and the two change for different reasons.
 */

/**
 * The rider on a rock of radius `r` centred at `cx, cy`, bracing by `brace`
 * (0 to 1) and swaying by `sway` head-radii.
 *
 * `brace` is what the beat does to the figure: it sinks into the pull and the
 * hat whips over with it. Both are on both screens from the moment the beat
 * begins, because *now* is a thing both players are entitled to and *which
 * way* is player 1's alone (`render/veer-marks.ts`).
 */
export function clownFigure(
  s: ClownSilhouette,
  cx: number,
  cy: number,
  r: number,
  brace: number,
  sway: number,
): ClownFigure {
  const hr = r * s.headMul;
  // The collar stays on the rock's crown: it is the figure's grip, and the
  // owner read it as hands — "the hands must stay on top connected holding the
  // meteor all the time" (11 September 2026). Only the head and hat crouch.
  const restY = cy - r * s.seatMul;
  const seatY = restY + r * s.crouchMul * brace;
  const headX = cx + sway * hr;
  const headY = seatY - hr * s.headLift;

  const ruff: ClownDisc[] = [];
  for (let k = -s.ruffSide; k <= s.ruffSide; k++) {
    ruff.push({
      x: cx + k * hr * s.ruffStep,
      y: restY + Math.abs(k) * hr * s.ruffDrop,
      r: hr * s.ruffMul,
    });
  }

  // The hat's own frame: a cone off the crown, turned by the lean, with the
  // pompom on its tip. It is turned into place here rather than left as a
  // rotation for the caller, so the outline the palette draws and the triangle
  // the game strokes are the same three corners.
  const lean = s.hatLean * brace;
  const baseY = headY - hr * s.hatLift;
  const turn = (x: number, y: number): Point => ({
    x: headX + x * Math.cos(lean) - y * Math.sin(lean),
    y: baseY + x * Math.sin(lean) + y * Math.cos(lean),
  });
  const tip = turn(0, -hr * s.hatTip);

  return {
    ruff,
    head: { x: headX, y: headY, r: hr },
    hat: [turn(-hr * s.hatHalf, 0), turn(hr * s.hatHalf, 0), tip],
    pompom: { ...tip, r: hr * s.pompomMul },
    eyes: [
      { x: headX - hr * s.eyeOut, y: headY - hr * s.eyeUp, r: hr * s.eyeMul },
      { x: headX + hr * s.eyeOut, y: headY - hr * s.eyeUp, r: hr * s.eyeMul },
    ],
    grin: {
      x: headX,
      y: headY + hr * s.grinDrop,
      r: hr * s.grinMul,
      from: s.grinFrom * Math.PI,
      to: s.grinTo * Math.PI,
      width: Math.max(1, hr * s.grinWidth),
    },
    nose: { x: headX, y: headY + hr * s.noseDrop, r: hr * s.noseMul },
    noseGlow: hr * s.noseGlowMul,
    brace: { x: headX, y: headY, r: hr * s.braceMul },
  };
}

/**
 * The figure as closed loops — the ruff, the head, the hat, the pompom and the
 * nose — for anything that wants the rider as an outline.
 *
 * **The eyes and the grin are not in it, and that is a rule rather than an
 * omission.** They are cut in the background's own dark on the field, which is
 * to say they are holes in the head and not bodies sitting on it; an outline
 * that traced them would draw two rings and a crescent where a face reads. The
 * nose is in, because a nose *is* a body sitting on the face — it is the one
 * coloured thing on the whole rock — and a head with nothing on it is not a
 * clown anybody recognises at the size a palette button gets.
 */
export function clownLoops(f: ClownFigure, steps = 24): Point[][] {
  const ring = (d: ClownDisc): Point[] => {
    const pts: Point[] = [];
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      pts.push({ x: d.x + Math.cos(a) * d.r, y: d.y + Math.sin(a) * d.r });
    }
    return pts;
  };
  return [...f.ruff.map(ring), ring(f.head), f.hat, ring(f.pompom), ring(f.nose)];
}
