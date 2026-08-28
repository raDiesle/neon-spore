import { contactPass, KEY, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { film, type Hsl, toHsl } from "./nacre-film.js";
import { auraPass, fillPass, rimPass } from "./parts.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * NACRE — mother-of-pearl. Colour that shifts *across* the surface and *with*
 * the body's own motion, rather than one hue at several brightnesses, which is
 * what every skin before this one does.
 *
 * **`docs/alive.md` refuses iridescence, and that refusal is about the field,
 * not about this page.** In a wave a creature's red-or-cyan is a gameplay fact
 * the pair says out loud across a two-second delay, and a third colour on it is
 * worse than a body that is merely less alive. A catalogue card is not in a wave
 * and nothing votes it into one. So this skin is allowed here and **is not a
 * promise about creatures**; nothing in it weakens `alive.md`.
 *
 * The constraint a shipped version would have to clear has two halves. The
 * first is the one `light.ts` names: at 26 px the tint may never move a red body
 * toward cyan, because the colour *is* the callout — `nacre-film.ts` clears that
 * half by construction, and its header is where the span is argued. The second
 * half is not cleared by any span, and it is why this stays on a card: a colour
 * that **changes while you are looking at it** is not a colour one player can
 * name to the other. The point of the skin is the shift; the point of the
 * callout is that there is nothing to shift.
 *
 * ## The shift rides the body, not a clock
 *
 * **A hue that cycles on a timer regardless of the shape is a screensaver** — it
 * looks plausible in a still and wrong in motion. So `onFrame` ignores `t`
 * entirely. The two films slide by the body's own displacement, projected onto
 * each layer's direction and divided by `ctx.reach`: a card that sways slides
 * its bands and brings them back, a card with no motion holds a fixed pattern,
 * and nothing advances while nothing moves. Every own-motion is an oscillation,
 * so the slide is one too — the bands breathe rather than march, which is what a
 * surface catching light does and a colour animation does not.
 *
 * `SkinContext` carries no velocity, so the displacement is CILIA's technique:
 * `ctx.body.transform.baseVal.getItem(0).matrix`, which `shape-figure.ts` writes
 * before every `onFrame`. That assumes a translate is the first transform item —
 * true today, promised nowhere. `docs/parked.md` already wants a proper field,
 * and this is the third caller waiting for it.
 *
 * No angle is named here. The two layers take `KEY` and one tilt off it, the
 * way `specularPass` already does.
 */

/** One band cycle as a fraction of the bbox — about three across a body. */
const PERIOD = 0.34;
/** The second layer's period, not a ratio of the first, so the two never line up. */
const PERIOD_B = PERIOD * 0.71;
/** The second layer's direction, as a tilt off `KEY` — never an angle of its own. */
const TILT = 0.62;
/** Stops in one cycle. First and last are equal, so `repeat` is seamless. */
const STOPS = 12;
const FILM_ALPHA = 0.26;
const CATCH_ALPHA = 0.38;
/** Band cycles slid per body-radius of travel. A full sway is about 1.6 of them. */
const RATE = 1.9;
const RATE_B = RATE * 0.63;

type Dir = typeof KEY;

interface Layer {
  readonly grad: SVGElement;
  readonly path: SVGPathElement;
  readonly dir: Dir;
  readonly period: number;
  readonly rate: number;
}

function stop(offset: number, colour: string, alpha: number): SVGElement {
  const s = document.createElementNS(SVG, "stop");
  s.setAttribute("offset", `${(offset * 100).toFixed(2)}%`);
  s.setAttribute("stop-color", colour);
  s.setAttribute("stop-opacity", alpha.toFixed(3));
  return s;
}

/** A gradient axis from one bbox offset to another, both relative to the centre. */
function axis(grad: SVGElement, from: Dir, to: Dir): void {
  grad.setAttribute("x1", (0.5 + from.x).toFixed(4));
  grad.setAttribute("y1", (0.5 + from.y).toFixed(4));
  grad.setAttribute("x2", (0.5 + to.x).toFixed(4));
  grad.setAttribute("y2", (0.5 + to.y).toFixed(4));
}

/**
 * One film: a repeating band gradient along `dir`, and the body path wearing it.
 * `spreadMethod` tiles the cycle, so sliding it by exactly one period is
 * seamless and the phase can be wrapped into 0..1 for ever without drifting.
 */
function filmLayer(
  ctx: SkinContext,
  id: string,
  base: Hsl | null,
  dir: Dir,
  period: number,
  alpha: number,
  rate: number,
): Layer {
  const grad = document.createElementNS(SVG, "linearGradient");
  grad.setAttribute("id", `${ctx.uid}-${id}`);
  grad.setAttribute("spreadMethod", "repeat");
  const h = { x: (dir.x * period) / 2, y: (dir.y * period) / 2 };
  axis(grad, { x: -h.x, y: -h.y }, h);
  for (let i = 0; i <= STOPS; i++) {
    const u = i / STOPS;
    grad.appendChild(stop(u, base ? film(base, u) : ctx.colour, alpha));
  }
  ctx.defs.appendChild(grad);
  const path = ctx.contourPath();
  path.setAttribute("fill", `url(#${ctx.uid}-${id})`);
  path.setAttribute("fill-rule", "evenodd");
  path.setAttribute("stroke", "none");
  return { grad, path, dir, period, rate };
}

/**
 * A mask keeping the second film to the lit side, gone by the terminator —
 * `0.5` along the key axis, the landmark `light.ts` uses. This layer is a
 * highlight, so it exists only when `ctx.lit`; without the guard the LIT toggle
 * would have a hole in it.
 */
function catchMask(ctx: SkinContext): string {
  const grad = document.createElementNS(SVG, "linearGradient");
  grad.setAttribute("id", `${ctx.uid}-nacre-fade`);
  axis(grad, { x: 0.5 * KEY.x, y: 0.5 * KEY.y }, { x: -0.5 * KEY.x, y: -0.5 * KEY.y });
  for (const [offset, white] of [
    [0, 1],
    [0.42, 0.55],
    [0.66, 0.06],
    [1, 0],
  ] as const)
    grad.appendChild(stop(offset, "#FFFFFF", white));
  ctx.defs.appendChild(grad);
  const mask = document.createElementNS(SVG, "mask");
  mask.setAttribute("id", `${ctx.uid}-nacre-catch`);
  mask.setAttribute("maskContentUnits", "objectBoundingBox");
  const rect = document.createElementNS(SVG, "rect");
  for (const [k, v] of [
    ["x", "-0.2"],
    ["y", "-0.2"],
    ["width", "1.4"],
    ["height", "1.4"],
  ] as const)
    rect.setAttribute(k, v);
  rect.setAttribute("fill", `url(#${ctx.uid}-nacre-fade)`);
  mask.appendChild(rect);
  ctx.defs.appendChild(mask);
  return `url(#${ctx.uid}-nacre-catch)`;
}

function nacre(ctx: SkinContext): void {
  const base = toHsl(ctx.colour);
  const dirB: Dir = {
    x: KEY.x * Math.cos(TILT) - KEY.y * Math.sin(TILT),
    y: KEY.x * Math.sin(TILT) + KEY.y * Math.cos(TILT),
  };

  const layers: Layer[] = [filmLayer(ctx, "nacre-a", base, KEY, PERIOD, FILM_ALPHA, RATE)];
  if (ctx.lit) {
    const b = filmLayer(ctx, "nacre-b", base, dirB, PERIOD_B, CATCH_ALPHA, RATE_B);
    b.path.setAttribute("mask", catchMask(ctx));
    layers.push(b);
  }
  for (const l of layers) ctx.body.appendChild(l.path);

  const phase = layers.map(() => 0);
  let prevX = 0;
  let prevY = 0;
  let seen = false;

  ctx.onFrame(() => {
    const list = ctx.body.transform.baseVal;
    if (list.numberOfItems === 0) return;
    const m = list.getItem(0).matrix;
    if (seen && ctx.reach > 0) {
      const dx = (m.e - prevX) / ctx.reach;
      const dy = (m.f - prevY) / ctx.reach;
      for (let i = 0; i < layers.length; i++) {
        const l = layers[i];
        if (!l) continue;
        const p = ((phase[i] ?? 0) + (dx * l.dir.x + dy * l.dir.y) * l.rate) % 1;
        phase[i] = p;
        const tx = p * l.period * l.dir.x;
        const ty = p * l.period * l.dir.y;
        l.grad.setAttribute("gradientTransform", `translate(${tx.toFixed(5)} ${ty.toFixed(5)})`);
      }
    }
    prevX = m.e;
    prevY = m.f;
    seen = true;
  });
}

/**
 * The light with the film between its value and its highlight — the order
 * `light.ts` describes as a skin needing a texture between two passes calling
 * them itself. The first film is the material and is drawn with the light off;
 * only the catch layer and the four light passes go away with `LIT`.
 */
export const NACRE: Skin<"nacre"> = {
  id: "nacre",
  label: "NACRE",
  hint: "mother-of-pearl: a 26° hue film that slides with the body's own motion",
  build(ctx) {
    fillPass(ctx);
    terminatorPass(ctx);
    contactPass(ctx);
    nacre(ctx);
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
  },
};
