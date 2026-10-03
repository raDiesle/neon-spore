import {
  type ControlId,
  type ControlSet,
  type DeskKey,
  deskKeys,
  keyGlyph,
  setHas,
} from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { bandControlSet } from "./band.js";
import { bandLobes } from "./band-lobes.js";
import { type Layout, showsCannon, showsShield, tileCX } from "./layout.js";

/**
 * **The desk's keys, on the guide's own controls.** A player at a keyboard
 * reads a rehearsal that shows a thumb on a strip and a thumb on a lobe, and
 * nothing on it says which key is that strip. The owner, 3 October 2026: *on
 * a non-touch device the guide should show the keyboard shortcuts — it looks
 * like a keyboard key with its symbol, next to the slider, or next to the
 * button with the colour to shoot.*
 *
 * So each control the page's seat carries gets a keycap: a strip one at each
 * end, the key that steps it that way, and a lobe one on its shoulder. What a
 * key *is* is `content/src/keys-desk.ts`'s answer, asked of the same set the
 * band was drawn from, so a panel that moves a control to another key moves
 * its cap with it. A phone is never shown one: the host says whether this
 * device is a desk (`ViewState.keys`), and nothing here asks.
 *
 * Only the guide, not the field: the field is the pair's to play, and a toast
 * already names the keys there once (`apps/game/src/key-hint.ts`).
 */

/** Light face, dark skirt: a key, not a button — the band's own lobes are
 * the buttons, and a cap the same colour as them would read as one more. */
const FACE = "#ECE8F4";
const SKIRT = "#7C7690";
const INK = "#1A1626";

/** Every desk key of `set`, by the control it presses. */
function keysByControl(set: ControlSet): Map<ControlId, DeskKey[]> {
  const out = new Map<ControlId, DeskKey[]>();
  for (const k of deskKeys(set)) {
    const list = out.get(k.control) ?? [];
    list.push(k);
    out.set(k.control, list);
  }
  return out;
}

export function drawGuideKeycaps(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
  alpha: number,
): void {
  if (alpha <= 0) return;
  const keys = keysByControl(set);
  // Seated the way the band seated it, so a cap stands on the lobe the band
  // actually drew this tick (`band.ts`, `content/control-seats.ts`).
  const seated = bandControlSet(set, world);
  const s = Math.round(Math.max(24, Math.min(32, l.lobeR * 0.8)));
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (const player of [1, 2] as const) {
    for (const lobe of bandLobes(l, seated, player)) {
      const caps = keys.get(lobe.control.id) ?? [];
      const { x, y, r } = lobe.circle;
      // On the upper right of the rim, half over it: near enough that it is
      // plainly this button's, clear of the middle where the colour is.
      caps.forEach((k, i) => {
        drawKeycap(ctx, x + r * 0.72 + i * (s + 3), y - r * 0.72, s, keyGlyph(k.code));
      });
    }
  }
  const strip = (id: ControlId, y: number): void => {
    for (const k of keys.get(id) ?? []) {
      if (k.step === undefined) continue;
      // The end each key steps towards, past the end column's node.
      const col = k.step < 0 ? 0 : l.cols - 1;
      const x = tileCX(l, col) + k.step * l.tile * 0.15;
      drawKeycap(ctx, x, y - s * 0.95, s, keyGlyph(k.code));
    }
  };
  if (showsCannon(l.role) && setHas(seated, "cannon")) strip("cannon", l.cannonStrip.y);
  if (showsShield(l.role) && setHas(seated, "shield")) strip("shield", l.shieldStrip.y);
  ctx.restore();
}

/** One key, centred on `x, y`, `s` across, its face lifted off its skirt. */
export function drawKeycap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  glyph: string,
): void {
  const lift = Math.max(2, Math.round(s * 0.14));
  const left = x - s / 2;
  const top = y - s / 2;
  const corner = s * 0.22;
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.roundRect(left - 1, top + 1, s + 2, s + lift + 1, corner);
  ctx.fill();
  ctx.fillStyle = SKIRT;
  ctx.beginPath();
  ctx.roundRect(left, top + lift, s, s, corner);
  ctx.fill();
  ctx.fillStyle = FACE;
  ctx.beginPath();
  ctx.roundRect(left, top, s, s, corner);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = `700 ${Math.round(s * 0.62)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, x, y + 1);
}
