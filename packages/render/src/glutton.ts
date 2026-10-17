import { type CreatureSilhouette, livingSilhouette } from "@neon-spore/content";
import { gluttonFed } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { drawGlancedBody, drawGlancedLiving } from "./creature-glance.js";
import { livingBodyMul } from "./creature-place.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import { drawPodForm } from "./pod-forms.js";

/**
 * THE GLUTTON, drawn: hungry, it is GULLET in its own colour; **fed, it is
 * bigger by a size and a lobe for every pod it has eaten, rounder as it
 * fills, and the pods are still in it**, glowing amber through the belly.
 *
 * The rule the pair has to read off it is a count — how many matching shots
 * it will take — and the picture gives that count three ways at once, each
 * big enough to see from across the field (the owner, 9 October 2026: a look
 * nobody can see is not a look): the body swells, its edge grows a lobe, and
 * every meal is a whole pod, shell and core, sitting inside it. Shoot one meal
 * back out and one pod goes.
 *
 * Nothing is stored. `gluttonFed` is the one fact, and the pods beat on the
 * clock, so both phones draw the same frame of it.
 */

/** How much bigger each meal makes it, and how many meals the picture follows:
 * past three it is already the biggest body on its row, and growing further
 * would push it into the next column's. */
const SWELL_PER_MEAL = 0.25;
const MEALS_DRAWN = 3;

/** How wide a meal is, against the hungry body's radius: half the hungry
 * body, so a pod inside it is a pod and not a speck. */
const MEAL = 0.5;

/** GULLET with a lobe more for each meal and every lobe shallower — a belly
 * stretched round by what is in it, where the hungry one is all mouth. Made
 * once rather than every frame, so a contour cached by its shape is cached
 * here too. */
const HUNGRY = livingSilhouette("glutton");
const FED: readonly CreatureSilhouette[] = Array.from({ length: MEALS_DRAWN + 1 }, (_, n) => ({
  ...HUNGRY,
  lobes: HUNGRY.lobes + n,
  depth: HUNGRY.depth * Math.max(0.15, 1 - 0.5 * n),
}));

export function drawGluttonBody(b: Body): void {
  const fed = Math.min(gluttonFed(b.c), MEALS_DRAWN);
  if (fed === 0) {
    drawGlancedLiving(b);
    return;
  }
  const swell = 1 + SWELL_PER_MEAL * fed;
  drawGlancedLiving(b, swell, FED[fed]);
  const { x, y, time } = b;
  const r = b.l.tile * 0.4 * livingBodyMul(b.c);
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
  halo(b.ctx, x, y, r * swell * 1.3, PALETTE.pod, 0.14 + 0.08 * pulse);
  // The meals sit in a row across the belly, as wide apart as the body has
  // grown, and turn with it like anything on it.
  drawGlancedBody(b, { r: r * swell, lit: true }, (ctx) => {
    for (let i = 0; i < fed; i++) {
      const dx = (i - (fed - 1) / 2) * r * MEAL * 2.1;
      drawPodForm(
        ctx,
        b.c.id + i,
        x + dx,
        y + r * 0.1,
        r * MEAL,
        time + i,
        Number.POSITIVE_INFINITY,
      );
    }
  });
}
