import { loadAtlas, STRIP_NAMES, type StripName } from "@neon-spore/render";
import burstStripUrl from "../../../assets/raster/burst-strip.webp";
import claspStripUrl from "../../../assets/raster/green-shield-strip.webp";
import plumbSettleStripUrl from "../../../assets/raster/plumb-settle-strip.webp";
import slingDrawStripUrl from "../../../assets/raster/sling-draw-strip.webp";
import viseCrackStripUrl from "../../../assets/raster/vise-crack-strip.webp";

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
 * **Every baked asset goes through here now, and the second one is why the first was
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
 * a network. One per strip rather than a flag on one: every strip is fetched
 * on its own, either can fail on its own, and a caller reading
 * `"unavailable"` should be told which strip it was about. They share the
 * flag, so one query parameter turns every offered look on at once — which is
 * what somebody comparing them actually wants, and what `docs/raster.md`
 * describes.
 */
async function bindStrip(
  host: SpriteHost,
  href: string,
  url: string,
): Promise<"off" | "installed" | "unavailable"> {
  if (!rasterRequested(href)) return "off";
  const strip = await loadAtlas(url);
  if (!strip) return "unavailable";
  host.install(strip);
  return "installed";
}

type Bound = Promise<"off" | "installed" | "unavailable">;

/** The baked burst (`sprite-burst.ts`). */
export const bindRasterBurst = (host: SpriteHost, href: string): Bound =>
  bindStrip(host, href, burstStripUrl);

/** THE CLASP's hand-painted shield. */
export const bindRasterClasp = (host: SpriteHost, href: string): Bound =>
  bindStrip(host, href, claspStripUrl);

/**
 * The painted strips' files, by the row's name in `PAINTED_STRIPS`. Typed on
 * every name, so a row the table gains without a file here is a type error
 * rather than a strip that never reaches the field. Each is laid over the
 * shipped picture — the split, the bare core, the thud — never in its place.
 */
const STRIP_URLS: Record<StripName, string> = {
  "vise-crack": viseCrackStripUrl,
  "plumb-settle": plumbSettleStripUrl,
  "sling-draw": slingDrawStripUrl,
};

/**
 * Every painted strip, in one loop: each is fetched and fails on its own, and
 * the answer says which strip it was about.
 */
export async function bindRasterStrips(
  host: { strip(name: StripName): SpriteHost },
  href: string,
): Promise<Record<StripName, "off" | "installed" | "unavailable">> {
  const bound = await Promise.all(
    STRIP_NAMES.map(
      async (name) => [name, await bindStrip(host.strip(name), href, STRIP_URLS[name])] as const,
    ),
  );
  return Object.fromEntries(bound) as Record<StripName, "off" | "installed" | "unavailable">;
}
