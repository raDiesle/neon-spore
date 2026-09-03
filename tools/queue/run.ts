#!/usr/bin/env bun

/**
 * `bun run queue` — what is waiting for a session of its own.
 * `bun run queue next` — the first item as a prompt to paste into a fresh one.
 * `bun run queue done <n|title>` — take an entry out once it has landed.
 *
 * The queue is a file rather than a chat message because the next session
 * clones `origin` and sees nothing else.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type Item, order, parseItems, pick, problemsIn, promptFor, removeItem } from "./queue.js";

const ROOT = join(import.meta.dirname, "..", "..");
const PATHS = { queue: join(ROOT, "docs", "queue.md"), parked: join(ROOT, "docs", "parked.md") };

function load(): Item[] {
  const queue = parseItems(readFileSync(PATHS.queue, "utf8"), "queue");
  const parked = parseItems(readFileSync(PATHS.parked, "utf8"), "parked");
  return order(queue, parked);
}

const [command, arg] = process.argv.slice(2);
const items = load();

if (!command || command === "list") {
  if (items.length === 0) {
    console.log("The queue is empty. Nothing is waiting.");
  } else {
    for (const [i, item] of items.entries()) {
      const tag = item.source === "parked" ? " (parked, half-done)" : "";
      console.log(`${String(i + 1).padStart(2)}. ${item.title}${tag}`);
      console.log(`    ${item.found}`);
      console.log(`    ${item.files.join(", ")}`);
    }
    console.log(`\n${items.length} waiting — \`bun run queue next\` prints the first as a prompt.`);
  }
  const problems = problemsIn(items);
  if (problems.length > 0) {
    console.log(`\nEntries a cold session could not act on:`);
    for (const p of problems) console.log(`  - ${p}`);
  }
} else if (command === "next") {
  if (items.length === 0) {
    console.log("The queue is empty. Nothing is waiting.");
  } else {
    console.log(promptFor(pick(items, arg ?? "1")));
  }
} else if (command === "done") {
  if (!arg) throw new Error("usage: bun run queue done <n|title>");
  const item = pick(items, arg);
  const path = PATHS[item.source];
  writeFileSync(path, removeItem(readFileSync(path, "utf8"), item.title));
  console.log(`Removed from docs/${item.source}.md: ${item.title}`);
} else {
  throw new Error(`unknown command ${JSON.stringify(command)} — list | next | done`);
}
