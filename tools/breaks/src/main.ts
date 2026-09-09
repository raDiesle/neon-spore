#!/usr/bin/env bun

/**
 * `bun run breaks` — every break the engine can make, drawn across time.
 *
 * The bench for `packages/render/src/shatter.ts`. A break lasts about a second
 * and the pieces separate inside the first fifth of one, so the only way to
 * judge a tuning is to see the whole arc at once: this puts seven moments of
 * each on one page, off the same geometry the field would draw.
 *
 * It is a **tool and not a look** (`docs/looks.md`): nothing on it is on the
 * field. `BREAK_LOOK.wedges` ships at 0 — the game draws no pieces at all — and
 * every row here is a tuning being tried on the way to a VERSUS candidate.
 *
 * The loop it exists for, and the reason it writes a file rather than opening a
 * server: change a number in `subjects.ts`, run this, rasterise it with
 * `bun run png docs/reference/breaks.svg out.png`, look at the picture, change
 * the number again. `.claude/skills/destruction` has the whole procedure.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { sheet } from "./sheet.js";

export { sheet } from "./sheet.js";
export { SUBJECTS } from "./subjects.js";

if (import.meta.main) {
  const out = resolve(import.meta.dir, "../../../docs/reference/breaks.svg");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, sheet(), "utf8");
  console.log(`wrote ${out}`);
  console.log("rasterise it:  bun run png docs/reference/breaks.svg breaks.png");
}
