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
 * How many buttons stand side by side before the next ones go underneath.
 *
 * Three is where a phone gives out: a fourth on the same row is a column of
 * glass narrower than a thumb, and a label that no longer fits in it. THE
 * GAUGE has exactly three and is drawn identically either way; SNAKE's six are
 * the reason this number exists, and the six read as two rows of three — which
 * is also what they *are*, a seat's two directions and its own verb.
 */
const PER_ROW = 3;

/**
 * Where a slab panel's buttons are, in the order the set lists them.
 *
 * Not the whole band's height: a slab as tall as the control strip reads as an
 * empty column rather than as a button, so they are squared off against the
 * width and centred in what is left — still a target far bigger than anything
 * on the field. A panel of more than `PER_ROW` wraps rather than getting
 * thinner, for the same reason.
 */
export function slabPanel(l: Layout, set: ControlSet, role: ViewRole): Slab[] {
  const controls = [
    ...(seatOn(role, 1) ? setControls(set, 1) : []),
    ...(seatOn(role, 2) ? setControls(set, 2) : []),
  ].filter((c) => c.form === "slab");
  if (controls.length === 0) return [];

  const pad = Math.max(6, l.width * 0.03);
  const rows = Math.ceil(controls.length / PER_ROW);
  const perRow = Math.ceil(controls.length / rows);
  const h = Math.max(
    1,
    Math.min((l.bandHeight - pad * (rows + 1)) / rows, (l.width * 0.42) / rows),
  );
  const top = l.bandTop + (l.bandHeight - (h * rows + pad * (rows - 1))) / 2;
  const w = Math.max(1, (l.width - pad * (perRow + 1)) / perRow);
  return controls.map((control, i) => ({
    control,
    x: pad + (i % perRow) * (w + pad),
    y: top + Math.floor(i / perRow) * (h + pad),
    w,
    h,
  }));
}

export function hitSlab(slab: Slab, x: number, y: number): boolean {
  return x >= slab.x && x <= slab.x + slab.w && y >= slab.y && y <= slab.y + slab.h;
}

/** The slab for one control, or null when this screen does not carry it. */
export function slabFor(slabs: readonly Slab[], id: ControlDef["id"]): Slab | null {
  return slabs.find((s) => s.control.id === id) ?? null;
}
