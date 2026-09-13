import { faultStep } from "./malfunction.js";
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

/** The fault's own numbers when this wave carries it, and null when it does not. */
function handover(world: World): { at: number; beats: number; every: number } | null {
  const m = world.malfunction;
  if (m?.kind !== "handover") return null;
  const cfg = world.cfg;
  // Authored where the arrivals are, or the game's own numbers where the wave
  // says nothing. Clamped the way every other fault clamps its beats, so a
  // slider dragged to zero is one beat rather than a trade that is always on.
  return {
    at: Math.max(1, Math.round(m.at ?? cfg.handoverAtBeat)),
    beats: Math.max(1, Math.round(m.beats ?? cfg.handoverHoldBeats)),
    // 0 is the tell for *once*: a cycle shorter than the hold would be a trade
    // that never comes home, so anything under the hold is one window too.
    every: Math.max(0, Math.round(m.every ?? 0)),
  };
}

/** Whether this wave has THE HANDOVER on it at all. */
export function handedWave(world: World): boolean {
  return handover(world) !== null;
}

/**
 * The trade this beat is in or next to: the beat it starts on, and the beat it
 * ends on.
 *
 * **One window, or one of many, and the arithmetic is the same either way.** A
 * wave that names `every` trades on `at`, `at + every`, `at + 2 * every` and so
 * on, and this answers the one the fault's own beat falls in or is coming up to
 * — so nothing downstream has to know which kind of wave it is on. Before the
 * first trade both kinds answer the first, which is what the countdown reads.
 *
 * `bounds` rather than the obvious name: `window` is banned in this package, and
 * rightly — the simulation is headless and the host drives the ticks
 * (`test/purity.test.ts`).
 */
function bounds(world: World): { from: number; to: number } {
  const held = handover(world);
  if (!held) return { from: 0, to: 0 };
  const { at, beats, every } = held;
  const step = faultStep(world);
  // A cycle only counts once it is longer than the hold: the panels have to be
  // home before they can be taken again.
  if (every <= beats || step < at) return { from: at, to: at + beats };
  const turns = Math.floor((step - at) / every);
  const from = at + turns * every;
  // Past the end of this one, the next is what is being counted down to.
  return step < from + beats
    ? { from, to: from + beats }
    : { from: from + every, to: from + every + beats };
}

/**
 * Whether the panels are traded **right now**.
 *
 * Counted in `faultStep`, the fault's own beat — zero on the wave's first beat
 * — so the number an author reads on the slider is the number of beats the pair
 * plays with its own hands first.
 */
export function handedOver(world: World): boolean {
  if (!handedWave(world)) return false;
  const step = faultStep(world);
  const { from, to } = bounds(world);
  return step >= from && step < to;
}

/** Beats until the trade, or 0 once it has happened. */
function handoverIn(world: World): number {
  if (!handedWave(world)) return 0;
  return Math.max(0, bounds(world).from - faultStep(world));
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

/** Beats until the panels come back, or 0 when they are not away. */
export function handoverLeft(world: World): number {
  if (!handedOver(world)) return 0;
  return Math.max(0, bounds(world).to - faultStep(world));
}
