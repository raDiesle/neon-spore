import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES } from "@neon-spore/content";
import type { Creature, World } from "@neon-spore/sim";
import { linkCenter } from "../src/crawler-place.js";
import { creatureCenter } from "../src/creature-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { podCenter } from "../src/pods.js";
import { FRAME_TIMEOUT_MS, peakWorld } from "./frame-harness.js";
import {
  drawPixels,
  installPixelGlobals,
  PIXEL_VIEWPORT,
  windowDiffers,
  withoutBodies,
} from "./pixel-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The one thing the stub canvas cannot say: whether the thing a frame drew
 * can be seen.
 *
 * `canvas-stub.ts` checks every argument the renderer hands the canvas and
 * nothing about the result, so a body at `globalAlpha` 0, a glow entirely under
 * the backdrop, a shape drawn outside its clip or a highlight in the backdrop's
 * own colour passes every frame test in this package and draws nothing on the
 * phone. This file draws the frame for real — through Skia, in-process — and
 * compares it against the same frame with the bodies taken out. Where a body
 * stands, the two pictures have to differ.
 *
 * **Seen on either seat, not on each.** A body one player cannot see is often
 * the design — that is what the two screens are for — so the claim is that no
 * body is invisible to *both*. Two kinds of body are outside the claim, and
 * both are the design too: one carrying `unseen`, which THE REPRISE forbids
 * every pass to draw (`unseen.ts`), and one standing off the field — a torch
 * still above the top edge, a worm's rings crawling in from the side, a
 * meteor crossing in from beyond a column — which is not on the picture to be
 * seen. The owner chose to have this on 17 September 2026 (`docs/queue.md`,
 * the pixel-harness entry).
 */

const SEATS: ViewRole[] = ["p1", "p2"];

/**
 * Kinds whose simulation has landed and whose look has not — a creature is
 * its simulation, then its look (`CLAUDE.md`), and between the two lanes its
 * body is on the field and drawn nowhere. Named here so the trunk stays green
 * for the day in between, and so the look's lane has a line to delete: the
 * test goes red the moment a kind listed here is drawn, which is the reminder.
 */
const LOOK_PENDING = new Set<string>([
  // THE CURTAIN, simulation landed 17 September 2026 (`docs/spec/bosses.md`
  // §11.24); `living-look.ts` answers `null` and `curtain-draw.ts` is not written.
  "curtain",
]);

/** A body and where it is drawn on a given seat's layout. */
interface Body {
  id: string;
  kind: string;
  at: (l: Layout, beatPhase: number) => { x: number; y: number };
}

function creatureAt(l: Layout, world: World, c: Creature, beatPhase: number) {
  if (c.kind === "crawler") return linkCenter(l, c, beatPhase);
  return creatureCenter(l, world, c, beatPhase);
}

/** Whether a point is inside the field's own rectangle on this layout. */
function onField(l: Layout, at: { x: number; y: number }): boolean {
  return (
    at.x >= l.gridLeft &&
    at.x < l.gridLeft + l.cols * l.tile &&
    at.y >= l.gridTop &&
    at.y < l.gridTop + l.rows * l.tile
  );
}

beforeAll(installPixelGlobals);

describe("every body standing on the peak frame's field can be seen", () => {
  for (const wave of WAVES) {
    it(`${wave.id}: each body marks the picture on p1 or p2`, () => {
      const world = peakWorld(wave.id);
      const empty = withoutBodies(world);
      const bodies: Body[] = [
        ...world.creatures
          .filter((c) => !c.unseen)
          .map((c) => ({
            id: `${c.kind}#${c.id}`,
            kind: c.kind,
            at: (l: Layout, phase: number) => creatureAt(l, world, c, phase),
          })),
        ...world.pods.map((p) => ({
          id: `pod#${p.id}`,
          kind: "pod",
          at: (l: Layout) => podCenter(l, p),
        })),
      ];
      const seen = new Set<string>();
      const offField = new Set<string>();
      for (const role of SEATS) {
        const full = drawPixels(world, role);
        const bare = drawPixels(empty, role);
        const l = computeLayout(PIXEL_VIEWPORT, world.cfg, role);
        for (const b of bodies) {
          if (seen.has(b.id)) continue;
          const at = b.at(l, full.beatPhase);
          if (!onField(l, at)) {
            offField.add(b.id);
            continue;
          }
          if (windowDiffers(full.picture, bare.picture, at.x, at.y, l.tile * 0.45)) seen.add(b.id);
        }
      }
      const onPicture = bodies.filter((b) => !offField.has(b.id));
      const unseen = onPicture.filter((b) => !seen.has(b.id) && !LOOK_PENDING.has(b.kind));
      expect(unseen.map((b) => b.id)).toEqual([]);
      // A look that has arrived comes off `LOOK_PENDING`, in the lane that drew it.
      const drawnEarly = onPicture.filter((b) => seen.has(b.id) && LOOK_PENDING.has(b.kind));
      expect(drawnEarly.map((b) => b.id)).toEqual([]);
    });
  }
});
