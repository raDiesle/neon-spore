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
 * GLAND's parts: EMBEDDED's arrangement with everything the owner asked for
 * laid over it.
 *
 * The buttons stay out at the thumbs and the rail stays a spine through the
 * middle (`fluid.ts`); the skin is `wet.ts`'s — clear, reflecting, no grain —
 * with seven ribs leaving the very top of the hull and hanging on through the
 * chamber as MEDUSA's ribbons; each button is an organ with seven veins and a
 * slow breath (`organ.ts`); and the floor of the panel is PLASM's big bubbles.
 */

/** Out at the thumbs, the rail a little lower than shipped so the spine runs
 * through the body's middle — EMBEDDED's arrangement, kept. */
export const CORNERS: PanelPlan["solo"] = [
  { centre: 0.5, maxPitch: 0.58, share: 1 },
  { centre: 0.5, maxPitch: 0.58, share: 1 },
];
export const CORNERS_TEST: PanelPlan["test"] = [
  { centre: 0.24, maxPitch: 0.26, share: 0.48 },
  { centre: 0.74, maxPitch: 0.26, share: 0.48 },
];
export const ROWS: Pick<PanelPlan, "lobeRow" | "cannonRow" | "shieldRow"> = {
  cannonRow: [0.3, 0.22],
  shieldRow: [0.3, 0.5],
  lobeRow: [0.74, 0.8],
};

const RIBS = ribs(7, 4);
const ORGAN = { veins: 5, reach: 2.3, swell: 0.75, lobes: 4, depth: 0.07 };

export function skin(s: SheenPass): void {
  wetHull(s, { ribs: RIBS, shine: 1, clear: 1 });
}

export function chamber(d: BandAttach): void {
  wetChamber(d, { ribs: RIBS, hang: true, weight: 0.45 });
}

export function floor(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  bubbles(g, w, h, skin, { count: 9, from: 0.5 });
}

export function bed(d: LobeDraw): void {
  organBed(d, ORGAN);
}

export function gloss(d: LobeDraw): void {
  organGloss(d);
}

export function life(d: NerveDraw): void {
  organLife(d, { beat: 0.5, drops: 3, beads: 3 });
}
