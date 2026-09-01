import { blobPath } from "@neon-spore/content";
import type { Creature, SimConfig, World } from "@neon-spore/sim";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { drawVeilBolts, veilScatter } from "./veil-bolt.js";

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

/** The cloud, as a contour. Many shallow lobes: a thunderhead is a stack of
 * billows rather than a blob with a waist, and the wobble is high because
 * nothing about weather is still. */
const CLOUD = { lobes: 7, depth: 0.17, wobble: 0.075, seed: 4.6 } as const;

/** How much wider than tall. A cloud spreads — and not further than this, or
 * a bulb's own height starts leaving the weather at the top and the bottom. */
const FLATTEN = 0.8;

const DARK = "#171331";
const DARKER = "#0C0A1D";
const EDGE = "#4A4185";
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

  const path = new Path2D(
    blobPath(0, 0, r, r * FLATTEN, CLOUD.lobes, CLOUD.depth, CLOUD.wobble, t, CLOUD.seed, 28),
  );

  // The body of it. A vertical gradient rather than a flat fill — a cloud is
  // lit from above and heavy underneath, and the dark underside is what makes
  // it read as weather instead of as a grey blob.
  const g = ctx.createLinearGradient(0, -r * FLATTEN, 0, r * FLATTEN);
  g.addColorStop(0, haze(shut > 0 ? mix(DARK, ANGRY, shut) : DARK));
  g.addColorStop(1, haze(shut > 0 ? mix(DARKER, ANGRY, shut * 0.8) : DARKER));
  // See-through on player 1's screen and nowhere else. Well short of half, so
  // the colour underneath is unambiguous — the pilot has to be able to say
  // "cyan" without leaning in — and well short of nothing, so the cloud is
  // still plainly the thing they are looking at.
  ctx.globalAlpha = seeThrough ? 0.62 : 1;
  ctx.fillStyle = g;
  ctx.fill(path);

  ctx.globalAlpha = 1;
  ctx.strokeStyle = haze(shut > 0 ? mix(EDGE, ANGRY_EDGE, shut) : EDGE);
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.stroke(path);

  drawVeilBolts(ctx, path, r, beats, c.id, shut, seeThrough);
  ctx.restore();

  drawWisps(ctx, l, x, y + sink, r, beats, c.id, haze(shut > 0 ? ANGRY_EDGE : EDGE));

  // Outside the contour, so it is not clipped with the bolts: the whole cloud
  // glowing for an instant on the beat, which is what a thunderhead does and
  // what makes the count readable from across a room.
  const flash = Math.max(0, 1 - (beats % 1) * 3.2);
  if (flash > 0.02) {
    halo(ctx, x, y + sink, r * 1.7, shut > 0 ? ANGRY_EDGE : BOLT_GLOW, 0.14 * flash);
  }
}

/**
 * What the cloud sheds. Three soft blobs off the underside, each on its own
 * third of a slow cycle: they appear at the bottom edge, sink a third of a
 * tile and fade out, so the eye is given something that is plainly falling
 * *away* from the body rather than with it.
 *
 * Under the cloud's own contour and outside the clip, which is the whole
 * point — a wisp still inside the weather is not one that has come off it.
 */
function drawWisps(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  beats: number,
  id: number,
  hex: string,
): void {
  ctx.save();
  ctx.fillStyle = hex;
  for (let k = 0; k < 3; k++) {
    // Each wisp is a third of a cycle behind the last, and a cycle is two
    // beats — slow enough to read as drifting rather than as a stream.
    const phase = (((beats / 2 + k / 3 + veilScatter(id, k) * 0.3) % 1) + 1) % 1;
    const a = Math.sin(phase * Math.PI) * 0.3;
    if (a <= 0.01) continue;
    const wx = x + (veilScatter(id + k * 5, k) * 2 - 1) * r * 0.5;
    const wy = y + r * 0.55 + phase * l.tile * 0.34;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.ellipse(wx, wy, r * 0.22 * (1 - phase * 0.4), r * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
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
