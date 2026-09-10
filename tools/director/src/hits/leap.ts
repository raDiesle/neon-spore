import { streamFor } from "../skins/seed.js";
import { SVG } from "../skins/types.js";
import type { Hit } from "./types.js";

/**
 * A ball of light thrown at the body over the beats before the hit, on a
 * bowed path from off the frame, a tail of fading copies behind it — and in
 * the last stretch a short bolt reaching out of it to strike the rim.
 *
 * It was `creature:coil` / `leap` on VERSUS: the charge that passes from a
 * failed dome to the next one, drawn as a thing that *jumps* rather than a
 * line that grows. The owner took PRONGS for the coil on 10 September 2026
 * and asked for this to be kept on the SHAPES page, in a new category if it
 * needed one. It did not: what it draws is the window before an impact —
 * something on its way to the body, announced and then landing — and that is
 * this axis's *before* phase, TELEGRAPH's own window, with the same trigger.
 * A charge is a hit seen from the far end.
 *
 * ## What it argues
 *
 * That what passes between two bodies should read as a body in flight rather
 * than a rope being paid out. The ball rises off the straight line and comes
 * down onto the rim it is aimed at; behind it five fading copies at the
 * places it was a moment ago, so the eye reads motion rather than a light
 * being slid. Nothing joins the source and the body for most of the flight —
 * only in the last stretch does a bolt reach out of the ball and strike the
 * rim, and that is the frame a pilot was being asked to call.
 *
 * The bow leans *up*: a ball that dipped below the chord would read as
 * falling, which everything else on the field already is.
 *
 * ## Where it can lose
 *
 * A ball in the air is a shot. If at speed it reads as one of the pair's own
 * bullets going sideways, the tail and the bow have not been enough.
 */
/** Where the flight starts, in half-extents from the centre, up and to the
 * left — off the frame the card is fitted to, so it is seen to arrive. */
const FROM_X = -2.0;
const FROM_Y = -1.2;
/** How high the arc stands off the chord at its middle, in half-extents. */
const BOW = 0.7;
/** Copies of the ball behind it, and how far back in the flight the last one
 * sits — further back than the game's 0.12 of a flight, since a card's flight
 * is a quarter of a field's and the copies would sit under the halo. */
const TAIL = 5;
const TAIL_BACK = 0.3;
/** The last share of the flight over which the bolt reaches ahead. */
const STRIKE = 0.22;
/** The ball's radius as a share of the smaller half-extent. */
const BALL = 0.14;
/** Bolt segments, how far each kinks off the line as a share of the reach,
 * and how many distinct crackles are pre-rolled to cycle through. */
const KINKS = 5;
const KINK = 0.18;
const CRACKLES = 8;

export const LEAP: Hit<"leap"> = {
  id: "leap",
  label: "LEAP",
  hint: "a ball of light thrown at the body on a bowed path over the beat before the hit, a tail behind it, a bolt striking the rim in the last stretch",
  phase: "before",
  spread: Math.hypot(FROM_X, FROM_Y) - 1 + BALL * 3,
  build(ctx) {
    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    const r = Math.min(rx, ry) * BALL;
    const cx = ctx.centre.x;
    const cy = ctx.centre.y;
    const from = { x: cx + FROM_X * rx, y: cy + FROM_Y * ry };
    // The rim on the side the ball comes from: where the bolt lands.
    const n = Math.hypot(FROM_X * rx, FROM_Y * ry) || 1;
    const to = { x: cx + (FROM_X * rx * rx * 0.92) / n, y: cy + (FROM_Y * ry * ry * 0.92) / n };
    const at = (s: number) => ({
      x: from.x + (to.x - from.x) * s,
      y: from.y + (to.y - from.y) * s - Math.sin(s * Math.PI) * BOW * ry,
    });

    const tail: SVGCircleElement[] = [];
    for (let k = TAIL; k >= 1; k--) {
      const c = document.createElementNS(SVG, "circle");
      c.setAttribute("fill", ctx.colour);
      c.setAttribute("r", (r * (0.4 + 0.6 * (1 - k / (TAIL + 1)))).toFixed(2));
      c.setAttribute("fill-opacity", "0");
      ctx.body.appendChild(c);
      tail.push(c);
    }
    const bolt = document.createElementNS(SVG, "polyline");
    bolt.setAttribute("fill", "none");
    bolt.setAttribute("stroke", ctx.colour);
    bolt.setAttribute("stroke-width", (ctx.weight * 0.9).toFixed(2));
    bolt.setAttribute("stroke-linejoin", "round");
    bolt.setAttribute("stroke-opacity", "0");
    ctx.body.appendChild(bolt);
    const halo = document.createElementNS(SVG, "circle");
    halo.setAttribute("fill", ctx.colour);
    halo.setAttribute("fill-opacity", "0");
    ctx.body.appendChild(halo);
    const ball = document.createElementNS(SVG, "circle");
    ball.setAttribute("fill", "#FFFFFF");
    ball.setAttribute("r", r.toFixed(2));
    ball.setAttribute("fill-opacity", "0");
    ctx.body.appendChild(ball);

    // The crackles, rolled once from the card's name: a kink per segment per
    // crackle, so the bolt redraws a few times a second without a random in
    // the loop.
    const rand = streamFor(ctx.name);
    const kinks = Array.from({ length: CRACKLES }, () =>
      Array.from({ length: KINKS - 1 }, () => (rand() - 0.5) * 2),
    );

    ctx.onFrame(({ hit }) => {
      const w = hit.wind;
      if (w <= 0) {
        for (const c of tail) c.setAttribute("fill-opacity", "0");
        bolt.setAttribute("stroke-opacity", "0");
        halo.setAttribute("fill-opacity", "0");
        ball.setAttribute("fill-opacity", "0");
        return;
      }
      const head = at(w);
      for (let i = 0; i < tail.length; i++) {
        const k = TAIL - i;
        const c = tail[i];
        if (!c) continue;
        const p = at(Math.max(0, w - (TAIL_BACK * k) / TAIL));
        c.setAttribute("cx", p.x.toFixed(2));
        c.setAttribute("cy", p.y.toFixed(2));
        c.setAttribute("fill-opacity", (0.5 * (1 - k / (TAIL + 1))).toFixed(3));
      }
      halo.setAttribute("cx", head.x.toFixed(2));
      halo.setAttribute("cy", head.y.toFixed(2));
      halo.setAttribute("r", (r * 2.6 * (0.7 + 0.5 * w)).toFixed(2));
      halo.setAttribute("fill-opacity", (0.18 + 0.18 * w).toFixed(3));
      ball.setAttribute("cx", head.x.toFixed(2));
      ball.setAttribute("cy", head.y.toFixed(2));
      ball.setAttribute("fill-opacity", "0.85");

      if (w <= 1 - STRIKE) {
        bolt.setAttribute("stroke-opacity", "0");
        return;
      }
      const reach = (w - (1 - STRIKE)) / STRIKE;
      const ex = head.x + (to.x - head.x) * reach;
      const ey = head.y + (to.y - head.y) * reach;
      const dx = ex - head.x;
      const dy = ey - head.y;
      const len = Math.hypot(dx, dy) || 1;
      const px = -dy / len;
      const py = dx / len;
      const set = kinks[Math.floor(hit.since * -60) % CRACKLES] ?? kinks[0] ?? [];
      let pts = `${head.x.toFixed(2)},${head.y.toFixed(2)}`;
      for (let i = 1; i < KINKS; i++) {
        const s = i / KINKS;
        const off = (set[i - 1] ?? 0) * KINK * len;
        pts += ` ${(head.x + dx * s + px * off).toFixed(2)},${(head.y + dy * s + py * off).toFixed(2)}`;
      }
      pts += ` ${ex.toFixed(2)},${ey.toFixed(2)}`;
      bolt.setAttribute("points", pts);
      bolt.setAttribute("stroke-opacity", "0.9");
    });
  },
};
