import { facet, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { at, disc, inside } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * VENT — a mouth on the surface, opening and closing.
 *
 * It was `creature:bulb` / `vent`, and the owner sent it here on 9 September
 * 2026 with the other three offered to that body.
 *
 * The bulb *fills and vents*: that is what the creature does, and its interior
 * never once said so. This puts a single aperture on the surface — a ring of
 * eight lips round one longitude — and works it slowly open and shut on the
 * body's own clock.
 *
 * **It is the one value on this axis that is not about contents at all.** Every
 * other value here fills a body; this one puts something *on* it, and it is the
 * only one that would still be legible if the membrane were opaque. That is why
 * it is worth having on a row about insides: it is the counter-example the rest
 * are read against.
 *
 * **The aperture is placed, so it turns away.** Its lips are pinned round one
 * point on the surface, so as the body turns the mouth foreshortens to a slit
 * and then goes round the back altogether — which a pair can read at speed and
 * a squashed ellipse never is.
 */

const LIPS = 8;
/** How wide the mouth is on the surface, in radians, and how far it works. */
const MOUTH = 0.5;
const WORK = 0.45;
const REACH = 0.72;
const SPIN = 0.36;
const LIP = 0.12;
const DIM = 0.28;
/** How fast it opens and closes, in radians per second of the page clock. */
const RATE = 0.9;

/** A ring about one point rather than about the pole: the mouth is a *place*
 * on the body, and a ring at one latitude is the shape that folds to a line. */
const PINS: Pin[] = Array.from({ length: LIPS }, (_, i) => {
  const a = (i / LIPS) * Math.PI * 2;
  return pin(Math.sin(a) * MOUTH, 0.15 + Math.cos(a) * MOUTH, 1);
});

export const VENT: Filling<"vent"> = {
  id: "vent",
  label: "VENT",
  hint: "one aperture on the surface working open and shut, and turning away round the back",
  build(ctx: FillingContext) {
    const g = inside(ctx, "vent");
    const reach = Math.min(ctx.extent.w, ctx.extent.h) * 0.5 * REACH;
    const body = at(0);
    const lips = PINS.map((q) => {
      const el = disc(reach * LIP * q.cosLat, ctx.colour, 0.6);
      body.appendChild(el);
      return el;
    });
    g.appendChild(body);

    const step = (t: number): void => {
      // Never fully shut and never fully open: a mouth that closes to nothing
      // is a body that lost a mark, and one that stands wide is a hole.
      const open = 0.45 + Math.sin(t * RATE) * WORK * 0.5;
      for (let i = 0; i < LIPS; i++) {
        const q = PINS[i];
        const el = lips[i];
        if (!q || !el) continue;
        const f = facet(q, t * SPIN);
        if (!f.near) {
          el.setAttribute("display", "none");
          continue;
        }
        el.removeAttribute("display");
        el.setAttribute(
          "transform",
          `translate(${(f.x * reach * open).toFixed(2)} ${(f.y * reach * open).toFixed(2)}) scale(${f.sx.toFixed(4)} 1)`,
        );
        el.setAttribute("opacity", surfaceDim(DIM, f.lit).toFixed(3));
      }
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
