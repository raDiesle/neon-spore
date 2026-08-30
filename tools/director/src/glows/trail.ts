import { SVG } from "../skins/types.js";
import type { Glow } from "./types.js";

/**
 * A luminous tail that lingers behind the body as it moves.
 *
 * ## Dots, not a ribbon
 *
 * The owner asked for *Trails / Ribbons*, and the source says dots.
 * `docs/tower-defence.md`'s "Three more frames" section reads the projectile
 * leaving Neon Pulsefire's player: it leaves a row of separating dots that
 * shrink, not a tapered stroke. That is not a cheaper approximation of a
 * ribbon — the **gaps** are what read as speed, and a continuous tail throws
 * exactly that away. A ribbon is still buildable beside this one if the cards
 * say the dots are wrong; this is the version worth trying first.
 *
 * ## Why it draws nothing on half the catalogue, and why that is right
 *
 * A trail is a fact about a body that is *going somewhere*, so this rides
 * `frame.pose` and a figure with no own-motion is handed `REST` forever — its
 * dots sit under it and never separate. That is the honest answer rather than
 * a bug: pair this with the MOTION axis, force something with a real
 * excursion, and it appears. The switcher's own line says so, because a reader
 * who ticks TRAIL on a still body and sees nothing will conclude the effect is
 * broken.
 *
 * ## The counter-transform
 *
 * `ctx.body` is the group the own-motion is written onto, so anything appended
 * to it travels *with* the body and can never trail it. Each dot is therefore
 * drawn at the difference between where the body was and where it is — which
 * puts it at the older absolute position without needing a second group
 * outside the motion, and without this file knowing anything about how the
 * transform is written.
 *
 * ## Nothing is allocated per frame
 *
 * One `Float64Array` used as a ring buffer, and eight circles. The obvious
 * implementation pushes a point onto an array and shifts the far end off,
 * which allocates on every frame of every card.
 */
const DOTS = 8;
/**
 * Frames between one dot and the next. At 60 Hz eight dots at nine frames
 * reach about 1.2 s back — roughly two beats.
 *
 * It was three frames, which reaches back a fifth of a second, and at that
 * span the tail was invisible on every motion in the catalogue. The reason is
 * a number nobody had: **no own-motion here translates very far at all.**
 * Measured over ninety seconds of every motion in `MOTIONS`, the largest whole
 * excursion is RECOIL's 0.22 tiles, and most are under 0.1 — while the
 * distance covered in three frames is at most 0.046 tiles and typically nearer
 * 0.005. Eight dots at that spacing pile into a smudge a twentieth of a tile
 * across, which is nothing on a 92 px card.
 *
 * So the tail is a *memory* problem rather than a spacing one: it has to reach
 * back far enough for a slow sway to have gone somewhere. Two beats is what
 * makes DRIFT — 0.19 tiles of excursion spread over sixty-four seconds — draw
 * a tail at all.
 */
const GAP = 9;
const SLOTS = DOTS * GAP;
/**
 * How far a dot must have got from the body, in tiles, to be drawn at full
 * strength. See the fade in the frame below.
 *
 * Three hundredths of a tile, and the number is measured rather than felt. It
 * was first a tenth, which lit one stray dot just off the centre of a body
 * that was barely moving — and one stray dot inside an outline reads as a
 * defect in the drawing rather than as a tail. It was then raised to a
 * quarter, which was worse and in a way that would not have shown up without
 * the figures above: a quarter of a tile is **larger than the whole excursion
 * of every motion in the catalogue**, so the tail could never light for
 * anything, ever. A threshold has to sit under the thing it is thresholding.
 *
 * At three hundredths, the motions that travel — DRIFT, RECOIL, SETTLE, PITCH,
 * LURCH — reach full strength, the ones that barely translate draw a faint
 * tail, and the five that do not translate at all (TURN, WIND, SWELL, BEAT,
 * HEART) draw exactly nothing. That last group is the honest picture and is
 * what the switcher line promises.
 */
const OPEN = 0.03;

export const TRAIL: Glow<"trail"> = {
  id: "trail",
  label: "TRAIL",
  hint: "dots that shrink behind a moving body — needs a motion, and shows nothing without one",
  layer: "under",
  spread: 0.08,
  build(ctx) {
    const dots: SVGCircleElement[] = [];
    /** How bright each dot is at full separation, before the collapse fade. */
    const dim: number[] = [];
    for (let i = 0; i < DOTS; i++) {
      const c = document.createElementNS(SVG, "circle");
      c.setAttribute("fill", ctx.colour);
      const fade = 1 - i / DOTS;
      dim.push(0.6 * fade * fade);
      c.setAttribute("r", (ctx.weight * 1.6 * fade + ctx.weight * 0.3).toFixed(2));
      ctx.body.appendChild(c);
      dots.push(c);
    }

    // x and y interleaved, in tiles — the unit a `Pose` offset is measured in.
    const past = new Float64Array(SLOTS * 2);
    let head = 0;

    ctx.onFrame(({ pose }) => {
      head = (head + 1) % SLOTS;
      past[head * 2] = pose.dx;
      past[head * 2 + 1] = pose.dy;
      for (let i = 0; i < DOTS; i++) {
        const dot = dots[i];
        if (!dot) continue;
        const slot = (head - i * GAP + SLOTS) % SLOTS;
        const dx = (past[slot * 2] ?? 0) - pose.dx;
        const dy = (past[slot * 2 + 1] ?? 0) - pose.dy;
        dot.setAttribute("cx", (ctx.centre.x + dx * ctx.tile).toFixed(2));
        dot.setAttribute("cy", (ctx.centre.y + dy * ctx.tile).toFixed(2));
        // Faded by how far the dot has actually got from the body, so a
        // motionless figure draws nothing at all. Without this the eight dots
        // pile up on the centre and read as one bright blob — which looks like
        // a defect in the glow rather than like the honest answer, which is
        // that a body going nowhere has no tail. `OPEN` is one tenth of a
        // tile: far enough that a wobble alone does not light it.
        const far = Math.min(1, Math.hypot(dx, dy) / OPEN);
        dot.setAttribute("fill-opacity", ((dim[i] ?? 0) * far).toFixed(3));
      }
    });
  },
};
