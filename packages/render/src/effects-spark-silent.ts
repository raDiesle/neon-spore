import type { SimEvent } from "@neon-spore/sim";

/**
 * **The events that are deliberately not a burst**, and why each one is not.
 *
 * `effects-spark.ts` is the other half: the table of events whose whole
 * visible answer is a handful of particles. This is the long tail it used to
 * carry underneath that table — a run of `case` labels falling through to one
 * `return null`, with a paragraph over each explaining what draws the thing
 * instead. Adding THE CHUTE's cut, one case and one clause, pushed the file
 * over its 250-line limit, and the only way to land it was to reword two
 * comments belonging to other creatures until five lines came back. That is a
 * cost every future event would have paid, and it is paid by editing prose
 * nobody meant to touch.
 *
 * **The property that had to survive the split is the compile error.**
 * `burstFor` is exhaustive on purpose: `runtHit` once fell through a
 * `default: return null`, and the day it stopped reusing `destroy` the burst
 * it drew silently stopped existing, with the type checker satisfied. So
 * `isSilent` is a type *guard* rather than a lookup — an event that passes it
 * is removed from the union `burstFor` then switches over, which leaves that
 * switch's `assertNever` catching exactly what it caught before: an event in
 * neither list. Add a case to `SimEvent` and account for it in neither place,
 * and `effects-spark.ts` stops type-checking.
 *
 * `satisfies` rather than a bare annotation, so the array keeps its literal
 * member types (the guard needs them) while a name that is not a `SimEvent`
 * type is still refused here rather than silently never matching.
 */
export const SILENT = [
  // THE PUSH's lane change. The body is drawn gliding into its new column by
  // `fromCol` the way any stepped body is, so the picture already carries the
  // move; the *cue* is the new thing and it is in `packages/audio`. Whether a
  // carry should also throw something is a look and the owner's to choose
  // (`docs/looks.md`), so nothing is invented here.
  "carry",
  // THE CHOIR's first arrow going out, and the gesture landing. The whole
  // screen is shaking on both (`choir-quake.ts`), and particles thrown on top
  // of an earthquake are particles nobody can see. What does throw one is
  // `choirOpen`, a beat later, when the colour arrives.
  "choirArm",
  "choirMerge",
  // A balloon popped. The `destroy` beside it on the same tick is what throws
  // the particles (`rubBalloon`) — the pair earned an ordinary kill's burst
  // and get one — so a second here would draw the same moment twice. Its two
  // siblings are not silent: a split and a burst are pictures nothing else
  // draws.
  "balloonPop",
  // A cloud coming apart and the body inside it showing: `veil-tear.ts` draws
  // the whole of it, and the ordinary `destroy` that rides beside it on the
  // same tick is what throws the particles.
  "veilTorn",
  // The body inside a cloud turning over. Nothing left the field and nothing
  // arrived — the cloud goes on falling and its lightning goes on striking. A
  // burst here would say something broke.
  "veilMorph",
  // A ghost letting go, on the same terms as a torn cloud: `ghost-release.ts`
  // draws the escape and the ordinary `destroy` beside it on the same tick is
  // what throws the particles.
  "ghostRelease",
  // And its other two. A burst at a wall would be the one thing this creature
  // must never produce: player 1 is not told which column it is in, and a
  // shower of sparks at the left edge of their own screen is that column, said
  // in light. The anger is drawn on the body instead, where only player 2 can
  // see it.
  "ghostTurn",
  "ghostCharge",
  // The hatch blowing, the canopy opening, and the canopy cut off the body it
  // carried. None is a burst: each is a body *travelling*, drawn as one every
  // frame after this (`chute.ts`, `chute-cut.ts`) rather than as particles
  // thrown once — and the crack or the destroy beside it on the same tick has
  // already thrown for that tile.
  "caromEject",
  "chuteOpen",
  "chuteCut",
  // A magnet coming apart. The `destroy` on the same tick is already throwing
  // the pole's colour off the tile; this one is the arch and the plate going,
  // and `magnet-break.ts` draws all of it.
  "magnetBreak",
  // THE STRAND's thread parting. Not a burst on the beat it parts: the line is
  // lit at both ends and burns inward (`strand-fuse.ts`), and the big moment
  // is a second later where the two fronts meet — a burst here would be the
  // end of it before it had started.
  "strandBroke",
  // THE COIL's charge crossing the field to the next dome. Nothing has broken
  // yet — that is the whole of what it means — and a shower of sparks along
  // the way would say something had. It is drawn as the bolt it is, on the one
  // screen that gets it (`coil-jump.ts`), and the burst comes when it lands.
  "coilJump",
  // A carom turning at a wall, and it is `ghostTurn`'s reason inverted:
  // nothing broke. The body bounced off the edge of the field intact, and a
  // shower of sparks there would read as damage to something the pair can
  // still do nothing about. The turn is drawn on the body — the streak swings
  // the other way next frame (`carom.ts`) — and heard, not seen.
  "caromBounce",
  // THE CRYSTAL at a wall, for the carom's reason; and a wrong shot driving
  // it down, because the `reject` on the same tick has already thrown the
  // bolt's spark and the dive is the whole body moving — drawn by the glide,
  // not by material leaving it.
  "crystalBounce",
  "crystalCatch",
  // THE GUM spreading is the smear itself getting wider, drawn off the world;
  // material leaving it would say it was coming apart, and it is not.
  "gumSpread",
  // A lure going is drawn *inward*, by `lure-vanish.ts`, and particles are the
  // whole of what it must not have: every burst in the other file throws
  // material away from a body, which is the picture of something being broken.
  // Nothing broke — it left.
  "lureVanished",
  "lureSeen", // Player 2's ear and player 2's strip; nothing on the field.
  "beat", // The click track and the HUD dots; no tile, nothing to burst.
  "waveStart", // The banner, not a burst — `banner.ts`, driven by the host.
  "needWave", // Bookkeeping between the host and the sim; nothing on the field.
  "waveFailed", // The breach that failed it has its own burst; the field then holds.
  "fire", // The bolt leaving is drawn as a bolt, over the beats it travels.
  "lanceFull", // The lobe's own fill reads the mark; nothing else to add.
  "lanceSpilled", // Likewise — the fill emptying is the whole picture.
  "deflect", // `effects.ts` builds its own bursts once the rock arrives.
  "podTaken", // `effects.ts` throws sparks inward directly — see `swallow.ts`.
  "breach", // `effects.ts` waits for a falling rock before it bursts anything.
  "tether", // The rim's own colour is read off the world every frame.
  "eyeOpen", // The hatch's openness is the rope's tension, not an event.
  "mirrorShow", // THE MIRROR's ghost shot — `simon-fx.ts` owns the whole sequence.
  "mirrorEcho",
  "mirrorVerdict",
  "mirrorDown",
  // THE MAZE, all four of them: the shot going down the tangle is the whole
  // picture and it is not a spark on the field. Silent until the lane that
  // draws the lattice says otherwise.
  "mazeCommit",
  "mazeProbe",
  "mazeVerdict",
  "mazeDown",
  // And the one event in the union that carries no position at all, so a spark
  // could not be put anywhere even if this creature wanted one.
  "wispHop",
  // THE CRAWLER's two endings, and neither throws anything from here. The beam
  // is a column of light the ship opens and the worm climbs, and the burrow is
  // a mound thrown up on both sides of a hole — two pictures with shapes of
  // their own (`crawler-fx.ts`), not a spray of dots. The `breach` events the
  // burrow causes throw the ordinary hull burst beside it.
  "crawlerBeam",
  "crawlerBurrow",
  // THE FLEET's five, and none of them throws anything from here. A salvo is
  // not resolved where it is pressed: the shell arcs out of the cannon and
  // takes `FLEET_SHELL_BEATS` to reach the square, so a burst thrown on the
  // tick of the event would land a second and a quarter before anything got
  // there. `FleetFx` holds the flight and throws the same three sizes — 6
  // cyan, 14 red, 26 ember — on the frame the shell arrives (`fleet-fx.ts`).
  // The last of them never threw one: the sinking that rides beside it on the
  // same tick is the picture, and `fleetSunk` has already thrown for it.
  "fleetSalvo",
  "fleetSplash",
  "fleetHit",
  "fleetSunk",
  "fleetDown",
] as const satisfies readonly SimEvent["type"][];

/** One of the above, as a type — what the guard narrows the union by. */
export type SilentEvent = Extract<SimEvent, { type: (typeof SILENT)[number] }>;

/**
 * Whether this event is answered somewhere other than a burst.
 *
 * A guard rather than a boolean, so that the caller's switch is left with the
 * bursting events alone and its `assertNever` still means what it meant.
 */
export function isSilent(e: SimEvent): e is SilentEvent {
  return (SILENT as readonly string[]).includes(e.type);
}
