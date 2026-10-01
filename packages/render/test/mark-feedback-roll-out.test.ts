import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { BOSS_KINDS } from "@neon-spore/sim";

/**
 * **Every boss with a mark answers a touch the same way** — the owner, 27
 * September 2026: *ultimately i want the consistent visual across all waves …
 * make sure that extending boss waves or adding new will follow the same
 * conventions* (`.claude/skills/new-boss/generic.md`).
 *
 * A boss has a mark when the renderer has a page for one: `<boss>-grip.ts`,
 * `-handles.ts`, `-hand.ts` or `-marks.ts`, which is where `new-boss` §5 puts
 * the thing a thumb or a bolt is asked for. Such a boss holds a
 * `GripVerdicts` in one of its own files (`grip-verdict.ts`), which is what
 * washes the touched mark green or red. The halo, the partner's ring and the
 * waiting clock are `mark-feedback.ts`'s, and whether a boss draws them is
 * its own verdict test's question, beside `instar-verdict.test.ts`.
 *
 * **`TO_COME` is the roll-out, in its order, and it only shrinks.** The
 * choreographed four first, then the rest as the table lists them. A lane
 * that gives a boss its verdicts takes it off the list, or this goes red;
 * a boss built after 27 September 2026 is never put on it.
 */
const TO_COME: readonly string[] = [
  "sling",
  "grindstone",
  "cyst",
  "davit",
  "halter",
  "capstan",
  "gall",
  "burgee",
  "flue",
];

const SRC = new URL("../src/", import.meta.url);
const FILES = readdirSync(SRC);

function hasMark(kind: string): boolean {
  const page = new RegExp(`^${kind}-(.+-)?(grip|handles?|hand|marks)[.]ts$`);
  return FILES.some((f) => page.test(f));
}

function holdsVerdicts(kind: string): boolean {
  return FILES.filter((f) => f.startsWith(`${kind}-`)).some((f) =>
    readFileSync(new URL(f, SRC), "utf8").includes("new GripVerdicts("),
  );
}

describe("the touch feedback's roll-out", () => {
  it("gives every boss with a mark, and not still to come, its verdicts", () => {
    const owed = BOSS_KINDS.filter((k) => hasMark(k) && !TO_COME.includes(k));
    expect(owed.filter((k) => !holdsVerdicts(k))).toEqual([]);
  });

  it("lists only bosses that have a mark and are still owed one", () => {
    for (const k of TO_COME) expect(BOSS_KINDS as readonly string[]).toContain(k);
    expect(TO_COME.filter((k) => !hasMark(k))).toEqual([]);
    expect(TO_COME.filter(holdsVerdicts)).toEqual([]);
    expect(new Set(TO_COME).size).toBe(TO_COME.length);
  });

  it("started from the worked example", () => {
    expect(hasMark("instar")).toBe(true);
    expect(holdsVerdicts("instar")).toBe(true);
  });
});
