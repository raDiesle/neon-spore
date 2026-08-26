import type { PodKind } from "@neon-spore/sim";

/**
 * Taking a pod in, as a piece of timing.
 *
 * The swallow is two movements on one clock — the skin comes apart, and then
 * the ship lights up — so that the flash can never arrive before the chewing.
 * Its own object because it is the only effect in the game with a *shape* over
 * time rather than a lifetime: everything else fades, this one has an order.
 */

/** The swallow, end to end. */
const LIFE = 1.05;
/** The share of it the chewing takes; the light and the receipt wait for it. */
const CHEW_SHARE = 0.55;

export class SwallowFx {
  /** Counts down from `LIFE` while a pod is being taken in. */
  private left = 0;
  /** Which kind the swallow currently running is for, for the receipt. */
  private kind: PodKind | null = null;

  /** The share of the whole swallow the chewing takes. Read by the banner. */
  get chewShare(): number {
    return CHEW_SHARE;
  }

  get life(): number {
    return LIFE;
  }

  get remaining(): number {
    return this.left;
  }

  get podKind(): PodKind | null {
    return this.kind;
  }

  /** 0..1 while the membrane around the maw is coming apart. */
  get chew(): number {
    const done = 1 - this.left / LIFE;
    if (this.left <= 0 || done > CHEW_SHARE) return 0;
    // Up fast, then held: the ship bites and keeps its mouth busy.
    return Math.min(1, done / (CHEW_SHARE * 0.3));
  }

  /** 0..1 for the light that goes through the ship once the pod is inside. */
  get charge(): number {
    const done = 1 - this.left / LIFE;
    if (this.left <= 0 || done < CHEW_SHARE) return 0;
    const after = (done - CHEW_SHARE) / (1 - CHEW_SHARE);
    // A flash is all attack and no sustain: full at once, then gone.
    return Math.max(0, 1 - after) ** 1.6;
  }

  start(kind: PodKind): void {
    this.left = LIFE;
    this.kind = kind;
  }

  update(dt: number): void {
    this.left = Math.max(0, this.left - dt);
  }

  clear(): void {
    this.left = 0;
    this.kind = null;
  }
}
