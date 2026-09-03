import { stepBoss } from "./boss.js";
import { lureIsSpent, throbIsOpen } from "./creature-rules.js";
import { stepDart } from "./dart.js";
import { echoFalls } from "./echo.js";
import { splitEchoes } from "./echo-split.js";
import { removeCreatures } from "./field.js";
import { ghostCrosses, stepGhostAcross } from "./ghost.js";
import { grippedFallTiles } from "./grip.js";
import { breakSpentGyres, stepGyre } from "./gyre.js";
import { resolveHull } from "./hull.js";
import { spawnPods } from "./pods.js";
import { spawnArrivals } from "./spawn.js";
import { isBossBody } from "./types.js";
import { veilMorph } from "./veil.js";
import { noteWaveCleared } from "./wave-end.js";
import { stepWisp, wispHops, wispOnField } from "./wisp.js";
import type { World } from "./world.js";

// `startWave` (and its private `installWarden`) is the shape of a wave
// beginning, not of a beat — it lives in wave-start.ts. Re-exported here so
// nothing that already reaches for it through beat.ts has to move.
export { startWave } from "./wave-start.js";

/**
 * Everything that happens on a beat. Creatures glide smoothly but land on tile
 * centres each beat, all at once, so a creature's `row` is exact. The shell
 * has no intermediate state — collision happens the moment a tile-change brings
 * someone to the hull row (docs/spec/systems.md 5.8).
 */
/**
 * The metronome on its own: the shared clock ticking over, and nothing about a
 * field. Separate because THE GAUGE is a round with no field in it and the
 * beat still runs through one — the ear would notice ninety seconds of silence
 * and the round's own drift is counted in beats. Call it rather than writing
 * the two lines again.
 */
export function beatMetronome(world: World): void {
  world.beat += 1;
  world.events.push({ type: "beat", beat: world.beat });
}

export function onBeat(world: World): void {
  beatMetronome(world);
  world.waveBeat += 1;

  // A lure goes on the beat it would step off the row `lureVanishRows` above
  // the hull — asked *before* the fall, so the beat it spent gliding into that
  // row was in plain sight of both players and nothing about it read as
  // different until it was not there. Collected rather than filtered in place:
  // the loop below is still walking `world.creatures`.
  const spent = world.creatures.filter((c) => lureIsSpent(world.cfg, c));
  if (spent.length > 0) {
    for (const c of spent) {
      world.events.push({
        type: "lureVanished",
        col: c.col,
        row: c.row,
        // Not null: `resolveLure` is the only branch a lure can take with a
        // shot in it, so a lure always carries the disguise's own colour, and
        // that is the colour the picture that fades has to be drawn in.
        color: c.color ?? "cyan",
      });
    }
    removeCreatures(
      world,
      spent.map((c) => c.id),
    );
  }

  // Every wheel with nothing left on its rim, taken off before anything else
  // this beat looks at the field. It has to be before the clear test at the
  // bottom, or a bare hub would hold a wave open with nothing in it to shoot;
  // and it is a whole beat after the last mount died on purpose, so the wheel
  // is seen to come apart rather than vanishing inside one frame (`gyre.ts`).
  breakSpentGyres(world);

  // Said once for the whole field rather than once per body: every wisp takes
  // the hop on the same beat (`wispHops`), and what the event is for is the
  // ear of the player who cannot see any of them — one pip means "whatever
  // you were holding has expired", and a second pip beside it would only mean
  // it twice. Before the loop, because after it there is nothing left to ask:
  // the bodies have already moved.
  if (wispHops(world.cfg, world.beat) && wispOnField(world)) {
    world.events.push({ type: "wispHop" });
  }

  // Creatures land on tile centres each beat, all at once — most move one
  // tile, a rock may move several, but never a fraction of one.
  for (const c of world.creatures) {
    // A boss body holds its row: the queen until petals make her descend, the
    // Warden for good. `isBossBody` is the one place both are named.
    if (isBossBody(c.kind)) continue;
    // A body on a rim, and it is skipped **before** the two lines below rather
    // than after them. `stepGyre` has already written its `col`, `row` and both
    // `from` fields — the hub comes first in this list and carries its six with
    // it (`carryMounts`) — so a mount that fell through to the assignments
    // would have where it came from overwritten with where it now is, and six
    // bodies that teleport once a beat instead of turning are a wheel that
    // jumps rather than a wheel that moves. Stepping it again would carry it
    // twice as well: once around the rim and once straight down.
    if (c.kind === "mount") continue;
    c.fromRow = c.row;
    // Where it is coming *from*, sideways. Set for every kind and moved by
    // one, so `drawnCol` has an origin to glide a dart out of and every other
    // body keeps drawing exactly where it stands.
    c.fromCol = c.col;
    // A dart does not fall. It takes a diagonal every other beat and hangs in
    // between, and `stepDart` is the whole of that — deliberately in place of
    // the line below rather than beside it, because a body that both stepped
    // and fell would be moving three rows on the beats it moved.
    if (c.kind === "dart") {
      stepDart(world, c);
      continue;
    }
    // A wisp does not fall either, and it does not cross the ground between
    // two tiles: on the beats `wispHops` names it is simply somewhere else,
    // and on the beats in between it is nowhere new. In place of the line
    // below for the dart's reason — a body that both hopped and fell would be
    // arriving one row lower than the tile player 2 just read out.
    if (c.kind === "wisp") {
      stepWisp(world, c);
      continue;
    }
    // A crossing ghost does not fall either: it drifts in to the row it
    // prowls along, walks it a column a beat, and only comes down once its
    // temper is spent (`stepGhostAcross`). In place of the fall rather than
    // beside it, for `stepDart`'s reason — a body that both walked and fell
    // would be moving in two directions on one beat.
    if (ghostCrosses(c)) {
      stepGhostAcross(world, c);
      continue;
    }
    // THE ECHO comes down half as fast as anything else, and the beats in
    // between are beats it simply does not take: the simulation stores
    // integers, so there is no half a tile for it to move. In place of the
    // fall rather than beside it, for `stepDart`'s reason — and it still
    // *falls*, on the beats it takes, so a hand may be put on one and slows
    // it further through the same `grippedFallTiles` every other body uses.
    if (c.kind === "echo" && !echoFalls(world.cfg, world.beat)) continue;
    // THE GYRE's hub walks a diamond and turns its rim, and carries its six
    // bodies with it. In place of the fall for `stepDart`'s reason — a wheel
    // that both walked and fell would be moving in two directions on one beat.
    if (c.kind === "gyre") {
      stepGyre(world, c);
      continue;
    }
    // Not `fallTilesPerBeat` directly: a hand held on this creature slows it,
    // and `grippedFallTiles` is where that is decided (grip.ts).
    c.row += grippedFallTiles(world, c);
    // Decided once a beat, from the beat this creature now stands on, and
    // stored — bullet-hit.ts and render/ both read it off the creature rather
    // than asking `throbIsOpen` a second time at a possibly different tick.
    if (c.kind === "throb") c.throbOpen = throbIsOpen(world.cfg, world.beat);
    // And the other body whose state is a fixed cycle read off the shared
    // clock: a veil turns over from a slick to a bulb and back on the beats
    // `veilMorphs` names, decided here and nowhere else, so player 1's timer
    // and the colour a shot has to match are two readings of one number.
    if (c.kind === "veil") veilMorph(world, c);
  }

  // Everything that was already standing when this beat began and still has a
  // division left in it becomes two. Before the queue below rather than after,
  // so an arrival entering on this beat is not walked by the pass that created
  // it — which is the whole of "one beat later" for this creature (`echo.ts`).
  splitEchoes(world);

  spawnArrivals(world);
  // What she releases this beat has to be on the field before the hull is resolved.
  stepBoss(world);
  spawnPods(world);

  // Hull resolution. Creatures that have reached it are removed and cause damage.
  resolveHull(world);

  // Wave progression: if all enemies are gone and all were spawned, the wave is
  // done. Wait `waveRestBeats` before the next one starts automatically. Pods
  // are deliberately not counted — a power-up never blocks the end of a wave
  // (docs/spec/systems.md 5.7), so one left hanging is one left behind.
  // A boss still standing holds the wave open even when the field is empty.
  // The queen is a creature and counted herself; THE MIRROR is not on the
  // field at all, so without this its wave would clear on its first beat.
  const cleared =
    world.spawned >= world.queue.length && world.creatures.length === 0 && world.boss === null;
  if (cleared) noteWaveCleared(world);
}
