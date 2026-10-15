import { describe, expect, it } from "bun:test";
import { blisterIsUp, blisterSwipeShare, type Command, type TimedCommand } from "@neon-spore/sim";
import { fresh, run, until } from "../../director/src/pose-kit.js";
import { parseHold } from "../hold.js";

/**
 * **THE BLISTER's stroke through `--hold`**, held and not lifted. A SWIPE or
 * COMBO blister carried part way — SLUG stretched to the knob, ZIP gaping
 * behind it — could not be photographed from a wave: the row lifted on the
 * tick it carried, so the body was only ever at rest or knocked (15 October
 * 2026). A stroke counts the moment it is carried far enough
 * (`sim/blister-swipe.ts`), so a held one loses nothing a lifted one had.
 */

/** A SWIPE blister pointing up, out of its pore, on the navigator's `by`. */
function upBlister() {
  const w = fresh([
    {
      beat: 0,
      col: 4,
      kind: "blister",
      color: null,
      row: 3,
      gesture: "swipe",
      way: "up",
    },
  ]);
  until(w, "a blister up", (x) => x.creatures.some(blisterIsUp));
  const body = w.creatures.find(blisterIsUp);
  if (!body) throw new Error("no blister up");
  return { w, body };
}

describe("a held BLISTER stroke", () => {
  it("is the grab and the carry, from the navigator's seat, and never the lift", () => {
    const said = parseHold("blisterSwipe=0,y=-900,id=3");
    expect(said.map((s) => s.player)).toEqual([2, 2]);
    expect(said.map((s) => s.command)).toEqual([
      { kind: "drag", target: "blisterSwipe", on: true, fromMilli: 0, fromYMilli: 0, id: 3 },
      { kind: "drag", target: "blisterSwipe", on: true, fromMilli: 0, fromYMilli: -900, id: 3 },
    ]);
    expect(parseHold("blisterSwipe1=0,y=-900,id=3").map((s) => s.player)).toEqual([1, 1]);
  });

  it("reaches the world as a drag on the body's id, the body carried part way", () => {
    const { w, body } = upBlister();
    const part = Math.round(w.cfg.blisterSwipeMilli / 2);
    const cmds: TimedCommand[] = parseHold(`blisterSwipe=0,y=${-part},id=${body.id}`).map(
      (s, i) => ({ tick: w.tick + i, player: s.player, command: s.command as Command }),
    );
    run(w, 3, cmds);
    const after = w.creatures.find((c) => c.id === body.id);
    expect(after && blisterIsUp(after)).toBe(true);
    expect(after && blisterSwipeShare(w, after)).toBe(0.5);
  });
});
