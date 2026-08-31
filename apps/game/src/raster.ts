import { loadAtlas } from "@neon-spore/render";
import burstStripUrl from "../../../assets/raster/burst-strip.webp";

/**
 * The baked burst, in the real game, behind a flag.
 *
 * `?raster=1` and the atlas is fetched, decoded and installed; without it
 * nothing is fetched at all and the field is byte for byte the field that
 * shipped. That is not caution about the code — it is CLAUDE.md's *A look is
 * offered, never replaced*: a hit that a session decided to change is a look
 * the owner has not chosen yet, so it arrives as something to turn on and
 * look at, next to the shipped one, rather than as the new default.
 *
 * The import is a real bundler import, so the asset is content-hashed, emitted
 * beside the bundle and cached like any other file the game ships — not a
 * data URL glued into the JavaScript, which would be paid for on every load by
 * every player including the ones who never turn this on.
 *
 * Failure is silent by design (`loadAtlas` resolves to `null`): a phone on a
 * bad connection gets the procedural sparks, which is what it would have had.
 */
const RASTER_PARAM = "raster";

/** Pure, so the rule can be tested without a browser — the shape `menu.ts` uses. */
export function rasterRequested(url: string): boolean {
  const parsed = new URL(url, "http://game.invalid/");
  const value = parsed.searchParams.get(RASTER_PARAM);
  return value !== null && value !== "0";
}

export interface SpriteHost {
  install(image: CanvasImageSource): void;
}

/**
 * Installs the atlas if the flag is set. Returns what it did, so a caller that
 * wants to say so on screen can, and so a test can read the decision without
 * a network.
 */
export async function bindRasterBurst(
  host: SpriteHost,
  href: string,
): Promise<"off" | "installed" | "unavailable"> {
  if (!rasterRequested(href)) return "off";
  const atlas = await loadAtlas(burstStripUrl);
  if (!atlas) return "unavailable";
  host.install(atlas);
  return "installed";
}
