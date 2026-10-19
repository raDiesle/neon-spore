import { WAVES } from "@neon-spore/content";
import { bossOrder } from "./src/boss-slots.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:bosses [--write]` — every boss to its place
 * (`docs/spec/wave-curriculum.md` §7; the rules are in `src/boss-slots.ts`):
 * the block it is about (`src/boss-about.ts`), or the first block free once
 * everything it needs has been taught. Prints where each one goes and what it
 * waited on; `--write` saves the new order. Run it again after a block is
 * written, and a boss waiting at the end takes the new block.
 *
 * A boss stands straight after its block's one regular wave: the fillers
 * that stood between them went on 19 October 2026 (§4, decision 3).
 */

const { order, slots } = bossOrder(WAVES);
const name = (id: string | undefined) => order.find((w) => w.id === id)?.name ?? "";
const at = (id: string) => WAVES.findIndex((w) => w.id === id);
let moved = 0;
for (const s of slots) {
  const where = s.closes
    ? `closes ${name(s.closes)}`
    : s.from <= WAVES.findIndex((w) => w.id === "finale")
      ? "stays, in the arc"
      : "waits at the end";
  if (s.from !== s.to) moved++;
  console.log(
    `${String(at(s.id) + 1).padStart(4)} → ${String(s.to + 1).padEnd(5)}${s.name.padEnd(16)}` +
      `${where.padEnd(28)}${s.waited.join(", ")}`,
  );
}
console.log(`${moved} of ${slots.length} bosses move`);
if (!process.argv.includes("--write") || moved === 0) process.exit(0);

const { complaint, rels, removed } = await writeWaves([...order], undefined, { recut: true });
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`wrote ${rels.length} files, deleted ${removed.length}`);
console.log("then: bun run briefings:renumber, baseline:blank, index");
