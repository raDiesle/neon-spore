import type { BandAttach } from "../../../../../packages/render/src/band-join.js";
import type { SheenPass } from "../../../../../packages/render/src/hull-sheen.js";
import type { LobeDraw } from "../../../../../packages/render/src/lobe-look.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";
import type { NerveDraw } from "../../../../../packages/render/src/ship-nerves.js";
import { bubbles } from "../../../fluid.js";
import { organBed, organGloss, organLife } from "../../../organ.js";
import { ribs, wetChamber, wetHull } from "../../../wet.js";

/**
 * HEART's parts: the shipped arrangement, the wet skin, and hearts for buttons.
 *
 * Nine ribs from the very top of the hull, carried on through the chamber as
 * ridges (no ribbons — the flesh here is thick, not hanging); each button a
 * swelling nearly twice its size with nine vessels reaching out to its
 * neighbours', beating a little over once a second; the floor PLASM's bubbles.
 */

const RIBS = ribs(9, 9);
const ORGAN = { veins: 7, reach: 2.7, swell: 0.9, lobes: 2, depth: 0.16 };

export function skin(s: SheenPass): void {
  wetHull(s, { ribs: RIBS, shine: 1.2, clear: 0.8 });
}

export function chamber(d: BandAttach): void {
  wetChamber(d, { ribs: RIBS, hang: false, weight: 0.5 });
}

export function floor(g: CanvasRenderingContext2D, w: number, h: number, skin: SeatSkin): void {
  bubbles(g, w, h, skin, { count: 7, from: 0.55 });
}

export function bed(d: LobeDraw): void {
  organBed(d, ORGAN);
}

export function gloss(d: LobeDraw): void {
  organGloss(d);
}

export function life(d: NerveDraw): void {
  organLife(d, { beat: 1.1, drops: 4, beads: 4 });
}
