import type { BandAttach } from "../../../../../packages/render/src/band-join.js";
import type { SheenPass } from "../../../../../packages/render/src/hull-sheen.js";
import type { LobeDraw } from "../../../../../packages/render/src/lobe-look.js";
import type { PanelPlan } from "../../../../../packages/render/src/panel-plan.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";
import type { NerveDraw } from "../../../../../packages/render/src/ship-nerves.js";
import { bubbles } from "../../../fluid.js";
import { organBed, organGloss, organLife } from "../../../organ.js";
import { ribs, wetChamber, wetHull } from "../../../wet.js";

/**
 * LYMPH's parts: the brief taken toward the fluid.
 *
 * Five ribs from the very top of the hull hanging on as wide ribbons, a pale
 * translucent skin under a softer light, small sacs for buttons low at the
 * thumbs with a slow breath and thick strings, and a dozen big bubbles rising
 * from the floor.
 */

/** Low at the thumbs — nearer the middle than EMBEDDED's corners, and the
 * rails a touch higher so the fluid has room under everything. */
export const LOW: PanelPlan["solo"] = [
  { centre: 0.5, maxPitch: 0.46, share: 1 },
  { centre: 0.5, maxPitch: 0.46, share: 1 },
];
export const LOW_TEST: PanelPlan["test"] = [
  { centre: 0.24, maxPitch: 0.22, share: 0.46 },
  { centre: 0.74, maxPitch: 0.22, share: 0.46 },
];
export const ROWS: Pick<PanelPlan, "lobeRow" | "cannonRow" | "shieldRow"> = {
  cannonRow: [0.26, 0.2],
  shieldRow: [0.26, 0.48],
  lobeRow: [0.7, 0.8],
};

const RIBS = ribs(5, 14);
const ORGAN = { veins: 4, reach: 2, swell: 0.5, lobes: 5, depth: 0.05 };

export function skin(s: SheenPass): void {
  wetHull(s, { ribs: RIBS, shine: 0.75, clear: 1.5 });
}

export function chamber(d: BandAttach): void {
  wetChamber(d, { ribs: RIBS, hang: true, weight: 0.35 });
}

export function floor(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  bubbles(g, w, h, skin, { count: 12, from: 0.4 });
}

export function bed(d: LobeDraw): void {
  organBed(d, ORGAN);
}

export function gloss(d: LobeDraw): void {
  organGloss(d);
}

export function life(d: NerveDraw): void {
  organLife(d, { beat: 0.35, drops: 2, beads: 5 });
}
