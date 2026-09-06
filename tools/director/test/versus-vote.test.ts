import { describe, expect, it } from "bun:test";
import { patch, type Slot, type Variant } from "../../versus/variant.js";
import { buildVoteBox } from "../src/versus-vote.js";
import { type FakeEl, installDom } from "./fake-dom.js";

/**
 * What a press of ADOPT or KEEP CURRENT actually puts on the clipboard.
 *
 * This is the test the wiring did not have, and the reason it needed one:
 * `tools/versus/prompt.ts` and its four companions were typechecked, linted
 * and covered by `tools/versus/test/prompt.test.ts` for a fortnight while
 * nothing in the director imported any of them. Every one of those tests
 * passed the whole time, because they hold the builder rather than the button
 * — so the text `docs/versus.md` argues for at length had never once reached a
 * clipboard, and the box was copying a four-line record that said so twice.
 *
 * A test of the builder cannot notice that. This one presses the button.
 */

const SKIN = { body: ["#F04AD8", "#B21FA0"], rim: "#FF6FE4" };

function slotWith(name: string): Slot {
  const candidate: Variant = {
    slot: "ship:hull-skin",
    name,
    sentence: "amber where the ship is violet",
    dir: `tools/versus/candidates/ship-hull-skin.${name}`,
    patches: [
      patch({
        target: SKIN,
        reached: () => SKIN,
        where: { file: "packages/content/src/hull.ts", symbol: "OWN_SKIN", type: "HullSkin" },
        fields: { rim: "#FFC46F" },
      }),
    ],
  };
  return { slot: "ship:hull-skin", candidates: [candidate] };
}

/** The fake DOM, plus the one thing beyond it a vote reaches for. */
function press(label: "ADOPT" | "KEEP"): string {
  const dom = installDom();
  const had = (globalThis as { navigator?: unknown }).navigator;
  let copied = "";
  (globalThis as { navigator?: unknown }).navigator = {
    clipboard: {
      writeText: (text: string) => {
        copied = text;
        return Promise.resolve();
      },
    },
  };
  try {
    const slot = slotWith("warm");
    const box = buildVoteBox(slot, { head: "b1085619cc6", dirty: false });
    box.setCandidate(slot.candidates[0] as Variant);
    // `box.root` is typed as an `HTMLElement` because that is what the
    // director builds; under this test it is a `FakeEl`, which is the whole
    // point of the file.
    const root = box.root as unknown as FakeEl;
    const buttons = root.descendants();
    const button = buttons.find((b) => b.textContent.startsWith(label));
    if (!button) throw new Error(`no ${label} button — ${buttons.map((b) => b.textContent)}`);
    button.click();
    return copied;
  } finally {
    (globalThis as { navigator?: unknown }).navigator = had;
    dom.restore();
  }
}

describe("the vote box", () => {
  it("copies the adoption prompt, not a record that says it is not one", () => {
    const text = press("ADOPT");
    expect(text).not.toContain("not built yet");
    // The steps are the half a record never carried, and step 0 is the
    // staleness refusal every later step depends on.
    expect(text).toContain("ship:hull-skin");
    expect(text).toContain("warm");
    expect(text).toContain("packages/content/src/hull.ts");
    expect(text).toContain("bun run check");
    expect(text.split("\n").length).toBeGreaterThan(30);
  });

  it("copies one for KEEP CURRENT too, which is an adoption with no files in it", () => {
    const text = press("KEEP");
    expect(text).not.toContain("not built yet");
    expect(text).toContain("ship:hull-skin");
    expect(text).toContain("bun run check");
  });

  it("reads the shipped value at the moment of the press, never a copy in the tool", () => {
    // `readCurrent` is called inside `emit`, so a record edited between the
    // page loading and the button being pressed is reported as it is now.
    SKIN.rim = "#123456";
    try {
      expect(press("ADOPT")).toContain("#123456");
    } finally {
      SKIN.rim = "#FF6FE4";
    }
  });
});
