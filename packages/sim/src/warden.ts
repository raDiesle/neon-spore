import type { WardenState } from "./boss-state.js";
import { removeCreature } from "./field.js";
import { NO_SHELL } from "./shell.js";
import { type Command, type Creature, WARDEN_COLS } from "./types.js";
import {
  NO_TETHER,
  wardenColor,
  wardenCycle,
  wardenCycleBeat,
  wardenPhase,
} from "./warden-cycle.js";
import type { World } from "./world.js";

/**
 * THE WARDEN's whole choreography: a gate held open by a rope somebody is
 * pulling.
 *
 * It splits no information — both screens show everything it does — because the
 * Bulb Queen already owns that coupling. What it splits is the pair's two hands.
 * A line comes down out of the rim; player 1 takes the handle and pulls it
 * aside, and the hatch in the middle of the ring — with the eyelids behind it —
 * opens **by degrees, in proportion to the tension**. Player 2 fires the rim's
 * colour into the open eye. A hit takes a plate, shuts eye and hatch together
 * and snaps the line back.
 *
 * One player cannot do it, and that is the point rather than a side effect: the
 * seat holding the rope cannot fire, and the seat firing cannot feel the pull —
 * they read it off how far the hatch has come open. The talking is not
 * decoration on the mechanic, it is the mechanic.
 *
 * Nothing here is random. The colour and the phase follow from the cycle count
 * and the plates, so the fight is the same fight on both devices without a
 * single draw from the rng.
 *
 * `docs/spec/bosses.md` 11.4 is the design; this is only the clock and the rope.
 */

/** The tether hanging right now, or null. */
export function wardenTether(world: World): Creature | null {
  const b = world.boss;
  if (b === null || b.kind !== "warden" || b.tetherId === NO_TETHER) return null;
  return world.creatures.find((c) => c.id === b.tetherId) ?? null;
}

/**
 * How taut the line is, 0..1000 — and so how far open the hatch and the eyelids
 * stand, because they are the same number drawn twice.
 *
 * There is no easing anywhere between this and the hatch. The openness *is*
 * player 2's readout of a hand they cannot see, and a readout that lags the rule
 * is a readout that lies at exactly the moment somebody is deciding to fire.
 */
export function wardenPullMilli(world: World, b: WardenState): number {
  const full = Math.max(1, world.cfg.wardenTautMilli);
  return Math.min(1000, Math.round((Math.abs(b.pullMilli) * 1000) / full));
}

/**
 * Whether the core is exposed this instant. The only window a shot counts in,
 * and the hatch is the sole way to it — nothing opens on a clock any more.
 */
export function wardenEyeOpen(world: World, b: WardenState): boolean {
  if (b.tetherId === NO_TETHER) return false;
  return Math.abs(b.pullMilli) >= world.cfg.wardenTautMilli;
}

/**
 * The hand on the line, and the whole of the gesture.
 *
 * **Only player 1 may pull**, for the reason player 2 is the only one who
 * fires: player 2's panel carries both colours, so a fight where either seat
 * could take the rope would be a fight one phone could play.
 *
 * `fromMilli` is how far the hand has come from where it grabbed, in thousandths
 * of a tile — a displacement and not a place, resolved on the device whose
 * finger it is (`Command` in `types.ts` has why). The grab's own position is the
 * origin, kept here, and the pull is the distance from it. The **sign** is kept
 * so the rope can be drawn swinging the way the hand went; the **rule** takes
 * its magnitude, because a gate on a block and tackle does not care which way
 * you lean.
 *
 * A hand that lifts lets the tension go and the gate shuts with it. That and a
 * landed shot are the only two things that shut it — there is no tearing, and
 * holding it taut all cycle is allowed (`docs/spec/bosses.md` 11.4).
 */
export function wardenTetherHeard(world: World, player: 1 | 2, command: Command): void {
  const b = world.boss;
  if (b === null || b.kind !== "warden" || player !== 1) return;
  if (command.kind !== "drag" || command.target !== "wardenTether") return;
  if (!command.on || b.tetherId === NO_TETHER) {
    slacken(b);
    return;
  }
  if (!b.pulling) {
    // The grab. Wherever the hand is standing is slack, so a line that was cut
    // and replaced under a finger still has to be pulled from where that finger
    // now is rather than arriving taut.
    b.pulling = true;
    b.pullOriginMilli = command.fromMilli;
    b.pullMilli = 0;
    return;
  }
  const was = wardenEyeOpen(world, b);
  const taut = world.cfg.wardenTautMilli;
  const pulled = command.fromMilli - b.pullOriginMilli;
  b.pullMilli = Math.max(-taut, Math.min(taut, pulled));
  if (!was && wardenEyeOpen(world, b)) {
    world.events.push({
      type: "eyeOpen",
      col: b.pupilCol,
      color: wardenColor(wardenCycle(world.cfg, world.waveBeat)),
    });
  }
}

/**
 * The rope let go of, however it happened. The origin goes with the tension:
 * `pulling` false is what makes the next `drag` message read as a fresh grab,
 * which is how a finger still pressed against the glass after a hit is made to
 * pull again instead of holding a gate open on a rope that is not there.
 */
function slacken(b: WardenState): void {
  b.pulling = false;
  b.pullOriginMilli = 0;
  b.pullMilli = 0;
}

/**
 * The rope's answer to a landed shot, on the tick and not the beat.
 *
 * Called from `step` straight after `advanceBullets`, so the snap-back is in the
 * same tick as the hit. That is the whole of what tells the pulling seat their
 * partner scored: they cannot see the plate come off from under their own thumb,
 * and the rope going slack in their hand is a sentence nobody had to say.
 */
export function stepWardenTether(world: World): void {
  const b = world.boss;
  if (b === null || b.kind !== "warden") return;
  if (!b.eyeSpent || b.tetherId === NO_TETHER) return;
  cutTether(world, b);
}

/** One beat of the boss. Dispatched from `stepBoss`. */
export function stepWarden(world: World, b: WardenState): void {
  const body = world.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined) return; // The last plate came off; it is gone.
  // A line the world lost track of leaves its id behind, and clearing it here
  // rather than at the next attach matters because `resetClock` puts `nextId`
  // back to 1: a stale id is a live id again the moment a run starts over.
  if (b.tetherId !== NO_TETHER && wardenTether(world) === null) cutTether(world, b);
  if (wardenCycleBeat(world.cfg, world.waveBeat) === 0) attach(world, b, body);
  drift(b, body, wardenPhase(b.plates).drift);
}

/**
 * A line down out of the middle of the rim, hanging where it is put.
 *
 * **Out of the middle on purpose.** That is the column the hatch is behind, so
 * the rope starts standing in the shot lane and the pull that opens the hatch is
 * the same movement that clears it. The picture and the rule are one thing.
 *
 * One line per cycle, hit or not. A cycle that was scored has no second line —
 * the pair gets the rest of it to say the next colour out loud — and a cycle
 * that was not gets its rope replaced under whatever hand is on it.
 */
function attach(world: World, b: WardenState, body: Creature): void {
  cutTether(world, b);
  b.eyeSpent = false;
  const col = body.col + Math.floor(WARDEN_COLS / 2);
  const id = world.nextId++;
  world.creatures.push({
    id,
    kind: "tether",
    col,
    // Lowered, not dropped: `fromRow` at the rim and `row` where it will hang
    // makes render/ glide it down over the attach beat, and it never moves
    // again — `fallTilesPerBeat("tether")` is zero, and nothing about this line
    // can reach the hull or cost anything.
    row: world.cfg.wardenRow + world.cfg.wardenHangRows,
    fromRow: world.cfg.wardenRow,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
    shell: NO_SHELL,
  });
  b.tetherId = id;
  world.events.push({
    type: "tether",
    col,
    color: wardenColor(wardenCycle(world.cfg, world.waveBeat)),
  });
}

/** The line off the field and the tension with it, however it ended. */
function cutTether(world: World, b: WardenState): void {
  slacken(b);
  if (b.tetherId === NO_TETHER) return;
  const id = b.tetherId;
  b.tetherId = NO_TETHER;
  removeCreature(world, id);
}

/**
 * The pupil slides a column or two a beat, back and forth inside the rim, so
 * the column that matters changes while the body does not.
 *
 * It keeps sliding while the hatch is open, on purpose. A gate the pair can hold
 * open for as long as they like would otherwise ask nothing of player 2 at all;
 * with the eye still walking, the shot is a column the two of them have to name
 * to each other across a voice delay while one of them holds the rope.
 */
function drift(b: WardenState, body: Creature, step: number): void {
  const lo = body.col;
  const hi = body.col + WARDEN_COLS - 1;
  let col = b.pupilCol + b.pupilDir * step;
  if (col < lo || col > hi) {
    b.pupilDir = b.pupilDir === 1 ? -1 : 1;
    col = b.pupilCol + b.pupilDir * step;
  }
  b.pupilCol = Math.max(lo, Math.min(hi, col));
}
