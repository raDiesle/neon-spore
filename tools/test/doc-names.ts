import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./doc-paths.js";

/**
 * **What a source comment may name, and the ten names the tree keeps on
 * purpose after losing the things they named.**
 *
 * `doc-drift.test.ts` already asks whether a backticked *path* in a comment
 * names a file the tree has. This is the same question one level down: a
 * backticked *identifier*. It was earned the way the paths check was — a
 * comment in `packages/render/test/frame.test.ts` said `drawInstarWord`
 * carried the kind of an action, the function beside it had never carried
 * anything of the sort, and nothing in `bun run check` could notice.
 *
 * **The restriction is the whole design, and it was measured rather than
 * guessed.** Every backticked camelCase identifier under the `src` of every
 * package and app is 6,452 claims, of which 205 name nothing — and nearly all
 * 205 are platform globals a comment is perfectly entitled to name
 * (`AudioContext`, `Path2D`, `blockConcurrencyWhile`,
 * `accelerationIncludingGravity`). An allowlist of those is a file that rots
 * quietly, which is the thing this test exists to prevent. Restricting to
 * identifiers whose lowercase **head word is a word of the comment's own file
 * name** — a comment naming something in its own subject — is 1,523 claims,
 * of which 18 name nothing and not one is a platform global. That is a check
 * that pays for itself on the day it lands, with no allowlist at all.
 *
 * It is deliberately conservative and misses drift: `readyButtonBox` in
 * `apps/game/src/briefing.ts` named nothing either, and its head word is
 * `ready` rather than `briefing`, so nothing here would ever have asked. It
 * was found by hand while this was being written, and repaired in the same
 * commit. A check that catches the
 * comments about a file's own subject is worth having anyway — those are the
 * ones a reader trusts most.
 *
 * **A later pass tried widening it instead of living with the miss.**
 * TypeScript's own `lib.es5.d.ts` through `lib.es2022.d.ts`,
 * `lib.dom.d.ts`/`lib.dom.iterable.d.ts` and `@cloudflare/workers-types`'
 * `index.d.ts` declare every global this repository can legitimately name,
 * harvested the same way `declaredNames` harvests the tree — 8,980 names.
 * Checked against every claim instead of only a file's own subject, the
 * tree's 5,611 unrestricted claims name nothing 108 times; adding the
 * harvested set as a second source of truth brings that to 89 — nowhere near
 * the dozen that would have paid for dropping the restriction. Most of what
 * was left was not a platform name at all — a `damage*` family, eight names
 * (`damageCreature`, `damageFleet`, `damageMeteor` among them) a comment
 * still names for the reason `hullPercent` is remembered below: the owner's
 * 12 September 2026 rule that every hit costs the same took the figures out
 * and left only the argument against them. Widening that far would mean
 * remembering most of a hundred names instead of ten. The restriction stays,
 * and the harvested lib list is not wired in — it would not change what this
 * check catches today.
 *
 * **A string literal declares a name.** Three of the original eighteen —
 * `ledgerTear`, `ledgerWard`, `ledgerRefused` — are event types, which exist
 * only as the members of a string union and the arms of a switch. A harvester
 * that reads `function`/`const`/`interface` and object properties does not see
 * them, and reporting them would have been the test being wrong rather than
 * the comment.
 *
 * **What is left after that is a habit, not a defect.** Ten of the remaining
 * mentions name something the tree does not have *because the comment is
 * saying so*: a number the owner cut, an event retired with the creature that
 * raised it, a field a paragraph is arguing against ever adding. That is how
 * this repository's headers are written and it should stay that way, so the
 * exception is written down rather than inferred — `REMEMBERED` below, one
 * sentence each, on `sound-link-none.ts`' `NO_SUBJECT` terms: the rule is that
 * a comment names what is there, and this is the written exception.
 *
 * **Keyed by file *and* name, because the same word can be both.**
 * `navButtons` is remembered in `render/guide-nav.ts`, whose paragraph is
 * about the drawing leaving that file — and the same word in
 * `apps/game/src/briefing.ts` was a live claim about geometry that had moved,
 * repaired in the commit that added this. A table keyed by name alone would
 * have blessed the second along with the first.
 */
export const REMEMBERED = new Map<string, string>([
  [
    "packages/audio/src/bind-cling.ts → clingShake",
    "The fourth cling sound, gone with the shake on 15 September 2026; the paragraph is about why nothing took its place.",
  ],
  [
    "packages/render/src/guide-nav.ts → navButtons",
    "The bar's button table, which left for `GUIDE_LOOK` on 16 September 2026; the paragraph is about the move.",
  ],
  [
    "packages/sim/src/config-veer.ts → veerChanges",
    "The third veer number, cut on 6 September 2026 so a rock never stops changing lane; the paragraph is about the cut.",
  ],
  [
    "packages/sim/src/crystal.ts → crystalDiveRows",
    "The row a wrong guess used to cost; the owner took it out and the paragraph says where it is written up instead.",
  ],
  [
    "packages/sim/src/events-balloon.ts → balloonBurst",
    "The event `balloonTopped` replaced when the top of the field stopped billing the hull.",
  ],
  [
    "packages/sim/src/events-cling.ts → clingShake",
    "The fourth cling event, retired with the shake on 15 September 2026; the paragraph is about why nothing replaced it.",
  ],
  [
    "packages/sim/src/hull-damage.ts → hullPercent",
    "One of the figures the owner's every-hit-costs-the-same rule retired on 12 September 2026, named to say what this file used to be.",
  ],
  [
    "packages/sim/src/magnet.ts → magnetSlantMilli",
    "The threshold a slant was measured against, gone with the diagonal the lock used to steer.",
  ],
  [
    "packages/sim/src/maze-solve.ts → mazeRoute",
    "The hand-listed route `mazeWheel` replaces; the paragraph is about why a second copy of the corridors drifts.",
  ],
  [
    "packages/sim/src/vane-cycle.ts → vaneCycleBeats",
    "A `SimConfig` field the paragraph is arguing against ever adding, beside the `VANE_CYCLE_BEATS` that is summed instead.",
  ],
]);

/** Every `.ts` under `packages/*` / `apps/*`'s own `src`, repository-relative. */
export function sourceFiles(): string[] {
  const glob = new Bun.Glob("{packages,apps}/*/src/**/*.ts");
  return [...glob.scanSync({ cwd: ROOT })].sort();
}

/**
 * The comment text of a source file — `//` to end of line and block comments —
 * with string and template literals skipped, so a `//` inside a quoted route is
 * not read as one. The same token shape `commentSpans` in
 * `tools/director/src/serialize.ts` matches, kept apart rather than imported:
 * that one compares a wave file's comments before and after a save, these read
 * what a comment says, and the two agree on nothing but the tokens.
 */
export function commentSpans(source: string): string[] {
  const tokens =
    /`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\*[\s\S]*?\*\/|(?:^|[^:])\/\/[^\n]*/gm;
  const found: string[] = [];
  for (const [text] of source.matchAll(tokens)) {
    if (text.startsWith("/*")) {
      found.push(text);
      continue;
    }
    const slash = text.indexOf("//");
    if (slash !== -1) found.push(text.slice(slash));
  }
  return found;
}

/** A declaration keyword and the name it introduces. */
const DECLARED = /\b(?:function|class|interface|type|enum|const|let|var)\s+([A-Za-z_$][\w$]*)/g;
/** An indented `name:` or `name(`: an interface field, an object key, a method. */
const PROPERTY = /^\s{2,}([A-Za-z_$][\w$]*)\s*[:(]/gm;
/**
 * A quoted word. Event types, sound ids and `DragTarget` members exist only as
 * these, and a sound id is dotted (`boss.ledgerTear`), so each is split on the
 * dot and every part counts.
 */
const QUOTED = /["']([A-Za-z_$][\w$.]*)["']/g;

/** Every file a name could be declared in: sources, tools and tests alike. */
function everyFile(): string[] {
  const glob = new Bun.Glob("{packages,apps,tools}/**/*.ts");
  return [...glob.scanSync({ cwd: ROOT })].filter((f) => !f.includes("node_modules")).sort();
}

/**
 * Every name this tree writes down anywhere, by any of the three forms above.
 * Deliberately generous: the question asked of it is only ever *does this word
 * appear as a name at all*, and a false yes costs a comment nobody checked
 * while a false no costs a red test nobody can fix.
 */
export function declaredNames(): Set<string> {
  const names = new Set<string>();
  for (const file of everyFile()) {
    const source = readFileSync(join(ROOT, file), "utf8");
    for (const match of source.matchAll(DECLARED)) names.add(match[1] as string);
    for (const match of source.matchAll(PROPERTY)) names.add(match[1] as string);
    for (const match of source.matchAll(QUOTED))
      for (const part of (match[1] as string).split(".")) names.add(part);
  }
  return names;
}

/** The words of a file's own name: `bind-ledger.ts` → `["bind", "ledger"]`. */
function ownWords(file: string): string[] {
  const base = (file.split("/").pop() ?? "").replace(/\.tsx?$/, "");
  return base.split("-").filter((word) => word.length >= 3);
}

/** A whole backticked span that is one identifier, with an optional `()`. */
const IDENTIFIER = /^([A-Za-z_$][\w$]*)(?:\(\))?$/;

/**
 * The identifiers a file's comments name **in their own file's subject**: whole
 * backticked spans, camelCase, whose first lowercase run is one of the words of
 * the file's name. Not PascalCase — a type named in a comment is as often
 * imported from a library as declared here, and the restriction that makes this
 * check cheap is the one that keeps it honest.
 */
export function ownSubjectClaims(file: string, source: string): string[] {
  const words = ownWords(file);
  if (words.length === 0) return [];
  const found: string[] = [];
  for (const span of commentSpans(source)) {
    for (const match of span.matchAll(/`([^`\n]+)`/g)) {
      const identifier = IDENTIFIER.exec((match[1] ?? "").trim());
      if (identifier === null) continue;
      const name = identifier[1] as string;
      if (!/^[a-z]/.test(name) || !/[A-Z]/.test(name)) continue;
      const head = (/^[a-z]+/.exec(name) as RegExpExecArray)[0];
      if (words.includes(head)) found.push(name);
    }
  }
  return found;
}
