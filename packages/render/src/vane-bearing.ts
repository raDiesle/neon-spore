import { circleSubpath } from "@neon-spore/content";
import { type VaneState, vaneSplitCol, type World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { litColour } from "./key-light.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE VANE's bearing: the mount it hangs from, the hub it turns on and the
 * bolt circle the pair is spending.
 *
 * **A mechanism, which is the one thing this boss is** (`vane-draw.ts`): it
 * encloses an area, unlike the arm, because a housing is a made object and the
 * arm is the part that moves. Everything here is cut from one metal (`STEEL`)
 * and lit by one ramp down the beam (`steelRamp`), so the mount, the hub and
 * the spar next door cannot end up disagreeing about where the light is —
 * `key-light.ts`'s argument, applied to the only machine in the game that is
 * not part of the ship.
 *
 * **The pins are sockets and not notches**, which is what the fight is about.
 * Five wells in a bolt circle, each with a pin standing in it or nothing at
 * all: a pin gone is a hole through the flange, in the same place on both
 * screens and across a restart, because the place follows from the index. The
 * arm reaches a phase further out for every one spent, so the silhouette says
 * how far in the pair are by getting longer — and the flange says the same
 * thing standing still, which is what a seat glancing up needs.
 */

/** The metal the whole mechanism is cut from — rock, lifted off its own dark. */
export const STEEL = mixHex(PALETTE.rockDark, PALETTE.rock, 0.42);

/**
 * A span of that metal, lit down the beam.
 *
 * One ramp top to bottom rather than one along the key's own diagonal, for the
 * reason `fleet-hull-body.ts` gives: `KEY` is equal parts up and left, so the
 * vertical half of it is the half a part reads by, and a part that turns keeps
 * its lit edge where the light is instead of carrying it round.
 */
export function steelRamp(
  ctx: CanvasRenderingContext2D,
  top: number,
  bottom: number,
  base: string = STEEL,
): CanvasGradient {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, litColour(base, 0.12));
  g.addColorStop(0.44, litColour(base, 0.5));
  g.addColorStop(1, litColour(base, 0.94));
  return g;
}

/** Where the bolt circle stands, as a multiple of the hub's own radius. */
const FLANGE = 1.16;

/**
 * The bearing, drawn from the pivot out: the mount across three columns, the
 * flange with the pins in it, the hub, and the split when there is one.
 */
export function drawBearing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: VaneState,
  px: number,
  py: number,
  hub: number,
  open: boolean,
  hex: string,
  rim: string,
  /** How red the blow of a knocked-out pin still shows on the hub (`boss-blows.ts`). */
  hurt = 0,
): void {
  mount(ctx, l, px, py);
  flange(ctx, world, b, px, py, hub);
  boss(ctx, px, py, hub, hurt);
  split(ctx, l, world, b, px, py, open, hex, rim);
}

/** The bar the bearing is bolted to, with a head at each end. */
function mount(ctx: CanvasRenderingContext2D, l: Layout, px: number, py: number): void {
  const half = l.tile * 1.15;
  const top = py - l.tile * 0.26;
  const deep = l.tile * 0.46;
  const bar = new Path2D();
  bar.roundRect(px - half, top, half * 2, deep, l.tile * 0.13);
  ctx.fillStyle = steelRamp(ctx, top, top + deep);
  ctx.fill(bar);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.45);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(bar);

  // The two heads it is hung by, and the shadow line under its lip: one path
  // for both ends, because there are five of these on every frame of the fight
  // and each one drawn for itself would be a pass of its own
  // (`eye-iris.ts`, *one path and one stroke, not nine*).
  const head = l.tile * 0.09;
  const heads = new Path2D();
  for (const s of [-1, 1]) {
    heads.addPath(new Path2D(circleSubpath(px + s * (half - head * 1.7), py, head)));
  }
  ctx.fillStyle = litColour(STEEL, 0.28);
  ctx.fill(heads);
  ctx.strokeStyle = rgba(PALETTE.rockDark, 0.9);
  ctx.stroke(heads);
}

/**
 * The bolt circle: a band round the hub, five wells in it, and a pin standing
 * in each one the pair has not taken yet.
 *
 * Two paths and three passes for all five, not five drawings of a pin: the
 * wells are one path filled dark and rimmed, and whatever is still standing in
 * them is one path over the top.
 */
function flange(
  ctx: CanvasRenderingContext2D,
  world: World,
  b: VaneState,
  px: number,
  py: number,
  hub: number,
): void {
  const total = Math.max(1, world.cfg.vanePins);
  const ring = hub * FLANGE;
  const well = hub * 0.26;

  const band = new Path2D(circleSubpath(px, py, ring));
  ctx.strokeStyle = litColour(STEEL, 0.62);
  ctx.lineWidth = well * 2.5;
  ctx.stroke(band);

  const wells = new Path2D();
  const pins = new Path2D();
  for (let k = 0; k < total; k++) {
    // The same angle every time this wave is played: the place is the index,
    // so a socket cannot wander between the two screens or across a restart.
    const a = (k / total) * Math.PI * 2 - Math.PI / 2;
    const x = px + Math.cos(a) * ring;
    const y = py + Math.sin(a) * ring;
    wells.addPath(new Path2D(circleSubpath(x, y, well)));
    if (k < b.pins) pins.addPath(new Path2D(circleSubpath(x, y, well * 0.66)));
  }
  ctx.fillStyle = rgba("#05040B", 0.85);
  ctx.fill(wells);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.4);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(wells);
  ctx.fillStyle = litColour(PALETTE.rock, 0.3);
  ctx.fill(pins);
}

/** The hub itself: the disc, the nut on its face and the keyway across it. */
function boss(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  hub: number,
  hurt: number,
): void {
  const disc = new Path2D(circleSubpath(px, py, hub));
  ctx.fillStyle = steelRamp(ctx, py - hub, py + hub);
  ctx.fill(disc);
  strokeGlow(ctx, disc, PALETTE.rock, STROKE.outline, 0.55);

  const nut = new Path2D(circleSubpath(px, py, hub * 0.44));
  ctx.fillStyle = litColour(STEEL, 0.3);
  ctx.fill(nut);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.55);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(nut);

  const key = new Path2D();
  const k = hub * 0.3;
  key.moveTo(px - k, py);
  key.lineTo(px + k, py);
  key.moveTo(px, py - k);
  key.lineTo(px, py + k);
  ctx.strokeStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.stroke(key);
  drawHurt(ctx, disc, hurt);
}

/**
 * The split, drawn where the shot has to go rather than where the load is: a
 * mouth at the top of the weak column, in the colour it will take.
 *
 * `vaneSplitCol` and not `vaneWeakCol`: from VEER the housing splits under the
 * pilot's thumb rather than at the ends of the sweep, and the cycle's own
 * answer is -1 there — which would leave the split undrawn for two thirds of
 * the fight (`sim/vane-open.ts`, `docs/spec/bosses.md` §11.5).
 */
function split(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: VaneState,
  px: number,
  py: number,
  open: boolean,
  hex: string,
  rim: string,
): void {
  const weak = vaneSplitCol(world, b);
  if (weak === -1) return;
  const wx = tileCX(l, weak);
  const mouth = new Path2D(circleSubpath(wx, py, l.tile * (open ? 0.2 : 0.12)));
  strokeGlow(ctx, mouth, open ? rim : hex, STROKE.outline, open ? 1.1 : 0.5);
  if (!open) return;
  const seam = new Path2D();
  seam.moveTo(px, py);
  seam.lineTo(wx, py);
  strokeGlow(ctx, seam, hex, STROKE.inner, 0.8);
}
