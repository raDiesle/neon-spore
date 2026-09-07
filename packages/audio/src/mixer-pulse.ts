import {
  PULSE_LANES,
  type PulseState,
  pulseCurrent,
  pulseNoteTick,
  type World,
} from "@neon-spore/sim";
import type { Memory } from "./memory.js";

/**
 * THE PULSE's song, played off the simulation's own clock.
 *
 * **This file is the music.** There is no theme, no player and no recording:
 * the chart *is* the piece, and every voice in it is fired by comparing this
 * frame's world to the last one's, which is the same mechanism the click track
 * has used since the game had one. The owner chose it over a backing theme,
 * and the reason is drift — `MusicPlayer` schedules against the browser's
 * audio clock while the arrows fall on the tick clock, and a minute of that on
 * a slow phone is a song that has walked away from its own chart.
 *
 * **What it plays, in three layers.** A kick on every beat and a thin tick on
 * the two steps between (three to a beat is the grid, `config-pulse.ts`); a
 * sub on the first and the middle of each bar; and the arrow's own lane voice
 * at the moment it crosses the line, whether anybody hit it or not — because
 * the song is the chart and a missed note is still a note in the tune.
 *
 * **And two things that are about the pair rather than the piece**: a bright
 * ring over a clean hit, and a scrape when either of them misses. Those are
 * per seat and they are how one player hears that the other has come off,
 * which is the thing the owner asked for first.
 *
 * It is beside `mixer-boss.ts` rather than in it for that file's own reason:
 * it was at its length, and everything here is one subject.
 */

/** The mixer's own `play`, handed over so nothing here needs an engine. */
export type Play = (id: string, pan?: number) => void;

/** Where in the stereo field each lane sits, left to right. */
const LANE_PAN = [-0.5, -0.17, 0.17, 0.5];
const LANE_SOUND = ["boss.pulseLeft", "boss.pulseDown", "boss.pulseUp", "boss.pulseRight"];

export function soundPulse(world: World, first: boolean, m: Memory, play: Play): void {
  const boss = world.boss;
  if (boss === null || boss.kind !== "pulse") {
    m.pulseStep = -1;
    m.pulseSung = 0;
    m.pulseWarned = 0;
    m.pulseLast1 = -1;
    m.pulseLast2 = -1;
    m.pulsePhase = "";
    return;
  }
  if (boss.phase !== m.pulsePhase) {
    if (!first && boss.phase === "verdict")
      play(boss.passed ? "boss.pulseClear" : "boss.pulseFlat");
    // A stage reloads its chart, so both cursors go back with it.
    if (boss.phase === "count") {
      m.pulseStep = -1;
      m.pulseSung = 0;
      m.pulseWarned = 0;
    }
    m.pulsePhase = boss.phase;
  }
  if (first) {
    m.pulseStep = stepAt(world, boss);
    m.pulseSung = boss.notes.length;
    m.pulseWarned = boss.notes.length;
    m.pulseLast1 = boss.lastTick1;
    m.pulseLast2 = boss.lastTick2;
    return;
  }
  if (boss.phase === "play" || boss.phase === "count") {
    bed(world, boss, m, play);
    arrows(world, boss, m, play);
  }
  judgements(boss, m, play);
}

/** Which step of the grid the world is on. Negative through the count-in. */
function stepAt(world: World, boss: PulseState): number {
  return Math.floor((world.tick - boss.startTick) / world.cfg.pulseStepTicks);
}

/**
 * The kick, the tick and the sub — everything that is the grid rather than the
 * chart. Silent before step 0 and after the last one, so the count-in and the
 * verdict are not played over.
 */
function bed(world: World, boss: PulseState, m: Memory, play: Play): void {
  const now = stepAt(world, boss);
  const last = pulseCurrent(boss).steps;
  for (let step = Math.max(m.pulseStep + 1, 0); step <= now; step++) {
    if (step >= last) break;
    // Three steps to a beat: the first is the floor, the other two the shuffle.
    if (step % 3 === 0) play("boss.pulseKick");
    else play("boss.pulseHat", step % 3 === 1 ? -0.3 : 0.3);
    // A bar is four beats, so twelve steps; the sub walks on its first and its
    // middle, which is the slowest thing in the piece and the only one a
    // listener could hum.
    if (step % 12 === 0 || step % 12 === 6) play("boss.pulseBass");
  }
  m.pulseStep = Math.max(m.pulseStep, now);
}

/**
 * The chart itself: each arrow's lane voice as it crosses the line, and a
 * swallowed warning tone the moment a veiled one *enters* the top.
 *
 * The warning is on both devices rather than only on the blind seat's, and
 * that is deliberate: the pair are being told a call is coming, and the seat
 * who has to make it needs the warning as much as the seat who cannot see.
 */
function arrows(world: World, boss: PulseState, m: Memory, play: Play): void {
  const cfg = world.cfg;
  while (m.pulseWarned < boss.notes.length) {
    const note = boss.notes[m.pulseWarned];
    if (note === undefined) break;
    if (pulseNoteTick(cfg, boss.startTick, note) - cfg.pulseLeadTicks > world.tick) break;
    if (note.veil !== undefined) play("boss.pulseVeil");
    m.pulseWarned += 1;
  }
  while (m.pulseSung < boss.notes.length) {
    const note = boss.notes[m.pulseSung];
    if (note === undefined) break;
    if (pulseNoteTick(cfg, boss.startTick, note) > world.tick) break;
    const lane = PULSE_LANES.indexOf(note.lane);
    const id = LANE_SOUND[lane];
    if (id !== undefined) play(id, LANE_PAN[lane]);
    m.pulseSung += 1;
  }
}

/**
 * What each seat just did. Two seats, one loop, because the whole point of
 * these two sounds is that a player hears the *other* one come off — a version
 * that only sounded this device's own presses would be the round with its
 * subject removed.
 */
function judgements(boss: PulseState, m: Memory, play: Play): void {
  for (const seat of [1, 2] as const) {
    const at = seat === 1 ? boss.lastTick1 : boss.lastTick2;
    const was = seat === 1 ? m.pulseLast1 : m.pulseLast2;
    if (at < 0 || at === was) continue;
    const judge = seat === 1 ? boss.last1 : boss.last2;
    const pan = seat === 1 ? -0.35 : 0.35;
    if (judge === 1) play("boss.pulseHit", pan);
    if (judge === 3 || judge === 4) play("boss.pulseMiss", pan);
    if (seat === 1) m.pulseLast1 = at;
    else m.pulseLast2 = at;
  }
}
