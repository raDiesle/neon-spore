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
import type { Layout, ViewRole } from "./layout.js";
import type { OpeningFx } from "./opening-fx.js";
import { drawReadyPage } from "./ready-page.js";
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
 * `scene` is a `GuideStage` the caller owns and has already brought up to this
 * frame; `fx` is where the two clocks a still world cannot supply live — how
 * long this page has been up, and the blobs a READY throws off
 * (`opening-fx.ts`).
 */
export function drawWaveOpening(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  role: ViewRole,
  scene?: GuideStage,
  time = 0,
  fx?: OpeningFx,
): void {
  if (introHolds(world)) {
    drawIntroduction(ctx, l, world, fx?.age ?? Number.POSITIVE_INFINITY, true);
    return;
  }
  if (!guideHolds(world)) return;
  // A rehearsal takes the whole stage and brings its own bar with it.
  if (scene?.active) {
    scene.draw(ctx, l, time, role);
    return;
  }
  const seat: 1 | 2 = role === "p2" ? 2 : 1;
  const pages = guidePages(world);
  // The gate: the field is behind this rather than covered, which is the whole
  // point of the page — it is the wave they are about to play (`ready-page.ts`).
  if (onReadyPage(world, seat)) {
    drawReadyPage(ctx, l, world, role, fx, pages);
    return;
  }
  drawProsePage(ctx, l, world, role, guidePage(world, seat), pages, fx);
}
