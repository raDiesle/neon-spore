import type { Vec3 } from "@neon-spore/content";

/**
 * A TRAILING PART THAT IS DRAGGED: a verlet chain, for the one case
 * `chainAt` (`solid-motion.ts`) is not.
 *
 * `chainAt` is follow-through as a delay — each link does what the root did a
 * little earlier. It cannot sag under its own weight, and when the root stops
 * the whole chain stops with it. A chain of points that remembers where each
 * one was a moment ago can do both: it hangs, it is dragged, and it goes on
 * swinging after the thing it hangs from has stopped.
 *
 * **Render-side only.** Nothing in `sim` reads it and nothing here writes
 * back; the chain is kept in `Effects.chains` because it outlives its frame,
 * and it is forgotten in `Effects.reset()` like every other transient. It is
 * driven by the pass that draws the part — only that pass knows where the
 * root is — with that pass's `dt`, the way `ghostTrail` is.
 *
 * The step, per chain:
 *
 * - **Fixed substeps** of at most `SUB` seconds, so 30 and 60 frames a second
 *   swing the same chain. A frame longer than `MAX_STEPS` of them — a tab that
 *   was asleep — is cut short rather than caught up.
 * - **The root moves in a straight line across the substeps** from where it
 *   was to where it is, and the first point is pinned to it.
 * - **Damping as a fraction of velocity kept per second**, raised to the
 *   substep, so it does not depend on the frame rate either.
 * - **One length pass from the root out**, moving only the child, so every
 *   link is exactly its length after each substep. One pass is enough for a
 *   chain with a pinned end; stiffness is not what a tail wants.
 * - **Re-seated, not whipped**, when the root jumps further than the chain is
 *   long several times over — a restart, a new wave, a rig put somewhere new.
 *
 * Model space is `solid.ts`'s: `y` is down the screen, so gravity is `+y`.
 */

/** The longest substep, in seconds. */
const SUB = 1 / 120;
/** The most substeps one frame is given; the rest of a long frame is dropped. */
const MAX_STEPS = 8;
/** How many chain-lengths the root may jump in a frame before it re-seats. */
const TELEPORT = 4;

/** How a chain hangs. Every field has a default a tail can start from. */
export interface ChainFeel {
  /** Down the screen, in model units per second². */
  readonly gravity?: number;
  /** The fraction of its velocity a point keeps over one second, 0..1. */
  readonly keep?: number;
  /** The direction a new chain is laid out along from its root. */
  readonly rest?: Vec3;
}

const FEEL = { gravity: 600, keep: 0.08, rest: { x: 1, y: 0, z: 0 } } as const;

interface Point {
  x: number;
  y: number;
  z: number;
}

class Chain {
  readonly pos: Point[] = [];
  readonly prev: Point[] = [];
  readonly root: Point = { x: 0, y: 0, z: 0 };

  constructor(
    readonly n: number,
    readonly link: number,
  ) {}

  seat(root: Vec3, rest: Vec3): void {
    const len = Math.hypot(rest.x, rest.y, rest.z) || 1;
    const d = { x: rest.x / len, y: rest.y / len, z: rest.z / len };
    for (let i = 0; i < this.n; i++) {
      const p = {
        x: root.x + d.x * this.link * i,
        y: root.y + d.y * this.link * i,
        z: root.z + d.z * this.link * i,
      };
      this.pos[i] = p;
      this.prev[i] = { ...p };
    }
    Object.assign(this.root, { x: root.x, y: root.y, z: root.z });
  }

  step(root: Vec3, dt: number, gravity: number, keep: number): void {
    const t = Math.min(dt, SUB * MAX_STEPS);
    const steps = t > 0 ? Math.ceil(t / SUB - 1e-9) : 0;
    const h = steps > 0 ? t / steps : 0;
    const damp = keep ** h;
    const fall = gravity * h * h;
    const from = { ...this.root };
    for (let s = 1; s <= steps; s++) {
      const k = s / steps;
      const head = this.pos[0] as Point;
      head.x = from.x + (root.x - from.x) * k;
      head.y = from.y + (root.y - from.y) * k;
      head.z = from.z + (root.z - from.z) * k;
      Object.assign(this.prev[0] as Point, head);
      for (let i = 1; i < this.n; i++) {
        const p = this.pos[i] as Point;
        const q = this.prev[i] as Point;
        const vx = (p.x - q.x) * damp;
        const vy = (p.y - q.y) * damp;
        const vz = (p.z - q.z) * damp;
        q.x = p.x;
        q.y = p.y;
        q.z = p.z;
        p.x += vx;
        p.y += vy + fall;
        p.z += vz;
      }
      this.hold();
    }
    Object.assign(this.pos[0] as Point, { x: root.x, y: root.y, z: root.z });
    Object.assign(this.root, { x: root.x, y: root.y, z: root.z });
  }

  /** Every link back to its length, from the root out, moving the child. */
  private hold(): void {
    for (let i = 1; i < this.n; i++) {
      const a = this.pos[i - 1] as Point;
      const b = this.pos[i] as Point;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const d = Math.hypot(dx, dy, dz);
      if (d < 1e-9) {
        b.x = a.x;
        b.y = a.y + this.link;
        b.z = a.z;
        continue;
      }
      const f = this.link / d;
      b.x = a.x + dx * f;
      b.y = a.y + dy * f;
      b.z = a.z + dz * f;
    }
  }
}

/** Every dragged chain on the field, by a key the drawing pass chooses. */
export class VerletChains {
  private readonly chains = new Map<string, Chain>();

  /**
   * Where the `n` points of the chain called `key` are after `dt` seconds
   * more, the first pinned to `root` and each `link` from the one before.
   * A new key, or a different `n` or `link`, lays the chain out afresh along
   * `feel.rest`. The array is the chain's own, rewritten by the next call.
   */
  follow(
    key: string,
    root: Vec3,
    n: number,
    link: number,
    dt: number,
    feel: ChainFeel = {},
  ): readonly Vec3[] {
    let c = this.chains.get(key);
    const rest = feel.rest ?? FEEL.rest;
    if (!c || c.n !== n || c.link !== link) {
      c = new Chain(n, link);
      c.seat(root, rest);
      this.chains.set(key, c);
      return c.pos;
    }
    const jump = Math.hypot(root.x - c.root.x, root.y - c.root.y, root.z - c.root.z);
    if (jump > TELEPORT * link * Math.max(1, n - 1)) {
      c.seat(root, rest);
      return c.pos;
    }
    c.step(root, dt, feel.gravity ?? FEEL.gravity, feel.keep ?? FEEL.keep);
    return c.pos;
  }

  get size(): number {
    return this.chains.size;
  }

  clear(): void {
    this.chains.clear();
  }
}
