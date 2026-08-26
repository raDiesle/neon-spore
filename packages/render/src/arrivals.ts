/**
 * Which impacts have actually landed, as far as the picture is concerned.
 *
 * The simulation scars the hull the instant a beat resolves, but a rock is
 * still visibly in the air at that moment — `rock-impact.ts` replays the last
 * step of its fall over the following fraction of a second. Anything that is
 * *caused* by the impact rather than merely recorded by it — the spark burst,
 * and the scar's own crack (`scars.ts`) — has to wait for that replay to
 * reach the hull, or the ship reads as breaking a beat before anything hits
 * it.
 *
 * A scar is keyed by the column and beat it was made on, which is unique
 * within a run and is all `Scar` carries. Across runs it is not unique, so a
 * reset run has to `clear()` — otherwise last run's beat 12 marks this run's
 * beat 12 as already landed, and its crack shows before its rock does.
 */
export class Arrivals {
  private landed = new Set<string>();

  private static key(col: number, beat: number): string {
    return `${col}:${beat}`;
  }

  /** Latch every column a `span`-wide rock covers, `loCol` first. */
  mark(loCol: number, span: number, beat: number): void {
    for (let i = 0; i < span; i++) this.landed.add(Arrivals.key(loCol + i, beat));
  }

  has(col: number, beat: number): boolean {
    return this.landed.has(Arrivals.key(col, beat));
  }

  clear(): void {
    this.landed.clear();
  }
}
