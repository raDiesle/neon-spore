import { setHas } from "@neon-spore/content";
import { colFromX, type Layout, type Strip, showsCannon, showsShield } from "./layout.js";
import type { Field } from "./touch-field.js";
import type { Touch } from "./touch-hold.js";
import { lobeUnder } from "./touch-lobe.js";

/**
 * A press on the panel below the field: the buttons, and the two strips.
 *
 * Split out of `touch.ts` on that file's length limit, which the strips' own
 * reach pushed it past. It is the half of `touchDown` that never looks at the
 * field — no bodies, no hull, no handles — and the order in it is the whole
 * of what it says.
 */

/** The panel's answer to a press. Null where nothing on it wanted the point. */
export function bandUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  // **The buttons first, and the strips after them.** A lobe is a circle and
  // says exactly where it is; a strip is a slab across the whole width and is
  // the band's fallback, so asking the precise one first is the only order in
  // which the two cannot argue. It was the other way round while the slab was
  // small enough never to reach a button.
  if (showsCannon(l.role)) {
    const lobe = lobeUnder(l, field.controls, 1, x, y);
    if (lobe) return lobe;
  }
  if (showsShield(l.role)) {
    const lobe = lobeUnder(l, field.controls, 2, x, y);
    if (lobe) return lobe;
  }
  // A strip is answered only when the wave's panel actually has one, and that
  // is the repair the lobes already had: `bandLobes` walks the set, so a
  // button the set left out has no circle to be answered at — while these two
  // strips were still answered by position whatever the set said. THE FLEET is
  // the first panel with no strip on it at all, and without this its arrows
  // would sit under a cannon nobody can see and nothing can move.
  //
  // **How near counts is the strip's own, and it is a share of the band**
  // rather than a slab round the cord: the thing a thumb aims at is drawn
  // larger than the cord, and a press on the visible part of it used to land
  // outside every region on the screen (`strip-band.ts`).
  if (showsCannon(l.role) && setHas(field.controls, "cannon") && onStrip(l.cannonStrip, y)) {
    // A press on the strip while THE CHOKE's fault has the cannon goes to the
    // ship like any other and is swallowed there (`faultSwallows`), the way a
    // press on a dead lobe is: the panel keeps every control where it was, and
    // the simulation is the one that says no.
    return {
      player: 1,
      command: { kind: "cannonCol", col: colFromX(l, x) },
      hold: { kind: "cannon" },
    };
  }
  if (showsShield(l.role) && setHas(field.controls, "shield") && onStrip(l.shieldStrip, y)) {
    return {
      player: 2,
      command: { kind: "shieldCol", col: colFromX(l, x) },
      hold: { kind: "shield" },
    };
  }
  return null;
}

/** Whether a press is near enough a strip to have meant it (`strip-band.ts`). */
function onStrip(s: Strip, y: number): boolean {
  return y >= s.top && y <= s.bottom;
}
