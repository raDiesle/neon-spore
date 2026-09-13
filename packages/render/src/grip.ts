import {
  type Creature,
  gripsCreature,
  type HandMeans,
  handMeans,
  type World,
} from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import { halo } from "./glow.js";
import { drawCarryArrows } from "./grip-arrows.js";
import { drawBeam } from "./grip-beam.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE GRIP, drawn — and **two hands, drawn differently**, which is the whole of
 * what this file had to learn.
 *
 * Both devices show the same field, so this is the one mechanic whose whole
 * point is the *other* screen: a player who cannot see that their partner is
 * holding a rock for them will move the shield as if nothing had changed, and
 * the beat they were given goes to waste. So the picture is deliberately loud
 * and made of separate statements — a ring on the creature, a word saying
 * whose hand it is, and, on a rock, a beam from the ship and the two lanes it
 * may be carried into.
 *
 * **The beam is the pull, so it is only drawn where there is one.** A hand is a
 * brake on a rock and an aim on anything living (`sim/hand.ts`), and a line
 * running from the hull up to a slick said *this body is being dragged at* over
 * a body falling at its own speed — the one lie this mechanic cannot tell,
 * because the partner is planning a column around it. The ring stays on both:
 * it is a hand closed on a body, and that much is true either way. What the
 * hand is *for* is then said in the word underneath — PULL or AIM — and by
 * whether the field draws a route from the ship or a frame around the body
 * (`lock-mark.ts`).
 *
 * Amber, the pod's colour: the two things in this game that are on the
 * players' side. Never red or cyan, which are ammunition and would read as a
 * shot, and never green, which is reserved for a Simon round answered in full.
 * The carry arrows are the one exception and are white, for the reason
 * `grip-arrows.ts` gives — they are an instruction rather than a force.
 */

/** How far outside the silhouette the ring sits. */
const RING_MUL = 1.5;

export function drawGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  if (l.tile <= 0) return;
  for (const c of world.creatures) {
    const p1 = gripsCreature(world, 1, c.id);
    const p2 = gripsCreature(world, 2, c.id);
    if (!p1 && !p2) continue;
    // What this hand is. A rock is a brake for either seat and a living body an
    // aim only the pilot has, so asking about whichever seat is holding it
    // answers for both — and it is the simulation's rule rather than a kind
    // test spelled out again here (`sim/hand.ts`).
    const means = handMeans(c.kind, p1 ? 1 : 2);
    if (means === null) continue;
    // **A press is not drawn here at all.** A hand on a weight is the one
    // thing in the game a player is shown that their partner is not
    // (`weight.ts`), and this loop draws for whichever seat is looking — so a
    // ring and a "P1 AIMS" over the body were the split given away on the
    // other phone, watched at tempo on 13 September 2026. The private mark and
    // the calipers are `drawWeightPress`'s, seat by seat.
    if (means === "press") continue;
    // **A pull is THE CAIRN's, and the pile is drawn after this pass** — so a
    // ring and a word put here sat under seven rocks, and a thumb carried
    // across the pile showed nothing at all until the unit came out (watched
    // at tempo, 13 September 2026). `drawBoss` draws that hand over the
    // stack instead (`cairn-hand.ts`).
    if (means === "pull") continue;
    drawHandOn(ctx, l, world, c, means, p1, p2, beatPhase, time);
  }
}

function drawHandOn(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  means: HandMeans,
  p1: boolean,
  p2: boolean,
  beatPhase: number,
  time: number,
): void {
  const { x, y } = creatureCenter(l, c, beatPhase);
  const r = Math.max(1, creatureRadius(l, c) * RING_MUL);
  drawHandAt(ctx, l, world, c, means, p1, p2, x, y, r, time);
}

/** The ring and the word, at a place a caller has already worked out —
 * the pile's hand is one (`cairn-hand.ts`). */
export function drawHandAt(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  means: HandMeans,
  p1: boolean,
  p2: boolean,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  // Two hands pull harder, and the picture says so before the numbers do.
  const weight = p1 && p2 ? 1 : 0.62;
  if (means === "brake") drawBeam(ctx, l, x, y, time, weight);
  drawRing(ctx, x, y, r, time, weight);
  // The two lanes out, and only a braked body has any: an aim does not move
  // what it is pointed at (`grip-arrows.ts`).
  if (means === "brake") drawCarryArrows(ctx, l, world, c, x, y, r, time);
  drawLabel(ctx, l.role, x, y + r + 12, means, p1, p2);
}

/** Four arcs turning around the silhouette — a hand closed on it, not a target
 * reticle: the creature is being held, not aimed at.
 *
 * **The ring says nothing about the beat of quiet after a carry, and does not
 * need to.** A body pushed a column cannot be pushed again for
 * `gripPushPauseBeats` (`sim/grip-push.ts`), and the field already says so
 * where it is loudest: the two carry arrows are drawn only while the body may
 * be carried (`grip-arrows.ts`), so they go out for the pause and come back
 * with it. A ring that stopped turning for those beats was offered beside this
 * one and withdrawn — it is a second, quieter statement of the same fact, and
 * a ring at rest reads as a hand *let go* while the beam is still pulling. */
function drawRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
  weight: number,
): void {
  const spin = time * 1.6;
  const gap = 0.42;
  ctx.save();
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 1.2 + weight;
  ctx.globalAlpha = 0.55 + 0.25 * Math.sin(time * 6);
  for (let k = 0; k < 4; k++) {
    const a = spin + (k * Math.PI) / 2;
    ctx.beginPath();
    ctx.arc(x, y, r, a + gap, a + Math.PI / 2 - gap);
    ctx.stroke();
  }
  ctx.restore();
  halo(ctx, x, y, r * 1.25, PALETTE.pod, 0.12 * (1 + weight));
}

/**
 * Whose hand it is, in words. A colour alone cannot say it: the two players
 * are not colour-coded anywhere else in the game — red and cyan are
 * ammunition — and inventing a per-player colour here would collide with the
 * one thing those two colours already mean.
 *
 * The screen says "YOU" for its own seat, so the same field reads correctly
 * on both phones from the same world.
 */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  role: ViewRole,
  x: number,
  y: number,
  means: HandMeans,
  p1: boolean,
  p2: boolean,
): void {
  const text = gripLabel(role, means, p1, p2);
  ctx.save();
  ctx.font = '600 9px "Courier New",monospace';
  ctx.textAlign = "center";
  const w = ctx.measureText(text).width + 8;
  ctx.fillStyle = "rgba(7,6,15,.66)";
  ctx.fillRect(x - w / 2, y - 8, w, 11);
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Exported for the test that reads it, and because it is the wording, not a
 * detail of the drawing.
 *
 * **The verb is what the hand is doing**, which is the half that used to be
 * wrong: every hand said PULL, including the one on a body it was not slowing
 * by a thousandth. A pull and an aim are two different pieces of news for the
 * partner — one buys a beat and the other takes the column out of the
 * conversation — and a pair reading PULL over a locked slick would be waiting
 * for time that was never bought.
 *
 * BOTH only ever appears over a pull. An aim is the pilot's alone, so there is
 * no second hand for it to be shared with (`sim/hand.ts`).
 */
export function gripLabel(role: ViewRole, means: HandMeans, p1: boolean, p2: boolean): string {
  // A brake and a pull are both a hand dragging at something; an aim is the
  // one that moves nothing, and the one word the partner has to read as such.
  const verb = means === "aim" ? "AIM" : "PULL";
  if (p1 && p2) return `BOTH ${verb}`;
  const who = p1 ? 1 : 2;
  const mine = role === (who === 1 ? "p1" : "p2");
  return mine ? `YOU ${verb}` : `P${who} ${verb}S`;
}
