import type { SimEvent } from "@neon-spore/sim";
import { INGEST_SILENT_BOSS } from "./effects-ingest-silent-boss.js";
import { INGEST_SILENT_BOSS_B } from "./effects-ingest-silent-boss-b.js";
import { INGEST_SILENT_BOSS_C } from "./effects-ingest-silent-boss-c.js";

/**
 * **The events that leave nothing behind in `Effects`**, and why each one does
 * not.
 *
 * `effects-ingest.ts` is the other half: the events whose answer is a
 * transient the renderer has to carry from one frame to the next. This is the
 * long tail it used to carry underneath that switch — a run of `case` labels
 * falling through to one `break`, with a paragraph over each explaining what
 * draws the thing instead. Two more arrived on one day, and
 * the file was already exactly at its 250-line limit, so the only way to land
 * them there would have been to reword comments belonging to other creatures
 * until four lines came back. `effects-spark-silent.ts` was cut off its own
 * neighbour for that reason and this is the same cut, one file along.
 *
 * **The property that had to survive the split is the compile error.**
 * `ingestOne` is exhaustive on purpose, so `isIngestSilent` is a type *guard*
 * rather than a lookup: an event that passes it is removed from the union that
 * switch then walks, which leaves its `assertNever` catching exactly what it
 * caught before — an event accounted for in neither place.
 *
 * `satisfies` rather than a bare annotation, so the array keeps its literal
 * member types (the guard needs them) while a name that is not a `SimEvent`
 * type is refused here rather than silently never matching.
 */
export const INGEST_SILENT = [
  // The bosses' rows, next door and spread in place: this file stood at its
  // 250-line ceiling and grows by one row per event
  // (`effects-ingest-silent-boss.ts`).
  ...INGEST_SILENT_BOSS,
  ...INGEST_SILENT_BOSS_B,
  ...INGEST_SILENT_BOSS_C,
  // THE BEATBOX's tap, and only its tap. The green rings a counted beat throws
  // are world state, redrawn from the creature every frame off the tick the
  // simulation stamped on it (`beatbox-air.ts`), so nothing about a press
  // outlives its own frame. The other two both start a clock here and are in
  // the switch next door: `beatboxWave`'s arcs go on crossing the field after
  // the body they came out of has moved on, and `beatboxSilent`'s rings open
  // out of a body that is no longer there to be read.
  "beatboxTap",
  "lureVanished",
  "claspBreak",
  "choirSing",
  // And the film finishing. The burst is thrown by `burstFor` above and the
  // body underneath is an ordinary slick or bulb from that tick on, drawn by
  // `drawLiving` like any other. Nothing about the moment outlives its frame:
  // the *closing* is read straight off `Creature.choirFuseTick` every frame
  // (`render/choir.ts`), which is the one thing that cannot go stale.
  "choirOpen",
  // THE BALLOON's other two. Nothing about either outlives its frame: how big
  // a balloon is drawn, how far it leans and how far each side has given are
  // read every frame straight off the body (`balloonSwellPhase`,
  // `balloonTension`), which is the one thing that cannot go stale across a
  // restart. The bursts are `burstFor` above, and the hull damage rides on the
  // `breach` beside the burst, which `ingestBreach` already remembers.
  //
  // **`balloonPop` was here until 15 September 2026** and is in the switch next
  // door now: the shreds of the skin go on flying and falling for a second
  // after the body is off the field, which is exactly the thing this list is
  // for saying a creature does not do (`balloon-burst.ts`).
  "balloonSplit",
  // Topping out is the same kind of nothing: the body it turned into is on
  // the field from that tick and is drawn as a torch off its own kind.
  "balloonTopped",
  "veilTorn",
  // A layer off THE RIND: the burst is thrown by `burstFor` above, and the
  // skin it came off in is `rind-shed.ts`, ingested with the rest of
  // `effects-body.ts` before this loop starts. The size the body steps down
  // to is not remembered anywhere — it is redrawn every frame straight off
  // `rindLayers` (`livingBodyMul`), which is the one thing that cannot go
  // stale across a restart.
  "rindShed",
  // A recoil bouncing: the burst is thrown by `burstFor` above and the jet
  // it vented is `recoil-vent.ts`, ingested with the rest of
  // `effects-body.ts` before this loop starts. How broken the cage is drawn
  // is not remembered anywhere — it is read every frame straight off
  // `recoilBounces` (`recoil.ts`), which is the one thing that cannot go
  // stale across a restart.
  "recoilBounce",
  // A carom turning at a wall, and one cracking open. Neither remembers
  // anything past this frame: how the crust is drawn is read every frame
  // straight off `c.kind` and `caromHeading` (`carom.ts`), and once it is a
  // rock it is drawn by the same `drawMeteor` every other rock is — which is
  // the one thing that cannot go stale across a restart.
  "caromBounce",
  "caromCrack",
  // THE CRYSTAL's three, for the carom's reason: the shell, the heading and
  // the light under the join are read every frame off the body and the world
  // (`crystal.ts`), and the two halves are a slick and a bulb from that tick.
  "crystalBounce",
  "crystalCatch",
  "crystalSplit",
  // THE GUM's one: which way it is flying is read off the world every frame
  // (`gum.ts`), and `burstFor` has already thrown the sparks.
  "gumFlung",
  // The clingers' four, for the gum's reason: the grip, the fuse and the
  // moves are all read off the world every frame (`cling.ts`), and
  // `burstFor` has already thrown the sparks.
  "clingGrip",
  "clingFreed",
  "clingBlast",
  // Nothing about the ejected body is remembered either: which way it is
  // going and what is drawn over it are read every frame off `chuteOpen`
  // (`chute.ts`), which is the one thing that cannot go stale across a
  // restart.
  "caromEject",
  "chuteOpen",
  // And the canopy cut off one, which does outlive its frame — but as a
  // transient belonging to one body, ingested with the rest of
  // `effects-body.ts` before this loop starts (`chute-cut.ts`).
  "chuteCut",
  // The shell bursting off a volley. `burstFor` above has already thrown the
  // rock it was made of, and nothing here is remembered past this frame: how
  // many plates are drawn is read every frame straight off `volleyPlates`
  // (`volley.ts`), and once the body is loose it is drawn by the same
  // `drawLiving` every other body is — which is the one thing that cannot go
  // stale across a restart.
  "volleyHatch",
  // Nothing here remembers anything past this frame: `burstFor`'s table
  // already said what a burst it is or is not, and none of these change
  // what `Effects` carries into the next one.
  "beat",
  "waveStart",
  "needWave",
  "waveFailed",
  "quit",
  "lanceFull",
  "lanceSpilled",
  // Read by `ShotOutFx.ingest` before this switch, the way the volley's are.
  "shotOut",
  "hole",
  "grip",
  // THE PUSH's lane change. Heard rather than seen: the carry is bound to a
  // cue in `packages/audio` and whether it also throws something on the field
  // is a look, which is the owner's to choose (`docs/looks.md`).
  "carry",
  "podLoose",
  "podLost",
  "lureHit",
  "lureSeen",
  "shellBreak",
  "shellBare",
  "veilMorph",
  "veilRebuff",
  // A wisp hopping leaves nothing behind on the field: the ring and the beam
  // are drawn every frame off the body itself (`wisp.ts`), so there is no
  // transient here — and an event carrying no column could not place one
  // anyway, which is deliberate (`events.ts`).
  // A wheel coming apart. `burstFor` has already said what it throws, and
  // there is nothing to carry into the next frame: the hub is off the field
  // on the same beat, so an entry keyed to it would have nothing to look up.
  "gyreBroke",
  // A bead shrivelling or filling again, and the thread parting. None of the
  // three leaves a transient *here*: a raisin is drawn off `strandSpent` on
  // the body every frame (`strand.ts`), and the thread's burn is one of the
  // body transients (`strand-fuse.ts`), which ingest the event themselves.
  "strandBead",
  "strandSwell",
  "strandBroke",
  "wispHop",
  // THE GHOST's three, and all three for the same reason: none of them is a
  // particle on the field. The escape is `ghost-release.ts`, a transient
  // that belongs to one body; the turn at a wall and the charge that ends
  // the prowling are read off `ghostLaps` every frame, on the body itself,
  // on the one screen that draws it.
  "ghostRelease",
  "ghostTurn",
  "ghostCharge",
  // THE FENCE passing the ship, and a bolt cutting it open. Both bursts are
  // `effects-spark.ts`'; neither leaves anything here, since a fence that
  // passed is off the field and a burnt column is world state.
  // A torn dome and a fault held off join them: one arrives as a burst and a
  // breach of its own, the other is a window the panel reads off the world.
  "fencePass",
  "fenceBurn",
  // A magnet coming apart, for THE CHUTE's reason exactly: what it leaves is a
  // transient of its own in `effects-body.ts`, spawned there rather than here
  // (`magnet-break.ts`).
  "magnetBreak",
  // THE COIL's two. The dome coming off is `effects-spark.ts`' burst and
  // nothing else — what is left is an ordinary torch, drawn by the same
  // `drawMeteor` every rock is — and the charge in flight is a transient of
  // its own in `effects-body.ts`, spawned there rather than here, for THE
  // CHUTE's reason exactly (`coil-jump.ts`).
  "coilBreak",
  "coilJump",
  // THE WEIGHT given. Nothing here outlives the frame it happens on: what the
  // pair watched was the **squeeze**, and that is world state — the contour
  // drawn tighter the further `weightPressTicks` has run, read off the creature
  // every frame while it is still on the field (`weight.ts`). The moment it
  // gives, the body is simply gone, which is what a pressed thing does; the
  // burst next door is the whole of the transient and it is a narrow one on
  // purpose. A body that threw pieces outward would be a body that exploded,
  // and the two hands did the opposite of that.
  "weightCrushed",
  // **A husk swallowed draws nothing of its own.** Its twin does — a refused
  // husk flies off for a second and a bit (`husk-deflate.ts`) — and the
  // asymmetry is the moment: this one went *in*, so there is nothing left on
  // the field to draw. What the pair sees instead is the wave lost, which is
  // the ship's own answer and is drawn from world state.
  "huskSwallowed",
] as const satisfies readonly SimEvent["type"][];

/** One of the above, as a type — what the guard narrows the union by. */
export type IngestSilentEvent = Extract<SimEvent, { type: (typeof INGEST_SILENT)[number] }>;

/**
 * Whether this event changes nothing `Effects` carries into the next frame.
 *
 * A guard rather than a boolean, so the caller's switch is left with the
 * events that *do* leave something behind and its `assertNever` still means
 * what it meant.
 */
export function isIngestSilent(e: SimEvent): e is IngestSilentEvent {
  return (INGEST_SILENT as readonly string[]).includes(e.type);
}
