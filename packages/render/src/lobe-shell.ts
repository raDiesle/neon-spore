import { blobPath } from "@neon-spore/content";
import { P1_SKIN, type SeatSkin } from "./seat-skin.js";

/**
 * WHAT A BUTTON ON THE PANEL SITS IN, AND WHAT IT IS SHAPED LIKE.
 *
 * Every lobe on the band was `ctx.arc` — a perfect circle sitting on a flat
 * plate, which is the one thing the owner named: *it should not look with
 * sharp edges (control panel box and buttons)*. A circle is not a sharp edge,
 * but it is a *drawn* edge, and everything else in this game is a grown one
 * (`blobPath`, `hullRadiusMul`). So a button is a closed contour with lobes
 * like every body in the game, and it stands in a socket — a wet depression in
 * the panel's tissue with a rim of its own, so the button reads as something
 * the ship grew rather than something screwed to it.
 *
 * **Neither the socket nor the gloss is drawn per frame.** Both are baked into
 * an offscreen canvas keyed on the radius and blitted, the bargain `glow.ts`
 * makes for its halos and `band-ground.ts` makes for the panel itself: a lobe
 * costs two `drawImage` calls, whatever is inside them. Radii are rounded to a
 * pixel before they are asked for, so a resize walks through a handful of
 * sprites rather than one per frame.
 *
 * The blob is deliberately the **same** shape on every button. A panel is a
 * set, and a set whose members each had their own silhouette would say there
 * was something to tell apart, when what tells them apart is the colour and
 * what is drawn inside them.
 */

/** The one contour every round control on the panel is cut from. */
const LOBES = 3;
const DEPTH = 0.042;
const SEED = 1907;

const blobs = new Map<number, Path2D>();

/**
 * The button's outline at radius `r`, centred on the origin.
 *
 * At the origin and scaled by the caller's transform, so one path serves every
 * button of that size — the same trick `controls.ts` plays with the fire
 * lobes' silhouettes, and for the same reason.
 */
export function lobeBlob(r: number): Path2D {
  const key = Math.max(1, Math.round(r));
  const held = blobs.get(key);
  if (held) return held;
  if (blobs.size > 12) blobs.clear();
  const made = new Path2D(blobPath(0, 0, key, key, LOBES, DEPTH, 0.02, 0, SEED, 44));
  blobs.set(key, made);
  return made;
}

/**
 * The button's body at `x`,`y` — what `ctx.arc(...)` was, filled, outlined or
 * both. Both in one call rather than two, because every button that has an
 * outline also has a fill and the pair is one transform rather than two.
 */
export function paintLobe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  mode: "fill" | "stroke" | "both",
): void {
  const key = Math.max(1, Math.round(r));
  const path = lobeBlob(key);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(r / key, r / key);
  if (mode !== "stroke") ctx.fill(path);
  if (mode !== "fill") {
    // The transform scales the pen too, so the line comes out the width the
    // caller asked for rather than that width times `r / key`.
    ctx.lineWidth *= key / r;
    ctx.stroke(path);
  }
  ctx.restore();
}

/** The margin a socket sprite adds round the button, as a share of `r`. */
const SOCKET_PAD = 0.62;

const sockets = new Map<string, HTMLCanvasElement>();

function socketSprite(
  r: number,
  dpr: number,
  lip: SeatSkin["lip"],
  withLip: boolean,
): HTMLCanvasElement {
  // Keyed on the light as well as the size: the two seats grew their tissue in
  // different colours, and a cache that only remembered radii would hand player
  // two whichever one was baked first (`seat-skin.ts`).
  const key = Math.max(2, Math.round(r * dpr));
  const id = `${key}:${lip[0]}:${withLip ? 1 : 0}`;
  const held = sockets.get(id);
  if (held) return held;
  if (sockets.size > 24) sockets.clear();
  const pad = Math.ceil(key * SOCKET_PAD);
  const size = (key + pad) * 2;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) paintSocket(g, size / 2, key, lip, withLip);
  sockets.set(id, c);
  return c;
}

/**
 * The depression itself: a soft dark pool with a lip that catches the light
 * from the seam above, and a thin wet ring where the button meets it.
 */
function paintSocket(
  g: CanvasRenderingContext2D,
  mid: number,
  r: number,
  lipColours: SeatSkin["lip"],
  withLip: boolean,
): void {
  const outer = r * (1 + SOCKET_PAD);
  const pool = g.createRadialGradient(mid, mid, r * 0.6, mid, mid, outer);
  pool.addColorStop(0, "rgba(6,3,16,0.72)");
  pool.addColorStop(0.62, "rgba(10,5,26,0.46)");
  pool.addColorStop(1, "rgba(10,5,26,0)");
  g.fillStyle = pool;
  g.fillRect(0, 0, mid * 2, mid * 2);

  // The lip. Brightest along the top, where the light in this chamber is. A
  // caller that draws its own outline asks for the pool without it: two rings
  // round one button is the "two borders" the owner saw on the guide's bar.
  if (!withLip) return;
  const lip = g.createLinearGradient(0, mid - r * 1.3, 0, mid + r * 1.3);
  lip.addColorStop(0, lipColours[0]);
  lip.addColorStop(0.5, lipColours[1]);
  lip.addColorStop(1, lipColours[2]);
  g.strokeStyle = lip;
  g.lineWidth = Math.max(1, r * 0.1);
  g.save();
  g.translate(mid, mid);
  g.scale(r * 1.18, r * 1.18);
  g.lineWidth /= r * 1.18;
  g.stroke(lobeBlob(1));
  g.restore();
}

/** The socket, under a button. `withLip` false leaves the pool and drops the
 * ring around it, for a button that carries an outline of its own. */
export function drawLobeSocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  dpr: number,
  lip: SeatSkin["lip"] = P1_SKIN.lip,
  withLip = true,
): void {
  const sprite = socketSprite(r, dpr, lip, withLip);
  const size = r * (1 + SOCKET_PAD) * 2;
  ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
}

const glosses = new Map<number, HTMLCanvasElement>();

function glossSprite(r: number, dpr: number): HTMLCanvasElement {
  const key = Math.max(2, Math.round(r * dpr));
  const held = glosses.get(key);
  if (held) return held;
  if (glosses.size > 12) glosses.clear();
  const size = key * 2;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) paintGloss(g, key);
  glosses.set(key, c);
  return c;
}

/**
 * The wet film on the button: a crescent of light across the upper half, cut
 * to the button's own contour so it never shows a straight edge.
 */
function paintGloss(g: CanvasRenderingContext2D, r: number): void {
  g.save();
  g.translate(r, r);
  g.scale(r, r);
  g.clip(lobeBlob(1));
  g.scale(1 / r, 1 / r);
  g.translate(-r, -r);
  const sheen = g.createRadialGradient(r * 0.72, r * 0.5, 0, r * 0.78, r * 0.6, r * 0.92);
  sheen.addColorStop(0, "rgba(255,255,255,0.34)");
  sheen.addColorStop(0.45, "rgba(255,255,255,0.08)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = sheen;
  g.fillRect(0, 0, r * 2, r * 2);
  // A shadow along the bottom, so the body has a belly.
  const under = g.createLinearGradient(0, r * 1.05, 0, r * 2);
  under.addColorStop(0, "rgba(8,4,20,0)");
  under.addColorStop(1, "rgba(8,4,20,0.4)");
  g.fillStyle = under;
  g.fillRect(0, 0, r * 2, r * 2);
  g.restore();
}

/** The film, over a finished button. */
export function drawLobeGloss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  dpr: number,
): void {
  ctx.drawImage(glossSprite(r, dpr), x - r, y - r, r * 2, r * 2);
}
