/**
 * Determinism, for skins.
 *
 * Rule (b) in `docs/skins.md`: every skin is seeded from the shape's name, so
 * a card looks the same on every reload and two shapes never share a texture.
 * That rule is only as good as there being one place to get a stream from —
 * a skin that reached for `Math.random` would look right on the screenshot
 * that got taken and different on the one the vote is held over.
 */

/** A small integer hash, so a shape's texture is its own and never moves. */
export function seedOf(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A deterministic 0..1 stream from one seed. */
export function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** The stream a skin should actually reach for: seeded from the name. */
export function streamFor(name: string): () => number {
  return rng(seedOf(name));
}
