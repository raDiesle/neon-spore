/** FNV-1a over every byte — not a cryptographic claim, only "did two renders match".
 * Split out of `versus-pair.ts` to keep that file under the line ceiling. */
export function hashCanvas(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    h ^= data[i] ?? 0;
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}
