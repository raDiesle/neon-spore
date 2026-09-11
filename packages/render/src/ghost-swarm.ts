import { facet, GHOST, LAT_LIMIT, pin, surfaceDim } from "@neon-spore/content";
import { GHOST_SPIN } from "./ghost-latitude.js";
import type { InteriorDraw } from "./ghost-look.js";
import { halo } from "./glow.js";

/**
 * SWARM — the nebula is not a gradient but a *population*: motes of the
 * body's own light streaming round the inside of the dome.
 *
 * The shipped interior is one soft gradient, and softness is why it reads as
 * a nebula. What a gradient cannot do is move: the same picture from every
 * side, on every frame. This trades the softness for a crowd. Fourteen motes,
 * each pinned to a longitude and a latitude on a ball inside the contour and
 * carried round by the same slow turn the camouflage turns on (`GHOST_SPIN`)
 * — faster than the bands by a named factor, because a swarm is not a skin
 * and a crowd that turned exactly as slowly as the surface it lives in would
 * read as painted on it.
 *
 * Each mote is what `.claude/skills/depth` says a placed mark is: a disc
 * facing us, a sliver at the limb, brightest square to `KEY` and dimmed by
 * `surfaceDim` toward the terminator. On the far half it is still drawn,
 * small and faint — a mote seen through the body — so over one turn every
 * mote goes round the back and comes out the other side, and the eye reads
 * that as *inside* rather than *on*. Each also drifts up and down its own
 * meridian on its own clock, so the swarm never settles into a ring, which
 * is the alien half of the brief: a nebula is still, a swarm is alive.
 *
 * A thin dark ground under all of it, so the outline still has a body to sit
 * on when the motes are mostly behind. Fourteen halos and fourteen trailing
 * halos a frame — twenty-eight sprite blits, each from `halo`'s cache, on a
 * body that is one or two to a wave.
 *
 * **How it can lose.** *A ghost with measles.* At 26 px a mote is a pixel and
 * fourteen of them may read as grain rather than as a cloud, and the bands
 * already put seven marks on this body. Judge it small before large.
 */

/** How many motes, and how fast they go round against the bands. */
const MOTES = 14;
const STREAM = 2.6;

/** The ball the motes live on, as a share of the contour, so the outermost
 * stays inside the outline at the limb. */
const REACH = 0.72;

/** What a mote keeps of its light facing away from the key, and what it
 * keeps when it is behind the body — faint, but never gone. */
const DIM = 0.55;
const BEHIND = 0.16;

/** How far up and down its meridian a mote drifts, and how fast. */
const DRIFT = 0.28;
const DRIFT_RATE = 0.19;

/** How far behind a mote its trail is, in radians of the turn. */
const TRAIL = 0.22;

/** Mote radii in body units, rounded once for `halo`'s cache: the mote and
 * the trail it leaves. */
const MOTE = Math.round(GHOST.rx * 0.34);
const WAKE = Math.round(GHOST.rx * 0.26);

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Each mote's home longitude and its resting latitude, spread by the golden
 * angle so no two share a meridian and the swarm never combs into rows. */
const HOMES = Array.from({ length: MOTES }, (_, i) => ({
  lon: i * GOLDEN,
  lat: Math.sin(i * 1.7) * LAT_LIMIT * 0.6,
}));

export function swarm(d: InteriorDraw): void {
  const { ctx, body, id, time, hex, dark, rim, back } = d;

  // The ground: the field's dark up to the body's own, so the outline has
  // something to stand on and the motes have something to be inside.
  const ground = ctx.createRadialGradient(0, 0, 0, 0, 0, GHOST.ry);
  ground.addColorStop(0, dark);
  ground.addColorStop(1, back);
  ctx.fillStyle = ground;
  ctx.fill(body);

  ctx.save();
  ctx.clip(body);
  const theta = time * GHOST_SPIN * STREAM * Math.PI * 2;
  for (let i = 0; i < HOMES.length; i++) {
    const home = HOMES[i];
    if (!home) continue;
    // The pin is rebuilt each frame because the latitude drifts; fourteen
    // pins a frame is nothing, and a drifting mark is what keeps this a swarm.
    const lat = home.lat + Math.sin(time * DRIFT_RATE * Math.PI * 2 + i * 2.3 + id) * DRIFT;
    const p = pin(home.lon, Math.max(-LAT_LIMIT, Math.min(LAT_LIMIT, lat)), REACH);
    // The wake first and under, a little behind on the turn.
    for (const [lag, radius, colour, gain] of [
      [TRAIL, WAKE, hex, 0.75],
      [0, MOTE, rim, 1],
    ] as const) {
      const f = facet(p, theta - lag);
      const strength = f.near ? surfaceDim(DIM, f.lit) : BEHIND;
      ctx.save();
      ctx.translate(f.x * GHOST.rx, f.y * GHOST.ry);
      ctx.scale(Math.max(0.1, Math.abs(f.sx)), f.sy);
      halo(ctx, 0, 0, radius, colour, gain * strength);
      ctx.restore();
    }
  }
  ctx.restore();
}
