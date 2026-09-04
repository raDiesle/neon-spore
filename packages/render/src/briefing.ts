import {
  guideHolds,
  guidePage,
  guidePages,
  introHolds,
  onReadyPage,
  type World,
} from "@neon-spore/sim";
import { drawProsePage } from "./guide-prose.js";
import type { GuideStage } from "./guide-scene.js";
import { drawGuideCorner } from "./guide-switch.js";
import type { Layout, ViewRole } from "./layout.js";
import type { OpeningFx } from "./opening-fx.js";
import { drawReadyPage } from "./ready-page.js";
import type { SeatNames } from "./seat-name.js";
import { drawIntroduction } from "./wave-intro.js";

/**
 * How a wave opens, drawn: its guide, and then its introduction — or, where the
 * guide has pages, its introduction *as* the guide's last page.
 *
 * **Nothing here is a card.** The introduction is plain text on the field; a
 * guide is pages of plain text or pages of the game's own screen playing; the
 * gate is the wave's name with a button under it. The bordered panel that used
 * to be the guide is gone, on the owner's instruction — *I don't want to show
 * old cards any longer* — and the tutorial had already lost its own for the
 * same reason a year of screens before it did: a frame around text shrinks the
 * game to a thumbnail and puts a paragraph under it, and the eye reading the
 * paragraph is not watching the thing it describes.
 *
 * **A guide is split, because it *is* split.** On the page that carries the two
 * halves this screen gets its own in words and the other player's as blocks —
 * visibly there, plainly not yours to read. A guide that omitted the other half
 * would read as a guide with three lines; one that showed both would teach a
 * pair, in the first ten seconds, that they never have to say anything to each
 * other (`guide-prose.ts`).
 *
 * Stateless, like every other draw here: everything shown is on the world, on
 * the wave, or on the two clocks in `fx` — so nothing survives a frame that
 * `Effects.reset` cannot clear.
 *
 * One object rather than a tail of optionals: it was `(ctx, l, world, role,
 * scene?, time, fx?)`, grown an argument at a time until two of the three
 * callers were passing `undefined` in the middle of it to reach the last, and
 * a fifth thing to say — what the two people are called — would have made it
 * eight. `docs/queue.md` carried it as a finding and this is that finding done.
 */
export interface OpeningView {
  /** Which of the two screens this is, or both at once while testing. */
  role: ViewRole;
  /** A rehearsal the caller owns and has already brought up to this frame. */
  scene?: GuideStage;
  /** Seconds since the page opened, for anything with own-motion. */
  time?: number;
  /**
   * Where the two clocks a still world cannot supply live — how long this page
   * has been up, and the blobs a READY throws off (`opening-fx.ts`).
   */
  fx?: OpeningFx;
  /** What the two people are called, by seat, when the room has said. */
  names?: SeatNames;
  /**
   * Where a mouse is resting, in stage coordinates, so a button under it can
   * light up. Absent on a phone, which has no such thing as hovering.
   */
  pointer?: { x: number; y: number };
}

export function drawWaveOpening(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: OpeningView,
): void {
  const { role, scene, fx, names } = view;
  if (introHolds(world)) {
    drawIntroduction(ctx, l, world, fx?.age ?? Number.POSITIVE_INFINITY, true);
    return;
  }
  if (!guideHolds(world)) return;
  // A rehearsal takes the whole stage and brings its own bar with it.
  if (scene?.active) {
    scene.draw(ctx, l, view);
    return;
  }
  const seat: 1 | 2 = role === "p2" ? 2 : 1;
  const pages = guidePages(world);
  // The gate: the field is behind this rather than covered, which is the whole
  // point of the page — it is the wave they are about to play (`ready-page.ts`).
  if (onReadyPage(world, seat)) {
    drawReadyPage(ctx, l, world, { role, pages, fx, names, pointer: view.pointer });
  } else {
    drawProsePage(ctx, l, world, {
      role,
      page: guidePage(world, seat),
      pages,
      fx,
      names,
      pointer: view.pointer,
    });
  }
  // The corner says TUTORIAL on these pages too, and nothing else: there is no
  // film, so there is no screen of one seat's to name (`guide-switch.ts`).
  drawGuideCorner(ctx, l, {});
}
