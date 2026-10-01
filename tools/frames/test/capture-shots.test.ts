import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { type CaptureResult, captureFrames } from "../capture.js";
import { pictureDelta, pictureDiff, pictureDigest } from "../pixels.js";
import { openingRig, STARVED_MS } from "./opening-rig.js";

/**
 * **What a capture is asked to frame, against the built game**: the crop and
 * the zoom, the same picture twice, `--until-back` and `--until-on`, and
 * `--hand`. The other half of what was one file until 1 October 2026; the
 * opening, the settle and the network are `opening.test.ts`'s, and the rig
 * both stand on is `opening-rig.ts`.
 */
describe("captureFrames, framed", () => {
  const rig = openingRig("shots-test-");

  /**
   * `--at` and `--zoom`, which is what a change the size of a creature needs.
   *
   * The picture written is the crop; the digest is of the whole frame, so the
   * `identical:` guard cannot be fooled by a rectangle that framed one
   * difference or cut the only one away.
   */
  it(
    "writes the rectangle it was asked for, and digests the whole frame anyway",
    async () => {
      const whole = await captureFrames(
        rig.url,
        { wave: 0, ticks: 60 },
        join(rig.out, "whole"),
        rig.browser,
      );
      const cropped = await captureFrames(
        rig.url,
        { wave: 0, ticks: 60, at: { x: 40, y: 200, width: 120, height: 120 } },
        join(rig.out, "cropped"),
        rig.browser,
      );
      // Uncropped, what was written *is* the whole frame, so the digest is the
      // picture that landed on disk. Cropped, it is not — which is the whole point: the guard in
      // `run.ts` has to be asking about the game rather than about the
      // rectangle somebody asked to look at.
      expect(whole.whole[0]).toBe(pictureDigest(await Bun.file(whole.paths[0] as string).bytes()));
      expect(cropped.whole[0]).not.toBe(
        pictureDigest(await Bun.file(cropped.paths[0] as string).bytes()),
      );
      const small = await Bun.file(cropped.paths[0] as string).bytes();
      const full = await Bun.file(whole.paths[0] as string).bytes();
      expect(small.byteLength).toBeGreaterThan(0);
      expect(small.byteLength).toBeLessThan(full.byteLength);
    },
    STARVED_MS,
  );

  it(
    "spends the zoom on real pixels rather than on a bigger file of the same ones",
    async () => {
      const at = { x: 40, y: 200, width: 120, height: 120 };
      const flat = await captureFrames(
        rig.url,
        { wave: 0, ticks: 60, at },
        join(rig.out, "flat"),
        rig.browser,
      );
      const magnified = await captureFrames(
        rig.url,
        { wave: 0, ticks: 60, at, zoom: 3 },
        join(rig.out, "magnified"),
        rig.browser,
      );
      // The same rectangle of the same frame at three times the density. The
      // layout is computed from the CSS viewport, so what grows is resolution.
      const small = await Bun.file(flat.paths[0] as string).bytes();
      const large = await Bun.file(magnified.paths[0] as string).bytes();
      expect(large.byteLength).toBeGreaterThan(small.byteLength);
    },
    STARVED_MS,
  );

  /**
   * **What differs between two captures of one build, said out loud.**
   *
   * `whole` is one digest a frame, so an assertion on it can only ever report
   * that two runs disagreed — and this pair failed once inside a full
   * `bun run check` and then passed twelve times on its own, which is exactly
   * the case where the next session needs the answer and cannot get it by
   * re-running. There is no crop here, so the file on disk is what was
   * digested: the PNGs are read back and the difference is counted in pixels
   * and placed on the frame (`png.ts`). A pair that comes back with nothing to
   * say is two encodings of one picture, and the digest would already have
   * treated them as equal.
   *
   * **A speck is not a difference.** It failed once more, 25 September 2026:
   * frame 2 of the settled strip, 3 of 987480 channel bytes, one pixel at
   * x=81, y=271 — open sky, a faint mote at the edge of a light shaft drawn
   * with `lighter`. What a real clock slip looks like was measured then: one
   * extra paint moves 30 to 70 thousand bytes, and a change of rasterizer
   * (`--disable-gpu`, SwiftShader) 81 to 533 thousand. Twenty runs under a
   * loaded CPU, and four copies in parallel, never reproduced it. So a pair
   * that disagrees in a handful of bytes by a few levels is the GPU rounding
   * one blended pixel differently, and is let through; anything larger is
   * still reported in full, with how many levels it moved.
   */
  const SPECK_BYTES = 12;
  const SPECK_LEVELS = 8;

  async function shotDiff(a: CaptureResult, b: CaptureResult): Promise<string> {
    if (a.whole.join() === b.whole.join()) return "";
    const lines: string[] = [];
    for (let i = 0; i < a.whole.length; i++) {
      if (a.whole[i] === b.whole[i]) continue;
      const one = await Bun.file(a.paths[i] as string).bytes();
      const two = await Bun.file(b.paths[i] as string).bytes();
      const d = pictureDelta(one, two);
      if (d && d.differing <= SPECK_BYTES && d.most <= SPECK_LEVELS) continue;
      lines.push(`frame ${i}: ${pictureDiff(one, two)}`);
    }
    return lines.join("; ");
  }

  /**
   * **The same build twice is the same picture.**
   *
   * It was not, and that made `run.ts`'s `identical:` guard a comment: two
   * runs at the same wave, tick and zoom came back with different digests, so
   * a pair that showed nothing could never be refused. The opening is cleared
   * by polling, the real rAF loop painted an unpredictable number of frames in
   * each 150 ms window, and everything drawn on `time` was at a different
   * phase the second time round. `freezeClocks` is the answer and this is what
   * holds it.
   */
  it(
    "takes the same picture of the same build twice",
    async () => {
      const spec = { wave: 0, ticks: 90 } as const;
      const once = await captureFrames(rig.url, spec, join(rig.out, "once"), rig.browser);
      const twice = await captureFrames(rig.url, spec, join(rig.out, "twice"), rig.browser);
      expect(await shotDiff(once, twice)).toBe("");
    },
    STARVED_MS,
  );

  /** And a strip of them, where every frame after the first is a settle and a
   * stride on top of a clock that has to have stayed where it was left. */
  it(
    "takes the same strip twice, settles and all",
    async () => {
      const spec = { wave: 0, ticks: 60, frames: 3, strideTicks: 4, settle: 5 } as const;
      const once = await captureFrames(rig.url, spec, join(rig.out, "strip-a"), rig.browser);
      const twice = await captureFrames(rig.url, spec, join(rig.out, "strip-b"), rig.browser);
      expect(await shotDiff(once, twice)).toBe("");
      expect(once.whole).toHaveLength(3);
    },
    STARVED_MS,
  );

  /**
   * **`--until-back` really does land before the event**, and `--until-on`
   * after it, which is the one
   * thing the pure tests cannot say: they hold the arithmetic, and the tick a
   * picture is taken at is the page's answer rather than a number this process
   * computed.
   *
   * Asked relationally, so it knows nothing about how long wave 0's opening
   * costs: the same event is waited for twice, and the second run has to come
   * back exactly `back` ticks earlier. Ten of them because the first `beat` is
   * at world tick 75 and every opening this wave has is behind that — a step
   * back into the opening is refused rather than clamped (`until.ts`), and a
   * test that tripped that refusal would be testing the refusal.
   */
  it(
    "photographs the tick before or after an event, not the one it fired on",
    async () => {
      const until = { event: "beat", cap: 3000 } as const;
      const on = await captureFrames(
        rig.url,
        { wave: 0, ticks: 0, until },
        join(rig.out, "on"),
        rig.browser,
      );
      const before = await captureFrames(
        rig.url,
        { wave: 0, ticks: 0, until: { ...until, back: 10 } },
        join(rig.out, "before"),
        rig.browser,
      );
      expect(before.atTick[0]).toBe((on.atTick[0] as number) - 10);
      expect(await Bun.file(before.paths[0] as string).exists()).toBe(true);
      // And `--until-on`, its mirror, stepped on in the same drive.
      const spec = { wave: 0, ticks: 0, until: { ...until, on: 10 } };
      const after = await captureFrames(rig.url, spec, join(rig.out, "after"), rig.browser);
      expect(after.atTick[0]).toBe((on.atTick[0] as number) + 10);
    },
    STARVED_MS,
  );

  /**
   * `--hand`: the ring under this phone's own thumb, which no command can put
   * on the screen because it is the input layer's (`hand.ts`). Two captures of
   * the same tick on the same seat, one with the mouse down on the cannon's
   * grab circle and one without, and the whole frame differs — the difference
   * is the ring, and the press went through the game's own listeners to draw
   * it. A build whose handle cannot say where the circle is refuses by name.
   */
  it(
    "puts this phone's thumb on the cannon, and the frame shows it",
    async () => {
      const bare = await captureFrames(
        rig.url,
        { wave: 0, ticks: 60, seat: "p1" },
        join(rig.out, "no-hand"),
        rig.browser,
      );
      const held = await captureFrames(
        rig.url,
        { wave: 0, ticks: 60, seat: "p1", hand: { on: "cannon" } },
        join(rig.out, "hand"),
        rig.browser,
      );
      expect(held.atTick).toEqual(bare.atTick);
      expect(held.whole[0]).not.toEqual(bare.whole[0]);
    },
    STARVED_MS,
  );
});
