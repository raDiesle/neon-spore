import type { BandAttach } from "./band-join.js";
import { bubbles } from "./gland-fluid.js";
import { organBed, organGloss, organLife } from "./gland-organ.js";
import { ribs, wetChamber, wetHull } from "./gland-wet.js";
import type { SheenPass } from "./hull-sheen.js";
import type { LobeDraw } from "./lobe-look.js";
import type { SeatSkin } from "./seat-skin.js";
import type { NerveDraw } from "./ship-nerves.js";

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

// The arrangement — buttons out at the thumbs, the rail a little lower than
// before so the spine runs through the body's middle — is `PANEL_PLAN` in
// `panel-plan.ts`, and only there. This file carried a second copy of those
// numbers from the day it was taken in, imported by nothing, until 14
// September 2026.

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
  organGloss(d, ORGAN);
}

export function life(d: NerveDraw): void {
  organLife(d, { beat: 0.5, drops: 3, beads: 3 });
}
