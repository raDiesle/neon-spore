import type { Bump, LobeShape } from "@neon-spore/content";

/**
 * One lobe of the membrane, as a bump on the contour. The lift breathes and the
 * width breathes against it, so the lobe swells and narrows the way a held
 * breath does rather than simply scaling up and down.
 *
 * Shared by the cannon (one lobe) and the shield (a chain of them), which is
 * why it does not live in either file.
 */
export function lobe(
  shape: LobeShape,
  angle: number,
  tile: number,
  ry: number,
  rx: number,
  time: number,
  scale: number,
  halfMul = 1,
): Bump {
  const breath = Math.sin(time * shape.breathHz * Math.PI * 2 + shape.breathPhase);
  const lift = ((tile * shape.liftTiles) / ry) * (1 + shape.breath * breath) * scale;
  const half = ((tile * shape.halfTiles * halfMul) / rx) * (1 - shape.breath * 0.5 * breath);
  return {
    angle,
    strength: lift,
    plateau: half * shape.plateau,
    shoulder: half * shape.shoulder,
  };
}
