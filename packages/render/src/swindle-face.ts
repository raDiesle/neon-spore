import type { SwindleState, World } from "@neon-spore/sim";
import { swindleLitStep } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { podCenter } from "./pods.js";
import type { DealerBox } from "./swindle-place.js";
import { SWINDLE_CORE, SWINDLE_RIM } from "./swindle-tint.js";

/**
 * **THE SWINDLE's face: a dealer's.** Two heavy-lidded eyes and a lopsided
 * smirk, on the front of her body and turned with it.
 *
 * **Her eyes follow the game**, the way a dealer's do: the pod falling, else
 * the pod gliding, else the next she will let go — all read off the script's
 * order and the pods' places, **never off what a pod is**, so the pilot's
 * screen learns nothing from where she looks. She blinks now and then; a real
 * pod swallowed makes her wince, and beaten she shuts her eyes.
 */

/** An eye's radius and its place off her middle, in tiles and her radii. */
const EYE_TILES = 0.34;
const EYE_APART = 0.26;
const EYE_UP = 0.12;
/** How far a pupil travels inside its eye, in eye radii. */
const LOOK = 0.42;
/** Seconds between blinks, and a blink's length. */
const BLINK_EVERY = 3.7;
const BLINK = 0.14;

interface At {
  x: number;
  y: number;
}

/** Where she looks this frame, in pixels; null for straight down. */
export function swindleGaze(l: Layout, world: World, s: SwindleState): At | null {
  const of = (id: number | undefined) => world.pods.find((p) => p.id === id);
  for (let i = s.hung.length - 1; i >= 0; i--) {
    const p = of(s.hung[i]);
    if (p?.loose) return podCenter(l, p);
  }
  const gliding = of(s.glide[0]);
  if (gliding !== undefined) return podCenter(l, gliding);
  const next = swindleLitStep(s)?.drops[s.dropped];
  const waiting = next === undefined ? undefined : of(s.hung[next.pod]);
  return waiting === undefined ? null : podCenter(l, waiting);
}

export function drawSwindleFace(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  b: DealerBox,
  gaze: At | null,
  hurt: number,
  spent: boolean,
  time: number,
): void {
  const r = EYE_TILES * l.tile * (0.8 + 0.2 * (b.ry / l.tile));
  const blink = time % BLINK_EVERY < BLINK;
  // How far down the upper lid comes: sly at rest, a wince when struck.
  const lid = spent || blink ? 1 : Math.min(0.85, 0.38 + hurt * 0.6);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.lean);
  for (const side of [-1, 1]) {
    const ex = side * b.rx * EYE_APART;
    const ey = -b.ry * EYE_UP;
    eye(ctx, ex, ey, r, side, lid, look(b, ex, ey, r, gaze), spent);
  }
  smirk(ctx, b, l.tile, hurt > 0.3 || spent);
  ctx.restore();
}

/** The pupil's offset in the eye, toward what she watches. */
function look(b: DealerBox, ex: number, ey: number, r: number, gaze: At | null): At {
  if (gaze === null) return { x: 0, y: r * LOOK * 0.6 };
  // Back into her own turned frame, then pointed at it.
  const c = Math.cos(-b.lean);
  const s = Math.sin(-b.lean);
  const gx = gaze.x - b.x;
  const gy = gaze.y - b.y;
  const dx = gx * c - gy * s - ex;
  const dy = gx * s + gy * c - ey;
  const d = Math.max(1, Math.hypot(dx, dy));
  return { x: (dx / d) * r * LOOK, y: (dy / d) * r * LOOK };
}

function eye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  side: number,
  lid: number,
  pupil: At,
  spent: boolean,
): void {
  const rim = spent ? rgba(PALETTE.dim, 0.8) : rgba(SWINDLE_RIM, 0.9);
  if (lid >= 1) {
    // Shut: a lash line sagging across where the eye was.
    ctx.strokeStyle = rim;
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2, r * 0.22);
    ctx.beginPath();
    ctx.arc(x, y - r * 0.6, r, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.82, 0, 0, Math.PI * 2);
  ctx.fillStyle = spent ? rgba(PALETTE.sparkDim, 0.5) : rgba("#F4FFE8", 0.95);
  ctx.fill();
  ctx.clip();
  // A slit pupil, the dark of her, with a glint.
  ctx.fillStyle = rgba(PALETTE.background, 0.95);
  ctx.beginPath();
  ctx.ellipse(x + pupil.x, y + pupil.y, r * 0.3, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba("#FFFFFF", 0.85);
  ctx.beginPath();
  ctx.arc(x + pupil.x - r * 0.1, y + pupil.y - r * 0.22, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // The upper lid, slanting down toward her middle: the schemer's look.
  const top = y - r;
  const edge = top + lid * 2 * r;
  const inner = edge + r * 0.28 * (1 - lid);
  ctx.fillStyle = rgba(SWINDLE_CORE, 1);
  ctx.beginPath();
  ctx.moveTo(x - r * 1.1, top - r);
  ctx.lineTo(x + r * 1.1, top - r);
  ctx.lineTo(x + r * 1.1, side > 0 ? edge : inner);
  ctx.lineTo(x - r * 1.1, side > 0 ? inner : edge);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(1.5, r * 0.16);
  ctx.beginPath();
  ctx.moveTo(x - r * 1.1, side > 0 ? inner : edge);
  ctx.lineTo(x + r * 1.1, side > 0 ? edge : inner);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(1.5, r * 0.14);
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.82, 0, 0, Math.PI * 2);
  ctx.stroke();
}

/** A lopsided smirk under her eyes; a sag when she is struck or beaten. */
function smirk(ctx: CanvasRenderingContext2D, b: DealerBox, tile: number, down: boolean): void {
  const y = b.ry * 0.38;
  const left = { x: -b.rx * 0.2, y: y + (down ? tile * 0.12 : 0) };
  const right = { x: b.rx * 0.24, y: y - (down ? -tile * 0.1 : tile * 0.16) };
  const bend = down ? -tile * 0.18 : tile * 0.2;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.background, 0.85);
  ctx.lineWidth = Math.max(2, tile * 0.08);
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.quadraticCurveTo((left.x + right.x) / 2 - tile * 0.2, y + bend, right.x, right.y);
  ctx.stroke();
  ctx.restore();
}
