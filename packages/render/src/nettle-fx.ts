import { instarStep, type NettleState, type SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";
import { GripVerdicts } from "./grip-verdict.js";
import { instarMarkPoint, type Point } from "./instar-place.js";
import type { Sway } from "./instar-sway.js";
import type { Layout } from "./layout.js";
import { NettleDeath } from "./nettle-death.js";
import { ingestNettle, noNettleSpots } from "./nettle-fx-ingest.js";
import { NettleStrike } from "./nettle-strike.js";

/**
 * What THE NETTLE leaves behind a frame: the **jolt** of a landing, the
 * **flinch** at a refused thumb or a slipped mark, the **hurt** of a step the
 * pair landed and the lighter one on every bolt a shoot mark counts
 * (`boss-hurt.ts`), the **strike** of a part the pair did not stop
 * (`nettle-strike.ts`), the **death** as the last step lands
 * (`nettle-death.ts`), the verdict washed over each touched mark
 * (`grip-verdict.ts`) — and the bursts its receipts throw.
 *
 * Its own class rather than a branch in `InstarFx`, the way the other
 * choreographed bosses keep their strikes and deaths: the engine is shared,
 * the body is not, and THE INSTAR's eggs, shove and hardening have no part
 * here to land on. Which of the two an event reaches is the world's boss
 * (`effects-boss.ts`). All of it is cleared in `Effects.reset()`
 * (`restart.test.ts`).
 */

const JOLT_DECAY = 8;
const FLINCH_DECAY = 7;

export class NettleFx {
  private joltNow = 0;
  private flinchNow = 0;
  /** Where this frame drew the marks and the bell (`nettle-fx-ingest.ts`). */
  readonly spots = noNettleSpots();
  /** Whether the last touch on each mark of this step was right, by index. */
  readonly verdicts = new GripVerdicts();
  /** The blow a landed step deals the body, and each counted bolt a lighter one. */
  readonly hurt = new BossHurt();
  /** What a part the pair did not stop does to the ship. */
  readonly strike = new NettleStrike();
  /** What leaves the bell as the last step lands. */
  readonly death = new NettleDeath();

  /** How far the bell is lifted right now, in tiles. */
  get jolt(): number {
    return this.joltNow;
  }

  set jolt(tiles: number) {
    this.joltNow = tiles;
  }

  /** How hard the bell is shivering sideways right now, 0..1. */
  get flinch(): number {
    return this.flinchNow;
  }

  set flinch(k: number) {
    this.flinchNow = k;
  }

  /** Told by the drawer where the marks and the bell are this frame, the
   * pulse included, so a burst lands where the part is drawn. */
  place(l: Layout, s: NettleState, sway: Sway, along: number, bell: Point, r: number): void {
    const spots = this.spots;
    const marks = instarStep(s)?.marks ?? [];
    spots.marks = marks.map((m) => instarMarkPoint(l, m, sway, along));
    spots.parts = marks.map((m) => m.part);
    spots.shoots = marks.map((m) => m.gesture === "shoot");
    spots.bell = bell;
    spots.bellR = r;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    for (const e of events) ingestNettle(this, e, l, burst);
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.joltNow = Math.max(0, this.joltNow - this.joltNow * JOLT_DECAY * step);
    if (this.joltNow < 0.002) this.joltNow = 0;
    this.flinchNow = Math.max(0, this.flinchNow - this.flinchNow * FLINCH_DECAY * step);
    if (this.flinchNow < 0.002) this.flinchNow = 0;
    this.verdicts.update(step);
    this.hurt.update(step);
    this.strike.update(step);
    this.death.update(step);
  }

  /** The death over the sagging bell, and the strike over everything. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    this.death.draw(ctx);
    this.strike.draw(ctx, l);
  }

  clear(): void {
    this.joltNow = 0;
    this.flinchNow = 0;
    Object.assign(this.spots, noNettleSpots());
    this.verdicts.clear();
    this.hurt.clear();
    this.strike.clear();
    this.death.clear();
  }
}
