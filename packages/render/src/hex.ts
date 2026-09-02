/**
 * Two `#rrggbb` colours mixed, as a `#rrggbb` colour.
 *
 * **It has to come back in that notation and not as `rgb(...)`.** Results feed
 * `hazed`, which reads a hex string apart by hand, and `haloSprite`, which
 * appends a hex alpha to it — and `packages/render/test/frame.test.ts` exists
 * because exactly this once went out in the other notation and the first frame
 * threw.
 *
 * There are two more copies of this arithmetic in `depth.ts` and `sheen.ts`,
 * each private to its file and each written before there was anywhere to put
 * it. Folding them in is a separate edit to two files this one has no other
 * business in, which is why they are still there.
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
