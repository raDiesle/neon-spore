import { FULL } from "./goo-ooze.js";
import { paintGooTrack } from "./goo-track.js";
import type { PullAfter, PullTrack, PullTrackDraw } from "./pull-track.js";

/**
 * **What a pull handle has just been through**, kept across frames so FIZZ
 * (`goo-knob.ts`, `goo-track.ts`) can play in the game what it plays in the
 * PULL LAB: the drop coming in when a handle appears, the squish when it is
 * taken, the slurp home when it is let go short, and the fizz when it counts.
 * The lab's rule fills `PullAfter` itself (`tools/director/src/pull-lab-rule.ts`);
 * in the game nothing did, so a knob only waited and was held.
 *
 * A handle is remembered by the `key` its caller passes to `drawPullTrack` or
 * `drawPullKnob`, and only then. **Only the caller knows when its pull has
 * counted** — some count the moment the cord is taut, some after it is held
 * taut a while, some on the lift — so a count is the caller's `counted`, read
 * off its own boss's state, or the boss's own event (`pull-counts.ts`), and
 * never guessed here from how far the hand has gone. A short lift is a hand let go part way **short of the end, whose knob the boss
 * then sends home** within `GOING_HOME`: shown going home from where it was let go. A
 * knob the boss keeps where it was let go (a winch, a wound spring) gave no
 * verdict, and nothing is played.
 *
 * Seconds of the renderer's own clock (`ViewState.time`), set once a frame by
 * `watchPulls`. It belongs to `Effects` and is emptied by its `reset()`.
 */

/** Seconds a handle not drawn is still remembered: back within this, it is the same handle. */
const FORGET = 2;
/** Seconds a verdict waits for its knob to come home before the knob is shown wherever
 * the boss has it — a handle that never springs back must not stay hidden. */
const HOME_WAIT = 2;
/** Seconds since anything, for a clock that has not started: long ago. */
const LONG_AGO = 60;
/** How far along a short lift must have gone to be shown going home, as the lab's. */
const SHORT = 0.04;
/** Seconds after a short let-go its knob has to be back home for it to be a refusal. */
const GOING_HOME = 0.25;
/** Seconds a count's fizz lasts (`goo-moment.ts`'s `ENDING`), drawn here once its handle is gone. */
const ENDING = 0.75;

interface Seen {
  born: number;
  held: boolean;
  grabbedAt: number | null;
  liftedAt: number | null;
  at: number | null;
  origin: number;
  countedNow: boolean;
  last: "counted" | "refused" | null;
  verdictAt: number;
  from: number;
  restedSince: number | null;
  /** A short let-go waiting to see the knob go home: where, and when. */
  pending: { at: number; since: number } | null;
  /** The frame it was last drawn on, and the channel it was drawn in then, for a fizz
   * to finish after the boss has stopped drawing it. */
  frame: number;
  seenAt: number;
  track: { t: PullTrack; o: PullTrackDraw; m: DOMMatrix } | null;
}

/** One handle as a caller draws it this frame. */
export interface PullObserved {
  readonly key: string;
  readonly held: boolean;
  /** Along its channel, when the call is the channel's. */
  readonly at?: number;
  readonly origin?: number;
  /** The caller's own word that this pull has counted, on every frame it stands counted. */
  readonly counted?: boolean;
}

export class PullMemory {
  private readonly seen = new Map<string, Seen>();
  /** Handles whose boss said this frame that they counted (`count`). */
  private readonly asked = new Set<string>();
  private now = 0;
  private frameNo = 0;

  /** The clock for this frame; called once a frame, before anything is drawn. */
  frame(now: number): void {
    this.now = now;
    this.frameNo++;
  }

  /** Note a handle drawn this frame, and what it has been through, for FIZZ. */
  observe(p: PullObserved): PullAfter {
    const now = this.now;
    let s = this.seen.get(p.key);
    if (s === undefined) {
      // On the first frame drawn, a handle was already there; after it, it came in.
      const born = this.frameNo <= 1 ? now - LONG_AGO : now;
      s = fresh(born, p);
      this.seen.set(p.key, s);
    }
    // Where the hand had the knob before this frame: the boss may send it home on the
    // very tick the hand lets go.
    const was = s.at;
    // Counted where the hand had it, before the boss put the knob anywhere else.
    if (this.asked.delete(p.key)) this.give(s, "counted");
    if (p.at !== undefined) s.at = p.at;
    if (p.origin !== undefined) s.origin = p.origin;
    if (p.held !== s.held) {
      if (p.held) {
        s.grabbedAt = now;
        s.last = null;
        s.pending = null;
      } else {
        s.liftedAt = now;
        const gone = was === null ? 0 : Math.abs(was - s.origin);
        if (s.last !== "counted" && gone > SHORT && gone < FULL)
          s.pending = { at: was ?? s.origin, since: now };
      }
      s.held = p.held;
    }
    const home = s.at === null || Math.abs(s.at - s.origin) < 0.01;
    if (s.pending !== null) {
      if (home) this.give(s, "refused", s.pending);
      if (home || now - s.pending.since > GOING_HOME) s.pending = null;
    }
    if (p.counted === true && !s.countedNow) this.give(s, "counted");
    s.countedNow = p.counted === true;
    if (home && !p.held) s.restedSince ??= now;
    else s.restedSince = null;
    s.frame = this.frameNo;
    s.seenAt = now;
    return this.afterOf(s);
  }

  /** The boss counted this handle's pull (`pull-counts.ts`): given on the frame it is next
   * drawn, or, if it is not drawn again, finished where it was. */
  count(key: string): void {
    this.asked.add(key);
  }

  /** Keep the channel a handle was drawn in, so its fizz can finish without it. */
  keepTrack(key: string, t: PullTrack, o: PullTrackDraw, m: DOMMatrix): void {
    const s = this.seen.get(key);
    if (s) s.track = { t, o, m };
  }

  /**
   * After every handle is drawn: finish the fizz of any that counted and was not
   * drawn this frame — the boss moved on the moment it counted — and forget the
   * handles gone a while.
   */
  endFrame(ctx: CanvasRenderingContext2D): void {
    for (const [key, s] of this.seen) {
      if (s.frame === this.frameNo) continue;
      if (this.asked.has(key)) this.give(s, "counted");
      if (this.now - s.seenAt > FORGET) {
        this.seen.delete(key);
        continue;
      }
      if (s.last !== "counted" || this.now - s.verdictAt > ENDING || s.track === null) continue;
      const { t, o, m } = s.track;
      ctx.save();
      ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
      paintGooTrack(ctx, t, { ...o, held: false, after: this.afterOf(s) });
      ctx.restore();
    }
    this.asked.clear();
  }

  clear(): void {
    this.seen.clear();
    this.asked.clear();
    this.frameNo = 0;
  }

  private give(s: Seen, verdict: "counted" | "refused", short?: Seen["pending"]): void {
    s.last = verdict;
    s.verdictAt = short?.since ?? this.now;
    s.from = short?.at ?? s.at ?? s.origin;
    s.pending = null;
  }

  private afterOf(s: Seen): PullAfter {
    const now = this.now;
    const age = now - s.verdictAt;
    const waited = s.last !== null && age > HOME_WAIT;
    const rested = s.restedSince !== null ? now - s.restedSince : waited ? HOME_WAIT : 0;
    return {
      verdict: s.last,
      since: age,
      off: { x: 0, y: 0 },
      age,
      rested,
      last: s.last,
      from: { at: s.from, off: { x: 0, y: 0 } },
      lifted: s.liftedAt === null ? LONG_AGO : now - s.liftedAt,
      grabbed: s.grabbedAt === null ? LONG_AGO : now - s.grabbedAt,
      born: now - s.born,
    };
  }
}

function fresh(born: number, p: PullObserved): Seen {
  return {
    born,
    held: p.held,
    grabbedAt: null,
    liftedAt: null,
    at: p.at ?? null,
    origin: p.origin ?? 0,
    countedNow: p.counted === true,
    last: null,
    verdictAt: born - LONG_AGO,
    from: p.origin ?? 0,
    restedSince: null,
    pending: null,
    frame: 0,
    seenAt: born,
    track: null,
  };
}

/** The memory the frame being drawn on `ctx` keeps, set by `watchPulls`. */
const watched = new WeakMap<CanvasRenderingContext2D, PullMemory>();

/** Once a frame, before the field: handles drawn on `ctx` are remembered in `memory`. */
export function watchPulls(ctx: CanvasRenderingContext2D, memory: PullMemory, now: number): void {
  memory.frame(now);
  watched.set(ctx, memory);
}

/** The memory handles drawn on `ctx` this frame go to, if a renderer is watching. */
export function pullMemoryOf(ctx: CanvasRenderingContext2D): PullMemory | undefined {
  return watched.get(ctx);
}
