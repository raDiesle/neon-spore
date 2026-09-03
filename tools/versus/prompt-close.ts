/**
 * Steps 4 to 7 of a vote prompt: removing the slot, what not to do, the check,
 * and the commit.
 *
 * These four run whatever won, including `KEEP CURRENT` — a keep is an adoption
 * whose file list happens to be empty, and the slot still has to come off the
 * sheet, the check still has to be green and the decision still has to reach a
 * commit body. Steps 0 to 3, which only an adoption reaches, are next door in
 * `prompt-steps.ts`; the split is where the two halves stop sharing a reader.
 */

import type { Prompt } from "./prompt-steps.js";
import { count, quoted, wrap } from "./prompt-text.js";
import { patchedFields } from "./variant.js";

/** 4 — every candidate directory goes, the winner's included. */
export function removeSlot(p: Prompt): string[] {
  const { dirs, pkgs } = p;
  const out = [
    wrap(
      '**4. REMOVE THE SLOT.** Every candidate in it, including one that won. "Removed" means, exactly:',
    ),
    "",
  ];
  for (const d of dirs) out.push(`        git rm -r ${d}`);
  out.push(
    "",
    wrap(
      `— the whole directory${dirs.length === 1 ? "" : " each time"}, not the one ` +
        "file you can see, because a candidate may have grown a helper beside it. " +
        "Then, in `tools/versus/candidates/index.ts`, delete the " +
        `${count(dirs.length)} \`import\` line${dirs.length === 1 ? "" : "s"} that ` +
        `named ${dirs.length === 1 ? "that directory" : "those directories"} and ` +
        `the ${dirs.length === 1 ? "entry it" : `${count(dirs.length)} entries they`} ` +
        "contributed to the `VARIANTS` array. Nothing else in the repository " +
        `refers to ${dirs.length === 1 ? "it" : "any of them"}; if the typecheck says ` +
        "otherwise, that is a real finding — report it, do not add an export to " +
        "satisfy it.",
    ),
    "",
    wrap(
      `A winning candidate's directory goes too. Its values live in ${quoted(pkgs)} ` +
        "now, and a second copy of them in a tool is the drift this whole " +
        "arrangement exists to prevent.",
    ),
    "",
    wrap(
      "If `VARIANTS` ends up empty, leave it as an empty array and leave the " +
        "file. `tools/versus/variant.ts`, `seed.ts`, `prompt.ts`, `run.ts` and " +
        "`candidates/index.ts` all stay whether or not a slot is open — they are " +
        "the seam, not scaffolding, the way `Effects` stays whether or not " +
        "anything is exploding.",
    ),
    "",
  );
  return out;
}

/** 5 — the three ways a session widens a vote it was not asked to widen. */
export function whatNotToDo(p: Prompt): string[] {
  const { candidates, shape, subject } = p;
  const forbidden = quoted(
    ["variant", "candidate", "current", ...candidates.map((c) => c.name)],
    "or",
  );
  const untouched = [
    ...new Set(
      shape.patches.flatMap((patch) =>
        Object.keys(patch.target).filter((k) => !patchedFields(patch).includes(k)),
      ),
    ),
  ];
  return [
    "**5. WHAT NOT TO DO.**",
    "",
    wrap(
      "Do not touch `packages/sim`. Nothing here is visible to the simulation " +
        "and nothing here may become visible to it.",
      "- ",
      "  ",
    ),
    wrap(
      "Do not add a variant flag, a second silhouette, a config field, an " +
        "optional argument or an `if` anywhere in `packages/render` or " +
        `\`packages/content\`. The game drew one ${subject} before this and draws ` +
        `one ${subject} after it. If you find yourself typing the words ` +
        `${forbidden} into either package, the instruction has been misread.`,
      "- ",
      "  ",
    ),
    wrap(
      (untouched.length > 0 && untouched.length <= 8
        ? `Do not touch ${quoted(untouched, "or")}, `
        : "Do not touch a field this vote did not name, ") +
        "or any record this slot did not name. The obvious next thought after a " +
        "change like this is one more change beside it, and that is a different " +
        "question that nobody voted on.",
      "- ",
      "  ",
    ),
    "",
  ];
}

/** 6 — the commands, and what to read in their output rather than watch exit. */
export function check(p: Prompt): string[] {
  const derived = p.won !== null && p.isContent;
  const out = ["**6. CHECK.**", ""];
  if (derived) out.push("        bun run shapes:report");
  out.push("        bun run check", "");
  if (derived) {
    out.push(
      wrap(
        "`shapes:report` prints the patched silhouettes' geometry as numbers, and " +
          "the change of step 1 should be measurable in it — read the output, do " +
          "not just watch it exit 0.",
      ),
      "",
    );
  }
  out.push(
    wrap(
      "`bun run check` is the typecheck, biome and the full suite, including " +
        "`packages/render/test/frame.test.ts`, which draws whole frames through a " +
        "canvas that refuses a NaN coordinate or an unparseable colour, and " +
        "`tools/versus/test/variants.test.ts`, which will be running over a " +
        "registry with one fewer slot in it.",
    ),
    "",
  );
  return out;
}

/** 7 — the staging list, and what the commit body has to carry. */
export function commit(p: Prompt): string[] {
  const { won, files, dirs, pkgs, subject, isContent } = p;
  const out = [wrap("**7. COMMIT,** on CLAUDE.md's four conditions. Stage only these paths:"), ""];
  const staged: [string, string][] = [];
  for (const f of files) staged.push([f, ""]);
  staged.push(["tools/versus/candidates/index.ts", ""]);
  for (const d of dirs) staged.push([`${d}/`, "(deleted)"]);
  if (won && isContent) {
    staged.push(["tools/shape-sheet/shape-sheet.svg", "(if step 3 rewrote it)"]);
    staged.push(["tools/shape-sheet/motion-sheet.svg", "(if step 3 rewrote it)"]);
  }
  const pw = Math.max(...staged.map((s) => s[0].length)) + 5;
  for (const [path, note] of staged) out.push(`        ${note ? path.padEnd(pw) + note : path}`);
  out.push(
    "",
    wrap(
      "The subject is a sentence in this history's voice. The body carries the " +
        "`why` line above verbatim and names what lost — that sentence is the only " +
        "durable record of the decision, so do not compress it to a line naming " +
        "the winner.",
    ),
    "",
  );
  out.push(
    won
      ? wrap(
          `Readers. Do not name how the ${subject} reads on the field — that is ` +
            "what the vote was: at true size, at tempo, beside the thing it " +
            "replaces. Do name, in one sentence in the commit body, each reader " +
            "step 2 turned up that the vote did not put on either phone — a title " +
            "screen, a sheet, a card. A place worth glancing at, not an obligation: " +
            "the release note carries the sentence forward on its own.",
        )
      : wrap(
          `Readers. Name none. Not how the ${subject} reads — that is what the ` +
            `vote was — and not a reader, because nothing in ${quoted(pkgs)} ` +
            "changed for one to read.",
        ),
  );
  out.push(
    "",
    wrap(
      "The vote is the record, and nothing is left waiting on it. `bun run land` " +
        "writes what this commit changed into `docs/release-notes.md` like any " +
        "other landing.",
    ),
    "",
  );
  return out;
}
