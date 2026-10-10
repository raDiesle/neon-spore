import type { ControlSet } from "@neon-spore/content";
import {
  LAMPREY_BUTTONS,
  type LampreyButton,
  lampreyBoss,
  lampreyPlugButton,
  lampreyPlugIn,
  type World,
} from "@neon-spore/sim";
import { controlLobes } from "./band-lobes.js";
import { WORD_FONT } from "./boss-cue-text.js";
import { cueBreath } from "./cue-helper.js";
import { fieldX } from "./field-flip.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { MOUTH } from "./lamprey-shape.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE LAMPREY's plug, inside the ship** (the owner, 10 October 2026: *the
 * worm bites inside the ship … tries to pull out the "suck" button by biting
 * it … it gets almost outside like an electrical button … the button keeping
 * visual almost out*; `sim/lamprey-plug.ts`).
 *
 * **The button comes out of its socket** (`drawPluggedLobe`, called by the
 * panel for each lobe): lifted toward the hull by how far the teeth have it,
 * tipped and nearer the eye, the socket left dark and bleeding under it and
 * three wires stretched between the two, like a plug half out of the wall.
 * **A button once bitten stays loose** for the rest of the fight, a little
 * out, a wire showing (`PLUG_LEFT`).
 *
 * **The eel is seen inside** (`drawLampreyInside`, over the panel): its body
 * comes in through the hull at its column and down through the ship, and its
 * sucker is clamped round the button, the teeth over its rim — on the screen
 * with the button. The other screen sees it go down into the ship and clamp
 * on a socket it cannot read, so how far out the button is stays the
 * worker's to say. The owner on the first build of this boss (5 October
 * 2026): *the boss head is not visible and behind the ship, this looks
 * weird* — so the head is never hidden by the hull here, it is drawn over the
 * panel.
 *
 * While the button is not in, the worker's screen breathes a halo round it
 * and says PRESS.
 */

/** How far a bitten button stays out once the eel has let go, as a share of the whole way. */
export const PLUG_LEFT = 0.45;
/** How far the whole way out lifts a button, in its radii; how much nearer the eye it comes; how far it tips, radians. */
const LIFT = 2;
const GROW = 0.22;
const TIP = 0.32;
/** The body's thickness inside the ship, in tiles, and the sucker's lip round the button, in its radii. */
const BODY = MOUTH * 0.9;
const LIP_IN = 1.02;
const LIP_OUT = 1.5;
const TEETH = 9;
/** The teeth along the jaw over the button's top. */
const JAW_TEETH = 6;
const WIRES = [PALETTE.red, PALETTE.pod, PALETTE.cyan] as const;

/** How far out of its socket the panel's `id` is drawn, nought to one. */
export function lampreyPlugDrawnOut(world: World, id: string): number {
  const s = lampreyBoss(world);
  if (s === null) return 0;
  if (s.phase === "bite" && lampreyPlugButton(s) === id) return Math.min(1, s.plugMilli / 1000);
  const i = LAMPREY_BUTTONS.indexOf(id as LampreyButton);
  return i >= 0 && s.plugs.includes(i) ? PLUG_LEFT : 0;
}

/** Where a button `out` of its socket is drawn: lifted, nearer, and which way it tips. */
export function pluggedCircle(l: Layout, c: Circle, out: number): Circle & { tip: number } {
  const side = c.x < l.width / 2 ? -1 : 1;
  return { x: c.x, y: c.y - out * c.r * LIFT, r: c.r * (1 + out * GROW), tip: side * out * TIP };
}

/**
 * A lobe `out` of its socket: the socket dark and bleeding, the wires, and the
 * button drawn by `draw` lifted and tipped over them.
 */
export function drawPluggedLobe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Circle,
  out: number,
  draw: () => void,
): void {
  const at = pluggedCircle(l, c, out);
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(at.tip);
  ctx.scale(at.r / c.r, at.r / c.r);
  ctx.translate(-c.x, -c.y);
  draw();
  ctx.restore();
  // What it left behind shows round the button and never over its face, so
  // the wires go in under it.
  ctx.save();
  const round = new Path2D();
  round.rect(0, 0, l.width, l.height);
  round.arc(at.x, at.y, at.r * 0.92, 0, Math.PI * 2);
  ctx.clip(round, "evenodd");
  ctx.fillStyle = PALETTE.lampreyMouth;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, c.r * 0.95, c.r * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.red, 0.7);
  ctx.stroke();
  // Blood run down from the socket's lip.
  ctx.fillStyle = rgba(PALETTE.red, 0.85);
  for (let i = 0; i < 3; i++) {
    const x = c.x + (i - 1) * c.r * 0.55;
    const len = c.r * (0.35 + 0.2 * (i % 2)) * (0.6 + out);
    ctx.fillRect(x - c.r * 0.05, c.y + c.r * 0.6, c.r * 0.1, len);
    ctx.beginPath();
    ctx.arc(x, c.y + c.r * 0.6 + len, c.r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  // The wires, stretched from the socket up under the button, bowed out past its rim.
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.5, c.r * 0.1);
  WIRES.forEach((hue, i) => {
    const d = (i - 1) * c.r * 0.38;
    ctx.strokeStyle = hue;
    ctx.beginPath();
    ctx.moveTo(c.x + d, c.y + c.r * 0.2);
    ctx.quadraticCurveTo(c.x + d * 2.6, (c.y + at.y) / 2, at.x + d * 0.7, at.y);
    ctx.stroke();
  });
  ctx.restore();
}

/** The eel inside the ship while a plug is on, over the panel. */
export function drawLampreyInside(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
  time: number,
  beatPhase: number,
): void {
  const s = lampreyBoss(world);
  const button = s === null ? null : lampreyPlugButton(s);
  if (s === null || button === null) return;
  const lobe = controlLobes(l, set).find((b) => b.control.id === button);
  const out = Math.min(1, s.plugMilli / 1000);
  // Once a beat the teeth tug the button toward the hole.
  const tug = Math.sin(beatPhase * Math.PI) ** 4 * l.tile * 0.08;
  const mouth =
    lobe === undefined
      ? { x: fieldX(l, s.col), y: l.lobeY, r: l.lobeR * 0.8 }
      : pluggedCircle(l, lobe.circle, out);
  const x0 = fieldX(l, s.col);
  const top = l.hullY - l.tile * 0.4;
  const end = { x: mouth.x, y: mouth.y - mouth.r * LIP_OUT * 0.8 - tug };
  drawBody(ctx, l, x0, top, end, time);
  drawSucker(ctx, mouth.x, mouth.y - tug, mouth.r, lobe === undefined);
  if (lobe === undefined || lampreyPlugIn(world.cfg, s)) return;
  const k = cueBreath(time);
  ctx.save();
  halo(ctx, mouth.x, mouth.y, mouth.r * LIP_OUT * 1.4, PALETTE.redRim, 0.4 * k);
  ctx.globalAlpha = 1;
  ctx.font = WORD_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(PALETTE.text, k);
  const side = mouth.x < l.width / 2 ? 1 : -1;
  ctx.fillText("PRESS", mouth.x + side * mouth.r * (LIP_OUT + 0.9), mouth.y);
  ctx.restore();
}

/** The body from the hole in the hull down through the ship to the mouth: dark edge, olive, a wet stripe, a wriggle. */
function drawBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x0: number,
  y0: number,
  end: { x: number; y: number },
  time: number,
): void {
  const wide = BODY * l.tile;
  const sway = Math.sin(time * 3) * l.tile * 0.25;
  const midY = (y0 + end.y) / 2;
  const path = new Path2D();
  path.moveTo(x0, y0);
  path.bezierCurveTo(x0 + sway, midY, end.x - sway, midY, end.x, end.y);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = wide + STROKE.outline * 2;
  ctx.strokeStyle = PALETTE.lampreyHideDark;
  ctx.stroke(path);
  ctx.lineWidth = wide;
  ctx.strokeStyle = PALETTE.lampreyHide;
  ctx.stroke(path);
  ctx.lineWidth = wide * 0.22;
  ctx.strokeStyle = rgba(PALETTE.lampreyFin, 0.7);
  ctx.translate(-wide * 0.18, 0);
  ctx.stroke(path);
  ctx.restore();
}

/**
 * The sucker clamped over the top of a button of radius `r`, its teeth over
 * the rim, so the socket and the wires under it still show — or, `blind`,
 * all the way round a dark socket.
 */
function drawSucker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  blind: boolean,
): void {
  ctx.save();
  const [from, to] = blind ? [0, Math.PI * 2] : [Math.PI * 0.9, Math.PI * 2.1];
  const lip = new Path2D();
  lip.arc(x, y, r * LIP_OUT, from, to);
  lip.arc(x, y, r * LIP_IN, to, from, true);
  lip.closePath();
  if (blind) {
    ctx.fillStyle = PALETTE.lampreyMouth;
    ctx.beginPath();
    ctx.arc(x, y, r * LIP_IN, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.lampreyHide;
  ctx.fill(lip);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.lampreyHideDark;
  ctx.stroke(lip);
  ctx.fillStyle = PALETTE.lampreyTooth;
  const teeth = blind ? TEETH : JAW_TEETH;
  for (let t = 0; t < teeth; t++) {
    const a = blind ? (t * Math.PI * 2) / TEETH : from + ((t + 0.5) * (to - from)) / teeth;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const w = (Math.PI / TEETH) * 0.6;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a - w) * r * LIP_IN * 1.08, y + Math.sin(a - w) * r * LIP_IN * 1.08);
    ctx.lineTo(x + c * r * 0.78, y + s * r * 0.78);
    ctx.lineTo(x + Math.cos(a + w) * r * LIP_IN * 1.08, y + Math.sin(a + w) * r * LIP_IN * 1.08);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
