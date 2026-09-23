import { describe, expect, it } from "bun:test";
import { parseFrameSpec } from "../flags.js";
import { pressesByFrame } from "../press-plan.js";
import type { PressSpec } from "../spec.js";

/**
 * A strip of frames with presses along it. `--frames 8 --stride 120` goes on
 * past `--ticks` to its last frame, and a press anywhere inside that span is
 * a press the strip can show — THE SCOUT's flight, watched as it goes wrong,
 * was the capture that found it refused with a number the run never stopped at.
 */
const at = (tick: number): PressSpec => ({ tick, player: 1, command: { kind: "guard" } });

describe("which frame of a strip hears each press", () => {
  it("gives the first frame everything up to its own tick, and each later one its stride", () => {
    expect(pressesByFrame([at(300), at(400), at(401), at(900)], 400, 8, 120)).toEqual([
      [at(300), at(400)],
      [at(1)],
      [],
      [],
      [],
      // 880 to 1000: the press at 900 is twenty ticks into this frame's stride.
      [at(20)],
      [],
      [],
    ]);
  });

  it("drops nothing a strip reaches, and a single frame is the first frame alone", () => {
    const presses = [at(0), at(120), at(121), at(360), at(361)];
    expect(pressesByFrame(presses, 120, 3, 120).flat()).toHaveLength(4);
    expect(pressesByFrame(presses, 120, 1, 120)).toEqual([[at(0), at(120)]]);
  });
});

describe("the guard on a press after the picture, on a strip", () => {
  const waves = [{ name: "THE DRIFT" }];
  const line = (press: string) => [
    "<sha>",
    "--wave",
    "1",
    "--ticks",
    "400",
    "--frames",
    "8",
    "--stride",
    "120",
    "--press",
    press,
  ];

  it("takes a press the strip's later frames are still watching", () => {
    const { spec } = parseFrameSpec(line("300:1:guard,900:1:guard"), waves);
    expect(spec.press?.map((p) => p.tick)).toEqual([300, 900]);
  });

  it("refuses one past the last frame, and names the tick that frame is on", () => {
    expect(() => parseFrameSpec(line("1300:1:guard"), waves)).toThrow(
      /after the last frame, tick 1240 \(--ticks 400, then 7 × --stride 120\)/,
    );
  });
});
