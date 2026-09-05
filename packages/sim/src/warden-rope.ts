import type { WardenState } from "./boss-state.js";
import { removeCreature } from "./field.js";
import { clampPull, pullIsTaut, pullOpenMilli, tileCentreMilli } from "./handle-pull.js";
import { NO_SHELL } from "./shell.js";
import { type Command, type Creature, WARDEN_COLS } from "./types.js";
import { NO_TETHER, wardenColor, wardenCycle } from "./warden-cycle.js";
import type { World } from "./world.js";

/**
 * **THE WARDEN's rope: the hand, the line and the tension between them.**
 *
 * Split out of `warden.ts` when the pull learned to go in any direction and
 * that file went past its 250-line limit for the third time — twice it was
 * paid for by shaving comments, which is how a file stays at 249 forever and
 * says less every time. The seam is the one the boss actually has: next door is
 * the **choreography**, which is a clock (attach on the cycle, drift the pupil,
 * count the plates), and this is the **control**, which is a hand and answers
 * on the tick. `warden-cycle.ts` is the third of the three and is the arithmetic
 * both of them read.
 *
 * The rule the whole thing rests on: **the openness is player 2's readout of a
 * hand they cannot see**, so nothing between the pull and the picture may ease,
 * lag or round it (`handle-pull.ts`).
 */
/** The tether hanging right now, or null. */
export function wardenTether(world: World): Creature | null {
  const b = world.boss;
  if (b === null || b.kind !== "warden" || b.tetherId === NO_TETHER) return null;
  return world.creatures.find((c) => c.id === b.tetherId) ?? null;
}

/**
 * How taut the line is, 0..1000 — and so how far open the hatch and the eyelids
 * stand, because they are the same number drawn twice (`handle-pull.ts` on why
 * nothing between the rule and the picture may ease it).
 */
export function wardenPullMilli(world: World, b: WardenState): number {
  return pullOpenMilli({ x: b.pullMilli, y: b.pullYMilli }, world.cfg.wardenTautMilli);
}

/**
 * Where the handle actually is, in thousandths of a tile: the anchor the hand
 * took it from plus how far the hand has carried it — and the rope's own rest
 * while nobody is holding it.
 */
export function wardenHandleMilli(world: World, b: WardenState): { x: number; y: number } {
  if (!b.pulling) return ropeRest(world, b);
  return { x: b.pullAnchorX + b.pullMilli, y: b.pullAnchorY + b.pullYMilli };
}

/** Where the handle hangs with nobody on it, in thousandths of a tile. */
function ropeRest(world: World, b: WardenState): { x: number; y: number } {
  const cfg = world.cfg;
  return tileCentreMilli(b.pupilCol, cfg.wardenRow + cfg.wardenHangRows);
}

/** Whether the core is exposed this instant: the only window a shot counts in,
 * and the hatch is the sole way to it. */
export function wardenEyeOpen(world: World, b: WardenState): boolean {
  if (b.tetherId === NO_TETHER) return false;
  return pullIsTaut({ x: b.pullMilli, y: b.pullYMilli }, world.cfg.wardenTautMilli);
}

/**
 * The hand on the line, and the whole of the gesture.
 *
 * **Only player 1 may pull**, for the reason player 2 is the only one who
 * fires: player 2's panel carries both colours, so a fight where either seat
 * could take the rope would be a fight one phone could play.
 *
 * `fromMilli` and `fromYMilli` are how far the hand has come from where it
 * grabbed, in thousandths of a tile — a displacement and not a place, resolved
 * on the device whose finger it is (`Command` in `types.ts` has why). Any
 * direction will do: what opens the gate is the *length* of the pull, because a
 * gate on a block and tackle does not care which way you lean.
 *
 * A hand that lifts lets the tension go and the gate shuts with it. That and a
 * landed shot are the only two that shut it (`docs/spec/bosses.md` 11.4).
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
    b.pullOriginYMilli = command.fromYMilli ?? 0;
    b.pullMilli = 0;
    b.pullYMilli = 0;
    // Where the handle was when the hand took it, held there for as long as
    // the hand stays: the pupil drifts a column or two a beat, and a handle
    // hung off today's rest slides out from under a still thumb.
    const rest = ropeRest(world, b);
    b.pullAnchorX = rest.x;
    b.pullAnchorY = rest.y;
    return;
  }
  const was = wardenEyeOpen(world, b);
  // Cut to taut and then kept on the field — one rule, `handle-pull.ts`.
  const pulled = clampPull(
    world.cfg,
    { x: b.pullAnchorX, y: b.pullAnchorY },
    {
      x: command.fromMilli - b.pullOriginMilli,
      y: (command.fromYMilli ?? 0) - b.pullOriginYMilli,
    },
    world.cfg.wardenTautMilli,
  );
  b.pullMilli = pulled.x;
  b.pullYMilli = pulled.y;
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
  b.pullOriginYMilli = 0;
  b.pullMilli = 0;
  b.pullYMilli = 0;
  b.pullAnchorX = 0;
  b.pullAnchorY = 0;
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
export function attach(world: World, b: WardenState, body: Creature): void {
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
export function cutTether(world: World, b: WardenState): void {
  slacken(b);
  if (b.tetherId === NO_TETHER) return;
  const id = b.tetherId;
  b.tetherId = NO_TETHER;
  removeCreature(world, id);
}
