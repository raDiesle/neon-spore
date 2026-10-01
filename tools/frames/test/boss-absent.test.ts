import { describe, expect, it } from "bun:test";
import type { BossSpec } from "../boss.js";
import { absentNote, bossError, NoSuchField, unlessAbsent } from "../boss-check.js";

/**
 * **A field only the after side has** (`docs/queue.md`, 30 September 2026):
 * `bun run frames 13757cea1 --boss catchTick=2375` was refused whole, because
 * the sha renamed `catchBeat` and its parent's boss had no `catchTick` yet.
 * The before side's missing field is now the one refusal a pair steps past.
 */

const PARENT = { kind: "pinball", catchBeat: 40 };
const SHA = { kind: "pinball", catchTick: 2400 };
const ASKED: BossSpec = [{ key: "catchTick", value: 2375 }];

function seenOn(state: Record<string, unknown>, list: BossSpec = ASKED) {
  return {
    kind: "pinball",
    hasBody: true,
    beatIsNumber: true,
    fields: list.map((f) => ({
      present: f.key in state,
      have: f.key in state ? [] : Object.keys(state).sort(),
      was: state[f.key],
    })),
  };
}

describe("a field the sha itself adds", () => {
  it("is a NoSuchField on the parent, naming what it has instead", () => {
    const error = bossError(ASKED, seenOn(PARENT));
    expect(error).toBeInstanceOf(NoSuchField);
    expect(error?.message).toBe(
      "--boss catchTick: the pinball has no such field. It has catchBeat, kind",
    );
  });

  it("is written on the sha", () => {
    expect(bossError(ASKED, seenOn(SHA))).toBeNull();
  });

  it("is an ordinary refusal when the field is there and the value is wrong", () => {
    const list: BossSpec = [{ key: "catchTick", value: "soon" }];
    const error = bossError(list, seenOn(SHA, list));
    expect(error).not.toBeNull();
    expect(error).not.toBeInstanceOf(NoSuchField);
  });

  it("lets the before side through as the field it lacks, and says so", async () => {
    const before = await unlessAbsent(Promise.reject(bossError(ASKED, seenOn(PARENT))));
    expect(before).toBeInstanceOf(NoSuchField);
    expect(absentNote(before as NoSuchField)).toContain("the after frame alone");
    expect(absentNote(before as NoSuchField)).toContain("catchTick");
  });

  it("still throws every other failure of the before side", async () => {
    const broken = unlessAbsent(Promise.reject(new Error("preview:once exited")));
    await expect(broken).rejects.toThrow("preview:once exited");
    expect(await unlessAbsent(Promise.resolve(7))).toBe(7);
  });
});
