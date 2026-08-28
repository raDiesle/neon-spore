import { type ControlDef, type ControlSet, setControls } from "@neon-spore/content";
import { type Layout, showsCannon, showsShield, type ViewRole } from "./layout.js";

/**
 * The other kind of panel: slabs, for a round that has taken the field away.
 *
 * `layout.ts` answers where the band's strips and lobes go. This answers the
 * same question for a control set whose `panelForm` is `slabs` — a set that
 * does not sit under a grid but replaces the whole strip, because the round it
 * belongs to has no grid to sit under. THE GAUGE is the first; there are eleven
 * more designed, and none of them should have to invent this again.
 *
 * **One layout, three readers, and that property is worth more than this
 * file.** The draw asks here, the game's hit test asks here, and the
 * director's asks here — so a control is never drawn where it is not answered.
 * That was the bug the round shipped with once already: the picture built its
 * own three buttons and the touch handler looked for a control set, matched
 * nothing, and the owner reported it as "i cannot test the gauge".
 *
 * **A seat's buttons fill the seat's screen.** However many that seat has, the
 * width is divided by exactly that many — so a seat with one gets one wide
 * button rather than a gap where two others used to be. There is no reaching
 * into the other seat's half the way the band's lobes have to, because a slab
 * panel has no field above it that the two seats share.
 */

/** One of a round's own buttons, placed. */
export interface Slab {
  control: ControlDef;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Whether this screen carries a seat at all. The band's rule, unchanged. */
function seatOn(role: ViewRole, player: 1 | 2): boolean {
  return player === 1 ? showsCannon(role) : showsShield(role);
}

/**
 * Where a slab panel's buttons are, in the order the set lists them.
 *
 * Not the whole band's height: a slab as tall as the control strip reads as an
 * empty column rather than as a button, so they are squared off against the
 * width and centred in what is left — still a target far bigger than anything
 * on the field.
 */
export function slabPanel(l: Layout, set: ControlSet, role: ViewRole): Slab[] {
  const controls = [
    ...(seatOn(role, 1) ? setControls(set, 1) : []),
    ...(seatOn(role, 2) ? setControls(set, 2) : []),
  ].filter((c) => c.form === "slab");
  if (controls.length === 0) return [];

  const pad = Math.max(6, l.width * 0.03);
  const h = Math.max(1, Math.min(l.bandHeight - pad * 2, l.width * 0.42));
  const y = l.bandTop + (l.bandHeight - h) / 2;
  const w = Math.max(1, (l.width - pad * (controls.length + 1)) / controls.length);
  return controls.map((control, i) => ({ control, x: pad + i * (w + pad), y, w, h }));
}

export function hitSlab(slab: Slab, x: number, y: number): boolean {
  return x >= slab.x && x <= slab.x + slab.w && y >= slab.y && y <= slab.y + slab.h;
}

/** The slab for one control, or null when this screen does not carry it. */
export function slabFor(slabs: readonly Slab[], id: ControlDef["id"]): Slab | null {
  return slabs.find((s) => s.control.id === id) ?? null;
}
