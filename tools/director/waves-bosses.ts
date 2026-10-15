import { WAVES } from "@neon-spore/content";
import { bossOrder } from "./src/boss-slots.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:bosses [--write]` — every boss to the end of the first block
 * after which everything it needs has been taught (`docs/spec/wave-curriculum.md`
 * §7; the rules are in `src/boss-slots.ts`). Prints where each one goes and
 * what it waited on; `--write` saves the new order. Run it again after a block
 * is written, and a boss waiting at the end takes the new block.
 */

const { order, slots } = bossOrder(WAVES);
const name = (id: string | undefined) => order.find((w) => w.id === id)?.name ?? "";
for (const s of slots) {
  const where = s.closes
    ? `closes ${name(s.closes)}`
    : s.from <= WAVES.findIndex((w) => w.id === "finale")
      ? "stays, in the arc"
      : "waits at the end";
  console.log(
    `${String(s.from + 1).padStart(4)} → ${String(s.to + 1).padEnd(5)}${s.name.padEnd(16)}` +
      `${where.padEnd(28)}${s.waited.join(", ")}`,
  );
}
const moved = slots.filter((s) => s.from !== s.to).length;
console.log(`${moved} of ${slots.length} bosses move`);
if (!process.argv.includes("--write") || moved === 0) process.exit(0);
const { complaint, rels } = await writeWaves(order);
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`wrote ${rels.join(", ")}`);
console.log("then: bun run briefings:renumber");
