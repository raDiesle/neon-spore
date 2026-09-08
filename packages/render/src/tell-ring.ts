import { TELL_BEATS, TELL_THROWS, type TellThrow } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The ring, drawn on the boss's own body — three nodes and the three arrows
 * between them.
 *
 * **This is why the rules can be on screen the whole time.** The owner asked
 * for the table of what beats what to be permanently visible, and a portrait
 * phone has no strip to spare for one. So the boss *is* the table: its three
 * lobes are the three throws, the arrows run round the inside of its skin, and
 * the lobe it fills during a tell is one of the ring's own nodes. Nothing had
 * to be given a corner of the screen, and there is no second drawing of the
 * ring to drift from `TELL_BEATS` (`sim/tell-rules.ts`), which is where the
 * arrows come from rather than from a list here.
 *
 * The geometry is shared with `tell-scene.ts` and with the body itself, so
 * `ringNode` is the one answer to *where is a throw drawn* — the same property
 * `slabPanel` has for a round's buttons, and for the same reason: a node lit
 * somewhere a glyph is not drawn is a rule pointing at nothing.
 */

/** Where the three nodes sit, as a fraction of the body's own radius. */
const NODE_RADIUS = 0.6;
/** How big a node is, as a fraction of the body's radius. */
const NODE_SIZE = 0.26;

/** The angle a throw's node stands at, clockwise from straight up. */
export function ringAngle(at: number): number {
  return -Math.PI / 2 + (at / TELL_THROWS.length) * Math.PI * 2;
}

/** Where a throw is drawn on a body of this radius, centred at `cx`,`cy`. */
export function ringNode(
  cx: number,
  cy: number,
  r: number,
  at: number,
): { x: number; y: number; r: number } {
  const a = ringAngle(at);
  return {
    x: cx + Math.cos(a) * r * NODE_RADIUS,
    y: cy + Math.sin(a) * r * NODE_RADIUS,
    r: r * NODE_SIZE,
  };
}

/**
 * One throw's glyph, at a point, at a size.
 *
 * Three drawings and no text: a word in a node would be a word to read, and
 * the pair are already reading two screens. Each is the thing the game already
 * draws for that verb — a bolt is the lozenge that leaves the cannon, a plate
 * is the dome the shield raises, and a maw is the mouth the cannon opens.
 */
export function drawThrowGlyph(
  ctx: CanvasRenderingContext2D,
  t: TellThrow,
  x: number,
  y: number,
  r: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, r * 0.18);
  ctx.lineCap = "round";
  if (t === "bolt") {
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.34, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (t === "plate") {
    // The dome, as the shield draws it: an arc over a flat, opening downward.
    ctx.beginPath();
    ctx.arc(x, y + r * 0.34, r * 0.78, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - r * 0.78, y + r * 0.34);
    ctx.lineTo(x + r * 0.78, y + r * 0.34);
    ctx.stroke();
    return;
  }
  // The mouth: an open crescent, hinged at the left, the way the maw opens.
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, Math.PI * 0.28, Math.PI * 1.72);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.3, Math.PI * 1.72, Math.PI * 0.28);
  ctx.stroke();
}

/** One arrow, from the throw that wins to the throw it beats, along the ring. */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number; r: number },
  to: { x: number; y: number; r: number },
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const ux = dx / len;
  const uy = dy / len;
  const ax = from.x + ux * (from.r * 1.25);
  const ay = from.y + uy * (from.r * 1.25);
  const bx = to.x - ux * (to.r * 1.35);
  const by = to.y - uy * (to.r * 1.35);
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = Math.max(1, from.r * 0.1);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();
  // The head, two strokes off the tip rather than a filled triangle: at this
  // size a triangle is a dot and a dot points nowhere.
  const head = from.r * 0.42;
  for (const turn of [2.5, -2.5]) {
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(
      bx + Math.cos(Math.atan2(uy, ux) + turn) * head,
      by + Math.sin(Math.atan2(uy, ux) + turn) * head,
    );
    ctx.stroke();
  }
}

/**
 * The whole ring on a body: three glyphs and three arrows, always on.
 *
 * `lit` is the node the ship has committed to, or -1 — it lights on both
 * screens the instant a seat locks, which is the owner's second rule about
 * visibility and the only way the seat that did not throw finds out what its
 * partner did.
 */
export function drawRing(
  ctx: CanvasRenderingContext2D,
  _l: Layout,
  cx: number,
  cy: number,
  r: number,
  lit: number,
): void {
  const nodes = TELL_THROWS.map((_, i) => ringNode(cx, cy, r, i));
  for (const [i, t] of TELL_THROWS.entries()) {
    const loser = TELL_THROWS.indexOf(TELL_BEATS[t]);
    const from = nodes[i];
    const to = nodes[loser];
    if (from && to) drawArrow(ctx, from, to);
  }
  for (const [i, t] of TELL_THROWS.entries()) {
    const n = nodes[i];
    if (!n) continue;
    const on = i === lit;
    if (on) {
      ctx.fillStyle = PALETTE.good;
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    drawThrowGlyph(ctx, t, n.x, n.y, n.r, on ? PALETTE.good : PALETTE.hullRim);
  }
}
