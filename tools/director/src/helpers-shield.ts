import { hullRow, midCol } from "@neon-spore/sim";
import type { HelperGroup } from "./helpers-def.js";
import { PUSHED_ONCE, TORCH_COMING } from "./helpers-poses.js";
import { openShieldLab } from "./shield-lab.js";

/**
 * CONTROLS › HELPERS › **THE SHIELD** — every picture the field draws to say
 * something about the shield, in one place. The owner, 14 October 2026:
 * *when it is required to use shield, it is not clear … also when "torch" is
 * approaching and we have the radar help, it is related to shield … can you
 * structure on the "helper" page everything what is shield related.*
 *
 * THE SHIELD LAB stands at its head (`shield-lab.ts`): the looks offered for
 * the one helper the game does not draw yet — *the shield is wanted here,
 * now* — on a real field. The rows under it are what already ships. THE
 * TORCH ALARM came here from TIME TO TALK and ONE LAST CHANCE from ON A BODY.
 *
 * Owed rows, for helpers that ship with no pose in the gallery to draw them
 * in, are a queue entry (`docs/queue.md`): THE FENCE's skull and gaps,
 * SHIELD STUCK ON, the push's red rim, the button's fading glow, THE
 * THROAT's shield face, and DEFLECTED — `WARD · DEFLECTED` ends on the tick
 * but its frame does not show the word.
 */

export const SHIELD_GROUP: HelperGroup = {
  title: "THE SHIELD",
  sub: "P2 slides it, P1 presses it — everything the field draws to say where, when, and what it will do",
  lab: (host) => openShieldLab("tether", { host }),
  rows: [
    {
      name: "THE TORCH ALARM",
      where: "a grey band across the strip and down both edges, a torch's fall ahead",
      seat: "BOTH, different words — P1: TORCH · COLUMN n · CALL IT; P2: TORCH INBOUND · TAKE THE COLUMN",
      says:
        "The fastest thing in the game is coming, and only the shield answers it. " +
        "The pilot can see where and must say it; the navigator must move the " +
        "shield there on the word.",
      source: "torch-alarm.ts",
      pose: TORCH_COMING,
      role: "p1",
      lookAt: "the grey band under the strip and the column it names",
    },
    {
      name: "THE LIT BUTTON",
      where: "the SHIELD button on P1's band, while the shield is up",
      seat: "P1 — the seat that presses it",
      says:
        "The shield is up now. The button stays lit for the window a press holds " +
        "the shield open, and fades for a moment after it shuts.",
      source: "band.ts, band-control.ts, guard-lapse.ts",
      pose: "SHIELD · ARMED",
      role: "p1",
      crop: "band",
      lookAt: "the lit SHIELD button on the band",
    },
    {
      name: "ONE LAST CHANCE",
      where: "over a body the shield has already pushed back up once",
      seat: "BOTH — both hands were in the push, and both must change what they do",
      says:
        "The shield will not save this one again: this fall is the cannon's or " +
        "the hull's. The body itself looks the same as the first time.",
      source: "last-chance.ts",
      pose: PUSHED_ONCE,
      role: "test",
      lookAt: "the words over the body",
    },
    {
      name: "THE VOLLEY'S BAND",
      where: "on the face of a volley the shield will meet — down as it falls, up as it climbs",
      seat: "BOTH",
      says:
        "The shield answers this one, and does not finish it: the same band the " +
        "dome's rim is drawn with, so it reads as the shield's, and the ball comes back.",
      source: "volley-ward.ts",
      pose: "VOLLEY · WARDED THREE TIMES",
      role: "test",
      lookAt: "the white band on the ball's leading face",
    },
    {
      name: "THE CRAWLER'S DOMES",
      where: "over each plated ring of a crawler, above its crosshair",
      seat: "BOTH",
      says:
        "A crosshair on every ring says *this lane*; a small dome over a ring says " +
        "the shield takes this one, not the cannon.",
      source: "crawler-marks.ts",
      pose: "CRAWLER · WALKING",
      role: "test",
      lookAt: "the small domes over the grey rings",
    },
    {
      name: "SHIELD, ON A BOSS",
      where: "on the part of a boss a step asks the shield for",
      seat: "whichever seat the step names — here both",
      says:
        "Press SHIELD for this: the panel's own SHIELD face inside a scanner box, " +
        "the same on every boss (the cannon's is EMBER).",
      source: "cue-helper.ts, action-face.ts — called from boss-cue-draw.ts",
      pose: "THE SEAM · BLIND",
      role: "p2",
      zoom: { at: (w) => ({ col: w.shieldCol, row: hullRow(w.cfg) - 1.5 }), span: 5 },
      lookAt: "the word SHIELD over the scanner box round the dome, and the SHIELD face in the box",
    },
    {
      name: "THE SURGE'S SHIELD",
      where: "on THE SURGE's grip mark, while a rock it spat is falling",
      seat: "P1 only",
      says: "Ward the rock the bulb just spat, then come back to the grip.",
      source: "surge-word.ts, surge-grip.ts",
      pose: "THE SURGE · WARDING",
      role: "p1",
      zoom: { at: (w) => ({ col: midCol(w.cfg) - 1.5, row: w.cfg.surgeBulbRow + 1.5 }), span: 7 },
      lookAt: "the word SHIELD under the bulb, on the grip mark, and the rock it spat",
    },
    {
      name: "MOVE SHIELD!",
      where: "over a body a fault has fired onto the shield, with its code and timer",
      seat: "P1 — the seat that does not hold the strip, and has to say it",
      says:
        "Something is stuck on the dome and blows if the dome stands still. The " +
        "shield has to keep moving.",
      source: "harpoon-mark.ts, duty-harpoon.ts",
      pose: "LIMPET · ON THE PLATE",
      role: "p1",
      lookAt: "the scanner box on the hull and MOVE SHIELD! above it",
    },
  ],
};
