import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { nextInt } from "./rng.js";
import type { StarePhase, StareState } from "./stare.js";
import { stareForbids, stareWatches } from "./stare.js";
import type { Command, TimedCommand } from "./types.js";
import type { World } from "./world.js";

/**
 * THE STARE's clock, and the one press that costs the hull.
 *
 * The cycle is four phases and no state beyond the beat each began on: away,
 * turning, looking, back — and two more the lid adds off the side of
 * `looking`, shut and opening, which go back into it (`stare-hand.ts` is the
 * thumb that opens that door). It runs on the **beat** and from `stepBoss`, because
 * every number in it is a count of beats a pair says something in — there is
 * nothing here that a finer clock would make fairer, and a tell that landed
 * between two beats would be a tell nobody could count out loud.
 *
 * **The roll happens when the turn begins, not when the look lands.** The
 * whole of the warning is knowing *who*, so the seat is chosen at the top of
 * the tell and stands for the look that follows — and it goes into the
 * fingerprint from that moment (`stare-hash.ts`), so two devices are warning
 * their pair about the same seat.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installStare(world: World): StareState {
  return {
    kind: "stare",
    phase: "away",
    phaseBeat: world.beat,
    watching: 0,
    lookBeats: world.cfg.stareLookBeats,
    looks: 0,
    caughtTick: -1,
    caughtPlayer: 0,
    lidSeat: 0,
    lidMilli: 0,
  };
}

/** The boss, if it is the one installed. Narrowing in one place rather than six. */
export function stareBoss(world: World): StareState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "stare" ? boss : null;
}

export function enterStare(stare: StareState, phase: StarePhase, beat: number): void {
  stare.phase = phase;
  stare.phaseBeat = beat;
}

/**
 * One beat of the eye.
 *
 * The look's length is read off `lookBeats` and grown *after* the look ends,
 * so the number the pair has been living with all through a look is the number
 * it was told about — a span that grew underneath them would make the last
 * beat of every look a beat nobody could have counted.
 */
export function stepStare(world: World, stare: StareState): void {
  const cfg = world.cfg;
  const since = world.beat - stare.phaseBeat;

  if (stare.phase === "away") {
    if (since < cfg.stareAwayBeats) return;
    // The seat is rolled here, at the top of the turn, and this is the only
    // roll in the boss. `docs/spec/structure.md`: what is random is what one
    // player knows and the other does not — the picture shows it to the seat
    // that is *not* watched (`docs/spec/bosses.md`), so the roll is the reason
    // there is something to say.
    stare.watching = nextInt(world.rng, 2) === 0 ? 1 : 2;
    enterStare(stare, "turning", world.beat);
    return;
  }

  if (stare.phase === "turning") {
    if (since < cfg.stareTellBeats) return;
    enterStare(stare, "looking", world.beat);
    return;
  }

  if (stare.phase === "looking") {
    if (since < stare.lookBeats) return;
    stare.looks += 1;
    // Longer every time, to a ceiling: a pair that has learned the rhythm has
    // learned one that is getting harder, which is what keeps the last window
    // of a wave worth as much as the first.
    stare.lookBeats = Math.min(cfg.stareLookMaxBeats, stare.lookBeats + cfg.stareLookGrowBeats);
    stare.watching = 0;
    // A look that ran its length is done with the lid too: a thumb still on
    // it is a thumb on nothing until the next look.
    stare.lidSeat = 0;
    stare.lidMilli = 0;
    enterStare(stare, "back", world.beat);
    return;
  }

  // The lid is down and the eye is straining against it. A thumb that lets
  // go opens it sooner (`stare-hand.ts`); this is the eye winning.
  if (stare.phase === "shut") {
    if (since < cfg.stareLidHoldBeats) return;
    openStare(world, stare, true);
    return;
  }

  // The lid is up and the eye looks at the seat that pulled it, for a whole
  // look — the same `lookBeats` the shut one would have run, not grown,
  // because a look the lid ended never landed (`looks` did not count it).
  if (stare.phase === "opening") {
    if (since < cfg.stareReopenBeats) return;
    stare.lidMilli = 0;
    enterStare(stare, "looking", world.beat);
    return;
  }

  if (since >= cfg.stareTurnBackBeats) enterStare(stare, "away", world.beat);
}

/**
 * The lid starts back up, from `shut`, and the eye takes the puller.
 *
 * `watching` is set here rather than when the look lands, for the tell's
 * reason: the picture shows the seat about to be frozen on the *other*
 * screen from the moment the lid moves, so both seats know who for the whole
 * of the rise. It is `lidSeat`, never a roll — the lid remembers who pulled
 * it, and that is the whole cost.
 */
export function openStare(world: World, stare: StareState, forced: boolean): void {
  const player = stare.lidSeat === 0 ? null : stare.lidSeat;
  if (player === null) return;
  stare.watching = player;
  enterStare(stare, "opening", world.beat);
  world.events.push({ type: "stareOpen", player, forced });
}

/**
 * **Whether this press is the one that costs the hull**, asked in
 * `applyCommand` above the switch and below `restart`.
 *
 * It refuses and punishes in the same breath, which is the difference between
 * this boss and a malfunction: `faultSwallows` eats a press because the button
 * is broken, and nothing happens. Here the button works perfectly and the
 * pair was told not to touch it — so the press is not applied *and* the hull
 * is broken, which is the wave lost (`wave-fail.ts`).
 *
 * The other seat is untouched. A look is one player sitting on their hands
 * while the other holds the field alone, and a rule that froze both would be a
 * pause rather than a boss.
 */
export function stareBreaks(world: World, timed: TimedCommand): boolean {
  const stare = stareBoss(world);
  if (stare === null) return false;
  if (!stareWatches(stare, timed.player)) return false;
  if (!stareForbids(timed.command)) return false;
  caught(world, stare, timed.player, timed.command);
  return true;
}

/**
 * The hull pays and the wave is lost.
 *
 * The middle column, because the eye is in the sky rather than in a lane and
 * there is no column to blame — the same argument SNAKE's crash and THE
 * SCOUT's touch both make. `heavy`, because being looked at is not a graze.
 */
function caught(world: World, stare: StareState, player: 1 | 2, command: Command): void {
  stare.caughtTick = world.tick;
  stare.caughtPlayer = player;
  world.events.push({ type: "stareCaught", player, command });
  bossStrikesHull(world, "stare", midCol(world.cfg));
}
