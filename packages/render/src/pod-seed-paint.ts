import { PALETTE } from "./palette.js";

/**
 * **The two coats a seed is painted in** — the real pod's amber, and the
 * hollow pod's dark blood-red as the seat that sees the truth sees it.
 *
 * The owner, 17 October 2026: the fake *should look dangerous — change colour
 * to red, mystery warning dark colours, red blinking*. So a husk on the seat
 * that can tell is the same form as the pod it copies — the same spikes, skin
 * and motion — in this second coat, and its blink on the count is red where
 * the real pod's is white. The red is a deep blood red, darker than the
 * ammunition's `PALETTE.red`: a husk may be shot all day, so it must not read
 * as a loaded colour, and only the maw has to stay shut.
 */
export interface SeedPaint {
  /** The body's lit side, its middle and its dark limb. */
  hi: string;
  mid: string;
  lo: string;
  /** The same two, on the count. */
  flashHi: string;
  flashMid: string;
  /** The outline, still and on the count. */
  rim: string;
  flashRim: string;
  /** The seam and the skin's marks. */
  seam: string;
  /** A spike's stalk, its shadowed half, and its tip still and on the count. */
  spike: string;
  spikeDark: string;
  tip: string;
  flashTip: string;
  halo: string;
}

export const REAL_PAINT: SeedPaint = {
  hi: PALETTE.pod,
  mid: "#7A4C0C",
  lo: PALETTE.podDark,
  flashHi: "#FFFFFF",
  flashMid: PALETTE.podRim,
  rim: PALETTE.pod,
  flashRim: PALETTE.podRim,
  seam: PALETTE.podRim,
  spike: PALETTE.pod,
  spikeDark: "#7A4C0C",
  tip: PALETTE.podRim,
  flashTip: "#FFFFFF",
  halo: PALETTE.pod,
};

export const FAKE_PAINT: SeedPaint = {
  hi: "#A3121C",
  mid: "#3E050A",
  lo: "#0C0103",
  flashHi: "#FF6A55",
  flashMid: "#D81E1E",
  rim: "#7E0C14",
  flashRim: "#FF4A3A",
  seam: "#D8323A",
  spike: "#8A0E16",
  spikeDark: "#2A0306",
  tip: "#E0323A",
  flashTip: "#FFC0B0",
  halo: "#C21A22",
};
