import type { RepriseEntry } from "./boss-entries.js";
import type { SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * **THE REPRISE**: everything the wave sent again remembers between beats.
 *
 * The fight is a memory test. The wave falls as its author wrote it, both
 * seats watching; then the stretch that has just come down is **sent again
 * with nothing drawn**, the same kinds in the same columns at the same
 * spacing, and the pair has to ward from what they remember. The wave's own
 * arrivals stand still while an echo plays and take up again after it, so a
 * wave alternates seen stretch and unseen echo until the queue is spent
 * (`reprise.ts` is the whole of the clock; this file is what it writes).
 *
 * **The echo is derived and never appended to `world.queue`.** The queue is
 * the wave's script, and it is outside the fingerprint on purpose (`hash.ts`):
 * a boss that pushed entries into it would be a boss writing into the one
 * thing two devices never check they agree about. So what is kept here is a
 * pair of *cursors into the script* — where the stretch began, which entry the
 * echo owes next — and the bodies come back out of the queue by index.
 *
 * The seven integers are what cannot be derived. Everything else about the
 * fight is: which entries are in the running stretch is `from` against
 * `world.spawned`, the spacing is the entries' own authored beats, and the
 * wave clock the pair sees is `world.waveBeat` less `held`.
 */
export interface RepriseState {
  kind: "reprise";
  /** Beats of seen wave a stretch runs for before it is sent again. */
  every: number;
  /**
   * The seen beat the running stretch began on — wave beats less every beat
   * spent inside an echo, which is the clock the queue is read against.
   */
  since: number;
  /** The queue index the running stretch began at. */
  from: number;
  /**
   * The world beat the running echo began on, `-1` while the field is the
   * pair's own. It is the offset every echoed arrival is timed from, so it is
   * also the one number that says an echo is playing at all.
   */
  at: number;
  /** The queue index of the next body the echo owes; `from` at its start. */
  cursor: number;
  /** Bodies the running echo still owes, `0` while the field is seen. */
  left: number;
  /**
   * Beats the wave's own queue has spent held, over every echo so far. The
   * wave clock the queue is read against is `world.waveBeat - held`, so this
   * is what makes an echo *pause* the wave rather than play over it.
   */
  held: number;
}

/**
 * The stretch length, in seen beats: what the wave authored, or the
 * configuration's own when it authored nothing. It is also the beat the first
 * echo starts on, and the two are one number on purpose — the first stretch
 * runs from the wave's start, so how long a stretch is and when the first one
 * ends cannot be two different facts.
 */
export function repriseEvery(cfg: SimConfig, entry: RepriseEntry): number {
  return Math.max(1, entry.beat ?? cfg.repriseBeats);
}

/**
 * THE REPRISE takes the field as a mechanism, not as a body — the shape THE
 * VANE and THE MAZE already have. No creature, no row and no health: nothing
 * of it falls, can be warded or can be taken hold of, and the wave under it is
 * the wave its author wrote (`bossFillsWave` is false for it).
 */
export function installReprise(cfg: SimConfig, entry: RepriseEntry): RepriseState {
  return {
    kind: "reprise",
    every: repriseEvery(cfg, entry),
    since: 0,
    from: 0,
    at: -1,
    cursor: 0,
    left: 0,
    held: 0,
  };
}

/**
 * Beats the queue has spent held, for whatever boss is installed — `0` for
 * every other one, which is what lets `spawnArrivals` ask the question
 * unconditionally and know nothing about this fight.
 */
export function repriseHeld(world: World): number {
  const boss = world.boss;
  return boss !== null && boss.kind === "reprise" ? boss.held : 0;
}

/** Whether an echo is playing right now — the field the pair is looking at is
 * a field they cannot see. render/ asks it, and so does the count. */
export function repriseEchoing(world: World): boolean {
  const boss = world.boss;
  return boss !== null && boss.kind === "reprise" && boss.at >= 0;
}

/** Bodies the running echo still owes, `0` when none is playing. The number
 * the boss shows the pair, and the only thing it tells them. */
export function repriseLeft(world: World): number {
  const boss = world.boss;
  return boss !== null && boss.kind === "reprise" ? boss.left : 0;
}

/**
 * **Where the running stretch or echo stands**, for the measure the picture
 * draws along the top of the screen (the owner, 25 September 2026: *some
 * loading indicator … when the next invisible starts, and also when it's the
 * beats of invisible time*).
 *
 * Recording, `done` runs from nought on the beat a stretch starts to
 * `beats - 1` on the last beat before the dark; the echo opens on the next.
 * Echoing, it runs from nought on the beat the first body is sent to
 * `beats - 1` on the beat the last one is, which is the beat the field is
 * the pair's own again. `count` is the bodies recorded so far, or still owed.
 * Whole beats: render adds the drawn beat's phase.
 */
export interface RepriseClock {
  echo: boolean;
  beats: number;
  done: number;
  count: number;
}

export function repriseClock(world: World): RepriseClock | null {
  const boss = world.boss;
  if (boss === null || boss.kind !== "reprise") return null;
  if (boss.at < 0) {
    const done = world.waveBeat - boss.held - boss.since;
    return { echo: false, beats: boss.every, done, count: world.spawned - boss.from };
  }
  const base = world.queue[boss.from]?.beat ?? 0;
  const last = world.queue[boss.cursor + boss.left - 1]?.beat ?? base;
  return { echo: true, beats: last - base + 1, done: world.waveBeat - boss.at, count: boss.left };
}

/**
 * Every number two devices have to agree about. `every` is authored and is in
 * here for `mazeHashParts`' reason — two phones on two builds of `content`
 * would send the wave again at different beats, and nothing else in the
 * fingerprint would say a word about it. The rest is the fight: `held` decides
 * which arrivals the wave owes *this* beat, `at` and `cursor` decide which
 * body comes back and when, and `left` is the number the pair is playing off.
 * A device that disagreed about any of them would be a device warding a column
 * nothing is falling down.
 */
export function repriseHashParts(boss: RepriseState): number[] {
  return [boss.every, boss.since, boss.from, boss.at, boss.cursor, boss.left, boss.held];
}
