import { describe, expect, it } from "bun:test";
import type { SimEvent } from "@neon-spore/sim";
import { bindHaptics, HULL_MS, pulseFor, pulseForFrame, WRONG_COLOUR_MS } from "../src/haptics.js";
import { DEFAULT_SETTINGS, parseSettings } from "../src/settings.js";

/**
 * The buzz, and the two events that earn one.
 *
 * `pulseFor` is the whole of the decision and is pure, so it is what is tested
 * here; everything around it is capability and consent, neither of which this
 * runner has. Whether a phone actually vibrates is a phone question and is
 * **unverified** by anything in this repository.
 */

const breach: SimEvent = {
  type: "breach",
  col: 3,
  damage: 9000,
  span: 1,
  kind: "meteor",
  color: null,
  fromRow: 4,
  beat: 12,
};
const reject: SimEvent = { type: "reject", col: 2, row: 5 };

describe("what earns a buzz", () => {
  it("buzzes long for the hull taking a hit", () => {
    expect(pulseFor(breach)).toBe(HULL_MS);
  });

  it("buzzes short for a shot in the wrong colour", () => {
    expect(pulseFor(reject)).toBe(WRONG_COLOUR_MS);
  });

  it("tells the two apart by length, which is what a hand can read", () => {
    expect(HULL_MS).toBeGreaterThan(WRONG_COLOUR_MS * 2);
  });

  it("buzzes for nothing else at all", () => {
    // A phone that buzzes at everything is a phone somebody turns off.
    const others: SimEvent[] = [
      { type: "beat", beat: 4 },
      { type: "waveStart", wave: 2 },
      { type: "destroy", col: 1, row: 2, color: "red" },
      { type: "hole", col: 1, row: 2 },
      { type: "deflect", col: 1, span: 1, kind: "meteor", fromRow: 3 },
      { type: "podTaken", col: 1, kind: "mend" },
      { type: "podLost", col: 1 },
    ];
    for (const event of others) {
      expect(pulseFor(event), `${event.type} asked for a buzz`).toBeNull();
    }
  });
});

describe("a frame, which is several ticks", () => {
  it("is one pulse and not three", () => {
    expect(pulseForFrame([reject, reject, reject])).toBe(WRONG_COLOUR_MS);
  });

  it("is the longest of them, so the hull is never hidden behind a reject", () => {
    expect(pulseForFrame([reject, breach, reject])).toBe(HULL_MS);
  });

  it("is nothing at all when nothing in it earned one", () => {
    expect(pulseForFrame([{ type: "beat", beat: 1 }])).toBeNull();
    expect(pulseForFrame([])).toBeNull();
  });
});

describe("the caller in front of it", () => {
  it("stays silent where the platform cannot vibrate", () => {
    // Which is every device this suite runs on: no `navigator` at all. The
    // toggle only appears where `"vibrate" in navigator`, and the call is
    // guarded again here, because a browser that has it may still refuse it.
    const felt: number[] = [];
    bindHaptics((ms) => felt.push(ms)).frame([breach, reject]);
    expect(felt).toEqual([]);
  });
});

describe("the setting", () => {
  it("is off until a player asks for it", () => {
    expect(DEFAULT_SETTINGS.haptics).toBe(false);
    expect(parseSettings(null).haptics).toBe(false);
  });

  it("is remembered once they have", () => {
    expect(parseSettings(JSON.stringify({ haptics: true })).haptics).toBe(true);
  });

  it("falls back to off rather than throwing on anything unreadable", () => {
    for (const raw of ["", "{", "null", "7", '{"haptics":"yes"}']) {
      expect(parseSettings(raw)).toEqual(DEFAULT_SETTINGS);
    }
  });
});
