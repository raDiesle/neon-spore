/**
 * **Every flag `bun run frames` reads, and the refusal of any other.**
 *
 * `--after 6` used to be heard as nothing at all: the run went ahead, wrote
 * the frame on the event's own tick, and said not a word, so the picture
 * looked like an answer to a question nobody had asked and the run had to be
 * repeated to find that the flag is `--until-on` (`docs/queue.md`, 8 October
 * 2026). A typo in a flag is the same picture, wrong and convincing.
 *
 * The list is the usage line's in `run.ts`, plus `--frames`, `--stride`,
 * `--time` and `--fault`, which it never named. A flag added to `flags.ts` or
 * `run.ts` and not here is refused by name the first time anybody writes it,
 * which is a loud way to find a missing row.
 */
export const KNOWN_FLAGS: readonly string[] = [
  "wave",
  "ticks",
  "frames",
  "stride",
  "seat",
  "level",
  "size",
  "raster",
  "hold",
  "hold-ticks",
  "hand",
  "hand-over",
  "settle",
  "time",
  "at",
  "zoom",
  "boss-round",
  "boss",
  "boss-json",
  "creature",
  "auto",
  "auto-miss",
  "until",
  "until-ticks",
  "until-back",
  "until-on",
  "events",
  "press",
  "opening",
  "guide-page",
  "fault",
  "out",
  "help",
];

/**
 * Throws on the first `--flag` in `argv` this tool does not read, naming the
 * nearest one it does when one is near enough to be a typo of it.
 */
export function refuseUnknownFlags(argv: readonly string[]): void {
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const name = arg.slice(2);
    if (KNOWN_FLAGS.includes(name)) continue;
    const near = nearestFlag(name);
    const mean = near === null ? "." : ` — did you mean --${near}?`;
    throw new Error(
      `${arg}: not a flag bun run frames reads${mean} Every flag, with a recipe each: bun run frames --help`,
    );
  }
}

/**
 * The known flag fewest single-letter edits from `name`, the first listed
 * winning a tie — or null when even that one is a different word rather than
 * a slip: more than one letter in four changed, or any second letter in a
 * word of under eight. `--after` is two edits from `--raster` and nobody's
 * typo of it, and *did you mean --raster* would send the reader the wrong way.
 */
export function nearestFlag(name: string): string | null {
  let best: string | null = null;
  let bestCost = Number.POSITIVE_INFINITY;
  for (const flag of KNOWN_FLAGS) {
    const cost = edits(name, flag);
    if (cost < bestCost) {
      best = flag;
      bestCost = cost;
    }
  }
  return bestCost <= Math.max(1, Math.floor(name.length / 4)) ? best : null;
}

/** Levenshtein distance: insertions, deletions and substitutions, one each. */
function edits(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      const swap = (row[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
      next.push(Math.min((row[j] ?? 0) + 1, (next[j - 1] ?? 0) + 1, swap));
    }
    row = next;
  }
  return row[b.length] ?? 0;
}
