import { describe, expect, test } from "bun:test";
import type { Wave } from "@neon-spore/content";
import { changedCount, makeWaveDraft, overlayDraft, type StoredDraft } from "../src/waves-draft.js";
import { installDom } from "./fake-dom.js";

/**
 * THE WAVE EDITOR'S UNSAVED EDITS SURVIVE A RELOAD — the owner, 11 October
 * 2026. What is tested is the count the save button shows, the draft laid back
 * over the act files, and the storage round trip `main.ts` drives.
 */

const wave = (id: string, name = id): Wave => ({ id, name, entries: [] });
const json = (waves: Wave[]) => new Map(waves.map((w) => [w.id, JSON.stringify(w)]));

describe("changedCount", () => {
  const base = [wave("a"), wave("b"), wave("c")];

  test("nothing changed is zero", () => {
    expect(changedCount(json(base), structuredClone(base))).toBe(0);
  });

  test("an edited, an added and a deleted wave count one each", () => {
    const now = [wave("a", "A!"), wave("c"), wave("d")];
    expect(changedCount(json(base), now)).toBe(3);
  });

  test("a reorder and nothing else is one", () => {
    expect(changedCount(json(base), [wave("b"), wave("a"), wave("c")])).toBe(1);
  });
});

describe("overlayDraft", () => {
  test("files that have not moved: the draft is the list", () => {
    const draft: StoredDraft = { token: "t1", waves: [wave("b")], edited: [], base: ["a", "b"] };
    expect(overlayDraft(draft, [wave("a"), wave("b")], "t1")).toEqual([wave("b")]);
  });

  test("files that moved: only the edited waves are laid over them", () => {
    const draft: StoredDraft = {
      token: "old",
      waves: [wave("a", "mine"), wave("b"), wave("gone")],
      edited: ["a"],
      base: ["a", "b", "gone"],
    };
    const disk = [wave("a", "theirs"), wave("b", "theirs too"), wave("new")];
    expect(overlayDraft(draft, disk, "fresh").map((w) => w.name)).toEqual([
      "mine",
      "theirs too",
      "new",
    ]);
  });
});

describe("makeWaveDraft", () => {
  test("an edit is stored, read back on the next load, and forgotten when undone", () => {
    const dom = installDom();
    try {
      const disk = [wave("a"), wave("b")];
      const first = makeWaveDraft();
      expect(first.settle([wave("a", "edited")])).toBe(0);
      first.setBase(disk, "t");
      expect(first.settle([wave("a", "edited"), wave("b")])).toBe(1);

      const reload = makeWaveDraft();
      reload.setBase(disk, "t");
      expect(reload.restore(disk, "t")?.[0]?.name).toBe("edited");

      expect(reload.settle(structuredClone(disk))).toBe(0);
      expect(makeWaveDraft().restore(disk, "t")).toBeNull();
    } finally {
      dom.restore();
    }
  });

  test("base hands back a copy, so RESET is not edited by the next edit", () => {
    const draft = makeWaveDraft();
    draft.setBase([wave("a")], "t");
    const [copy] = draft.base();
    if (copy) copy.name = "changed";
    expect(draft.base()[0]?.name).toBe("a");
  });
});
