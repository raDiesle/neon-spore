import { POD } from "@neon-spore/content";
import { moultCargo, moultIsPod, type SimConfig, spanOf } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { drawMeteor } from "./meteor.js";
import { drawMoultNext } from "./moult-ghost.js";
import { moultOutline } from "./moult-shape.js";
import { PALETTE } from "./palette.js";
import { drawPodBody, drawPodCore, POD_TILES } from "./pods.js";
import { rockRadius } from "./rock-size.js";

/**
 * THE MOULT, drawn: the form it is wearing **now** on both screens, and on the
 * navigator's screen alone the form it is about to wear (`moult-ghost.ts`).
 *
 * The rule itself is `sim/moult.ts` and nothing here re-derives it. What this
 * file adds is the one thing a rule cannot say — that the turn is a *movement*
 * — and it says it the queen's way: one contour blended vertex by vertex from
 * the rock to the cargo (`moult-shape.ts`), never two drawings dissolved over
 * each other. The pair have to be able to point at this body and say what it
 * is, and a frame with two edges in it is a frame where neither of them can.
 *
 * **The morph lags the turn; it never leads it.** The simulation flips on the
 * beat, and the picture spends the first `MORPH_BEATS` of that beat catching
 * up. Running it the other way — finishing the change by the beat it lands on
 * — would have the body reading as a cargo while the rules still answer it as
 * a rock, and on this creature that is not a cosmetic disagreement: what it is
 * on the beat it reaches the ship is the whole of what happens. A picture that
 * is briefly *behind* the truth is honest about a change that has begun; one
 * that is ahead of it is a lie about the answer.
 */

/**
 * How much of a beat the turn takes on screen. A third: long enough that the
 * eye reads a body changing rather than a body swapped, short enough that the
 * in-between is never what anybody is looking at when it lands.
 */
const MORPH_BEATS = 0.34;

const mix = (a: number, b: number, k: number): number => a + (b - a) * k;

/** The pod's own normalisation, so `drawPodCore` — which draws in `POD`'s
 * units — can be scaled into the blend's radius-1 frame. */
const POD_NORM = Math.max(POD.rx, POD.ry);

/**
 * How much cargo is in this body right now: 0 is all rock, 1 is all pod.
 *
 * Off `waveBeat` and the beat's own phase and nothing else — the same three
 * numbers on both phones, so two screens showing one moult are showing the
 * same frame of one movement. Stateless for `veilMorph`'s reason: a body that
 * remembered how far through its turn it was would be a body whose picture
 * could drift from the rule over a long fall.
 */
export function moultPodShare(cfg: SimConfig, waveBeat: number, beatPhase: number): number {
  const pod = moultIsPod(cfg, waveBeat) ? 1 : 0;
  const period = Math.max(1, cfg.moultBeats);
  // Not on a beat the form turned over on — so it is wholly what it is. The
  // first beat of a wave is deliberately one of these: there is no form behind
  // it to have come from, and a moult opening the wave mid-morph would read as
  // a body that had already done something.
  if (waveBeat <= 0 || waveBeat % period !== 0) return pod;
  const share = Math.max(0, Math.min(1, beatPhase / MORPH_BEATS));
  return pod === 1 ? share : 1 - share;
}

/** The body, at whatever it currently is. */
export function drawMoultBody(b: Body): void {
  const k = moultPodShare(b.world.cfg, b.world.waveBeat, b.beatPhase);
  if (k <= 0) drawMeteor(b.ctx, b.l, b.c, b.x, b.y, b.time);
  else if (k >= 1) drawPodBody(b.ctx, b.x, b.y, b.l.tile * POD_TILES, b.time, moultCargo(b.c));
  else drawBlend(b, k);
  drawMoultNext(b);
}

/**
 * A body part-way between the two, and the only frames in the game that are
 * painted by neither the rock's hand nor the pod's.
 *
 * Both materials are mixed rather than layered — one fill, one stroke, one
 * colour each, out of `mixHex` — because the whole argument for blending the
 * *shape* falls down if the paint inside it is two paints. What is dropped for
 * the third of a beat this lasts is the rock's facet lighting and its craters:
 * a crater is a thing that happened to stone, and this is no longer wholly
 * stone. Nothing is stored, so both come back whole the moment the body is
 * rock again — `c.holes` never moved.
 *
 * The cargo's mark fades in with the cargo, and that is the one part of the
 * pod's picture that is not decoration: it says *which* cargo, which is what
 * the pilot is deciding whether to be under.
 */
function drawBlend(b: Body, k: number): void {
  const { ctx, l, c, x, y, time } = b;
  const podR = l.tile * POD_TILES;
  const r = mix(rockRadius(l, spanOf(c)), podR, k);
  const path = moultOutline(k, time);
  // The rock's own spin, easing into the cargo's slow list. A stone that
  // stopped turning the instant it started to change would read as a stone
  // that had been grabbed.
  const spin = (c.id % 13) * 0.48 + time * 0.12;
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(mix(spin, Math.sin(time * 0.6) * 0.08, k));
  ctx.scale(r, r);
  ctx.fillStyle = mixHex(PALETTE.rockDark, PALETTE.podDark, k);
  ctx.fill(path);
  strokeGlow(
    ctx,
    path,
    mixHex(PALETTE.rock, PALETTE.pod, k),
    Math.max(1, r * 0.1) / r,
    mix(0.5, 0.8 + 0.4 * pulse, k),
  );
  ctx.scale(k / POD_NORM, k / POD_NORM);
  ctx.globalAlpha = k;
  drawPodCore(ctx, 0.55 + 0.45 * pulse, moultCargo(c));
  ctx.globalAlpha = 1;
  ctx.restore();

  // One halo radius for every frame of the morph, not one per fraction: the
  // sprite is cached by colour and size, and a radius that moved with `k`
  // would bake a new canvas on every frame of every turn (`glow.ts`).
  halo(ctx, x, y, podR * 2.1, PALETTE.pod, 0.14 * k);
}
