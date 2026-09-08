/**
 * Every swatch in `PALETTE`, filed under the rule it belongs to.
 *
 * The filing is by hand and the *coverage* is not: `test/style-guide.test.ts`
 * fails when a colour is in the palette and not on this sheet, or on it twice.
 * A palette entry nobody drew is exactly the drift this sheet exists to catch —
 * the next colour gets chosen against a picture that is missing three of them.
 */
export interface Family {
  name: string;
  rule: string;
  keys: string[];
}

export const FAMILIES: Family[] = [
  {
    name: "AMMUNITION",
    rule: "the two accents. 345° and 185°. Everything else must be unmistakable for either.",
    keys: ["red", "redRim", "redDark", "cyan", "cyanRim", "cyanDark"],
  },
  {
    name: "THE SHIP",
    rule: "violet hull, cyan shield — the shield shares the cyan accent, because the shield is the thing that answers it.",
    keys: ["hull", "hullRim", "shield", "shieldRim"],
  },
  {
    name: "THE GREENS",
    rule: "`good` is the round answered in full. The other three were granted by name, and each is held apart by hue and by where it appears.",
    keys: [
      "good",
      "goodRim",
      "claspShield",
      "claspShieldRim",
      "claspShieldDeep",
      "eyeFluid",
      "eyeFluidRim",
      "venom",
      "venomRim",
      "venomDeep",
    ],
  },
  {
    name: "ONE THING EACH",
    rule: "a hue spent on a single body or hazard, placed in a gap and touching neither neighbour.",
    keys: [
      "pod",
      "podRim",
      "podDark",
      "ember",
      "emberRim",
      "clownNose",
      "clownNoseRim",
      "wisp",
      "wispRim",
      "arc",
      "arcRim",
    ],
  },
  {
    name: "DEAD MATTER",
    rule: "colder and bluer than the dark, at 224°. The rock is immune because it does not live, and it throws no light.",
    keys: ["rock", "rockDark"],
  },
  {
    name: "NEUTRALS",
    rule: "one desaturated violet, 247°–252°, so the whole picture sits inside the hull's hue. A neutral says `nothing to report`.",
    keys: ["background", "grid", "gridBeat", "dim", "sparkDim", "text"],
  },
];

/** Hue, saturation and lightness of a `#rrggbb`, in degrees and percent. */
export function hsl(hex: string): { h: number; s: number; l: number } {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d > 0) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const l = (mx + mn) / 2;
  return { h, s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l };
}

/**
 * The hues on the dial: the body colours, which are the ones the placement
 * rule is about. A rim is the same hue paler and a deep is the same hue darker,
 * so plotting all three would put a cluster of three dots where the rule sees
 * one hue — and the gap between two hues is the whole of what the dial shows.
 */
export const DIAL: string[] = [
  "red",
  "ember",
  "pod",
  "venom",
  "eyeFluid",
  "claspShield",
  "good",
  "cyan",
  "arc",
  "wisp",
  "hull",
  "clownNose",
];
