import { walkedSilhouette } from "../../../../../packages/content/src/body-form.js";
import { blobRadiusMul, type Point } from "../../../../../packages/content/src/shapes.js";
import type { CreatureSilhouette } from "../../../../../packages/content/src/silhouettes.js";

/**
 * TOOTHED — THE RIND card off the shapes page, given to the body that was
 * never given it: a round rind whose rim is broken into sharpened teeth while
 * it is whole, and the teeth wear down as the layers go.
 *
 * `tools/shape-sheet/src/drafts/tower-defence.ts` draws THE RIND as `shed`:
 * three sizes stepped down and a rim that goes from toothed to smooth,
 * "because a body that has lost its armour should not still look armoured".
 * The game took the first half of that argument — the size steps — and never
 * the second. This is the second, with one change the card could not make:
 * the card reads its armour off a clock, and this reads it off the creature.
 * A rind with both layers on has its full teeth, a rind with one has half of
 * them, and the bare body underneath is the ordinary slick or bulb it always
 * was — so the rim is a second readout of the count, said in the silhouette
 * where a phone can hear it, beside the size that already says it.
 *
 * The notch is the card's own: a sine sharpened through `tanh`, so a tooth
 * reads as a broken edge rather than as lobing, on a body that is otherwise a
 * five-lobed blob so shallow it is nearly round — round, because a rind is a
 * thing *around* a slick or a bulb, and the body it is around has the lobes.
 */

const TEETH = 9;
/** How far a tooth stands off the rim at full armour, as a share of the radius. */
const BITE = 0.1;
/** The silhouette's reach: a rind fits the same footprint whatever it wears,
 * so these two only set the aspect — a little wider than tall, like the slick
 * it is round. */
const RX = 60;
const RY = 52;
/** Points round the rim: enough that nine teeth are nine points and not nine
 * dents (`studded.ts` takes 224 for the same reason). */
const N = 160;

const base = { lobes: TEETH, depth: 0.04, wobble: 0.03, seed: 3.3 };

function contour(armour: number): (t: number) => Point[] {
  return (t) => {
    const pts: Point[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const notch = Math.tanh(Math.sin(TEETH * a + 1.7) * 2.4);
      const body = blobRadiusMul(a, 5, base.depth, base.wobble, t, base.seed);
      const m = body * (1 + BITE * armour * notch);
      pts.push({ x: Math.cos(a) * RX * m, y: Math.sin(a) * RY * m });
    }
    return pts;
  };
}

/** One silhouette per count of layers, built the first time it is asked for. */
const built = new Map<number, CreatureSilhouette>();

export function toothed(left: number, layers: number): CreatureSilhouette {
  const armour = layers > 0 ? Math.min(1, left / layers) : 1;
  const have = built.get(left);
  if (have) return have;
  const made = walkedSilhouette(base, contour(armour));
  built.set(left, made);
  return made;
}
