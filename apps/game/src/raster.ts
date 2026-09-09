import { loadAtlas } from "@neon-spore/render";
import burstStripUrl from "../../../assets/raster/burst-strip.webp";
import claspStripUrl from "../../../assets/raster/green-shield-strip.webp";

/**
 * The baked assets, in the real game, behind a flag.
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
 *
 * **Two assets go through here now, and the second one is why the first was
 * worth generalising.** THE CLASP's hand-painted shield was baked in the same
 * pass as the burst and then never reached the field at all: `drawClaspShield`
 * takes an image or draws a procedural shell, and nothing anywhere passed an
 * image, so the shell was the picture on every device from the day the
 * creature landed. The frames are wired the same way rather than deleted,
 * because the owner commissioned them and has still not seen them next to what
 * ships — which is the one thing `?raster=1` is for.
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

/**
 * The same, for THE CLASP's shield.
 *
 * A second function rather than a flag on the first: the two assets are
 * fetched independently, either can fail on its own, and a caller reading
 * `"unavailable"` should be told which strip it was about. They share the
 * flag, so one query parameter turns both of the offered looks on at once —
 * which is what somebody comparing them actually wants, and what
 * `docs/raster.md` describes.
 */
export async function bindRasterClasp(
  host: SpriteHost,
  href: string,
): Promise<"off" | "installed" | "unavailable"> {
  if (!rasterRequested(href)) return "off";
  const strip = await loadAtlas(claspStripUrl);
  if (!strip) return "unavailable";
  host.install(strip);
  return "installed";
}
