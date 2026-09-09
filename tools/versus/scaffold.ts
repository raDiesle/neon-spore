/**
 * `bun run versus new <slot> <name>` — the candidate, spelled out, and the
 * five things about writing one that are not guessable.
 *
 * It prints rather than writes, and that is deliberate. A candidate with no
 * `fields` in it is a candidate `distinct.test.ts` and `variants.test.ts`
 * cannot pass, so a scaffold that wrote one to disk would hand the lane a red
 * tree to start from. What costs a lane tokens is not typing the twelve lines
 * — it is reading `README.md` end to end to find out that the imports are
 * relative, that `reached` is the drawing code's route and not the record, and
 * that a slot with no pose is compared against a red slick nobody asked about.
 * So the twelve lines come with those five sentences and nothing else.
 *
 * Registration is not in the template because there is nothing to register:
 * `registry.ts` is generated from the directories by `bun run versus index`.
 */

import { quoted, wrap } from "./text.js";

/** `creature:torch` -> `creature-torch`, the directory a slot's answers share. */
export function slotDir(slot: string): string {
  return slot.replace(":", "-");
}

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

export function template(slot: string, name: string): string[] {
  const dir = `tools/versus/candidates/${slotDir(slot)}/${name}`;
  return [
    `  ${dir}/index.ts`,
    "",
    ...`import * as look from "../../../../packages/render/src/<file>.js";
import { patch, type Variant } from "../../variant.js";

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
      `Give \`${slot}\` a pose in \`tools/director/src/versus-pose.ts\` in the same commit. ` +
        "A slot with no entry falls through to a red slick falling, which for five slots " +
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
