/**
 * `DECIDED.md` — the answers, after the slot they were given to has gone.
 *
 * The directories are removed by the decision that closes them and the record
 * is what is left of the argument: which answer was taken, what it was written
 * into, which answers went with the slot, and the owner's reason in his own
 * words. `decide.ts` does the moving; this does the remembering, and the two
 * are apart because a file that prints prose about a decision and a file that
 * rewrites source are not one subject.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Edit } from "./record-edit.js";
import { ROOT } from "./root.js";
import type { OnDisk } from "./slots.js";
import type { FunctionTake } from "./take-function-fs.js";
import { quoted, wrap } from "./text.js";
import type { Variant } from "./variant.js";

const DECIDED = join("tools", "versus", "DECIDED.md");

/** Everything one file gets written in one adoption. */
export interface FileEdit {
  readonly file: string;
  readonly symbol: string;
  readonly text: string;
  readonly edits: readonly Edit[];
  /** The function-valued fields, taken by moving their file. */
  readonly taken?: FunctionTake;
}

/** One decision, on the end of the file. `won` is `null` when nothing was taken. */
export function recordDecision(
  slot: string,
  won: Variant | null,
  candidates: readonly OnDisk[],
  reason: string,
  plan: readonly FileEdit[],
  root = ROOT,
): void {
  writeDecided(join(root, DECIDED), decidedEntry(slot, won, candidates, reason, plan));
}

/** Append, never rewrite: the file is a record of answers and nothing edits an old one. */
function writeDecided(file: string, entry: string): void {
  const md = readFileSync(file, "utf8").replace(/\s+$/, "");
  writeFileSync(file, `${md}\n\n${entry}\n`);
}

function decidedEntry(
  slot: string,
  won: Variant | null,
  candidates: readonly OnDisk[],
  reason: string,
  plan: readonly FileEdit[],
): string {
  const today = new Date().toISOString().slice(0, 10);
  const others = candidates.filter((c) => c !== won).map((c) => c.name);
  const lines = [
    won
      ? `## \`${slot}\` / \`${won.name}\` — taken, ${today}`
      : `## \`${slot}\` — nothing taken, ${today}`,
    "",
    wrap(reason.trim() || "(no reason written down, which is worse than a short one.)"),
  ];
  if (won) {
    lines.push("", wrap(won.sentence));
    for (const f of plan) {
      const written = f.edits.map((e) => e.field);
      if (written.length > 0) {
        lines.push("", wrap(`Written into \`${f.file}\`, \`${f.symbol}\`: ${quoted(written)}.`));
      }
      for (const t of f.taken?.fields ?? []) {
        lines.push(
          "",
          wrap(
            `\`${f.symbol}.${t.field}\` is \`${t.ident}\`, moved from \`${t.from}\` to \`${t.to}\`.`,
          ),
        );
      }
      for (const r of f.taken?.retired ?? []) lines.push("", wrap(`${r.note}.`));
    }
  }
  lines.push(
    "",
    wrap(
      others.length === 0
        ? "It was the only answer offered."
        : `The other ${others.length === 1 ? "answer" : "answers"} offered ${
            others.length === 1 ? "was" : "were"
          } ${quoted(others)}; ${others.length === 1 ? "it went" : "they went"} with the slot.`,
    ),
  );
  return lines.join("\n");
}
