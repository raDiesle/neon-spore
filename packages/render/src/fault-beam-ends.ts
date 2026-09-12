import { malfunctionColor, type World } from "@neon-spore/sim";
import type { BeamEnd } from "./fault-emitter.js";
import { type Layout, tileCX } from "./layout.js";

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
  const m = world.malfunction;
  if (m === null) return [];
  const out: BeamEnd[] = [];
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
  } else {
    const loading = malfunctionColor(world, m) === "red" ? "fireRed" : "fireCyan";
    for (const id of ["fireRed", "fireCyan"]) {
      const c = lobe(id);
      if (c) out.push({ ...c, dim: id !== loading });
    }
    if (showsCannon) out.push({ x: tileCX(l, world.cannonCol), y: l.hullY, r: l.tile * 0.4 });
  }
  return out;
}
