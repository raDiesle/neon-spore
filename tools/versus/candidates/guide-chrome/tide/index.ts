import * as look from "../../../../../packages/render/src/guide-look.js";
import { patch, type Variant } from "../../../variant.js";
import { caption } from "./caption.js";
import { BAND_FOOT, band, buttons, NAV_HEIGHT, nav } from "./paint.js";

/**
 * `guide:chrome` / `tide` — CONSOLE's arrangement, cut from a square body,
 * under a living top, with a scrim light enough to see the field through.
 *
 * **What this argues.** That the slot already had its answer in pieces and
 * none of the five held all of it. The owner said so himself on 16 September
 * 2026, reading the page: CONSOLE has the positions and the dashed amber ring;
 * RIBBON has a moving top and a box shape worth putting on every button;
 * SPOTLIGHT has the right idea about the field and the wrong number for it.
 * What each of them also has is the reason he could not simply take one.
 *
 * So four corrections, and every one of them is his sentence:
 * the pages not yet read are drawn to be counted rather than in a violet
 * nobody can see on black; the top moves like something alive rather than like
 * tape on a floor; every button is the square-with-a-lid rather than a blob;
 * and the scrim is 0.32 where SPOTLIGHT's was 0.6.
 *
 * **How it can lose.** It is the busiest of the six. A guide's job is to point
 * at one thing, and this page has a surface moving at the top of it on every
 * page — `membrane.ts` names the part to watch. And the crest costs a
 * rounded rectangle per button per frame, which is nothing on its own and is
 * six of them here.
 *
 * **What it does not carry.** The fifth ask — a second thing highlighted with
 * no words on it, so a page about the cannon also rings the body the cannon
 * has to answer — is not here. `SceneAnchor` has no notion of a companion
 * today and picking one per anchor is a table somebody has to write; it is its
 * own lane.
 */
export const GUIDE_TIDE: Variant = {
  slot: "guide:chrome",
  name: "tide",
  sentence:
    "CONSOLE's positions and its dashed amber ring kept whole, with the four things the owner asked for on top of them — the pages still to read outlined so they can be counted, every button a square with the corners taken off and a lit crest inside its top, a fluid drifting under the top bezel where the tape was, and the field dimmed to a third rather than to two thirds",
  dir: "tools/versus/candidates/guide-chrome/tide",
  screenshot: { freezeSeconds: 2.5 },
  patches: [
    patch({
      target: look.GUIDE_LOOK,
      reached: () => look.GUIDE_LOOK,
      where: {
        file: "packages/render/src/guide-look.ts",
        symbol: "GUIDE_LOOK",
        type: "GuideLook",
      },
      fields: { navHeight: NAV_HEIGHT, bandFoot: BAND_FOOT, band, buttons, nav, caption },
    }),
  ],
};
