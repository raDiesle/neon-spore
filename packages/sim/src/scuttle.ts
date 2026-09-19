import type { SimConfig } from "./config.js";
import { midCol } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE SCUTTLE: a boss racing you to its own death.
 *
 * **The question no other boss asks** — *whether you can beat a clock that
 * is the boss's own body.* A frame of sockets hangs over the top of the
 * field, every socket holding a **part**, and on a cadence one part comes
 * **loose**: it hangs off the frame for the length of the cadence and is
 * then **thrown** down its column as an ordinary arrival — a rock, a slick, a
 * bulb, or a pod. The parts are its health and its ammunition at once, and
 * **when the last one is thrown the wave is lost**. To end it the pair must
 * strike a part off *while it hangs*, in its column and its colour, and
 * only one hanging part is **live** in a cycle: the pilot is shown what is
 * still attached, the navigator which of it counts and where the next
 * throw lands (`docs/spec/bosses-choreographed.md` §15; the split is the
 * look's, `render/view-role-clocks.ts`).
 *
 * From `scuttleTwinParts` left two come loose a cycle with one of them live;
 * from `scuttleFastParts` the cadence tightens to `scuttleFastBeats`, and
 * the live part is the attached one farthest from the last. A pod thrown and
 * taken slows the cadence by `scuttlePodSlackBeats` for the rest of the
 * fight. With one part left it does not throw: it **winds up** for
 * `lancePrimeBeats` and a beat of slack, and only the beam standing in that
 * column before the throw ends it; then the frame collapses over
 * `scuttleOutBeats`.
 *
 * **The one thing on it a hand takes hold of is a part already hanging.**
 * The pilot may carry one hanging part a column along the frame, once a
 * cycle, and it is then thrown down the column he put it in rather than its
 * socket's — a *place* he is buying, where every other handle in this game
 * buys time. He is the seat shown every socket and every hanging part,
 * uncoloured and unlocked (`showsScuttleCount`), so a thumb on one tells him
 * nothing about which is live: what it costs him is the thumb, which is off
 * the cannon and the shield while it is on the frame (`scuttle-hand.ts`).
 *
 * **It is otherwise a fixture and not a body** (`bossFillsWave`): nothing of
 * it is among the creatures, no hand takes hold of its slab, and every
 * arrival in its wave is a part it threw.
 *
 * The clock is `scuttle-step.ts`, the shot that leaves the top
 * `scuttle-shot.ts`, the fingerprint `scuttle-hash.ts`, the numbers
 * `config-scuttle.ts`. This file is the shape and the questions asked of it.
 */

/** What a part becomes when it is thrown: a rock for the shield, a body for the cannon, a pod for the maw. */
export type ScuttlePartKind = "rock" | "body" | "pod";

/** One part in one socket. */
export interface ScuttlePart {
  /** What it is thrown as. */
  kind: ScuttlePartKind;
  /** The colour a shot has to be to strike it off while it hangs — and the body's colour, if it is thrown as one. */
  color: Color;
}

/** Everything THE SCUTTLE remembers between beats. */
export interface ScuttleState {
  kind: "scuttle";
  /** One entry a socket, row-major over `scuttleRows` × `scuttleCols`; `null` once the part is gone, either way. */
  parts: (ScuttlePart | null)[];
  /** Sockets whose parts hang loose now, oldest first. Empty between throws. */
  loose: number[];
  /** The one loose socket a shot can strike; `-1` when none is. */
  live: number;
  /** The live socket of the cycle before, for the far-side rule; `-1` before the first. */
  lastLive: number;
  /** `world.beat` the current cycle began on: the look, or the detachment. */
  cycleBeat: number;
  /** Beats the taken pods have added to every cadence since. */
  slack: number;
  /** `world.beat` the wind-up began on; `-1` until the last part. */
  windBeat: number;
  /** `world.beat` the beam took the last part on; `-1` while it stands. */
  downBeat: number;
  /** The hanging socket the pilot's thumb is on; `-1` when none is. */
  held: number;
  /** The socket swung a column this cycle; `-1` until one is, and again at the next detachment. */
  swung: number;
  /** The column the swung part now hangs over and will be thrown down; `-1` when nothing is swung. */
  swungCol: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than five. */
export function scuttleBoss(world: World): ScuttleState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "scuttle" ? boss : null;
}

/** The leftmost column of the frame: centred on the middle of the field. */
export function scuttleLeftCol(cfg: SimConfig): number {
  return Math.max(0, midCol(cfg) - Math.floor(cfg.scuttleCols / 2));
}

/** The column socket `i` hangs over, and throws into. */
export function scuttleSocketCol(cfg: SimConfig, i: number): number {
  return Math.min(cfg.cols - 1, scuttleLeftCol(cfg) + (i % cfg.scuttleCols));
}

/** The row socket `i` is in, from the top of the frame. */
export function scuttleSocketRow(cfg: SimConfig, i: number): number {
  return Math.floor(i / cfg.scuttleCols);
}

/** Parts still in their sockets — the pilot's count, and the pair's time. */
export function scuttleLeft(s: ScuttleState): number {
  let n = 0;
  for (const p of s.parts) if (p !== null) n += 1;
  return n;
}

/** The sockets still holding a part that is not hanging loose. */
export function scuttleAttached(s: ScuttleState): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.parts.length; i++) {
    if (s.parts[i] !== null && !s.loose.includes(i)) out.push(i);
  }
  return out;
}

/** Whether it is winding up for the last throw. */
export function scuttleWinding(s: ScuttleState): boolean {
  return s.windBeat >= 0 && s.downBeat < 0;
}

/** Whether a part hangs loose and can be shot: the live socket, while it is not winding up. */
export function scuttleShootable(s: ScuttleState): boolean {
  return s.live >= 0 && !scuttleWinding(s) && s.downBeat < 0;
}

/** Whether it has thinned enough to throw at the fast cadence. */
export function scuttleFast(s: ScuttleState, cfg: SimConfig): boolean {
  return scuttleLeft(s) <= cfg.scuttleFastParts;
}

/** Whether two parts come loose a cycle now. */
export function scuttleTwins(s: ScuttleState, cfg: SimConfig): boolean {
  return scuttleLeft(s) <= cfg.scuttleTwinParts;
}

/** Beats from a detachment to the throw, now: the cadence, and the window. */
export function scuttleCadence(s: ScuttleState, cfg: SimConfig): number {
  return (scuttleFast(s, cfg) ? cfg.scuttleFastBeats : cfg.scuttleThrowBeats) + s.slack;
}

/** Beats the wind-up takes: what the lance takes to fill, and the slack that makes a fill started on the wind-up's own beat land. */
export function scuttleWindBeats(cfg: SimConfig): number {
  return cfg.lancePrimeBeats + cfg.scuttleWindSlackBeats;
}

/** The beat the loose parts are thrown on, or the last one is; `-1` when nothing hangs. */
export function scuttleThrowBeat(s: ScuttleState, cfg: SimConfig): number {
  if (scuttleWinding(s)) return s.windBeat + scuttleWindBeats(cfg);
  if (s.loose.length === 0) return -1;
  return s.cycleBeat + scuttleCadence(s, cfg);
}

/** The column the next throw lands in — the live socket's, or the oldest loose one's; `-1` when nothing hangs. */
export function scuttleNextCol(s: ScuttleState, cfg: SimConfig): number {
  const i = s.live >= 0 ? s.live : (s.loose[0] ?? -1);
  return i < 0 ? -1 : scuttlePartCol(s, cfg, i);
}

/**
 * The column part `i` hangs over, and is thrown down: its socket's, or the
 * one the pilot swung it to this cycle.
 *
 * **Everything that reads a hanging part's column reads it here** — the
 * throw, the lock on the next column, the bolt that strikes it off — because
 * a swing that moved the throw without moving the bolt, or the lock without
 * the throw, would be two frames disagreeing about where a part is. A socket
 * that is not the swung one is still exactly its own column, so the whole of
 * the swing is one part, one cycle.
 */
export function scuttlePartCol(s: ScuttleState, cfg: SimConfig, i: number): number {
  return s.swung === i && s.swungCol >= 0 ? s.swungCol : scuttleSocketCol(cfg, i);
}

/**
 * Whether a hanging part may still be taken hold of and swung: **one a
 * cycle**, and never while the frame winds up.
 *
 * One a cycle because the gesture is a decision and not a steering wheel: a
 * thumb that could keep pushing would walk a part the width of the frame and
 * the cadence would stop being the clock. Never on the wind-up because the
 * last part is not thrown at all — it is burned where it stands, and a
 * column the pilot could move under the navigator's beam would make the one
 * moment this fight ends on a moving target (`scuttle-shot.ts`).
 */
export function scuttleSwingable(s: ScuttleState): boolean {
  return s.swung < 0 && s.downBeat < 0 && !scuttleWinding(s) && s.loose.length > 0;
}

/** The column part `i` swung `dir` would hang over: one column, and never off the frame. */
export function scuttleSwingCol(s: ScuttleState, cfg: SimConfig, i: number, dir: 1 | -1): number {
  const left = scuttleLeftCol(cfg);
  const right = Math.min(cfg.cols - 1, left + cfg.scuttleCols - 1);
  return Math.max(left, Math.min(right, scuttlePartCol(s, cfg, i) + dir));
}

/**
 * A new cycle: nothing is held and nothing is swung.
 *
 * The one-a-cycle rule of `scuttleSwingable` is this line and nothing else,
 * so the two beats that begin a cycle — the detachment and the wind-up —
 * each say it once rather than every reader of the state working out when a
 * swing expires (`scuttle-step.ts`). The thumb is let go with it: the part it
 * was on is in the air or gone, and a `held` that outlived its part would
 * draw a ring on a socket nothing hangs from.
 */
export function scuttleClearSwing(s: ScuttleState): void {
  s.held = -1;
  s.swung = -1;
  s.swungCol = -1;
}
