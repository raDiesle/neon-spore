import { type Glide, glideTo } from "./glide.js";

/**
 * The shield, as a body rather than a plate.
 *
 * The simulation moves the shield a whole column at a time, and a single lobe
 * that slides across the hull reads as a lump being dragged. A worm does not
 * move like that: its head leaves first, the body strings out behind it and
 * gathers back up when the head stops. So the shield is a short chain — a head
 * that chases the column and three followers, each chasing the segment in front
 * of it a little more slowly.
 *
 * The chain is drawn as several bumps on the same membrane, so the skin of the
 * ship travels with the shield instead of the shield travelling over the skin.
 * All of it is render-only motion: nothing here is ever read back into a world.
 */

/** Head plus body. Four reads as a creature; more reads as a caterpillar. */
const SEGMENTS = 4;
/** Spring stiffness per segment, head first. Lower is a longer lag. */
const OMEGA = [21, 15, 11.5, 9];
/** Just under critical, so a segment settles without wobbling on arrival. */
const ZETA = 0.85;
/** Share of the shield's lift each segment carries, before normalising. */
const WEIGHT = [1, 0.62, 0.38, 0.22];
/** Half width of each segment, relative to the shield lobe's own. */
const HALF_MUL = [1, 0.92, 0.84, 0.74];
/** How far the peristaltic wave lifts and drops a segment, as a share of it. */
const UNDULATE = 0.34;
/** Phase between neighbouring segments. Their sum stays near zero at rest. */
const SEGMENT_PHASE = 1.6;
/** Crawl rate at a standstill, and how much travel adds to it, per second. */
const CRAWL_HZ = 0.45;
const CRAWL_PER_COLUMN = 1.1;

export interface ShieldSegment {
  /** Fractional column of this segment's centre. */
  col: number;
  /** Share of the shield's total lift. Sums to about 1, and breathes past it. */
  weight: number;
  /** Half width, relative to the shield lobe's own. */
  halfMul: number;
}

export class ShieldBody {
  private chain: Glide[] = Array.from({ length: SEGMENTS }, () => ({
    value: Number.NaN,
    velocity: 0,
  }));
  /** Phase of the peristaltic wave. Advanced by time *and* by travel. */
  private phase = 0;
  private out: ShieldSegment[] = [];

  update(targetCol: number, dt: number): void {
    const before = this.chain[0]!.value;
    for (let i = 0; i < this.chain.length; i++) {
      const target = i === 0 ? targetCol : this.chain[i - 1]!.value;
      glideTo(this.chain[i]!, target, dt, OMEGA[i]!, ZETA);
    }
    const travelled = Number.isFinite(before) ? Math.abs(this.chain[0]!.value - before) : 0;
    this.phase += dt * CRAWL_HZ * Math.PI * 2 + travelled * CRAWL_PER_COLUMN * Math.PI * 2;

    const total = WEIGHT.reduce((a, b) => a + b, 0);
    this.out.length = 0;
    for (let i = 0; i < this.chain.length; i++) {
      const wave = Math.sin(this.phase - i * SEGMENT_PHASE);
      this.out.push({
        col: this.chain[i]!.value,
        weight: (WEIGHT[i]! / total) * (1 + UNDULATE * wave),
        halfMul: HALF_MUL[i]!,
      });
    }
  }

  /** Head first, tail last. Empty until the first `update`. */
  get segments(): readonly ShieldSegment[] {
    return this.out;
  }

  /** Where the head is, in fractional columns — the muzzle of the shield. */
  get head(): number {
    return this.chain[0]!.value;
  }

  /** Leftmost and rightmost segment centre, so the rim can span the body. */
  get span(): { from: number; to: number } {
    let from = Number.POSITIVE_INFINITY;
    let to = Number.NEGATIVE_INFINITY;
    for (const g of this.chain) {
      from = Math.min(from, g.value);
      to = Math.max(to, g.value);
    }
    return { from, to };
  }
}
