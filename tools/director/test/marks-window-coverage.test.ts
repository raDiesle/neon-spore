import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { BOSS_KINDS } from "@neon-spore/sim";
import { NO_ROW } from "./marks-window-no-row.js";
import { ROWS_A } from "./marks-window-rows-a.js";
import { ROWS_B } from "./marks-window-rows-b.js";
import { ROWS_C } from "./marks-window-rows-c.js";
import { ROWS_D } from "./marks-window-rows-d.js";

/**
 * **Every boss has a row in `marks-window.test.ts`, or a line in `NO_ROW`
 * saying why not** — and nothing has both, so the allowance can only shrink.
 * Apart from the walk itself, which is minutes long, because this half is a
 * lookup and should go red in a second when a boss is added without either.
 */

const RENDER = join(import.meta.dir, "../../../packages/render/src");
const marksFile = (kind: string) => existsSync(join(RENDER, `${kind}-marks.ts`));
const rowed = [...ROWS_A, ...ROWS_B, ...ROWS_C, ...ROWS_D].map((r) => r.kind);

describe("the bosses marks-window.test.ts walks", () => {
  test("are every boss, less the ones NO_ROW names", () => {
    const missing = BOSS_KINDS.filter((k) => !rowed.includes(k) && NO_ROW[k] === undefined);
    expect(missing, "bosses with no row and no line in NO_ROW").toEqual([]);
  });

  test("leave nothing on NO_ROW that has a row — strike its line", () => {
    expect(rowed.filter((k) => NO_ROW[k] !== undefined)).toEqual([]);
  });

  test("give no boss two rows", () => {
    expect(rowed.filter((k, i) => rowed.indexOf(k) !== i)).toEqual([]);
  });

  test("owe a row only where there is a marks file to spy on, and say so where there is none", () => {
    for (const [kind, why] of Object.entries(NO_ROW)) {
      if (why === "owed") expect(marksFile(kind), `${kind} is owed, with no marks file`).toBe(true);
      if (why === "no-marks-file") expect(marksFile(kind), `${kind} has one now`).toBe(false);
    }
  });
});
