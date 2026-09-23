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

import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { byHand } from "./by-hand.js";
import { type FileEdit, recordDecision } from "./decided-md.js";
import { removePoseRow } from "./pose-row.js";
import { isRefusal, rewriteRecord } from "./record-edit.js";
import { writeRegistry } from "./registry.js";
import { candidatesUnder, ROOT } from "./root.js";
import { candidatesIn, type OnDisk, slotDir, slotsOnDisk } from "./slots.js";
import { type FunctionTake, planFunctionTake } from "./take-function-fs.js";
import { quoted, wrap } from "./text.js";
import { currentValues, slots, type Variant } from "./variant.js";

/**
 * **The registry is loaded by `adopt` and by nothing else.**
 *
 * A candidate's values are what `adopt` writes into the record, so it has no
 * way to work without the modules that hold them. `drop` writes none of them,
 * and importing this at the top of the file made it pay for them anyway — see
 * `candidatesIn` for the state that costs.
 */
async function slotOf(name: string): Promise<{ slot: string; candidates: readonly Variant[] }> {
  const { VARIANTS } = await import("./candidates/index.js");
  const found = slots(VARIANTS).find((s) => s.slot === name);
  if (!found)
    throw noSlot(
      name,
      slots(VARIANTS).map((s) => s.slot),
    );
  return found;
}

/** Said the same way whichever half of the tool was asked. */
function noSlot(name: string, open: readonly string[]): Error {
  return new Error(
    open.length === 0
      ? `no slot is open, so there is nothing called ${JSON.stringify(name)} to decide`
      : `no slot called ${JSON.stringify(name)} — open right now: ${quoted(open)}`,
  );
}

/**
 * The winner's values, in the files, or the first reason they cannot go there.
 *
 * `currentValues` is read here and nowhere earlier: the left-hand side of every
 * comparison has to be what the live record says at this moment, because a
 * value copied into a candidate is the drift this whole arrangement exists to
 * prevent.
 */
function planFor(won: Variant, root: string, as?: string): FileEdit[] {
  const plan: FileEdit[] = [];
  for (const patch of won.patches) {
    const file = join(root, patch.where.file);
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
      const take = planFunctionTake(root, won, patch, functions, text, as);
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
 * a moved implementation file, when the default is not wanted. `root` is the
 * repository written to; the candidates are still the ones this process
 * imported, since a registry is code and cannot be read from another tree. */
export async function adopt(
  slotName: string,
  winner: string,
  reason: string,
  as?: string,
  root = ROOT,
): Promise<string[]> {
  const { slot, candidates } = await slotOf(slotName);
  const won = candidates.find((c) => c.name === winner);
  if (!won) {
    throw new Error(
      `no candidate called ${JSON.stringify(winner)} in ${slot} — it offers ${quoted(
        candidates.map((c) => c.name),
        "or",
      )}`,
    );
  }

  const plan = planFor(won, root, as);
  for (const f of plan) {
    writeFileSync(join(root, f.file), f.text);
    for (const m of f.taken?.moves ?? []) writeFileSync(join(root, m.to), m.text);
    for (const r of f.taken?.retired ?? []) {
      if (r.delete) rmSync(join(root, r.file), { force: true });
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
  out.push("", ...removeSlot(slot, candidates, root), "");
  recordDecision(slot, won, candidates, reason, plan, root);
  out.push(
    "  tools/versus/DECIDED.md — the answer, so the next slot on this record can read it",
    "",
    wrap("Now `bun run check`. The record moved; the tests that draw it have not been run."),
  );
  return out;
}

/** No answer taken: the slot goes, the game is untouched, the reason is kept.
 * `root` is the repository, which a test points at a tree of its own. */
export function drop(slotName: string, reason: string, root = ROOT): string[] {
  const under = candidatesUnder(root);
  const candidates = candidatesIn(under, slotName);
  if (candidates.length === 0) throw noSlot(slotName, slotsOnDisk(under));
  const out = [`${slotName} — nothing taken. The game draws what it drew.`, ""];
  out.push(...removeSlot(slotName, candidates, root), "");
  recordDecision(slotName, null, candidates, reason, [], root);
  out.push("  tools/versus/DECIDED.md — the reason, which is the only thing left of the slot");
  return out;
}

/**
 * Every candidate directory in the slot, gone, the registry rebuilt around
 * the hole, and the slot's row taken out of the director's pose map. The
 * winner's directory goes with the losers: its numbers live in `packages/`
 * now, and a second copy of them in a tool is exactly the drift this
 * arrangement exists to prevent. The row goes for the reason `pose-row.ts`
 * gives — its pose stays in the gallery, the row was only the slot's way to it.
 */
function removeSlot(slot: string, candidates: readonly OnDisk[], root: string): string[] {
  for (const c of candidates) rmSync(join(root, c.dir), { recursive: true, force: true });
  // What is left is what the candidates shared (`slotHelpers`), and it goes too.
  const dir = join(candidatesUnder(root), slotDir(slot));
  const shared = existsSync(dir) ? readdirSync(dir) : [];
  rmSync(dir, { recursive: true, force: true });
  const { count } = writeRegistry(candidatesUnder(root));
  return [
    ...candidates.map((c) => `  removed  ${c.dir}`),
    ...shared.map((f) => `  removed  tools/versus/candidates/${slotDir(slot)}/${f}`),
    `  rewrote  tools/versus/candidates/registry.ts — ${count} candidate${count === 1 ? "" : "s"} left`,
    removePoseRow(root, slot),
  ];
}
