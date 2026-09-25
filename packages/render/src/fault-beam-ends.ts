import {
  faultsNow,
  handedOver,
  handoverWarning,
  malfunctionColor,
  midCol,
  type PlacedFault,
  type World,
} from "@neon-spore/sim";
import type { BeamEnd } from "./fault-emitter.js";
import { type Layout, showsCodex, tileCX } from "./layout.js";

/**
 * **Where the fault's beam lands on this screen**, from what the fault has
 * taken: the pilot's panel shows GUARD or the muzzle, the navigator's the
 * dome or the two colour lobes (`view-role.ts`), and for THE CHOKE the
 * pilot's shows the cannon strip's node and the muzzle while the navigator's
 * shows the muzzle alone — the cannon is on the hull on both screens, and
 * the beam is what says the thing at the top is walking it. Handed the
 * lobes rather than
 * looking them up, so this file reads no control set; the strip's node comes
 * in the same list, as a circle with the strip control's id
 * (`frame-ship.ts`).
 *
 * Its own file because `fault-emitter.ts` stood at its 250-line ceiling
 * when the third fault arrived, and this is the one part of it that is
 * about the screen rather than about the thing at the top of the field.
 */
export function faultBeamEnds(
  l: Layout,
  world: World,
  lobes: readonly { id: string; x: number; y: number; r: number }[],
  showsCannon: boolean,
  showsShield: boolean,
): BeamEnd[] {
  const out: BeamEnd[] = [];
  // Every fault in force, not the one: a wave places them on beat rows and may
  // stand two over the same beat, and a lantern with one beam under two faults
  // would be pointing at half of what is wrong (`sim/fault-placed.ts`).
  for (const m of faultsNow(world)) endsFor(m, world, l, lobes, showsCannon, showsShield, out);
  return out;
}

function endsFor(
  m: PlacedFault,
  world: World,
  l: Layout,
  lobes: readonly { id: string; x: number; y: number; r: number }[],
  showsCannon: boolean,
  showsShield: boolean,
  out: BeamEnd[],
): void {
  const lobe = (id: string) => lobes.find((c) => c.id === id);
  if (m.kind === "shield") {
    const guard = lobe("guard");
    if (guard) out.push(guard);
    if (showsShield)
      out.push({ x: tileCX(l, world.shieldCol), y: l.hullY - l.tile * 0.35, r: l.tile * 0.5 });
  } else if (m.kind === "steer") {
    const strip = lobe("cannon");
    if (strip) out.push(strip);
    out.push({ x: tileCX(l, world.cannonCol), y: l.hullY, r: l.tile * 0.4 });
  } else if (m.kind === "handover") {
    // **The whole band, and not one control on it.** Every other fault takes a
    // button or a strip, so its beam lands on that button; this one has both
    // panels, and a beam standing on one lobe of a panel that has changed hands
    // would say the wrong thing about which. So it lands on the band twice, once
    // either side of the middle — one end for each seat's half — from the
    // warning's first beat: threads while the trade is still coming, and two
    // beams once the panels are away (`drawFaultBeam`'s `dim`, `handover.ts`).
    //
    // Two rather than one because one is a *vertical* beam: the emitter hangs in
    // the middle column and the band's middle is directly under it, so a single
    // end drew a bar down the centre of the field with the bodies behind it.
    const away = handedOver(world);
    if (away || handoverWarning(world) > 0) {
      const y = l.bandTop + l.bandHeight / 2;
      for (const share of [0.3, 0.7]) {
        out.push({ x: l.width * share, y, r: l.tile * 0.5, dim: !away });
      }
    }
  } else if (m.kind === "codex") {
    // **Nothing on a panel**, which is the one beam here that lands on no
    // control: the two buttons the fault acts on are the navigator's, and the
    // navigator is the seat this is kept from. So it stands in the field, in the
    // air it has gone wrong in — and only where that air is drawn at all
    // (`codex.ts`).
    if (showsCodex(l.role)) {
      out.push({ x: tileCX(l, midCol(world.cfg)), y: l.gridTop + l.tile, r: l.tile });
    }
  } else if (m.kind === "flip") {
    // **The two columns that have changed places**, and only on the screen
    // they have changed places on. THE FLIP takes no control — every button on
    // both panels works — so there is nothing on a band for a beam to stand
    // on, and the `else` below, which is a runaway cannon's, would have lit
    // both colour lobes and put an end on the muzzle: a picture of a different
    // fault, which is the mistake THE LEECH's arm above was written to undo.
    //
    // It asks the layout and not the world, because the layout is where the
    // fold is (`field-flip.ts`) — the turned screen gets both ends and the
    // true one gets none, so a seat is never shown a tell about a picture it
    // is not being shown. The walls are the same two pixels either way round,
    // which is the point of them: they are what the field is folded about.
    if (l.flip) {
      for (const col of [0, l.cols - 1]) {
        out.push({ x: tileCX(l, col), y: l.gridTop + l.tile, r: l.tile * 0.5 });
      }
    }
  } else if (m.kind === "dark") {
    // **Into the dark itself, on both screens.** THE DARK takes no control
    // either — it has taken the field — so its two beams go down into the
    // black either side of the middle, the thing gone wrong being the air the
    // lantern hangs in (`dark-field.ts`). Two for THE HANDOVER's reason: one
    // straight down from the middle column is a bar across the field.
    const y = l.gridTop + (l.rows / 2) * l.tile;
    for (const col of [1, l.cols - 2]) out.push({ x: tileCX(l, col), y, r: l.tile * 0.6 });
  } else if (m.kind === "leech" || m.kind === "limpet") {
    // **No beam at all, and it is the only fault that gets none.** These two do
    // not reach down and hold a control from a distance — they *fire a body at
    // it*, and the line that body came down is already drawn, from this same
    // lantern's vesicle to the thing it is stuck to (`harpoon-line.ts`). A beam
    // beside it would be the lantern doing the same thing twice.
    //
    // Said by name rather than left to the `else` below, which is a runaway
    // cannon's: until 15 September 2026 a placed leech lit both colour lobes
    // and put a beam on the cannon's column, which is a picture of a different
    // fault entirely. The first frame of one showed it.
  } else {
    const loading = malfunctionColor(world, m) === "red" ? "fireRed" : "fireCyan";
    for (const id of ["fireRed", "fireCyan"]) {
      const c = lobe(id);
      if (c) out.push({ ...c, dim: id !== loading });
    }
    if (showsCannon) out.push({ x: tileCX(l, world.cannonCol), y: l.hullY, r: l.tile * 0.4 });
  }
}
