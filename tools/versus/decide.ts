/**
 * What happens after the owner has looked: one command that takes the name he
 * said and leaves the repository as if the slot had never been open.
 *
 * There used to be a vote button on the page and a prompt on the clipboard. He
 * said on 9 September 2026 that he does not want either — that he prefers to
 * say in chat which candidate to integrate and which to reject — so the page's
 * whole job is now to show the pair, and this is the half that was worth
 * keeping. It is the same work the prompt described, done rather than written
 * out: the winner's values into the shipped record, the whole slot's
 * directories gone, the registry regenerated, and a line in `DECIDED.md` so
 * the answer outlives the session that carried it.
 *
 * **It writes nothing at all unless every field can be written.** `adopt`
 * collects the rewrites for the whole slot first and stops on the first
 * refusal, so a candidate with three good fields and one this cannot place
 * does not leave a record half taken. `record-edit.ts` holds the refusals for
 * a plain value and why each one is a refusal rather than a guess.
 *
 * **A function-valued field is taken by moving its file.** `record-edit.ts`
 * still refuses to *write* one — `toString` hands back the transpiler's
 * spelling — but since 10 September 2026 that refusal is not the end: the
 * candidate's implementation file moves into the package the record lives
 * in, its imports are rewritten, the record's field points at the moved
 * function and the implementation nothing reads any more is deleted
 * (`take-function.ts`, `take-function-fs.ts`). What stays a refusal is a
 * function written inline in the candidate's `index.ts`, which has no file to
 * move, and a name the record file already uses.
 */

import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { byHand } from "./by-hand.js";
import { VARIANTS } from "./candidates/index.js";
import { type Edit, isRefusal, rewriteRecord } from "./record-edit.js";
import { writeRegistry } from "./registry.js";
import { CANDIDATES, ROOT } from "./root.js";
import { type FunctionTake, planFunctionTake } from "./take-function-fs.js";
import { quoted, wrap } from "./text.js";
import { currentValues, slots, type Variant } from "./variant.js";

const DECIDED = join(ROOT, "tools", "versus", "DECIDED.md");

/** Everything one file gets written in one adoption. */
interface FileEdit {
  readonly file: string;
  readonly symbol: string;
  readonly text: string;
  readonly edits: readonly Edit[];
  /** The function-valued fields, taken by moving their file. */
  readonly taken?: FunctionTake;
}

function slotOf(name: string): { slot: string; candidates: readonly Variant[] } {
  const found = slots(VARIANTS).find((s) => s.slot === name);
  if (!found) {
    const open = slots(VARIANTS).map((s) => s.slot);
    throw new Error(
      open.length === 0
        ? `no slot is open, so there is nothing called ${JSON.stringify(name)} to decide`
        : `no slot called ${JSON.stringify(name)} — open right now: ${quoted(open)}`,
    );
  }
  return found;
}

/**
 * The winner's values, in the files, or the first reason they cannot go there.
 *
 * `currentValues` is read here and nowhere earlier: the left-hand side of every
 * comparison has to be what the live record says at this moment, because a
 * value copied into a candidate is the drift this whole arrangement exists to
 * prevent.
 */
function planFor(won: Variant, as?: string): FileEdit[] {
  const plan: FileEdit[] = [];
  for (const patch of won.patches) {
    const file = join(ROOT, patch.where.file);
    const fields = patch.fields as Record<string, unknown>;
    const current = currentValues(patch);
    // The plain values first, through the writer that compares them against
    // the live record; the functions after, by moving their file into place.
    const plain: Record<string, unknown> = {};
    const functions: string[] = [];
    for (const field of Object.keys(fields)) {
      if (typeof fields[field] === "function" || typeof current[field] === "function") {
        functions.push(field);
      } else plain[field] = fields[field];
    }
    const result = rewriteRecord(readFileSync(file, "utf8"), patch.where.symbol, plain, current);
    if (isRefusal(result)) {
      throw new Error(
        [`${patch.where.file} — ${result.why}`, "", ...byHand(won, patch.where.file)].join("\n"),
      );
    }
    let text = result.text;
    let taken: FunctionTake | undefined;
    if (functions.length > 0) {
      const take = planFunctionTake(ROOT, won, patch, functions, text, as);
      if ("why" in take) {
        throw new Error([take.why, "", ...byHand(won, patch.where.file)].join("\n"));
      }
      taken = take;
      text = take.recordText;
    }
    plan.push({
      file: patch.where.file,
      symbol: patch.where.symbol,
      text,
      edits: result.edits,
      taken,
    });
  }
  return plan;
}

/** The winner into the game, and the slot off the page. `as` names the base of
 * a moved implementation file, when the default is not wanted. */
export function adopt(slotName: string, winner: string, reason: string, as?: string): string[] {
  const { slot, candidates } = slotOf(slotName);
  const won = candidates.find((c) => c.name === winner);
  if (!won) {
    throw new Error(
      `no candidate called ${JSON.stringify(winner)} in ${slot} — it offers ${quoted(
        candidates.map((c) => c.name),
        "or",
      )}`,
    );
  }

  const plan = planFor(won, as);
  for (const f of plan) {
    writeFileSync(join(ROOT, f.file), f.text);
    for (const m of f.taken?.moves ?? []) writeFileSync(join(ROOT, m.to), m.text);
    for (const r of f.taken?.retired ?? []) {
      if (r.delete) rmSync(join(ROOT, r.file), { force: true });
    }
  }

  const out = [`${slot} — ${won.name} taken.`, ""];
  for (const f of plan) {
    out.push(`  ${f.file} · ${f.symbol}`);
    for (const e of f.edits) out.push(`      ${e.field}  ${e.from}  ->  ${e.to}`);
    for (const t of f.taken?.fields ?? []) {
      out.push(`      ${t.field}  ->  ${t.ident} from ${t.to}`);
    }
    for (const m of f.taken?.moves ?? []) out.push(`  moved    ${m.from} -> ${m.to}`);
    for (const r of f.taken?.retired ?? []) {
      out.push(`  ${r.delete ? "deleted " : "kept    "} ${r.note}`);
    }
  }
  out.push("", ...removeSlot(candidates), "");
  writeDecided(decidedEntry(slot, won, candidates, reason, plan));
  out.push(
    "  tools/versus/DECIDED.md — the answer, so the next slot on this record can read it",
    "",
    wrap("Now `bun run check`. The record moved; the tests that draw it have not been run."),
  );
  return out;
}

/** No answer taken: the slot goes, the game is untouched, the reason is kept. */
export function drop(slotName: string, reason: string): string[] {
  const { slot, candidates } = slotOf(slotName);
  const out = [`${slot} — nothing taken. The game draws what it drew.`, ""];
  out.push(...removeSlot(candidates), "");
  writeDecided(decidedEntry(slot, null, candidates, reason, []));
  out.push("  tools/versus/DECIDED.md — the reason, which is the only thing left of the slot");
  return out;
}

/**
 * Every candidate directory in the slot, gone, and the registry rebuilt around
 * the hole. The winner's directory goes with the losers: its numbers live in
 * `packages/` now, and a second copy of them in a tool is exactly the drift
 * this arrangement exists to prevent.
 */
function removeSlot(candidates: readonly Variant[]): string[] {
  for (const c of candidates) rmSync(join(ROOT, c.dir), { recursive: true, force: true });
  const { count } = writeRegistry(CANDIDATES);
  return [
    ...candidates.map((c) => `  removed  ${c.dir}`),
    `  rewrote  tools/versus/candidates/registry.ts — ${count} candidate${count === 1 ? "" : "s"} left`,
  ];
}

/** Append, never rewrite: the file is a record of answers and nothing edits an old one. */
function writeDecided(entry: string): void {
  const md = readFileSync(DECIDED, "utf8").replace(/\s+$/, "");
  writeFileSync(DECIDED, `${md}\n\n${entry}\n`);
}

function decidedEntry(
  slot: string,
  won: Variant | null,
  candidates: readonly Variant[],
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
