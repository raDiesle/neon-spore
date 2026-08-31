/**
 * Getting a baked atlas into a shape `drawImage` will take.
 *
 * Two paths, and the difference is where the decode happens.
 * `createImageBitmap` decodes off the main thread and hands back a bitmap the
 * GPU is happy with; an `<img>` decodes on the first draw, which on a phone is
 * a frame that arrives late — the one obvious trap in shipping a raster asset
 * to a game with a frame budget. So the bitmap path is preferred and the
 * `<img>` is the fallback, and either way the caller waits for the promise
 * before installing anything.
 *
 * A failure is not an error. Nothing in the game requires the atlas: a
 * `SpriteBursts` with nothing installed draws nothing, and the procedural
 * sparks that shipped are still there underneath. So this resolves to `null`
 * rather than throwing, and a host that cannot fetch its asset simply looks
 * the way it looked before the asset existed.
 */
export async function loadAtlas(url: string): Promise<CanvasImageSource | null> {
  try {
    if (typeof globalThis.createImageBitmap === "function") {
      const response = await fetch(url);
      if (!response.ok) return null;
      return await createImageBitmap(await response.blob());
    }
  } catch {
    // Fall through to the <img> path: a bitmap decode can fail on a format
    // the tag would still have shown.
  }
  return await new Promise<CanvasImageSource | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
