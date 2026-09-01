import type { Creature, SimConfig, World } from "@neon-spore/sim";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { drawVeilBolts, veilScatter } from "./veil-bolt.js";
import { cloudPath, drawVeilWisps, VEIL_FLATTEN } from "./veil-shape.js";

/**
 * THE VEIL's cloud: the thunderhead a slick or a bulb falls inside.
 *
 * The body underneath is not drawn here. `wornKind` already answers "slick" or
 * "bulb" for a veil, so `creatures.ts` draws an ordinary living body with its
 * ordinary colour and its ordinary own-motion — and then this file lays the
 * weather over the top of it, exactly as `clasp.ts` lays a membrane and
 * `shell-draw.ts` lays plating.
 *
 * **The one thing that is not like those two: on player 2's screen the body is
 * never drawn at all.** `showsVeilCore` is that sentence, and `creatures.ts`
 * asks it before it draws anything. A cloud painted opaque over a body would
 * have been the tempting version and it leaks: a halo, a motion trail and a
 * glow pass all reach outside the contour they belong to, so the colour would
 * have shown as a rim of light around a shape nobody was meant to be able to
 * name. Not drawing it cannot leak.
 *
 * **The cloud is identical on both screens and that is the whole disguise.**
 * Same contour, same size, same lightning, same beat. Player 1's is
 * see-through and player 2's is not, and nothing else about it differs — so a
 * cloud is a cloud in either seat and the pair can talk about *which* one
 * without either of them having to describe the weather.
 *
 * **The lightning is on the beat.** It is not decoration: the pair is counting
 * beats to the morph, and a flash that lands on the count gives them a
 * metronome inside the thing they are counting about. Which way a bolt forks
 * is spread by the body's own id, so two clouds on one field are never one
 * picture drawn twice — deterministically, from an integer both devices have.
 *
 * **And it sinks.** The owner asked for a cloud that looks as though it is
 * floating downwards, which is not the same thing as one that falls: the
 * simulation already moves it a tile a beat. So the picture adds the part a
 * fall does not have — the weather riding a little below the body it carries
 * and settling back, and three wisps shed off its underside that go on sinking
 * after the cloud has left them. Something that sheds is something with a
 * direction, and the direction is down.
 *
 * Both are sampled on the shared beat, like every other pose in this game
 * (`content/own-motion.ts` says why at length), so two phones draw one cloud.
 */

/**
 * How far the cloud reaches past a body's own drawn radius.
 *
 * It has to cover a **bulb at the far end of its sway**, which is the widest
 * thing that can be inside one: `drawLiving` sizes every body to `tile * 0.4`
 * and `SWAY_PUMP` then carries it up to 0.17 of a tile sideways, so the
 * silhouette reaches 0.57 of a tile from where the simulation put it. At 1.9
 * the contour's *narrowest* lobe still stands at 0.63, which is the number
 * that matters — a cloud sized to its widest point has a body poking out of
 * the dips in it. Together with `FLATTEN` the whole thing is a little over one
 * and a half tiles across, which is the clasp's bubble, so the two read as the
 * same class of object wrapped round a body.
 */
export const VEIL_RADIUS_MUL = 1.9;

/**
 * A thundercloud is dark and it is still on a dark field, so its own colours
 * are slate-blue rather than the near-black they were on the first pass. The
 * background it stands against is `#08060F` at the hull and `#1D1547` at the
 * top of the grid, so anything below about `#1A` in the blue channel is a
 * silhouette nobody can find.
 */
const DARK = "#3B3668";
const DARKER = "#191534";
const EDGE = "#7E76C4";
/** The light the whole cloud throws on the beat, once. The bolt's own colours
 * are `veil-bolt.ts`'s — this is only what leaks out through the contour. */
const BOLT_GLOW = "#9FB6FF";
/** The same, once a wrong colour has shut the cloud. */
const ANGRY = "#3A0F22";
const ANGRY_EDGE = "#8A2340";

/**
 * Whether this screen can see into the cloud. Player 2 never can — that is the
 * whole creature — and `test` can, because it is both halves at once on one
 * screen and a rig that hid half the picture would be no rig.
 *
 * The mirror image of `showsLureAlarm`, deliberately and to the letter: that
 * one is `role !== "p1"`, this one is `role !== "p2"`, and the two creatures
 * are the same split pointed opposite ways.
 */
export function showsVeilCore(l: Layout): boolean {
  return l.role !== "p2";
}

/** Every veil on the field. Exported so the marks and the body pass ask the
 * same question once. */
export function veils(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "veil");
}

/**
 * The cloud over a body already drawn. `beats` is `world.beat + beatPhase`,
 * `armour` is `veilArmourPhase` — 1 for an open cloud, climbing from 0 while a
 * wrong colour holds it shut.
 */
export function drawVeilCloud(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beats: number,
  near: number,
  armour: number,
  seeThrough: boolean,
): void {
  const shut = 1 - armour;
  const r = l.tile * 0.4 * VEIL_RADIUS_MUL;
  const t = contourClock(c.id, time);
  const haze = (h: string): string => hazed(cfg, h, near);
  // The sink: the body of the cloud rides a little below where it is standing
  // and settles back, so the weather looks like it is falling through the
  // field a fraction slower than the thing inside it.
  const sink = Math.sin(beats * 1.1 + c.id * 0.7) * l.tile * 0.05 + l.tile * 0.03;

  ctx.save();
  ctx.translate(x, y + sink);

  const path = cloudPath(r, t);

  // The rim: the same shape a fraction larger, filled underneath rather than
  // stroked. `BILLOWS` says why — a stroke would draw the seams between the
  // four heaps and turn one cloud into four bubbles.
  ctx.globalAlpha = seeThrough ? 0.5 : 0.85;
  ctx.fillStyle = haze(shut > 0 ? mix(EDGE, ANGRY_EDGE, shut) : EDGE);
  ctx.save();
  ctx.scale(1.07, 1.09);
  ctx.fill(cloudPath(r, t), "nonzero");
  ctx.restore();

  // The body of it. A vertical gradient rather than a flat fill — a cloud is
  // lit from above and heavy underneath, and the dark underside is what makes
  // it read as weather instead of as a grey blob.
  const g = ctx.createLinearGradient(0, -r * 0.85, 0, r * VEIL_FLATTEN);
  g.addColorStop(0, haze(shut > 0 ? mix(DARK, ANGRY, shut) : DARK));
  g.addColorStop(1, haze(shut > 0 ? mix(DARKER, ANGRY, shut * 0.8) : DARKER));
  // See-through on player 1's screen and nowhere else. Well short of half, so
  // the colour underneath is unambiguous — the pilot has to be able to say
  // "cyan" without leaning in — and well short of nothing, so the cloud is
  // still plainly the thing they are looking at.
  ctx.globalAlpha = seeThrough ? 0.66 : 1;
  ctx.fillStyle = g;
  ctx.fill(path, "nonzero");
  ctx.globalAlpha = 1;

  drawVeilBolts(ctx, path, r, beats, c.id, shut, seeThrough);
  ctx.restore();

  drawVeilWisps(ctx, l, x, y + sink, r, beats, c.id, haze(shut > 0 ? ANGRY_EDGE : EDGE));

  // Outside the contour, so it is not clipped with the bolts: the whole cloud
  // glowing for an instant on the beat, which is what a thunderhead does and
  // what makes the count readable from across a room.
  const flash = Math.max(0, 1 - (beats % 1) * 3.2);
  if (flash > 0.02) {
    halo(ctx, x, y + sink, r * 1.7, shut > 0 ? ANGRY_EDGE : BOLT_GLOW, 0.14 * flash);
  }
}

/**
 * Two hex colours mixed, as a hex colour. Small and local: the palette has no
 * angry cloud in it, because the anger is a two-second state rather than a
 * colour the game spends anywhere else.
 *
 * **It has to come back as `#rrggbb` and not as `rgb(...)`.** The result goes
 * straight into `hazed`, which reads a hex string apart by hand — and
 * `frame.test.ts` exists because exactly this once went out in the other
 * notation and the first frame threw.
 */
function mix(a: string, b: string, k: number): string {
  const pa = Number.parseInt(a.slice(1), 16);
  const pb = Number.parseInt(b.slice(1), 16);
  const ch = (shift: number): number => {
    const va = (pa >> shift) & 255;
    const vb = (pb >> shift) & 255;
    return Math.round(va + (vb - va) * Math.max(0, Math.min(1, k)));
  };
  const hex = (ch(16) << 16) | (ch(8) << 8) | ch(0);
  return `#${hex.toString(16).padStart(6, "0")}`;
}
