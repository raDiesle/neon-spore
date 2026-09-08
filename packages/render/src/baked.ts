/**
 * Every cache in render/ that holds baked work between frames, in one place
 * that can empty them all.
 *
 * A sprite, a sheet or a contour that depends only on a size and a colour is
 * built once and blitted after that — `band-ground.ts`'s panel sheet,
 * `glow.ts`'s halos, `lobe-shell.ts`'s sockets. That is the whole point of
 * them, and nothing in the running game ever wants them emptied: the state a
 * *restart* has to forget lives on `Effects` and is cleared there
 * (`test/restart.test.ts`), because it is about a world rather than about a
 * pixel size.
 *
 * A test run is the one caller that does want them cold. Module state outlives
 * a test, so whichever run first asked for a size paid for the bake and every
 * run after it did not — `frame-budget.test.ts`'s first row carried fourteen
 * `new Path2D` that the second seat, drawing the same panel at the same size,
 * got for nothing. The rows were then true only for the order the loop
 * happened to run in. `installCanvasGlobals` calls `clearBakedCaches`, so every
 * run starts cold and two rows of the same shape mean the same thing.
 */

const caches: { clear(): void; readonly size: number }[] = [];

/**
 * A module-level cache of baked work, registered so a test can empty it. Use
 * it wherever a `new Map` would have held sprites, sheets or paths keyed on
 * the size and colour they were baked at.
 */
export function bakedCache<K, V>(): Map<K, V> {
  const cache = new Map<K, V>();
  caches.push(cache);
  return cache;
}

/**
 * How many baked things are being held, across every cache at once.
 *
 * The cheapest way to draw something expensive here is to compute it once into
 * a sprite and blit it after that, keyed on the values it was baked at — and
 * the one way that goes wrong is a key that *moves*: a radius that is not
 * rounded, a spin that is not stepped, a colour mixed continuously with a
 * distance. Such a cache never hits, bakes a canvas every frame, and grows
 * without a ceiling until the phone gives up. It cannot be caught by counting
 * canvas calls, because a cache that misses every frame costs exactly what
 * having no cache costs; it shows up here, as a number that keeps climbing on
 * a scene that has settled. `test/baked-growth.test.ts` is what watches it.
 */
export function bakedEntries(): number {
  let n = 0;
  for (const cache of caches) n += cache.size;
  return n;
}

/** Empties every one of them, so the next frame bakes what it needs again. */
export function clearBakedCaches(): void {
  for (const cache of caches) cache.clear();
}
