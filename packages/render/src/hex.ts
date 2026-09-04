/**
 * Two `#rrggbb` colours mixed, as a `#rrggbb` colour.
 *
 * **It has to come back in that notation and not as `rgb(...)`.** Results feed
 * `hazed`, which reads a hex string apart by hand, and `haloSprite`, which
 * appends a hex alpha to it — and `packages/render/test/frame.test.ts` exists
 * because exactly this once went out in the other notation and the first frame
 * threw.
 *
 * `depth.ts` and `sheen.ts` both used to carry a private copy of this
 * arithmetic and both now call `mixHex`. `sheen.ts`'s wrote the same mix the
 * other way round — `va * (1 - t) + vb * t` rather than `va + (vb - va) * t`
 * — which is not the same expression in floating point, but is the same
 * rounded byte at every one of a million sampled `t` across each of the five
 * film colour pairs it is ever called with.
 */
export function mixHex(a: string, b: string, k: number): string {
  const pa = Number.parseInt(a.slice(1), 16);
  const pb = Number.parseInt(b.slice(1), 16);
  const t = Math.max(0, Math.min(1, k));
  const ch = (shift: number): number => {
    const va = (pa >> shift) & 255;
    const vb = (pb >> shift) & 255;
    return Math.round(va + (vb - va) * t);
  };
  const hex = (ch(16) << 16) | (ch(8) << 8) | ch(0);
  return `#${hex.toString(16).padStart(6, "0")}`;
}

/**
 * A `#rrggbb` colour as `rgba(...)` at `alpha`.
 *
 * The panel's tissue is written as hex in `seat-skin.ts` — one seat's colour,
 * spelled once — and used at a dozen different opacities: a vein at .16, a
 * cell at .03, a feeder at .2. Without this every one of those sites would
 * either carry its own `rgba(...)` literal, which is a second copy of the
 * seat's colour and drifts, or reach for `mixHex` against the ground, which is
 * not the same picture over a texture that is already there.
 */
export function rgba(hex: string, alpha: number): string {
  const v = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${alpha})`;
}
