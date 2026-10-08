/**
 * A hue as `#rrggbb` — THE FLUE's rainbow mirage turns it (`flue-mirage.ts`).
 *
 * `#rrggbb` and not `hsl(...)`: `packages/render/test/canvas-stub.ts` refuses
 * anything else, and it refuses it because a colour notation this renderer had
 * not agreed on is exactly the class of mistake that stub exists to catch.
 */
export function neonHue(deg: number, sat: number, val: number): string {
  const h = (((deg % 360) + 360) % 360) / 60;
  const c = val * sat;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = val - c;
  const wheel: readonly (readonly [number, number, number])[] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const rgb = wheel[Math.floor(h) % 6] as readonly [number, number, number];
  const byte = (v: number): string =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${byte(rgb[0])}${byte(rgb[1])}${byte(rgb[2])}`;
}
