import type { Point } from "@neon-spore/content";
import { paintGooTrack } from "./goo-track.js";
import { PULL_SIZE } from "./pull-knob.js";
import type { PullWay } from "./pull-line.js";
import { pullMemoryOf } from "./pull-memory.js";

/**
 * **A pull is drawn as the way the hand goes, and a big circle where it
 * starts.** The one look every handle you pull wears — the owner's rule,
 * written for every boss and every wave in `.claude/skills/new-boss/generic.md`
 * and `.claude/skills/new-creature/SKILL.md`.
 *
 * THE INSTAR's swipe learnt it first (`instar-track.ts`): *instead of a circle
 * for swiping in a direction it should be visual like … a slider*. On 25
 * September 2026 the owner asked the same of the handles you pull, and then
 * refined it the same morning, generic:
 *
 * - **The channel is quiet and thin** — it says where the pull can go, it is
 *   not the control. It runs the whole of the travel, from where the hand
 *   takes hold to where the pull is full, and fills **green** behind the hand.
 * - **The circle to start is big and loud** (`drawPullKnob`, `pull-knob.ts`): it is the one
 *   thing to put a thumb on, it breathes until it is taken, and it is the
 *   handle's radius, never shrunk to the channel's width.
 * - **A press is answered well outside that circle** (`PULL_GRAB`), because a
 *   handle that is also moving is hard to catch.
 * - **A turn goes the whole way round** (`closed`): THE MAZE's wheel turns
 *   without end, so its channel is a closed ring round the drum, hugging it,
 *   and the fill wraps.
 *
 * The spine is any polyline: THE WARDEN's is straight, THE MAZE's is a
 * circle. `origin` is where along it the hand takes hold and `at` is where the
 * hand is now; on an open track both are fractions in [0, 1], on a closed one
 * `at` may run past either end, a whole number of laps being a full ring.
 */

export interface PullTrack {
  /** From one end of the travel to the other, in field pixels. A closed one repeats its first point last. */
  readonly pts: readonly Point[];
  /** The channel's half-width. */
  readonly w: number;
  /** A loop with no ends: the fill wraps, and chevrons run a stretch rather than to an end. */
  readonly closed?: boolean;
}

export interface PullTrackDraw {
  /** The control's own colour, and its lit rim. */
  readonly hex: string;
  readonly rim: string;
  readonly held: boolean;
  /** Where the hand takes hold, and where it is now: fractions of the length. */
  readonly origin: number;
  readonly at: number;
  readonly time: number;
  /** What the last lift came to and how many seconds ago, while it is shown,
   * and how far off the path the hand has the knob, in field pixels. FIZZ
   * (`goo-track.ts`) plays its count, its refusal and a fresh drop coming in
   * from these: the PULL LAB fills them itself, and in the game `key` has
   * `PullMemory` fill them. */
  readonly after?: PullAfter;
  /** Which handle this is, the same string every frame, for `PullMemory` to fill `after`
   * when the caller does not (`pull-memory.ts`); with none, nothing is remembered. */
  readonly key?: string;
  /** The caller's own word that this pull has counted, read off its boss's state. */
  readonly counted?: boolean;
}

export interface PullAfter {
  readonly verdict: "counted" | "refused" | null;
  readonly since: number;
  readonly off: Point;
  /** How far either side of the path the hand may take the knob before the
   * pull fails, in field pixels; absent where a thumb off it is free. */
  readonly reach?: number;
  /** Seconds since the verdict, on a clock the lift does not restart. */
  readonly age?: number;
  /** Seconds the knob has rested at its start since it last came home. */
  readonly rested?: number;
  /** The last verdict given, kept after it stops being shown, until the next press. */
  readonly last?: "counted" | "refused" | null;
  /** Where the knob was when that verdict was given: along the track, and off it. */
  readonly from?: { readonly at: number; readonly off: Point };
  /** Seconds since the last lift. */
  readonly lifted?: number;
  /** Seconds since the knob was last taken. */
  readonly grabbed?: number;
  /** Seconds since the knob was first put on the field. */
  readonly born?: number;
  /** How much a two-way pull's arrow is still two arrows, 1 at its start and 0 once
   * pulled a way — for a look that parts them rather than drawing two heads. */
  readonly split?: number;
}

/** The channel's half-width, as a share of the knob's radius: thin, so the knob is the control. */
export const PULL_TRACK_W = 0.28;

/** The spine's running length at each point. */
export function pullTrackLengths(pts: readonly Point[]): number[] {
  const out = [0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1] as Point;
    const b = pts[i] as Point;
    out.push((out[i - 1] as number) + Math.hypot(b.x - a.x, b.y - a.y));
  }
  return out;
}

/** The point `k` of the way along, and the way the spine is heading there. */
export function pullTrackPoint(
  t: PullTrack,
  k: number,
): { x: number; y: number; dx: number; dy: number } {
  const run = pullTrackLengths(t.pts);
  const total = run[run.length - 1] ?? 0;
  const lap = t.closed ? k - Math.floor(k) : Math.max(0, Math.min(1, k));
  const want = lap * total;
  let i = 1;
  while (i < t.pts.length - 1 && (run[i] as number) < want) i++;
  const a = t.pts[i - 1] as Point;
  const b = t.pts[i] ?? a;
  const seg = (run[i] as number) - (run[i - 1] as number) || 1;
  const u = (want - (run[i - 1] as number)) / seg;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    dx: (b.x - a.x) / len,
    dy: (b.y - a.y) / len,
  };
}

/**
 * **Which way the hand goes from `at`**, for the arrow in the knob
 * (`drawPullKnob`): along the spine, towards the end the pull is full at —
 * `1` for a pull that fills as `at` grows, `0` for one that fills as it falls.
 */
export function pullWay(t: PullTrack, at: number, toward: 0 | 1): PullWay {
  const q = pullTrackPoint(t, at);
  const sign = toward === 1 ? 1 : -1;
  return { dx: q.dx * sign, dy: q.dy * sign };
}

/** The channel, the green behind the hand, and the chevrons ahead of it, at
 * `PULL_SIZE` times the width it is asked for — through `PULL_TRACK`, the way `drawPullKnob` reaches its knob. */
export function drawPullTrack(
  ctx: CanvasRenderingContext2D,
  asked: PullTrack,
  o: PullTrackDraw,
): void {
  // As wide as the knob is drawn big (`PULL_SIZE`).
  const t = { ...asked, w: asked.w * PULL_SIZE };
  const memory = o.key === undefined || o.after ? undefined : pullMemoryOf(ctx);
  if (memory === undefined || o.key === undefined) {
    PULL_TRACK.paint(ctx, t, o);
    return;
  }
  // A closed channel is still the thin ring and plays no ending, so it is given none.
  const open = t.closed !== true;
  const after = memory.observe({
    key: o.key,
    held: o.held,
    origin: o.origin,
    at: open ? o.at : undefined,
    counted: open && o.counted,
  });
  memory.keepTrack(o.key, t, o, ctx.getTransform());
  PULL_TRACK.paint(ctx, t, { ...o, after });
}

/** What `drawPullTrack` draws with: the PULL LAB's FIZZ channel (`goo-track.ts`) — the
 * thin one (`pull-track-thin.ts`) on a closed track, a turn — unless something holds another in its place
 * for a frame. Called through rather than named: `goo-track.ts` imports this file, and
 * where it is loaded first, Bun's dev bundle has no `paintGooTrack` yet when this record
 * is made — the director failed to open on exactly that, 12 October 2026. */
export const PULL_TRACK: {
  paint: (ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw) => void;
} = { paint: (ctx, t, o) => paintGooTrack(ctx, t, o) };
