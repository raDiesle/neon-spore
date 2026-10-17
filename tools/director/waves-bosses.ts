import { WAVES, type Wave } from "@neon-spore/content";
import { bossOrder } from "./src/boss-slots.js";
import { isFiller } from "./src/compose-block.js";
import { addFillers } from "./src/compose-filler.js";
import { nameWaves } from "./src/compose-names.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:bosses [--write]` — every boss to its place
 * (`docs/spec/wave-curriculum.md` §7; the rules are in `src/boss-slots.ts`):
 * the block it is about (`src/boss-about.ts`), or the first block free once
 * everything it needs has been taught. Prints where each one goes and what it
 * waited on; `--write` saves the new order. Run it again after a block is
 * written, and a boss waiting at the end takes the new block.
 *
 * **A filler goes where its boss goes.** A filler (`src/compose-filler.ts`)
 * is composed for the boss behind it and the waves in front of it, so the
 * fillers are taken out before the bosses move and composed again in front
 * of each boss's new place — left in, one would stand before another boss.
 */

const bare = WAVES.filter((w) => !isFiller(w.id));
const { order, slots } = bossOrder(bare);
const name = (id: string | undefined) => order.find((w) => w.id === id)?.name ?? "";
const at = (id: string) => WAVES.findIndex((w) => w.id === id);
let moved = 0;
for (const s of slots) {
  const where = s.closes
    ? `closes ${name(s.closes)}`
    : s.from <= bare.findIndex((w) => w.id === "finale")
      ? "stays, in the arc"
      : "waits at the end";
  if (s.from !== s.to) moved++;
  console.log(
    `${String(at(s.id) + 1).padStart(4)} → ${String(s.to + 1).padEnd(5)}${s.name.padEnd(16)}` +
      `${where.padEnd(28)}${s.waited.join(", ")}`,
  );
}
console.log(`${moved} of ${slots.length} bosses move (numbers without fillers on the right)`);
if (!process.argv.includes("--write") || moved === 0) process.exit(0);

const composedIds = new Set<string>();
const filled = addFillers([...order], composedIds, () => {});
if (typeof filled === "string") {
  console.error(`stopped: ${filled}`);
  process.exit(1);
}
const waves: Wave[] = nameWaves(filled, composedIds);
console.log(`${composedIds.size / 3} fillers composed again, ${waves.length} waves`);
const { complaint, rels, removed } = await writeWaves(waves, undefined, { recut: true });
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`wrote ${rels.length} files, deleted ${removed.length}`);
console.log("then: bun run briefings:renumber, baseline:blank, index");
