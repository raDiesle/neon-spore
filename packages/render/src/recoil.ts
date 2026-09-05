import { type Creature, recoilBouncesLeft, type SimConfig } from "@neon-spore/sim";
import { creatureRadius } from "./creature-place.js";
import { colorTrio, turnedTrio } from "./creature-tint.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawHoopArc, drawRib } from "./recoil-ribs.js";

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
 * RIND's size is its own count and this one's cage is: one rib per bounce the
 * body arrived with, one of them blown open per bounce already spent, so *how
 * many are left* is a thing either seat can read from where they are sitting
 * without being told. `recoilBouncesLeft` in the simulation is the one thing
 * it reads, which is what stops the picture and the shot ever disagreeing
 * about whether the next one finishes it.
 *
 * **And the last bounce takes the whole frame with it.** Out of bounces, this
 * file draws *nothing*: the cage comes apart on the shot that spends the third
 * one (`recoil-cage-break.ts` throws the ribs off the tile it happened on) and
 * what falls the rest of the way is an ordinary slick or an ordinary bulb.
 * That is the creature's own sentence finishing — the shot after it is a shot
 * at a plain body, and the pair has to be able to *see* that it is, rather
 * than reading a fourth broken rib as one more thing still in the way.
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
 * **And it is lit, in the colour of the body it holds.** A cage that returns
 * a shot is the ship's own ward said again on the other side of the field, so
 * it is drawn the way the ward is (`shield.ts`): every rib and every arc goes
 * through `strokeGlow`, over an aura the width of the hoop. The light is the
 * body's own colour rather than a colour of its own — `turnedTrio` is the same
 * crossing `living-draw.ts` paints the body with, so the frame turns red to
 * cyan on the same frame the thing inside it does. That is the point of
 * mixing it in rather than lighting the cage white: what the pair has to read
 * through the frame is still the colour, and a frame in that colour is one
 * more thing saying it rather than one more thing over the top of it.
 *
 * **The dimmer it is, the more it burns.** The aura and the glow both rise
 * with `strain`, so a cage down to its last rib is visibly working — the same
 * count the ribs carry, said a second way for the seat that is reading light
 * across a phone screen rather than counting spokes.
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
/**
 * Ribs around the body: one per bounce the arrival carries, read off
 * `cfg.recoilBounces` rather than typed here, so the frame and the count of
 * shots it takes cannot be moved apart. An untouched cage is whole, the last
 * rib standing is the one about to fail, and the shot that fails it leaves no
 * cage at all. Three at the shipped number, which is about the ceiling for a
 * broken one staying countable at the size a phone draws.
 *
 * At least one, because a cage of nothing is not a cage — a config that asked
 * for no bounces would be a creature this file has no picture for, and a
 * division by zero is a worse answer than a single rib.
 */
export function strutsFor(cfg: SimConfig): number {
  return Math.max(1, cfg.recoilBounces);
}
/** How much the frame breathes, as a share of the hoop. Under a tenth: this is
 * tension, not a pulse, and the throb owns pulsing. */
const BREATHE = 0.06;
/** How far the metal is stained by the body's colour, 0 rock and 1 the body's
 * own rim. Past halfway, because a cage that only tinted would read as grey
 * lit from somewhere else — the frame is meant to be *of* the creature. */
const STAIN = 0.78;
/** And how far a spent rib's ember is, on the same scale. Lower: what is left
 * of a blown rib is the fire that went through it, not the body. */
const SCORCH = 0.3;
/** `strokeGlow` intensity on a whole frame, and what the last rib adds. The
 * ward's own two numbers are 0.35 and 1.6 (`WARD_LOOK`); a cage is a smaller
 * object seen further away and takes rather less. */
const GLOW_BASE = 1;
const GLOW_STRAIN = 1.1;
/** The aura's opacity on a whole frame, and what the last rib adds. Faint at
 * both: the centre of a halo sprite is its brightest part, and the body inside
 * has to stay the thing being read. */
const AURA_BASE = 0.2;
const AURA_STRAIN = 0.2;
/** How far the aura reaches past the hoop. */
const AURA_MUL = 1.35;
/** How far the light swings either side of itself, as a share of it, and how
 * fast. Two sines rather than one, the ward's own reason (`WARD_LOOK`): a
 * single period is one an eye predicts, and a frame it can predict stops
 * reading as something under tension. */
const SHIMMER = 0.24;
const SHIMMER_HZ_A = 1.5;
const SHIMMER_HZ_B = 0.7;

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
  turn = 1,
): void {
  // The body's own drawn radius, so the hoop is around what is actually there
  // rather than around a nominal tile — `creatureRadius` is the same rule the
  // grip's ring is drawn at, and a frame that disagreed with it would be a
  // frame a thumb grabs through.
  const left = recoilBouncesLeft(c);
  // Out of bounces: the frame is gone rather than wrecked. `recoil-cage-break`
  // has already thrown it off the tile the last shot landed in, and what is
  // left standing here is the body alone.
  if (left <= 0) return;
  const struts = strutsFor(cfg);
  const r = creatureRadius(l, c, 0, cfg) * HOOP_MUL;
  // Under tension and let go, on the wall clock: `sinHash` off the id spreads
  // the phase so two cages never breathe together, and the amount tightens as
  // the ribs go — a frame with one rib left is visibly working harder.
  const strain = 1 + (struts - left) / struts;
  const breath = 1 + BREATHE * strain * Math.sin(time * 4.2 + sinHash(c.id) * 6.3);
  const hoop = r * breath;

  // The body's own colour, mid-turn if it is mid-turn — one call, shared with
  // the draw of the body itself, so the two can never be a frame apart.
  const tint = turnedTrio(c.color, turn);
  const metal = hazed(cfg, mixHex(PALETTE.rock, tint.rim, STAIN), near);
  const dark = hazed(cfg, mixHex(PALETTE.rockDark, tint.dark, STAIN), near);
  const burnt = hazed(cfg, mixHex(PALETTE.ember, tint.hex, SCORCH), near);
  // Spread by the body's id along with the breath, so two cages in two lanes
  // are never one drawing done twice.
  const phase = sinHash(c.id) * 6.3;
  const shimmer =
    1 +
    SHIMMER * Math.sin(time * SHIMMER_HZ_A + phase) +
    SHIMMER * 0.6 * Math.sin(time * SHIMMER_HZ_B + phase + 1.7);
  const lit = (GLOW_BASE + GLOW_STRAIN * (strain - 1)) * shimmer;

  // The aura, under everything. Its colour is the one the body is *becoming*
  // rather than the mixture it is passing through: `haloSprite` caches one
  // canvas per colour and radius, and a mixture that moves every frame would
  // mint a fresh canvas every frame (`glow.ts`). The radius is quantised for
  // the same reason.
  const step = Math.max(2, hoop * 0.25);
  halo(
    ctx,
    x,
    y,
    Math.round((hoop * AURA_MUL) / step) * step,
    hazed(cfg, colorTrio(c.color).hex, near),
    (AURA_BASE + AURA_STRAIN * (strain - 1)) * shimmer,
  );

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < struts; i++) {
    // Rib `i` is spent once fewer than `i` bounces remain. Counted from the
    // top and going round, so the damage accumulates in one direction and the
    // pair can read "how far round has it got" rather than "how many are lit".
    const spent = i >= left;
    const a = (i / struts) * Math.PI * 2 - Math.PI / 2;
    const hex = spent ? burnt : metal;
    const glow = spent ? lit * 0.25 : lit;
    drawRib(ctx, x, y, a, creatureRadius(l, c, 0, cfg), hoop, spent, hex, time, glow);
    drawHoopArc(ctx, x, y, a, struts, hoop, spent, hex, dark, glow);
  }
  ctx.restore();
}
