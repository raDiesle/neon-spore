import { faultStep } from "./fault-clock.js";
import { faultInWave, faultOn, faultWindow } from "./fault-placed.js";
import type { World } from "./world.js";

/**
 * **THE HANDOVER: the fault that takes no control away and gives it to the
 * other person.**
 *
 * Every other fault is a control that answers nobody, or — THE CODEX — two that
 * answer the thumb and do each other's job. This one leaves all four working and
 * changes *whose they are*: a few beats into the wave the two panels trade
 * screens. The pilot's phone draws the navigator's half in the navigator's
 * colours and answers it; the navigator's draws the pilot's. Everything each of
 * them has spent seven acts learning about their own half is now something they
 * have to say out loud to somebody who is holding it
 * (`docs/spec/ideas.md`, under Handover, before it was built).
 *
 * **The simulation does not change, and that is the whole of this file.** There
 * is no state, no step, nothing in the hash and no command swallowed
 * (`faultSwallows`). A panel is drawn by render/ and answered by a host, so a
 * trade of panels is a fact those two read off the world's own beat — this is
 * only the clock they read it from, `codexSwapped`'s arrangement exactly.
 *
 * **It ends, and it is the first fault that does.** Every fault before it runs
 * from the wave's first beat to its last, and the owner's decision of 6
 * September 2026 is why: the broken seat used to be handed a lobe that bought
 * two beats of quiet and he did not want the button. A window is not that
 * button. Nobody presses anything to start or stop it, the pair cannot spend it
 * or save it, and both of them are told when it is coming — it is the ship's
 * own clock, and what a pair can do about it is arrange their hands before it
 * lands and get them back afterwards.
 *
 * **What travels is the panel and the reads; who the two people are does not.**
 * The wire's two identities are fixed for the run (`packages/net`), and the
 * simulation attributes the handful of commands that need a hand — a grip, a
 * balloon's two pulls, a tap on a box — to the player who sent them. So a
 * device that has borrowed a panel still presses as itself, which is a rule the
 * two hosts carry (`render/handover.ts`, `apps/game/src/input.ts`), and a wave
 * with this fault on it is a wave of bodies answered by the band rather than by
 * a hand on the glass.
 */

/**
 * **The trade this beat is in, or the next one coming.**
 *
 * It used to be arithmetic: the fault carried `at`, `beats` and `every`, and
 * this file worked out which turn of the cycle the wave was on. Every fault is
 * a pencil on the map now (`fault-placed.ts`) — so a wave that trades three
 * times places THE HANDOVER three times, `faultWindow` finds the one in force
 * or the one still to come, and none of the cycle arithmetic survives. The
 * owner asked for the placement on 14 September 2026, and it is the same
 * answer he gave about this fault on the 13th, generalised to all five.
 *
 * `bounds` rather than the obvious name: `window` is banned in this package,
 * and rightly — the simulation is headless and the host drives the ticks
 * (`test/purity.test.ts`).
 */
function bounds(world: World): { from: number; to: number } | null {
  return faultWindow(world, "handover");
}

/** Whether this wave places THE HANDOVER at all, now or later. */
export function handedWave(world: World): boolean {
  return faultInWave(world, "handover");
}

/**
 * Whether the panels are traded **right now**.
 *
 * Counted in `faultStep`, the wave's own beat — zero on its first — so the
 * number an author places the pencil on is the number of beats the pair plays
 * with its own hands first.
 */
export function handedOver(world: World): boolean {
  return faultOn(world, "handover") !== null;
}

/** Beats until the trade, or 0 once it has happened. */
function handoverIn(world: World): number {
  const at = bounds(world);
  if (!at) return 0;
  return Math.max(0, at.from - faultStep(world));
}

/**
 * Beats until the trade while the warning is running, and 0 outside it — the
 * number on the plate, and the answer to whether there is a plate at all.
 *
 * One function rather than the count and the window separately, because the
 * picture needs them together and the two readers of it are in two packages
 * (`render/handover-look.ts` draws the count, `render/fault-beam-ends.ts`
 * reaches the beam down on it). A screen that clamped `handoverWarnBeats` for
 * itself would be the second copy of a rule, and the first beat they disagreed
 * on is a phone warning about a trade the other one has already made
 * (`test/copies-table.ts`).
 *
 * The warning is the ship's and not a screen's: both phones count it down,
 * because a pair where only one of them knows is a pair where the other is
 * simply surprised, and there is nothing to say about a surprise.
 */
export function handoverWarning(world: World): number {
  const away = handoverIn(world);
  return away > 0 && away <= Math.max(1, Math.round(world.cfg.handoverWarnBeats)) ? away : 0;
}

/** Beats until the panels come back, or 0 when they are not away — and 0 as
 * well for a placement with no end, which has no coming back to count to. */
export function handoverLeft(world: World): number {
  const at = bounds(world);
  if (!handedOver(world) || !at || !Number.isFinite(at.to)) return 0;
  return Math.max(0, at.to - faultStep(world));
}
