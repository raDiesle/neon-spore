import { priming } from "./lance.js";
import type { World } from "./world.js";

/**
 * THE FORK: the seam between two waves, handed back to the pair.
 *
 * Everywhere else in this game the clock decides. A creature arrives on its
 * beat, a window opens for 900 ms, a rest runs `waveRestBeats` and the next
 * wave begins whether or not anybody was ready. THE FORK is the one place that
 * is not true: the rest ends in a **wait**, and the run continues only when
 * both thumbs are down. Spaceteam's warp jump, and the only moment in a run
 * that belongs to the pair rather than to the beat.
 *
 * **Whose thumb, and on what.** Player 1 holds the lance; player 2 presses a
 * colour while he holds. Neither is a new button — they are the two the band
 * already draws, and `touch.ts` already signs the lance with player 1 and the
 * colours with player 2, so one person cannot hold both halves whatever they
 * do with their own screen. The two acts have to **overlap in time**: nothing
 * latches here, so a thumb put down and taken away again leaves the run
 * exactly where it was.
 *
 * That overlap is the whole design. Player 1 puts his thumb down and says so;
 * two seconds of voice delay later player 2 hears it and fires, and the hold
 * has to have survived the trip. It is the game's signature constraint with
 * the timing skill taken out — nothing is lost by getting it wrong, you simply
 * say it again. And it is docs/spec/couplings.md 2 inverted: during a wave
 * player 2 must **not** fire while the lobe fills, and
 * at the fork she must fire *because* it is filling. Same two thumbs, opposite
 * instruction, and the only way to know which you are in is to say it.
 *
 * **What it is not.** There is no timeout. A clock that eventually started the
 * wave anyway would make the wait decorative — the pair would learn its length
 * and stop committing, and the one moment that belongs to them would belong to
 * the clock again like everything else. So a fork stays open forever, and the
 * only ways out are the two thumbs or leaving the run.
 *
 * **Nor is it a free repair bay.** The hull stops regenerating while a fork is
 * open (`regenerateHull` in world.ts). Otherwise the cheapest way to play would
 * be to stand at the fork and talk about nothing for a minute.
 *
 * **THE FORK first, then the briefing card.** A wave that opens on a card
 * (`briefing.ts`) puts two gates at the same seam, and they run in that order:
 * the fork is the pair deciding to go, the card is what they are told on the
 * way in. Read the other way round the pair would be handed a lesson about a
 * wave they have not agreed to yet — and, since the commit has no *no* in it
 * until the route choice is built, the information would change nothing about
 * the decision it preceded. It would also stack two "both of you press
 * something" gates back to back with nothing between them, which is how a
 * gesture stops meaning anything.
 *
 * The order needs no code to arrange, which is the sign the seams were cut in
 * the right places: a card is only ever opened by `startWave`, `startWave` is
 * only reached through `needWave`, and `needWave` between waves comes only from
 * a fork being crossed. **They also cannot deadlock**, for the same reason from
 * both ends: no card can be raised while a fork is open, because raising one
 * requires the fork to have been crossed; and no fork can open while a card is
 * up, because `step` freezes before it reaches `progressWave`. `startWave`
 * closes any fork it finds, so "waiting to start" and "started" are states a
 * world cannot hold at once.
 */

/** The run is not waiting. `world.forkBeat` carries this while a wave is on. */
export const NO_FORK = -1;

/** Whether the run has stopped between waves and is waiting for the pair. */
export function forkOpen(world: World): boolean {
  return world.forkBeat !== NO_FORK;
}

/**
 * The rest between waves has run out. Either the run asks the host for the
 * next wave, as it always did, or — with THE FORK on — it stops here instead.
 * The one place that decision is made; `world.ts` calls this and knows nothing
 * else about it.
 */
export function restEnded(world: World): void {
  if (world.cfg.forkBetweenWaves) {
    world.forkBeat = world.beat;
    return;
  }
  world.events.push({ type: "needWave", wave: world.wave + 1 });
}

/**
 * Put the run back on the clock. `startWave` calls it, which is what makes a
 * fork and a running wave mutually exclusive rather than merely unlikely — see
 * the note about deadlock above. `restart` calls it too, so a run being left
 * does not spend the frame before the host answers with its shots being
 * swallowed by a fork nobody is standing at.
 */
export function closeFork(world: World): void {
  world.forkBeat = NO_FORK;
}

/**
 * Player 1's half: his thumb is on the lance. It is the lobe filling and
 * nothing else — the mark is the one row of the information split that is
 * deliberately not split (docs/spec/systems.md 5.2), so player 2's screen may
 * show this too, and does. A fork that could only be crossed over a working
 * voice channel would be a fork a pair can be stuck at, and the pause is for
 * talking, not for proving that they can.
 */
export function forkHeld(world: World): boolean {
  return priming(world);
}

/**
 * Player 2's half arriving. Returns whether the fork swallowed the press —
 * true for **every** colour pressed while the run is waiting, because at the
 * fork a colour is not a shot. There is nothing on the field to fire at, and a
 * bolt let loose here would only teach the pair that their commit sometimes
 * comes out as a weapon.
 *
 * It asks for the next wave only if player 1's thumb is on the lance at that
 * moment. Pressed too early, it does nothing at all and costs nothing.
 */
export function forkFire(world: World): boolean {
  if (!forkOpen(world)) return false;
  if (forkHeld(world)) {
    closeFork(world);
    world.events.push({ type: "needWave", wave: world.wave + 1 });
  }
  return true;
}

/**
 * Beats the pair has been standing at this fork. Display only, and never
 * compared with a limit by anything in `sim` — see the note about timeouts
 * above. It is here because the beat keeps running through the wait
 * (docs/spec/systems.md 5.3) and a device may want to say how long the breath
 * has been, which is a different thing from counting down to the end of it.
 */
export function forkBeats(world: World): number {
  return forkOpen(world) ? world.beat - world.forkBeat : 0;
}
