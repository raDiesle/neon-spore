import { type Creature, recoilBouncesLeft, type SimConfig } from "@neon-spore/sim";
import { creatureRadius } from "./creature-place.js";
import { hazed } from "./depth.js";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE RECOIL's cage: the sprung frame a slick or a bulb falls inside, and the
 * damage it carries from every shot it has already survived.
 *
 * The body underneath is not drawn here at all. `wornKind` already answers
 * "slick" or "bulb" for a recoil, so `creatures.ts` draws an ordinary living
 * body with its ordinary colour and its ordinary own-motion, and this file
 * lays one more object over the top of it — THE CLASP's arrangement exactly,
 * and for the clasp's reason: what the pair has to read through the frame is
 * the colour, and the colour is the one thing about this creature that keeps
 * changing.
 *
 * **The frame is the health readout, and that is why there is no bar.** THE
 * RIND's size is its own count and this one's cage is: `STRUTS` ribs around
 * the body, one of them blown open per bounce already spent, so *how many are
 * left* is a thing either seat can read from where they are sitting without
 * being told. `recoilBouncesLeft` in the simulation is the one thing it reads,
 * which is what stops the picture and the shot ever disagreeing about whether
 * the next one finishes it.
 *
 * **The ribs are springs, because the mechanic is a trampoline.** A plain ring
 * would be plating, and plating is THE SHELL's word — chipped away a piece at
 * a time by a shot that does not care about colour. This one does not absorb
 * a shot, it *returns* it, so each rib is drawn as a zigzag leaf between the
 * body and the outer hoop: a thing under tension, which is the picture of
 * something about to throw what hits it back the other way. The whole frame
 * breathes on the wall clock, spread by the body's own id, so two recoils in
 * two lanes are never one drawing done twice.
 *
 * A broken rib is drawn rather than omitted. It hangs off the hoop, shortened
 * and scorched in `PALETTE.ember` — the colour of the jet that vented out of
 * it (`recoil-vent.ts`) — because a missing rib reads as a frame that was
 * always that shape, and a bent one reads as a frame something happened to.
 */

/** How far the hoop stands off the body it holds, as a multiple of its radius.
 * Wide enough to read as a cage around the thing rather than a rim on it, and
 * inside the fifth of a lane the gutter between two columns is worth
 * (`depth.ts`) — a frame that touched its neighbour would argue with the
 * column player 1 has just been told. */
const HOOP_MUL = 1.5;
/** Ribs around the body. Four, one per shot the arrival can take: three
 * bounces and the kill, so an untouched cage is whole and the last rib
 * standing is the one that is about to fail. Any more and a broken one stops
 * being countable at the size a phone draws. */
const STRUTS = 4;
/** Zigzag folds in one rib. Three reads as a spring at 26 px; two reads as a
 * kink and four reads as a scribble. */
const FOLDS = 3;
/** How far a fold swings off the rib's own line, as a share of its length. */
const FOLD_MUL = 0.34;
/** How much the frame breathes, as a share of the hoop. Under a tenth: this is
 * tension, not a pulse, and the throb owns pulsing. */
const BREATHE = 0.06;

/**
 * The cage, over a body that is already drawn. `time` is seconds, for the
 * frame's own breath; `near` is `nearness`, so the far rows dim with
 * everything else.
 */
export function drawRecoilCage(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  near: number,
): void {
  // The body's own drawn radius, so the hoop is around what is actually there
  // rather than around a nominal tile — `creatureRadius` is the same rule the
  // grip's ring is drawn at, and a frame that disagreed with it would be a
  // frame a thumb grabs through.
  const r = creatureRadius(l, c, 0, cfg) * HOOP_MUL;
  const left = recoilBouncesLeft(c);
  // Under tension and let go, on the wall clock: `sinHash` off the id spreads
  // the phase so two cages never breathe together, and the amount tightens as
  // the ribs go — a frame with one rib left is visibly working harder.
  const strain = 1 + (STRUTS - left) / STRUTS;
  const breath = 1 + BREATHE * strain * Math.sin(time * 4.2 + sinHash(c.id) * 6.3);
  const hoop = r * breath;

  const metal = hazed(cfg, PALETTE.rock, near);
  const dark = hazed(cfg, PALETTE.rockDark, near);
  const burnt = hazed(cfg, PALETTE.ember, near);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < STRUTS; i++) {
    // Rib `i` is spent once fewer than `i` bounces remain. Counted from the
    // top and going round, so the damage accumulates in one direction and the
    // pair can read "how far round has it got" rather than "how many are lit".
    const spent = i >= left;
    const a = (i / STRUTS) * Math.PI * 2 - Math.PI / 2;
    drawRib(ctx, x, y, a, creatureRadius(l, c, 0, cfg), hoop, spent, spent ? burnt : metal, time);
    drawHoopArc(ctx, x, y, a, STRUTS, hoop, spent, spent ? burnt : metal, dark);
  }
  ctx.restore();
}

/**
 * One rib: a zigzag leaf from the body out to the hoop.
 *
 * A spent one stops short of the hoop and leans off its own line — the spring
 * blew out and what is left is hanging. The lean is a fixed function of the
 * angle rather than of time, so a broken rib is *broken* and does not go on
 * flapping: the frame breathes and the wreckage does not, which is what makes
 * the two read as different materials.
 */
function drawRib(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  a: number,
  inner: number,
  outer: number,
  spent: boolean,
  hex: string,
  time: number,
): void {
  const reach = spent ? inner + (outer - inner) * 0.55 : outer;
  const lean = spent ? 0.5 : 0;
  const swing = spent ? 0 : 0.18 * Math.sin(time * 3.1 + a * 2);
  ctx.strokeStyle = hex;
  ctx.globalAlpha = spent ? 0.65 : 1;
  ctx.lineWidth = Math.max(0.8, outer * (spent ? 0.05 : 0.08));
  ctx.beginPath();
  for (let k = 0; k <= FOLDS * 2; k++) {
    const t = k / (FOLDS * 2);
    const d = inner + (reach - inner) * t;
    // The fold, alternating either side of the rib's line, and tapering to
    // nothing at both ends so the leaf meets the body and the hoop square on.
    const off = (k % 2 === 0 ? 0 : 1) * FOLD_MUL * (outer - inner) * Math.sin(t * Math.PI);
    const ang = a + lean * t + swing * t + off / Math.max(1, d);
    const px = x + Math.cos(ang) * d;
    const py = y + Math.sin(ang) * d;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * The quarter of the hoop this rib carries, and the bolt at its head.
 *
 * A spent rib's arc is drawn split: two short pieces with a gap where the bolt
 * was, so the hoop is visibly *open* there. That gap is the whole readout —
 * a shot could be said to have "damaged" a frame by dimming it, and dimming is
 * something a phone in a bright room throws away first.
 */
function drawHoopArc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  a: number,
  struts: number,
  r: number,
  spent: boolean,
  hex: string,
  dark: string,
): void {
  const half = Math.PI / struts;
  const gap = spent ? half * 0.45 : 0;
  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(0.8, r * (spent ? 0.05 : 0.075));
  ctx.globalAlpha = spent ? 0.7 : 1;
  ctx.beginPath();
  ctx.arc(x, y, r, a - half, a - gap);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, a + gap, a + half);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // The bolt the rib meets the hoop at. Present while the rib is, gone when it
  // is not — which is what the gap above is a gap in.
  if (spent) return;
  ctx.fillStyle = dark;
  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(0.6, r * 0.045);
  ctx.beginPath();
  ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, Math.max(1, r * 0.09), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
