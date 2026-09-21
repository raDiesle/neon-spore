/**
 * `bun run versus new <slot> <name>` — the candidate, spelled out, and the
 * five things about writing one that are not guessable.
 *
 * It prints rather than writes, and that is deliberate — but the directory now
 * comes first, as the `mkdir -p` that makes it. That was the one part of this
 * a lane could not paste: `versus new` named a candidate and left the name in
 * the prose, so the lane made the directory by hand, wrote one answer's files
 * and the next answer's a few minutes later, and every `bun run versus index`
 * in between failed on the empty directory it had left standing (21 September
 * 2026; `registry.ts` now says which half of a candidate is missing).
 *
 * What it will not write is the files, and three tests are the reason. A
 * candidate with no `fields` in it says nothing the shipped record does not
 * (`test/distinct.test.ts`) and patches no field the record has
 * (`test/variants.test.ts`); one that is on disk and not in the generated
 * registry fails `test/registry.test.ts`. A scaffold that wrote its own
 * template out would hand the lane a red tree to start from whichever way it
 * went — with `bun run versus index` run for it or without.
 *
 * What costs a lane tokens is not typing the twelve lines
 * — it is reading `README.md` end to end to find out that the imports are
 * relative, that `reached` is the drawing code's route and not the record, and
 * that a slot with no pose is compared against a red slick nobody asked about.
 * So the twelve lines come with those five sentences and nothing else.
 *
 * Registration is not in the template because there is nothing to register:
 * `registry.ts` is generated from the directories by `bun run versus index`.
 */

import { posix } from "node:path";
// The slot-to-directory spelling lives with the tree it names, because closing
// a slot has to read that tree without importing a candidate (`registry.ts`).
import { slotDir } from "./slots.js";
import { quoted, wrap } from "./text.js";

/**
 * `creature:torch` + `flare` -> `TORCH_FLARE`, the way the standing candidates
 * are named: the specific half of the slot, then the answer. `creature`,
 * `ship`, `panel` and `field` are the areas that say nothing on their own, so
 * a slot in one of them is named after the thing instead.
 */
export function symbolFor(slot: string, name: string): string {
  const [area = slot, thing = ""] = slot.split(":");
  const generic = ["creature", "ship", "panel", "field"].includes(area);
  const base = generic ? (thing.split("-").pop() ?? area) : area;
  return `${base}_${name}`.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

/**
 * The specifier a file in `dir` writes to reach `target`, both repo-relative.
 *
 * Computed and not spelled, because the spelling was wrong for as long as the
 * layout has been what it is: a candidate used to be one file at
 * `candidates/<name>.ts` and the template still carried that file's four
 * levels up, so every import in a scaffolded candidate was one directory short
 * and the file did not typecheck the moment it was saved (17 September 2026,
 * the `lost:screen` answers). A depth is a fact about a path and there is a
 * function for it.
 */
function from(dir: string, target: string): string {
  const rel = posix.relative(dir, target);
  return rel.startsWith(".") ? rel : `./${rel}`;
}

export function template(slot: string, name: string): string[] {
  const dir = `tools/versus/candidates/${slotDir(slot)}/${name}`;
  const look = from(dir, "packages/render/src/<file>.js");
  const variant = from(dir, "tools/versus/variant.js");
  return [
    `  mkdir -p ${dir}`,
    "",
    `  ${dir}/index.ts`,
    "",
    ...`import * as look from "${look}";
import { patch, type Variant } from "${variant}";

export const ${symbolFor(slot, name)}: Variant = {
  slot: "${slot}",
  name: "${name}",
  sentence: "<one line in your own words — the page quotes it verbatim>",
  dir: "${dir}",
  patches: [
    patch({
      target: look.<RECORD>,
      reached: () => look.<RECORD>,
      where: {
        file: "packages/render/src/<file>.ts",
        symbol: "<RECORD>",
        type: "<Type>",
      },
      fields: {},
    }),
  ],
};`
      .split("\n")
      .map((l) => (l ? `    ${l}` : l)),
  ];
}

/** The five things a lane would otherwise read `README.md` in full to learn. */
export function rules(slot: string): string[] {
  const say = (n: string, text: string): string[] => ["", wrap(`${n}  ${text}`, "  ", "      ")];
  return [
    ...say(
      "1.",
      "Imports are relative paths into the packages, never `@neon-spore/render`: this " +
        "directory has no `package.json`, so the bare specifier does not resolve.",
    ),
    ...say(
      "2.",
      '`reached` is the route the *drawing code* takes — `() => livingSilhouette("bulb")`, ' +
        "not `() => BULB`. The whole monkeypatch rests on the draw path reading that exact " +
        "object every call, and `test/variants.test.ts` checks it does.",
    ),
    ...say(
      "3.",
      "Check the record is on the branch the shipping game takes. A draw path that chooses " +
        "between a baked asset and a procedural one will happily let you patch the half a " +
        "phone never runs. Read the call site and count the arguments.",
    ),
    ...say(
      "4.",
      `Give \`${slot}\` a row in \`tools/director/src/versus-pose.ts\` in the same commit — ` +
        "the row alone; why that pose goes on the pose's own docstring in `poses-*.ts`. " +
        "A slot with no row falls through to a red slick falling, which for five slots " +
        "once meant two identical pictures and a vote on a difference nobody could see.",
    ),
    ...say(
      "5.",
      "Every answer in a slot patches the same records and the same fields, and no field " +
        "may be claimed by two open slots at once. `bun run versus` lists what is taken.",
    ),
    "",
    wrap(
      "Then `bun run versus index` — the registry is generated from the directories, so " +
        "there is no array to add a line to.",
      "  ",
    ),
  ];
}

export function scaffold(slot: string, name: string, taken: readonly string[]): string[] {
  const clash = taken.includes(name);
  return [
    "",
    ...(clash
      ? [wrap(`\`${slot}\` already offers ${quoted(taken)} — pick another name.`, "  "), ""]
      : []),
    ...template(slot, name),
    "",
    ...rules(slot),
  ];
}
