import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { STEEL } from "../src/gimbal-rig.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";
import {
  aligned,
  body,
  count,
  drawn,
  frame,
  hung,
  leaking,
  opening,
  shearing,
  still,
  turning,
} from "./gimbal-frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GIMBAL's six poses — dark and still, one ring turning, both at true,
 * the shear, the loose spin and the drum split open — on all three screens.
 *
 * The states are **set** rather than played to, `filament-frame.test.ts`'s
 * arrangement (`gimbal-frame-harness.ts`), and what this page asks is whether
 * every branch of the picture is one a canvas accepts, plus the two things
 * nothing else could catch: that **neither seat is ever shown the other's
 * ring** — the pilot's screen identical whatever the inner ring is doing, the
 * navigator's whatever the outer is — and that the rim says how many teeth
 * are left without anything printing the number. What the cradle says back
 * — the fold, the knob, the word, the kicks — is `gimbal-answer.test.ts`.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

describe("THE GIMBAL's cradle", () => {
  it.each(ROLES)("hangs the drum dark and still, on %s", (role) => {
    const dark = frame(role, still);
    expect(dark.calls).toBeGreaterThan(50);
    // Steel, because neither ring is ever shot (`gimbal-rig.ts`). The counts
    // are relative throughout this file: the whole frame is logged, and the
    // ship's own band carries both trigger colours whatever the boss is doing.
    expect(count(dark.text, STEEL.base)).toBeGreaterThan(0);
  });

  it.each(ROLES)("marks the ring once an alignment is up, on %s", (role) => {
    const up = frame(role, (w) => turning(w, 0, 0));
    const dark = frame(role, still);
    expect(up.text).not.toBe(dark.text);
    expect(count(up.text, PALETTE.hullRim)).toBeGreaterThan(count(dark.text, PALETTE.hullRim));
  });

  it("shows the pilot the outer ring alone and the navigator the inner alone", () => {
    const mark = body(hung()).marks[0];
    if (mark === undefined) throw new Error("the script has no first alignment");
    // His screen is the same whatever the inner ring is doing, and hers the
    // same whatever the outer is. Neither can read the other's bearing, which
    // is the whole of the encounter.
    expect(frame("p1", (w) => turning(w, 100, 0)).text).toBe(
      frame("p1", (w) => turning(w, 100, 700)).text,
    );
    expect(frame("p2", (w) => turning(w, 0, 100)).text).toBe(
      frame("p2", (w) => turning(w, 700, 100)).text,
    );
    // And each screen does change with its own ring.
    expect(frame("p1", (w) => turning(w, 100, 0)).text).not.toBe(
      frame("p1", (w) => turning(w, 700, 0)).text,
    );
    expect(frame("p2", (w) => turning(w, 0, 100)).text).not.toBe(
      frame("p2", (w) => turning(w, 0, 700)).text,
    );
    // The test screen holds both rings, so it changes with either.
    expect(frame("test", (w) => turning(w, 100, 0)).text).not.toBe(
      frame("test", (w) => turning(w, 100, 700)).text,
    );
  });

  it.each(ROLES)("glows a ring standing at true, on %s", (role) => {
    const on = frame(role, (w) => aligned(w, 0));
    const off = frame(role, (w) => turning(w, 500, 500));
    expect(on.text).not.toBe(off.text);
  });

  it.each(ROLES)("draws the rim a tooth shorter for every alignment spent, on %s", (role) => {
    // The health is the silhouette: a rim with one tooth left is a different
    // picture from one with three, and no count is written anywhere.
    const fresh = frame(role, (w) => turning(w, 200, 200, 0));
    const worn = frame(role, (w) => turning(w, 200, 200, 2));
    expect(worn.text).not.toBe(fresh.text);
    expect(count(worn.text, PALETTE.rockDark)).toBeGreaterThan(0);
  });

  it.each(ROLES)("sparks the tooth off on the shear, on %s", (role) => {
    const cut = frame(role, (w) => shearing(w, 1));
    expect(cut.calls).toBeGreaterThan(50);
    expect(count(cut.text, PALETTE.hullRim)).toBeGreaterThan(0);
  });

  it.each(ROLES)("runs the leak down the field toward the column it breaches, on %s", (role) => {
    const leak = frame(role, leaking);
    const dry = frame(role, (w) => shearing(w, 3));
    expect(leak.text).not.toBe(dry.text);
    // The seam is the one part of this boss that carries a trigger colour,
    // and it only does so while it is leaking.
    const hot = (t: string) => count(t, PALETTE.red) + count(t, PALETTE.cyan);
    expect(hot(leak.text)).toBeGreaterThan(hot(dry.text));
  });

  it.each(ROLES)("splits the drum open and spins the rings loose, on %s", (role) => {
    const open = frame(role, opening);
    const shut = frame(role, (w) => turning(w, 200, 200, 3));
    expect(open.text).not.toBe(shut.text);
    // The core behind the hatch is the one violet on this boss, and it is
    // only lit once the leaves have parted. Its rim, because the glow is the
    // one stroke laid in the palette's own hex — a fill goes down as `rgba`
    // and the stub logs what it was given.
    expect(count(open.text, PALETTE.wispRim)).toBeGreaterThan(count(shut.text, PALETTE.wispRim));
  });
});
