import type { Creature, SimEvent } from "@neon-spore/sim";
import { drawnCol, drawnRow } from "./depth.js";
import { smoothstep } from "./ease.js";

/**
 * THE RECOIL's knock-back as a **throw**: one beat long from the instant of
 * the hit, starting where the body was drawn on that frame, rising fast,
 * slowing at the top and coming down into its fall.
 *
 * **Why the simulation's own glide is not enough.** A bounce happens mid-tick
 * at whatever phase of the beat the bolt arrived on, and the simulation
 * writes it the way it writes every move: `fromRow`/`fromCol` where it was,
 * `row`/`col` where it lands, and the picture glides between the two over
 * *the rest of the beat* (`drawnRow`, `drawnCol`). Two things follow, and the
 * owner saw both. The body was being drawn partway down its fall, and the
 * new glide starts from the tile's centre, so on the frame of the hit it
 * jumps — the later in the beat the shot lands, the further. And a bounce
 * struck at nine tenths of a beat crosses two rows and a lane in the tenth
 * that is left, then turns on its heel at the beat line and falls at one row
 * a beat: a jump, not a throw. Nothing about the *rules* is wrong — the body
 * is on the row and in the column the shot is judged against — only the
 * motion, so the fix is here and touches no integer.
 *
 * **The throw is one beat, whatever phase it began on.** It leaves from the
 * point the body was last drawn at, so the frame of the hit shows no jump;
 * it follows a parabola in rows whose end *velocity* is the fall's own, one
 * row a beat downward, so the body comes off the arc into its fall without a
 * corner; and it slides across the lane with the speed all spent at the
 * start, the way anything shoved sideways does. Where it ends is where the
 * simulation will have the body when the beat is up — the landing row plus
 * the part of a row it has fallen since — and the last fifth of the arc is
 * blended onto the simulation's own place, so a world that did something
 * else in the meantime cannot leave the picture a hair off. The colour turns
 * over along the same arc, which is what `Body.turn` carries: `recoilTurn`
 * in the simulation is that clock read off the beat, and this one supersedes
 * it only while a throw is in the air.
 *
 * Kept in `Effects` and cleared on restart, because it outlives a frame: the
 * point a throw left from is the one thing about it that cannot be re-read
 * off the world.
 */

/** How long the throw takes, in beats. One: the body is where the simulation
 * says by the next beat line after the beat it was struck in, which is the
 * soonest the pair can have re-aimed anyway. */
const LEAP_BEATS = 1;
/** The last share of the arc that is blended onto the simulation's place. */
const SETTLE = 0.2;

interface Leap {
  /** Where it left from, in rows and columns, fractional. */
  row0: number;
  col0: number;
  /** Where the simulation put it. */
  toRow: number;
  toCol: number;
  age: number;
  life: number;
  /** The phase of the beat the shot landed on, read on the first frame drawn
   * and unknown before it: `ingest` sees no clock. */
  phase0: number;
}

export interface Placed {
  row: number;
  col: number;
  /** How far the colour has turned, 0 to 1 — `turnedTrio`'s argument. */
  turn: number;
}

export class RecoilLeapFx {
  private live = new Map<number, Leap>();
  /** Where every recoil was drawn on the last frame, by id — the point the
   * next throw leaves from. */
  private last = new Map<number, { row: number; col: number }>();

  ingest(events: readonly SimEvent[], beatSeconds: number): void {
    for (const e of events) {
      if (e.type !== "recoilBounce") continue;
      // A body struck before it was ever drawn leaves from the struck tile.
      const from = this.last.get(e.id) ?? { row: e.row, col: e.col };
      this.live.set(e.id, {
        row0: from.row,
        col0: from.col,
        toRow: e.toRow,
        toCol: e.toCol,
        age: 0,
        life: LEAP_BEATS * beatSeconds,
        phase0: Number.NaN,
      });
    }
  }

  update(dt: number): void {
    for (const [id, fx] of this.live) {
      fx.age += dt;
      if (fx.age >= fx.life) this.live.delete(id);
    }
  }

  clear(): void {
    this.live.clear();
    this.last.clear();
  }

  /** Where a body was last placed by `place` — for a picture that has to end
   * on the body, like the vent's wake (`recoil-vent.ts`). */
  drawnAt(id: number): { row: number; col: number } | undefined {
    return this.last.get(id);
  }

  /**
   * The row and column a recoil is drawn at this frame, and the turn of its
   * colour. Called once per recoil per frame by `drawCreatures`: it is also
   * how this class learns where the body was, so a call from anywhere else
   * would move the point the next throw leaves from.
   */
  place(c: Creature, beats: number, beatPhase: number): Placed {
    const simRow = drawnRow(c, beatPhase);
    const simCol = drawnCol(c, beatPhase);
    const fx = this.live.get(c.id);
    const placed = fx ? arc(fx, beats, simRow, simCol) : { row: simRow, col: simCol, turn: 1 };
    this.last.set(c.id, { row: placed.row, col: placed.col });
    return placed;
  }
}

function arc(fx: Leap, beats: number, simRow: number, simCol: number): Placed {
  const tau = (fx.age / fx.life) * LEAP_BEATS;
  if (Number.isNaN(fx.phase0)) fx.phase0 = (((beats - tau) % 1) + 1) % 1;
  const u = Math.min(1, tau / LEAP_BEATS);
  // Where the simulation will have the body when the throw is up: the row it
  // landed on, plus what it has fallen since the beat line after the hit.
  const fallen = Math.max(0, LEAP_BEATS - (1 - fx.phase0));
  const row1 = fx.toRow + fallen;
  // A parabola through both ends whose slope at the far one is the fall's:
  // r(0) = row0, r(D) = row1, r'(D) = +1 row a beat.
  const g = (2 * (fx.row0 + LEAP_BEATS - row1)) / (LEAP_BEATS * LEAP_BEATS);
  const v0 = 1 - g * LEAP_BEATS;
  let row = fx.row0 + v0 * tau + 0.5 * g * tau * tau;
  // Sideways with all the speed at the start.
  const slide = 1 - (1 - u) * (1 - u);
  let col = fx.col0 + (fx.toCol - fx.col0) * slide;
  if (u > 1 - SETTLE) {
    const w = smoothstep((u - (1 - SETTLE)) / SETTLE);
    row += (simRow - row) * w;
    col += (simCol - col) * w;
  }
  return { row, col, turn: u };
}
