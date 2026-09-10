import { BEAT_SECONDS, SVG } from "../skins/types.js";
import type { Tail } from "./types.js";

/**
 * Two ribbons of flame wound round one axis half a turn apart and rolling on
 * the beat — a thrust that twists instead of a cone that only gets longer.
 *
 * It was `creature:dart` / `braid` on VERSUS, offered against FLAME, and the
 * owner took SHOCK instead on 10 September 2026 and asked for this to be kept
 * on the SHAPES page. Here rather than on GLOW because it is a mark *behind* a
 * body travelling one way — the question this axis asks of every falling
 * body, and the one it was asked of a dart.
 *
 * ## The argument
 *
 * A flame is turbulent, and the cheapest honest way to say so is two ribbons
 * rather than one cone. Each ribbon is sampled along the axis and pushed
 * sideways by a sine of its own distance back, so it winds; the two are half a
 * cycle apart, so where one is out the other is in and the pair crosses down
 * the reach. The whole braid turns slowly on the beat, so a still frame of it
 * is never the same still frame twice — motion grown rather than tweened. The
 * swing dies at the nozzle and opens with distance: a flame leaves the thing
 * it is pushing straight and only breaks up once it is clear of it. What ends
 * it is the ribbon running out of light — there is no closing outline.
 *
 * ## Where it can lose
 *
 * Two thin ribbons have far less area than one filled cone and may add up to
 * a fainter thrust than FLAME. And a braid is a shape the game already uses
 * for a thing that is *held* — THE COIL's tether and THE WARDEN's rope are
 * wound lines. If it reads as a cord trailing off the body, that is the wrong
 * word entirely.
 */
/** Samples per ribbon. Sixteen in the game, where `lighter` fuses them;
 * more here, since plain alpha does not and a ribbon that shows its beads is
 * a string of them. */
const STEPS = 24;
/** How far a ribbon swings off the axis at its widest, as a share of the
 * body's half-width, and how many turns it makes over the reach. Wider than
 * the game's 0.4, so the two are seen to cross at a card's size. */
const SWING = 0.55;
const TURNS = 1.6;
/** Radians per beat the whole braid rolls at — slow against a flicker, so
 * what the eye reads is a twist travelling rather than a strobe. */
const ROLL = 9;
/** A ribbon's half-width at the nozzle and at the end, as shares of the
 * body's half-width. */
const RIBBON = 0.3;
const RIBBON_END = 0.1;
/** The reach, in body heights — FLAME's, so the two are read at one length. */
const REACH = 1.9;
/** How far up the ribbon the pale centre goes, as a share of the reach. */
const PALE_TO = 0.34;

interface Bead {
  readonly el: SVGCircleElement;
  readonly pale: SVGCircleElement | undefined;
  readonly t: number;
  readonly side: number;
}

/** The radius widths are measured in: the smaller of the two, since in the
 * game the body behind a thrust is round and a slick here is not. */
function bodyR(ctx: Parameters<Tail["build"]>[0]): number {
  return Math.min(ctx.extent.w, ctx.extent.h) / 2;
}

function bead(ctx: Parameters<Tail["build"]>[0], t: number, side: number): Bead {
  const rx = bodyR(ctx);
  const fade = (1 - t) ** 1.4;
  const wide = rx * (RIBBON + (RIBBON_END - RIBBON) * t);
  const el = document.createElementNS(SVG, "circle");
  el.setAttribute("r", wide.toFixed(2));
  el.setAttribute("fill", ctx.colour);
  el.setAttribute("fill-opacity", (0.8 * fade).toFixed(3));
  ctx.body.appendChild(el);
  let pale: SVGCircleElement | undefined;
  if (t < PALE_TO) {
    pale = document.createElementNS(SVG, "circle");
    pale.setAttribute("r", (wide * 0.45).toFixed(2));
    pale.setAttribute("fill", "#FFF6D8");
    pale.setAttribute("fill-opacity", (0.55 * fade).toFixed(3));
    ctx.body.appendChild(pale);
  }
  return { el, pale, t, side };
}

export const BRAID: Tail<"braid"> = {
  id: "braid",
  label: "BRAID",
  hint: "two ribbons of flame wound round one axis half a turn apart, rolling on the beat — a thrust that twists",
  reachUp: REACH,
  build(ctx) {
    const rx = bodyR(ctx);
    const ry = ctx.extent.h / 2;
    const reach = ry * REACH * 2;
    const beads: Bead[] = [];
    for (const side of [0, Math.PI]) {
      for (let i = 0; i < STEPS; i++) beads.push(bead(ctx, i / (STEPS - 1), side));
    }

    // The root, near-white: the hottest part of a flame is where it leaves
    // the thing it is pushing, and it is the one mark both ribbons share.
    const root = document.createElementNS(SVG, "circle");
    root.setAttribute("cx", String(ctx.centre.x));
    root.setAttribute("cy", (ctx.centre.y - ry * 0.22).toFixed(2));
    root.setAttribute("r", (rx * 0.3).toFixed(2));
    root.setAttribute("fill", "#FFF6D8");
    root.setAttribute("fill-opacity", "0.9");
    ctx.body.appendChild(root);

    let phase = 0;
    for (let i = 0; i < ctx.name.length; i++) phase += ctx.name.charCodeAt(i);
    ctx.onFrame(({ t }) => {
      const roll = (t / BEAT_SECONDS) * ROLL + phase;
      for (const b of beads) {
        const swing = SWING * rx * b.t * Math.sin(b.t * TURNS * Math.PI * 2 + roll + b.side);
        const cx = (ctx.centre.x + swing).toFixed(2);
        const cy = (ctx.centre.y - reach * b.t).toFixed(2);
        b.el.setAttribute("cx", cx);
        b.el.setAttribute("cy", cy);
        if (b.pale) {
          b.pale.setAttribute("cx", cx);
          b.pale.setAttribute("cy", cy);
        }
      }
    });
  },
};
