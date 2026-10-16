import { WAVES } from "@neon-spore/content";
import {
  type Command,
  type Creature,
  fallTilesPerBeat,
  framePhase,
  guardWindowTicks,
  isWardable,
  type SpawnEntry,
  shieldRow,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { fresh, rock } from "./pose-kit.js";

/**
 * **THE SHIELD LAB's run, without a canvas** (`shield-lab-scene.ts` draws
 * it): THE ROCK with five rocks queued, stepped by the real simulation,
 * AUTO's two hands, and which rock is the first of its kind.
 *
 * Two of the five are a kind already met, so FIRST OF A KIND has a second
 * meteor to stay quiet on. The field starts over once the last is gone.
 */

/**
 * The rocks, in the order they fall: a second meteor and a third, to be met
 * without the moment. Spaced by when each **arrives**, not when it is
 * queued — a faster tier overtakes, and two rocks reaching the dome on one
 * beat in two columns is a pair no hands can save.
 */
export const ROCKS: readonly SpawnEntry[] = [
  rock(3, "meteor", 0),
  rock(8, "meteor", 10),
  rock(5, "meteorMedium", 24),
  rock(2, "meteor", 28),
  rock(7, "meteorFast", 44),
];

/** How far ahead, in beats, AUTO's navigator starts sliding — late, so the off-column state is seen. */
const SLIDE_AHEAD = 4.5;
/** Ticks between AUTO's navigator stepping one column. */
const SLIDE_TICKS = 10;
/** How far into the guard window AUTO's pilot presses, as a share of it. */
const PRESS_AT = 0.45;
/** Beats the empty field rests before it starts over, so the last rock's turn is seen. */
const REST_BEATS = 2;

function theRock(): number {
  const i = WAVES.findIndex((w) => w.id === "theRock");
  if (i < 0) throw new Error("THE ROCK is not in WAVES");
  return i;
}

/** The lowest rock the shield has still to answer, or null. */
export function askedBody(w: World): Creature | null {
  const row = shieldRow(w.cfg);
  let best: Creature | null = null;
  for (const c of w.creatures) {
    if (!isWardable(c.kind) || c.row >= row) continue;
    if (!best || c.row > best.row) best = c;
  }
  return best;
}

/** Beats until `c` reaches the shield's row: whole beats of fall, less the one under way. */
export function beatsLeft(w: World, c: Creature): number {
  const fall = Math.max(1, fallTilesPerBeat(c.kind));
  const beats = Math.ceil((shieldRow(w.cfg) - c.row) / fall);
  return Math.max(0, beats - framePhase(w));
}

/** The guard window, in beats: a press this close to the moment turns the rock. */
export const windowBeats = (w: World): number => guardWindowTicks(w.cfg) / ticksPerBeat(w.cfg);

export class ShieldRun {
  readonly wave = theRock();
  world: World = this.build();
  /** How many times the field has started over. */
  restarts = 0;
  /** The first id of each kind met on this run — decided the tick a body appears. */
  private firsts = new Map<string, number>();
  /** The id AUTO's pilot has already pressed for. */
  private pressedFor = 0;
  private sinceSlide = 0;
  /** The tick the field fell empty for good, or -1 while a rock is still to come. */
  private emptySince = -1;
  /** Commands from a hand, sent on the next tick. */
  private queued: Command[] = [];

  private build(): World {
    return fresh([...ROCKS], [], null, {}, this.wave);
  }

  restart(): void {
    this.world = this.build();
    this.restarts += 1;
    this.firsts.clear();
    this.pressedFor = 0;
    this.emptySince = -1;
    this.queued = [];
  }

  /** Whether `c` is the first of its kind on this run. */
  first(c: Creature): boolean {
    return this.firsts.get(c.kind) === c.id;
  }

  /** A hand's command, from the seat that owns it: SHIELD is player 1's, the strip player 2's. */
  send(command: Command): void {
    this.queued.push(command);
  }

  /** One tick of the field, with AUTO's two hands on it when `auto`. */
  tick(auto: boolean): void {
    const w = this.world;
    const cmds: TimedCommand[] = this.queued.map((command) => ({
      tick: w.tick,
      player: command.kind === "guard" ? 1 : 2,
      command,
    }));
    this.queued = [];
    if (auto) cmds.push(...this.autoHands());
    step(w, cmds);
    for (const c of w.creatures)
      if (isWardable(c.kind) && !this.firsts.has(c.kind)) this.firsts.set(c.kind, c.id);
    const done = w.creatures.length === 0 && w.spawned >= w.queue.length;
    if (!done) return;
    if (this.emptySince < 0) this.emptySince = w.tick;
    if (w.tick - this.emptySince >= REST_BEATS * ticksPerBeat(w.cfg)) this.restart();
  }

  /** AUTO: the navigator slides late, a column at a time; the pilot presses inside the window. */
  private autoHands(): TimedCommand[] {
    const w = this.world;
    const c = askedBody(w);
    if (!c) return [];
    const out: TimedCommand[] = [];
    const left = beatsLeft(w, c);
    this.sinceSlide += 1;
    if (left <= SLIDE_AHEAD && w.shieldCol !== c.col && this.sinceSlide >= SLIDE_TICKS) {
      this.sinceSlide = 0;
      const col = w.shieldCol + Math.sign(c.col - w.shieldCol);
      out.push({ tick: w.tick, player: 2, command: { kind: "shieldCol", col } });
    }
    if (this.pressedFor !== c.id && left <= windowBeats(w) * PRESS_AT) {
      this.pressedFor = c.id;
      out.push({ tick: w.tick, player: 1, command: { kind: "guard" } });
    }
    return out;
  }
}
