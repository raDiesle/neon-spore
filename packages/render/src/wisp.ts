import { type Creature, type SimConfig, type World, wispHops } from "@neon-spore/sim";
import { hazed } from "./depth.js";
import type { Layout } from "./layout.js";
import { drawWispBody } from "./wisp-body.js";

/**
 * THE WISP: a body on one screen and not on the other, going over the field in
 * one arc and landing on a tile nothing about the last one predicted.
 *
 * **On player 1's screen nothing is drawn at all.** `showsWisp` is that
 * sentence and `creatures.ts` asks it before it draws anything, exactly as it
 * does for the body inside a veil. The tempting version — a dimmed shape, a
 * ghost, a smear where it is — leaks: a halo, a glow pass and a landing ring
 * all reach outside the contour they belong to, so the tile would show as a
 * patch of light on the one screen that must not be able to name it. Drawing
 * nothing cannot leak. Everything in `wisp-ground.ts` is behind the same gate
 * for the same reason, the arc and the landing marker most of all.
 *
 * There is no companion picture on that screen either, and that is the one way
 * this creature is unlike every split before it. A veil gives player 2 a
 * question mark *over the cloud*, a dart gives player 1 arrows *over the
 * body* — both can, because both bodies are visible to both seats and only
 * something about them is hidden. Here the body itself is the secret, so a
 * mark would have to stand on the tile it is marking. What player 1 gets
 * instead is the lettered grid (`coord-grid.ts`), the siren in the corner
 * (`siren.ts`) and the pip on every hop (`wispHop`) — a place to put a word,
 * a light saying somebody has one, and a sound saying the last one is spent.
 *
 * **It jumps, and the jump is a whole beat long.** It used to blink: a squash,
 * a stretch into a line, nothing, and the same run backwards into the new
 * tile, with two thirds of a beat unaccounted for in between. Player 2 saw a
 * body go out and a body come in and had to *infer* that they were the same
 * body, which is the one thing a picture is for. Now it gathers, launches,
 * crosses the field along an arc and comes down where it is going — the going
 * and the coming are one continuous movement, because they are one movement.
 *
 * The three phases sit against the beat like this, and `wispJump` is the whole
 * of it:
 *
 * - the **crouch**, the tail of the beat before the hop: it gathers and the
 *   tentacles pull in.
 * - the **flight**, the whole of the hop beat: the simulation has already put
 *   it on the destination tile (`sim/wisp.ts`), so the arc render draws is the
 *   truth about where it will be and not a guess. It is off the ground for
 *   every frame of that beat and lands exactly on the last one.
 * - the **landing**, the head of the beat after: it flattens, the shock goes
 *   out across the tile, and it comes back up to standing.
 *
 * That leaves `wispDwellBeats - 1` whole beats of a body standing plainly on
 * its tile, which is the part player 2 reads a letter and a number off. It is
 * also why the dwell had to grow: at two beats the jump *was* the dwell.
 *
 * Every end is read off the shared beat through `wispHops`, so two devices
 * draw one jump, and neither stores a phase.
 */

/**
 * Whether this screen can see a wisp at all. Player 1 never can — that is the
 * whole creature — and `test` can, because it is both halves at once on one
 * screen and a rig that hid half the picture would be no rig.
 *
 * The mirror image of `showsVeilCore`, deliberately and to the letter: that
 * one is `role !== "p2"`, this one is `role !== "p1"`, and the two creatures
 * hide opposite things from opposite seats.
 */
export function showsWisp(l: Layout): boolean {
  return l.role !== "p1";
}

/** Every wisp on the field. Exported so the ground pass and the body pass ask
 * the same question once. */
export function wisps(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "wisp");
}

/**
 * The share of the beat *before* a hop spent gathering, and the share of the
 * beat *after* one spent absorbing it.
 *
 * Both under a third, and they are not the same number: a jump is anticipated
 * faster than it is absorbed. The gather is a body deciding to go and wants to
 * read as a snap; the landing is a mass arriving and wants to read as
 * something that took the hit. Anything longer on either end and the two would
 * meet across the standing beats the pair has to read the tile off.
 */
const CROUCH = 0.26;
const LAND = 0.34;

/**
 * How high the arc goes, in tiles. Not a tunable in `SimConfig`, because
 * nothing in the simulation can see it: the body is on its landing tile for
 * the whole beat whatever this number is (`sim/wisp.ts`), so it changes the
 * picture and nothing else.
 */
export const JUMP_TILES = 2.2;

/** Where a wisp is in its jump this frame. One value per question the picture
 * asks, all four derived from the shared beat and none of them stored. */
export interface WispJump {
  /** Off the ground this frame: the whole of a hop beat, and nothing else. */
  flying: boolean;
  /** How far through the flight, 0 leaving the old tile, 1 landing on the new
   * one. Zero when it is not in the air, which is most of a dwell. */
  flight: number;
  /** Height above the ground in tiles — 0 standing, `JUMP_TILES` at the apex. */
  lift: number;
  /** The same height as a share of the apex, 0 on the ground and 1 at the top.
   * Carried beside `lift` rather than divided out at each of the four sites
   * that want it: the lean, the halo, the streamers' spread and the shadow are
   * one reading of how high it is, and a second copy of `JUMP_TILES` is how
   * they come to disagree about it. */
  arc: number;
  /** The gather before it goes: 0 standing, 1 at the instant of the launch. */
  crouch: number;
  /** The squash after it arrives: 1 on impact, 0 back at standing. */
  land: number;
}

/** A wisp standing still on its tile — the shape of most of a dwell, and what
 * a rig with no beat of its own draws. */
const STILL: WispJump = { flying: false, flight: 0, lift: 0, arc: 0, crouch: 0, land: 0 };

/**
 * The jump, read straight off the beat.
 *
 * The flight is the *whole* of a hop beat rather than a window inside one, and
 * that is what makes the arc a picture of the simulation rather than a flourish
 * over it: the body leaves the tile on the frame `stepWisp` moves it and
 * touches down on the last frame before the next beat, so there is no instant
 * where the thing player 2 is looking at is somewhere the world does not say
 * it is.
 *
 * A body in the air is neither crouching nor landing, and the guard is not
 * decoration: at `wispDwellBeats` of 1 every beat is a hop beat and all three
 * windows would otherwise be open at once, which is a body gathering itself in
 * mid-air.
 */
export function wispJump(cfg: SimConfig, beat: number, beatPhase: number): WispJump {
  if (wispHops(cfg, beat)) {
    const arc = Math.sin(Math.PI * beatPhase);
    return { flying: true, flight: beatPhase, lift: arc * JUMP_TILES, arc, crouch: 0, land: 0 };
  }
  // The beat after a hop: it came down at the top of this one.
  const land = wispHops(cfg, beat - 1) && beatPhase < LAND ? 1 - beatPhase / LAND : 0;
  // The beat before the next one: it goes at the top of the next.
  const crouch =
    wispHops(cfg, beat + 1) && beatPhase > 1 - CROUCH ? (beatPhase - (1 - CROUCH)) / CROUCH : 0;
  return { ...STILL, crouch, land };
}

/**
 * The body, at the height its jump has it.
 *
 * `x`/`y` are the ground position `creatureCenter` gives every body — for a
 * wisp mid-hop that is the linear glide from the old tile to the new one, and
 * the arc is what this adds to it. Up and not down: `lift` is subtracted,
 * because screen y grows toward the hull.
 */
export function drawWisp(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beats: number,
  near: number,
  j: WispJump,
): void {
  const haze = (h: string): string => hazed(cfg, h, near);
  drawWispBody(ctx, l, c, x, y - j.lift * l.tile, time, beats, j, haze);
}
