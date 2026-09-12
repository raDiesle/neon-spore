import { halo } from "./glow.js";
import { handleSag } from "./handle-draw.js";
import { mixHex, rgba } from "./hex.js";
import { STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import type { TetherDraw } from "./tether-look.js";

/**
 * SINEW — the rope is a piece of the boss, and pulling it is felt all the
 * way up.
 *
 * **The rope.** Not a line but a tendon: a translucent sheath drawn as a
 * filled band around the sag, thick where it leaves the eye and tapering to
 * the hand, with a bright core down its middle. The sheath is the body
 * colour at low alpha, so the field shows through it and it reads as wet
 * tissue rather than as cable. While a hand is on it, pulses of light run up
 * the core from the hand *to the eye* — the tension travelling to the thing
 * it opens — faster and brighter the harder the pull, so the player who is
 * not holding it can see the pull arriving and not only how far it has got.
 * Taut, the sheath goes pale and narrow and the core hard, which is the
 * shipped rope's own gauge said in flesh.
 *
 * **The root.** A puckered socket: six short creases radiating from where
 * the sinew enters the eye's underside, drawn in toward the hole as the pull
 * rises, so the boss is seen to be *gripped* where it is being pulled.
 *
 * **How it can lose.** *A wide translucent band over the field is a smear.*
 * If the sheath at its widest hides what is behind it rather than tinting
 * it, or the pulses read as bullets travelling the wrong way, the rope has
 * stopped being a control and become weather. Judge it held and half
 * pulled.
 */

/** The sheath's half-width at the eye and at the hand, slack, in tiles; and
 * how much of that survives at full pull. */
const ROOT_W = 0.2;
const HAND_W = 0.07;
const TAUT_MUL = 0.45;
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";
/** Pulses in flight at once, their speed in lengths a second at full pull,
 * and their size in tiles. */
const PULSES = 3;
const PULSE_SPEED = 1.4;
const PULSE_R = 0.12;
/** The socket's creases: how many and how far they reach, in tiles. */
const CREASES = 6;
const CREASE = 0.22;

type Point = { x: number; y: number };

function sag(d: TetherDraw): Point[] {
  const { anchor, head, held, pull, time } = d;
  return handleSag({
    anchor,
    head,
    held,
    pull,
    time,
    segments: 14,
    waveHeld: 1.2,
    waveSlack: 3.5,
  });
}

/** A band around the axis, wide at the root and narrow at the hand. */
function sheathPath(pts: Point[], d: TetherDraw): Path2D {
  const { tile, pull } = d;
  const n = pts.length - 1;
  const left: Point[] = [];
  const right: Point[] = [];
  const squeeze = 1 + (TAUT_MUL - 1) * pull;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const prev = pts[Math.max(0, i - 1)]!;
    const next = pts[Math.min(n, i + 1)]!;
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const w = tile * (ROOT_W + (HAND_W - ROOT_W) * t) * squeeze;
    const p = pts[i]!;
    left.push({ x: p.x + (-dy / len) * w, y: p.y + (dx / len) * w });
    right.push({ x: p.x - (-dy / len) * w, y: p.y - (dx / len) * w });
  }
  // One closed loop — down one edge and back up the other. Two open paths
  // added together each close on their own chord, and the sheath filled as a
  // straight-edged sliver beside the sag.
  return splinePath([...left, ...right.reverse()], true);
}

/** Where along the axis `t` lands, interpolated between the sag's points. */
function along(pts: Point[], t: number): Point {
  const n = pts.length - 1;
  const s = Math.max(0, Math.min(1, t)) * n;
  const i = Math.min(n - 1, Math.floor(s));
  const f = s - i;
  const a = pts[i]!;
  const b = pts[i + 1]!;
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

export function sinew(d: TetherDraw): void {
  const { ctx, held, pull, time, hex, rim, tile } = d;
  const pts = sag(d);
  const paint = held ? mixHex(hex, rim, pull * 0.6) : hex;
  ctx.save();
  // The sheath: translucent, edged in a darker skin.
  const band = sheathPath(pts, d);
  ctx.fillStyle = rgba(paint, 0.22 + 0.18 * pull);
  ctx.fill(band);
  ctx.strokeStyle = rgba(mixHex(paint, SHADOW, 0.4), 0.6);
  ctx.lineWidth = STROKE.inner;
  ctx.lineJoin = "round";
  ctx.stroke(band);
  // The core: hard and bright, brighter the tighter.
  const core = splinePath(pts, false);
  ctx.strokeStyle = held ? rim : rgba(rim, 0.6);
  ctx.lineWidth = STROKE.inner * (0.8 + 0.6 * pull);
  ctx.lineCap = "round";
  ctx.stroke(core);
  ctx.restore();
  // The pulses: only under a hand, running from the hand up to the eye.
  if (!held) return;
  const speed = PULSE_SPEED * (0.4 + 0.6 * pull);
  for (let k = 0; k < PULSES; k++) {
    const phase = (time * speed + k / PULSES) % 1;
    // From the hand (t = 1) to the eye (t = 0).
    const p = along(pts, 1 - phase);
    halo(ctx, p.x, p.y, tile * PULSE_R * 2.5, rim, (0.25 + 0.5 * pull) * (1 - phase * 0.5));
  }
}

export function socket(d: TetherDraw): void {
  const { ctx, anchor, hex, rim, pull, tile } = d;
  const reach = tile * CREASE * (1 - 0.4 * pull);
  const inner = tile * ROOT_W * 0.5;
  ctx.save();
  ctx.strokeStyle = pull > 0 ? rim : hex;
  ctx.globalAlpha = 0.5 + 0.5 * pull;
  ctx.lineWidth = STROKE.inner;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let k = 0; k < CREASES; k++) {
    // Fanned across the underside only: the sinew leaves the eye downward,
    // and a crease pointing up would be drawn over the lens.
    const a = Math.PI * (0.15 + (0.7 * k) / (CREASES - 1));
    ctx.moveTo(anchor.x + Math.cos(a) * inner, anchor.y + Math.sin(a) * inner);
    ctx.lineTo(anchor.x + Math.cos(a) * (inner + reach), anchor.y + Math.sin(a) * (inner + reach));
  }
  ctx.stroke();
  ctx.restore();
}
