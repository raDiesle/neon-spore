#!/usr/bin/env bun

/**
 * `bun run versus` — what is open.
 * `bun run versus new <slot> <name>` — the candidate, spelled out, and the
 *   five things about writing one that are not guessable.
 * `bun run versus index` — regenerate the registry from the directories.
 * `bun run versus adopt <slot> <name> "<why>"` — the owner's answer, applied.
 * `bun run versus drop <slot> "<why not>"` — the slot, closed with nothing taken.
 *
 * The two that write are the ones worth explaining. Until 9 September 2026 a
 * vote was cast on the page and put a prompt on the clipboard for a session to
 * carry out by hand; the owner said he does not want a button and prefers to
 * name the winner in chat, so what the tool owes him is not a way to record a
 * decision but a way to *apply* one. `decide.ts` is that, and it refuses far
 * more readily than it writes.
 *
 * **Every command but `index` reaches the candidates lazily**, because `index`
 * is the one that repairs the file the others import. A registry that names a
 * directory somebody deleted is exactly when the command to regenerate it must
 * still run, and a static import at the top of this file would have taken that
 * away.
 */

import { writeRegistry } from "./registry.js";
import { CANDIDATES } from "./root.js";
import { scaffold } from "./scaffold.js";
import { slots } from "./variant.js";

const [command, ...rest] = process.argv.slice(2);

function need(what: string, value: string | undefined, usage: string): string {
  if (!value) throw new Error(`${usage}\n  (missing the ${what})`);
  return value;
}

/**
 * A refusal is an answer, not a crash. `adopt` says no more often than it says
 * yes — that is its design — and a stack trace under every one of those would
 * teach a reader to skim past the sentence that says which field disagreed,
 * which is the only part worth reading.
 */
process.on("uncaughtException", (e: unknown) => {
  console.error(`\n${e instanceof Error ? e.message : String(e)}\n`);
  process.exit(1);
});

async function open(): Promise<ReturnType<typeof slots>> {
  return slots((await import("./candidates/index.js")).VARIANTS);
}

if (command === "index") {
  const { changed, count } = writeRegistry(CANDIDATES);
  const n = `${count} candidate${count === 1 ? "" : "s"}`;
  console.log(
    changed
      ? `candidates/registry.ts rewritten — ${n}.`
      : `candidates/registry.ts already matches the directories — ${n}.`,
  );
} else if (!command || command === "list") {
  const { listing } = await import("./list.js");
  for (const line of await listing(await open())) console.log(line);
} else if (command === "new") {
  const usage = "usage: bun run versus new <slot> <name>";
  const slot = need("slot", rest[0], usage);
  const name = need("name", rest[1], usage);
  const taken = (await open()).find((s) => s.slot === slot)?.candidates.map((c) => c.name) ?? [];
  for (const line of scaffold(slot, name, taken)) console.log(line);
} else if (command === "adopt") {
  const usage = 'usage: bun run versus adopt <slot> <name> "<why>"';
  const slot = need("slot", rest[0], usage);
  const name = need("candidate", rest[1], usage);
  const { adopt } = await import("./decide.js");
  for (const line of adopt(slot, name, rest.slice(2).join(" "))) console.log(line);
} else if (command === "drop") {
  const usage = 'usage: bun run versus drop <slot> "<why not>"';
  const slot = need("slot", rest[0], usage);
  const { drop } = await import("./decide.js");
  for (const line of drop(slot, rest.slice(1).join(" "))) console.log(line);
} else {
  throw new Error(`unknown command ${JSON.stringify(command)} — list | new | index | adopt | drop`);
}
