import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { BUDGET_SKY, budgetRow } from "./budget-row.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";
import { acting, hung, TPB } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * An op-count budget for **THE INSTAR's turn between its two views** — the
 * stretch of a morph where the body is part of the way round
 * (`instarHandover`). It cost two to five times a still frame until the tubes
 * were sliced by their size on the screen and a view flown off the field was
 * left undrawn (`solid-tube-screen.ts`, `instar-reach.ts`); these rows hold it
 * there. The dive was 1390 draws and 302 gradients before.
 *
 * The dive flies the body at a fifth of its size, a speck, and a speck is
 * drawn without its surface texture (`speck` in `solid-tube-screen.ts`): 440
 * fills and 513 strokes became 289 and 237. The coil and the roar peak at
 * seven tenths, where nothing is left out.
 *
 * On 27 September 2026 the baked iris and hide were taken off VERSUS: the two
 * front irises are a blit each (drawImage 30 → 32, fills two fewer) and the
 * scales one pattern fill a plate instead of a stroked row of arcs (the coil's
 * strokes 513 → 452, the roar's 524 → 463). The dive is a speck and lays no
 * scales, so only its irises moved.
 *
 * On 2 October 2026 THE INSTAR's dragon body and serpent swim shipped: a
 * deeper body is more slices on the screen and a swimming one more lights
 * (coil fills 449 → 458, dive 287 → 302 and linear gradients 46 → 52, roar
 * fills 456 → 457, its strokes 463 → 453). The gradients held because the
 * tube's light cache grew to 2048 (`solid-tube-light.ts`); at 512 it filled
 * through the turn and the coil made 157 in the frame after it emptied.
 *
 * `fill` up one in every row on 5 October 2026: the cannon's column became a
 * gunsight in the seat's colour, its rails and ticks one path (`cannon-column.ts`).
 *
 * On 7 October 2026 the head side-on turned three quarters to the ship
 * (`instar-quarter-head.ts`): two eyes and two brows where the profile had one,
 * two nostrils, the snarl's folds and the frill. Coil fills 459 → 481 and
 * strokes 452 → 480, roar 458 → 480 and 453 → 481, dive 303 → 324 and
 * 237 → 253; a second iris is two blits more and two radial gradients.
 *
 * The same day the side-on body grew four legs (`instar-legs.ts`), each a lit
 * tube with three claws: coil fills 481 → 553 and strokes 480 → 492, roar
 * 480 → 552 and 481 → 493, dive 324 → 369, 253 → 265 and two linear gradients.
 * The tail's two crescents then became fins on bone rays with a barb
 * (`instar-tail-blade.ts`), three strokes each: coil 492 → 498, roar
 * 493 → 499, dive 265 → 271.
 *
 * Then the face-on view became the same drake (`instar-front.ts`): the tail
 * with its fins out of the far end, the legs, and the side view's hide — scale
 * rows, belly, lamps, two rows of spines — on its tube. Across a turn both
 * views are drawn, so coil fills 553 → 706 and strokes 498 → 560, roar
 * 552 → 704 and 499 → 556, dive 369 → 433 and 271 → 312, with two or three
 * gradients more each.
 *
 * Then the turn became one body turning instead of the two views crossed
 * (`instar-turning.ts`): one body drawn where there were two, so coil fills
 * 706 → 469 and strokes 560 → 433, roar 704 → 474 and 556 → 434, dive
 * 433 → 296 and 312 → 236. The roar's linear gradients are the one row that
 * rose, 91 → 117: the body really yaws round now,
 * so its sections are lit at angles the tube's light cache has not held yet
 * (`solid-tube-light.ts`), each baked once as the turn first reaches it.
 *
 * On 9 October 2026 the approach's TAPER was taken (`instar-flight-taper.ts`):
 * the dive's body is one smooth taper with the wings spread full while it
 * flies in, so fills 296 → 301 and linear gradients 49 → 54.
 *
 * The same day the body's far end was kept on the screen and the resting tail
 * took to leaning both ways (`instar-far-end.ts`, `instar-tail-lean.ts`): a
 * rear moved in from past the corner yaws the turning body through angles
 * the tube's light cache had not baked, so the linear gradients rose — coil
 * 73 → 79, dive 54 → 56, roar 117 → 149, and one radial more in the roar —
 * and the dive's fills fell 301 → 289, less of its body sliced at the
 * screen's edge.
 *
 * On 14 October 2026 the face-on head was drawn once onto the glance's own
 * layer and laid down a half at a time (`instar-turn.ts`, `glance-layer.ts`),
 * where it had been drawn whole under each half's clip, which left a hairline
 * down the snout. Its draws are made on the layer's canvas now, which these
 * rows do not count — they count the screen's — so the rows fell by the head
 * twice over: coil fills 469 → 375, strokes 433 → 313, radial gradients
 * 41 → 25; dive 289 → 237, 236 → 184, 40 → 24; roar 474 → 376, 434 → 308,
 * 40 → 24. The head itself is drawn once where it was drawn twice. The linear
 * gradients fell too (coil 79 → 76, dive 56 → 51, roar 149 → 104), the
 * head's own being made on the layer. The tube light cache is held per canvas
 * now (`solid-tube-light.ts`): emptied on every change of canvas, as it was,
 * the head drawn on the layer made the body bake its light again every frame.
 *
 * On 15 October 2026 the stub began counting the layer's own draws as the
 * frame's (`canvas-stub-layer.ts`), so the head is back in the rows — once,
 * where before the layer it was twice: coil fills 375 → 459, strokes
 * 313 → 411, radial gradients 25 → 37; dive 237 → 280, 184 → 220, 24 → 36;
 * roar 376 → 462, 308 → 408, 24 → 36. The linear gradients rose with it
 * (coil 76 → 81, dive 51 → 53, roar 104 → 141), and five more blits in each
 * for the halves put together and laid down.
 *
 * Each row is the worst of each op over one beat starting a third of the way
 * into the step's morph, on a phone. Set `MEASURE` to true and run this file
 * to print the rows as they are written below (`budget-row.ts`); never
 * committed as `true`.
 */
const MEASURE = false;

type Budget = Record<
  "fill" | "stroke" | "drawImage" | "createLinearGradient" | "createRadialGradient",
  number
>;

/** Step index and name → the ceiling. Remeasured 16 October 2026 under the one sky every budget run is drawn under (`BUDGET_SKY`), so the wave's place in the list no longer moves a row. */
// From 16 October 2026 every sky stands on a deep sky (`sky-depth.ts`), CELLS
// too: far stars, a drifting haze and near stars, the last two blitted twice
// so they wrap, and ten twinkles of one baked cross — fifteen more
// `drawImage` in every row; and two more the same day for CELLS's own far
// wall and its organelles (`sky-cells.ts`). Remeasured, not padded.
// From 17 October 2026 the siren's bar stands at the top of every field, at
// rest when nothing is called: the housing's fill and stroke, one path of seven
// dark cells, one save (`siren-lightbar.ts`). Every row here rose by exactly
// that, remeasured rather than padded.
const BUDGETS: Record<string, { cursor: number; budget: Budget }> = {
  "13 coil": {
    cursor: 13,
    budget: {
      fill: 461,
      stroke: 412,
      drawImage: 53,
      createLinearGradient: 80,
      createRadialGradient: 37,
    },
  },
  "15 dive": {
    cursor: 15,
    budget: {
      fill: 282,
      stroke: 221,
      drawImage: 53,
      createLinearGradient: 52,
      createRadialGradient: 36,
    },
  },
  "20 roar": {
    cursor: 20,
    budget: {
      fill: 464,
      stroke: 409,
      drawImage: 53,
      createLinearGradient: 140,
      createRadialGradient: 36,
    },
  },
};

installCanvasGlobals();

function worst(cursor: number): Map<string, number> {
  const world = hung();
  const s = acting(world, cursor);
  s.phase = "morph";
  s.phaseBeat = world.beat - (s.steps[cursor]?.morphBeats ?? 0) * 0.3;
  const most = new Map<string, number>();
  runFrames(world, "p1", TPB, {
    sky: BUDGET_SKY,
    viewport: { width: 390, height: 844, dpr: 3 },
    onDrawn: (ctx, frame) => {
      if (frame >= 2) for (const [k, v] of ctx.tally) most.set(k, Math.max(most.get(k) ?? 0, v));
      ctx.tally.clear();
    },
  });
  return most;
}

describe("THE INSTAR's turn stays inside its measured budget", () => {
  for (const [name, { cursor, budget }] of Object.entries(BUDGETS)) {
    it(name, () => {
      const tally = worst(cursor);
      if (MEASURE) {
        console.log(`  ${name}`, budgetRow(tally, budget));
        return;
      }
      for (const [key, max] of Object.entries(budget))
        expect(tally.get(key) ?? 0, `${name} ${key}`).toBeLessThanOrEqual(max);
    });
  }
  it("is not left measuring", () => expect(MEASURE).toBe(false));
});
