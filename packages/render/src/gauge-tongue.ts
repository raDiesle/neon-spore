import type { Point } from "@neon-spore/content";
import type { GaugeState, SimConfig } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE GAUGE's tongue out**, in the rest after the second level
 * (`sim/gauge-tongue.ts`). The owner, 30 September 2026: *or to rotate the
 * tongue that it gets twisted by both players*.
 *
 * The in-mouth tongue (`gauge-face.ts`) lolls up out of the throat, long, and
 * each seat's half of it turns with that seat's drag: hers a little way up
 * from the root, his at the tip. It is a flat ribbon seen from the side, so a
 * turn shows as the width narrowing to its edge and the underside coming
 * round, darker — and two halves wrung opposite ways show as a spiral between
 * the two hands. The twist is drawn off the state, on both screens, so each
 * seat watches the other's half arrive.
 *
 * The root never turns: it is in the throat, and a ribbon turned at the root
 * would be a tongue unscrewing rather than one being wrung.
 */

/** The middle line out of the throat and up across the mouth, in dial radii from the pivot. */
const LINE: readonly (readonly [number, number])[] = [
  [0.1, 0.05],
  [0.3, -0.05],
  [0.42, -0.3],
  [0.35, -0.58],
  [0.15, -0.72],
];
/** How far along it her hand is; his is the tip. */
export const TONGUE_P2_AT = 0.38;
const SAMPLES = 24;
const ROOT_W = 0.2;
const TIP_W = 0.13;
/** How far one seat's full drag turns its end, in half-turns, and where it stops. */
const TURN_PER = 0.75;
const TURN_MAX = 1.25;
/** The edge-on ribbon's own thickness, as a share of its width. */
const EDGE = 0.14;
const DARK = "#2E0D22";
const LIT = "#8A4760";
const UNDER = "#5A2440";

/** A seat's end, turned by its drag: radians. */
function turnOf(cfg: SimConfig, milli: number): number {
  const u = Math.max(-TURN_MAX, Math.min(TURN_MAX, milli / cfg.gaugeTongueTwistMilli));
  return u * TURN_PER * Math.PI;
}

/** The turn at `k` along the tongue: none at the root, hers at hers, his at the tip. */
function turnAt(cfg: SimConfig, g: GaugeState, k: number): number {
  const t2 = turnOf(cfg, g.tongueP2Milli);
  if (k <= TONGUE_P2_AT) return (t2 * k) / TONGUE_P2_AT;
  const t1 = turnOf(cfg, g.tongueP1Milli);
  return t2 + ((t1 - t2) * (k - TONGUE_P2_AT)) / (1 - TONGUE_P2_AT);
}

/** One uniform Catmull-Rom point on the middle line, `k` from root to tip. */
function lineAt(dial: Dial, k: number, sway: number): Point {
  const last = LINE.length - 1;
  const f = Math.min(last - 1e-9, Math.max(0, k * last));
  const i = Math.floor(f);
  const t = f - i;
  const p = (j: number) => LINE[Math.max(0, Math.min(last, j))] as readonly [number, number];
  const [a, b, c, d] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
  const cr = (n: 0 | 1) =>
    0.5 *
    (2 * b[n] +
      (c[n] - a[n]) * t +
      (2 * a[n] - 5 * b[n] + 4 * c[n] - d[n]) * t * t +
      (3 * b[n] - a[n] - 3 * c[n] + d[n]) * t * t * t);
  return { x: dial.cx + dial.r * (cr(0) + sway * k * k), y: dial.cy + dial.r * cr(1) };
}

/** Where each seat's hand goes on the tongue: his at the tip, hers along it. */
export function gaugeTongueGrip(dial: Dial, seat: 1 | 2): Point {
  return lineAt(dial, seat === 1 ? 1 : TONGUE_P2_AT, 0);
}

interface Slice {
  c: Point;
  nx: number;
  ny: number;
  /** Signed half-width as seen: positive is the top showing. */
  h: number;
}

function slices(dial: Dial, cfg: SimConfig, g: GaugeState, sway: number): Slice[] {
  const mid: Point[] = [];
  for (let i = 0; i <= SAMPLES; i++) mid.push(lineAt(dial, i / SAMPLES, sway));
  return mid.map((c, i) => {
    const a = mid[Math.max(0, i - 1)] as Point;
    const b = mid[Math.min(SAMPLES, i + 1)] as Point;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const k = i / SAMPLES;
    const w = dial.r * (ROOT_W + (TIP_W - ROOT_W) * k);
    const h = w * Math.cos(turnAt(cfg, g, k));
    return { c, nx: -(b.y - a.y) / len, ny: (b.x - a.x) / len, h };
  });
}

/** The runs between the places the ribbon stands on its edge, each one face. */
function runs(s: readonly Slice[]): Slice[][] {
  const out: Slice[][] = [];
  let run: Slice[] = [s[0] as Slice];
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1] as Slice;
    const b = s[i] as Slice;
    if (a.h * b.h < 0) {
      const t = a.h / (a.h - b.h);
      const edge: Slice = {
        c: { x: a.c.x + (b.c.x - a.c.x) * t, y: a.c.y + (b.c.y - a.c.y) * t },
        nx: a.nx + (b.nx - a.nx) * t,
        ny: a.ny + (b.ny - a.ny) * t,
        h: 0,
      };
      run.push(edge);
      out.push(run);
      run = [edge];
    }
    run.push(b);
  }
  out.push(run);
  return out;
}

function facePath(run: readonly Slice[]): Path2D {
  const left = run.map((s) => ({ x: s.c.x + s.nx * s.h, y: s.c.y + s.ny * s.h }));
  const right = run.map((s) => ({ x: s.c.x - s.nx * s.h, y: s.c.y - s.ny * s.h }));
  return splinePath([...left, ...right.reverse()], true);
}

/** The tongue out and wrung, for both screens alike. */
export function drawGaugeTongueOut(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  cfg: SimConfig,
  g: GaugeState,
  time: number,
): void {
  const sway = g.tongueHolds === 0 ? Math.sin(time * 1.3) * 0.04 : 0;
  const s = slices(dial, cfg, g, sway);
  const tip = s[SAMPLES] as Slice;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Its thickness first, so a half standing on its edge is a thin neck and not a gap.
  ctx.strokeStyle = DARK;
  ctx.lineWidth = dial.r * TIP_W * EDGE * 2;
  ctx.stroke(
    splinePath(
      s.map((x) => x.c),
      false,
    ),
  );
  // The rounded tip, in whichever face is showing there.
  ctx.fillStyle = tip.h >= 0 ? LIT : UNDER;
  ctx.beginPath();
  ctx.ellipse(
    tip.c.x + tip.ny * dial.r * TIP_W * 0.35,
    tip.c.y - tip.nx * dial.r * TIP_W * 0.35,
    Math.max(1, Math.abs(tip.h)),
    dial.r * TIP_W * 0.8,
    Math.atan2(tip.ny, tip.nx),
    0,
    Math.PI * 2,
  );
  ctx.fill();
  const light = ctx.createLinearGradient(dial.cx, dial.cy, tip.c.x, tip.c.y);
  light.addColorStop(0, DARK);
  light.addColorStop(1, LIT);
  for (const run of runs(s)) {
    const top = run.some((x) => x.h > 0);
    const path = facePath(run);
    ctx.fillStyle = top ? light : UNDER;
    ctx.fill(path);
    ctx.strokeStyle = mixHex(LIT, PALETTE.venom, 0.25);
    ctx.lineWidth = 1.6;
    ctx.stroke(path);
    // The groove runs down the top, the vein down the underside.
    ctx.strokeStyle = rgba(DARK, top ? 0.9 : 0.6);
    ctx.lineWidth = Math.max(1.2, dial.r * (top ? 0.018 : 0.01));
    ctx.stroke(
      splinePath(
        run.map((x) => x.c),
        false,
      ),
    );
  }
  ctx.restore();
}
