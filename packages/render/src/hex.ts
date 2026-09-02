/**
 * Two `#rrggbb` colours mixed, as a `#rrggbb` colour.
 *
 * **It has to come back in that notation and not as `rgb(...)`.** Results feed
 * `hazed`, which reads a hex string apart by hand, and `haloSprite`, which
 * appends a hex alpha to it — and `packages/render/test/frame.test.ts` exists
 * because exactly this once went out in the other notation and the first frame
 * threw.
 *
 * `depth.ts` used to carry a private copy of this arithmetic and now calls
 * `mixHex` directly. `sheen.ts` still carries its own — folding it in is a
 * separate edit to a file this one has no other business in.
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
