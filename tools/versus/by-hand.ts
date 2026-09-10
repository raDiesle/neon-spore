/**
 * What to do instead, when `adopt` will not do it — its own file since the
 * take of a function-valued field moved into `decide.ts`'s plan and left that
 * file no room for the prose it prints when the plan cannot be made.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./root.js";
import { wrap } from "./text.js";
import type { Variant } from "./variant.js";

/**
 * What to do instead, when the tool will not do it — spelled out rather than
 * left as "take it by hand".
 *
 * It matters more than it looks. Fourteen of the fifteen candidates standing on
 * 9 September 2026 patch a whole drawing function rather than a colour, so this
 * is the path a lane actually walks, and every step of it is the same four
 * every time: the candidate's `paint.ts` moves into the package, its imports
 * lose the five `../`, the record points at the moved function, and the slot is
 * closed with a reason. Saying so here costs one read; working it out from the
 * candidate costs five.
 */
export function byHand(won: Variant, recordFile: string): string[] {
  const paint = `${won.dir}/paint.ts`;
  const has = existsSync(join(ROOT, paint));
  const pkg = recordFile.split("/").slice(0, 2).join("/");
  return [
    wrap(`Nothing was written. Taking \`${won.slot}\` / \`${won.name}\` by hand:`),
    "",
    ...(has
      ? [
          `  1. git mv ${paint} ${pkg}/src/<a name for it>.ts`,
          "",
          wrap(
            `2. In the moved file, rewrite the imports: a \`../../…/${pkg}/src/x.js\` ` +
              "becomes `./x.js`, and a path into another package becomes its bare " +
              "specifier — the candidate directory has no `package.json`, and the " +
              "package it is moving into does.",
            "  ",
            "     ",
          ),
          "",
          wrap(
            `3. In \`${recordFile}\`, point the field at the moved function, and delete ` +
              "the implementation nothing reads any more.",
            "  ",
            "     ",
          ),
        ]
      : [
          wrap(
            `1. Open \`${recordFile}\` and make the change the candidate makes. Its own ` +
              `\`index.ts\` under \`${won.dir}\` is the argument for it.`,
            "  ",
            "     ",
          ),
        ]),
    "",
    wrap(
      `${has ? "4" : "2"}. bun run versus drop ${won.slot} "taken by hand — <why>"`,
      "  ",
      "     ",
    ),
    "",
    wrap("Then `bun run check`."),
  ];
}
