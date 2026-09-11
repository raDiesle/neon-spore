import type { SimEvent } from "@neon-spore/sim";

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
  // THE MIRROR's four, read above the loop by an `ingest` of their own before
  // this switch ever sees them.
  "mirrorShow",
  "mirrorEcho",
  "mirrorVerdict",
  "mirrorDown",
  // THE BEATBOX's tap, and only its tap. The green rings a counted beat throws
  // are world state, redrawn from the creature every frame off the tick the
  // simulation stamped on it (`beatbox-air.ts`), so nothing about a press
  // outlives its own frame. The other two both start a clock here and are in
  // the switch next door: `beatboxWave`'s arcs go on crossing the field after
  // the body they came out of has moved on, and `beatboxSilent`'s rings open
  // out of a body that is no longer there to be read.
  "beatboxTap",
  "plate",
  "lureVanished",
  "claspBreak",
  // THE CHOIR singing. The burst is thrown by `burstFor` above and the hull
  // damage rides on the `breach` beside it on the same tick, which is what
  // `ingestBreach` already remembers. Nothing about the chord itself outlives
  // its frame: the two events that *do* start a clock here are `choirArm` and
  // `choirMerge`, and both are in the switch next door.
  "choirSing",
  // And the film finishing. The burst is thrown by `burstFor` above and the
  // body underneath is an ordinary slick or bulb from that tick on, drawn by
  // `drawLiving` like any other. Nothing about the moment outlives its frame:
  // the *closing* is read straight off `Creature.choirFuseTick` every frame
  // (`render/choir.ts`), which is the one thing that cannot go stale.
  "choirOpen",
  // THE BALLOON's three. Nothing about any of them outlives its frame: how big
  // a balloon is drawn, how far it leans and how far each side has given are
  // read every frame straight off the body (`balloonSwellPhase`,
  // `balloonTension`), which is the one thing that cannot go stale across a
  // restart. The bursts are `burstFor` above, and the hull damage rides on the
  // `breach` beside the burst, which `ingestBreach` already remembers.
  "balloonSplit",
  "balloonPop",
  "balloonBurst",
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
  "crystalDive",
  "crystalSplit",
  // THE GUM's four: whether it is stuck, how wide, whether the cannon is
  // under it and how far a hand has pulled it are all read off the world
  // every frame (`gum.ts`), and nothing outlives the tick.
  "gumStick",
  "gumBlock",
  "gumFlung",
  "gumSpread",
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
  "lanceFull",
  "lanceSpilled",
  "hole",
  "grip",
  // THE PUSH's lane change. Heard rather than seen: the carry is bound to a
  // cue in `packages/audio` and whether it also throws something on the field
  // is a look, which is the owner's to choose (`docs/looks.md`).
  "carry",
  "podLoose",
  "podLost",
  "queenDown",
  "tether",
  "eyeOpen",
  "wardenDown",
  "mazeCommit",
  "mazeProbe",
  "mazeVerdict",
  "mazeDown",
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
  // three leaves a transient: a raisin is drawn off `strandSpent` on the
  // body every frame (`strand.ts`), and the thread is off the field on the
  // beat it breaks, so an entry keyed to it would have nothing to look up.
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
  // THE FLEET is drawn straight off the world every frame — the marks from
  // `struck`, the sinking from `sunkBeat` — with one exception, and the
  // exception is read above this loop by an `ingest` of its own: a salvo is
  // in the air for `FLEET_SHELL_BEATS` after the tick that resolved it, so
  // the shell, its shadow and the burst it makes are `FleetFx`'s
  // (`fleet-fx.ts`).
  "fleetSalvo",
  "fleetSplash",
  "fleetHit",
  "fleetSunk",
  "fleetDown",
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
