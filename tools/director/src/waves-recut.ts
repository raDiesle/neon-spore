import type { Wave } from "@neon-spore/content";
import { biomeLineCount } from "./biome-lines.js";
import { STEPS, TUTORIAL_LAST_ID } from "./compose-steps.js";
import { splitCurriculum } from "./curriculum-order.js";
import { serializeWaveArray } from "./serialize.js";
import { type ActName, CUT_AT, exportNameFor, fixImports } from "./waves-act-list.js";

/**
 * **The act files after the tutorial arc, cut again in the order the waves
 * are played** — what `bun run waves:order --write` writes.
 *
 * A save keeps each wave in the act that holds it and never moves one back
 * (`assignToActs`), which is right for a wave dragged in the editor and wrong
 * for a reorder that moves nearly every unit: on 16 October 2026 the moved
 * waves piled into thirty new pages at the end, and fifty-five act files were
 * left holding nothing under a header about waves that had gone elsewhere.
 * So a reorder throws the old cut away. The arc, which nothing reorders, keeps
 * its files and the prose written over them; every file after it is written
 * fresh — one name each, `act-3` on — holding whole blocks while they fit
 * under the ceiling, under a header that says which waves of the game it
 * holds and whose. A second reorder re-cuts again rather than appending.
 *
 * Pure: waves and sources in, texts out. `waves-acts.ts` writes them.
 */

/** Whose a wave is, for the header: a block's head, a boss, a review or a
 * filler. */
interface Owner {
  id: string;
  label: string;
}

/** The block prefix of a composed wave's id: `theLanceSpread` → `theLance`. */
function prefixOf(id: string): string | null {
  const step = STEPS.find((s) => id.endsWith(s.name) && id.length > s.name.length);
  return step ? id.slice(0, -step.name.length) : null;
}

/** Every wave from `from` on, with whose it is, in order. */
function owners(all: readonly Wave[], from: number): Owner[] {
  const heads = new Map(splitCurriculum(all).units.map((u) => [u.head.id, u.head.name]));
  const named = new Map(all.map((w) => [w.id, w.name]));
  const block = (id: string) => ({ id, label: `${heads.get(id) ?? id}'s block` });
  let current: Owner = { id: TUTORIAL_LAST_ID, label: "the arc's last waves" };
  return all.slice(from).map((w) => {
    if (w.boss) return { id: w.id, label: `the boss ${w.name}` };
    if (heads.has(w.id)) {
      current = block(w.id);
      return current;
    }
    const prefix = prefixOf(w.id);
    if (prefix && heads.has(prefix)) return block(prefix);
    if (prefix?.startsWith("review")) {
      const head = `the${prefix.slice("review".length)}`;
      return { id: prefix, label: `${named.get(head) ?? prefix}'s review` };
    }
    if (prefix?.startsWith("filler")) {
      const boss = prefix.slice("filler".length);
      const name =
        named.get(`the${boss}`) ?? named.get(boss.charAt(0).toLowerCase() + boss.slice(1));
      return { id: prefix, label: `the filler before ${name ?? prefix}` };
    }
    return current;
  });
}

/** `text` as the lines of a doc comment, each under eighty columns. */
function wrapped(text: string): string[] {
  const lines: string[] = [];
  let line = " *";
  for (const word of text.split(" ")) {
    if (line.length + 1 + word.length > 80) {
      lines.push(line);
      line = " *";
    }
    line += ` ${word}`;
  }
  return [...lines, line];
}

/** Labels joined the way a sentence lists them. */
function listed(labels: readonly string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/** The empty act file for the waves from `at` to `to`, its header saying whose they are. */
function source(name: string, of: readonly Owner[], at: number, to: number, base: number): string {
  const runs: string[] = [];
  const own = of.slice(at, to);
  for (const [i, o] of own.entries()) if (i === 0 || own[i - 1]?.id !== o.id) runs.push(o.label);
  const first = of[at - 1]?.id === own[0]?.id;
  const last = of[to]?.id === own[own.length - 1]?.id;
  if (runs.length === 1 && first && last) runs[0] = `the middle of ${runs[0]}`;
  else {
    if (first) runs[0] = `the end of ${runs[0]}`;
    if (last) runs[runs.length - 1] = `the start of ${runs[runs.length - 1]}`;
  }
  const said =
    `Waves ${base + at + 1} to ${base + to} of the game, in the order they are ` +
    `played: ${listed(runs)}.`;
  return [
    'import type { Wave } from "../wave-types.js";',
    "",
    "/**",
    ...wrapped(said),
    " *",
    ...wrapped(
      "Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act " +
        "after the tutorial arc again in play order. A save that fills it cuts a page " +
        "after it (`acts.ts`).",
    ),
    " */",
    `export const ${exportNameFor(name)}: Wave[] = [`,
    "];",
    "",
  ].join("\n");
}

/**
 * The files the waves after the arc are cut into, named `act-<first>` on:
 * each holds whole blocks while they fit under `CUT_AT`, and a block that
 * fits in no file on its own is cut wave by wave.
 */
export function recutActs(
  all: readonly Wave[],
  from: number,
  first: number,
  known: ReadonlyMap<string, string>,
): { act: ActName; text: string }[] {
  const of = owners(all, from);
  const rest = all.slice(from);
  const text = (n: number, at: number, to: number) => {
    const name = `act-${n}`;
    const base = source(name, of, at, to, from);
    return fixImports(serializeWaveArray(base, rest.slice(at, to), exportNameFor(name)), known);
  };
  const fits = (n: number, at: number, to: number) => biomeLineCount(text(n, at, to)) <= CUT_AT;
  // Where each block starts: a cut falls on one when it can.
  const starts = of.flatMap((o, i) => (i === 0 || of[i - 1]?.id !== o.id ? [i] : []));
  const cuts: [number, number][] = [];
  let at = 0;
  let to = 0;
  for (const [k, start] of starts.entries()) {
    const end = starts[k + 1] ?? rest.length;
    if (fits(first + cuts.length, at, end)) {
      to = end;
      continue;
    }
    if (to > at) cuts.push([at, to]);
    at = to = start;
    if (fits(first + cuts.length, at, end)) {
      to = end;
      continue;
    }
    // A block too long for a file of its own, cut wave by wave.
    for (let i = start; i < end; i++) {
      if (!fits(first + cuts.length, at, i + 1)) {
        cuts.push([at, i]);
        at = i;
      }
      to = i + 1;
    }
  }
  if (to > at) cuts.push([at, to]);
  return cuts.map(([a, b], i) => {
    const name = `act-${first + i}`;
    return { act: { name, exportName: exportNameFor(name) }, text: text(first + i, a, b) };
  });
}
