import { hullRow, midCol } from "@neon-spore/sim";
import type { HelperGroup } from "./helpers-def.js";
import { FENCE_SKULL, PUSHED_ONCE, TORCH_COMING } from "./helpers-poses.js";
import { SHIELD_FAULT } from "./helpers-poses-faults.js";
import {
  GUARD_FADING,
  GUARD_LIT,
  PUSH_FLASH,
  THROAT_SHIELD,
  VOLLEY_TURNED,
} from "./helpers-poses-shield.js";
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
 * THE FENCE's skull is here on a frame of its own (`FENCE_SKULL`); its
 * doorway and sweep are a split and stand with the split
 * (`helpers-hidden.ts`, `helpers-tell.ts`). The push's red rim, the button
 * going out, THE THROAT's shield face and DEFLECTED are posed for this page
 * (`helpers-poses-shield.ts`), SHIELD STUCK ON beside the other faults
 * (`helpers-poses-faults.ts`).
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
      pose: GUARD_LIT,
      role: "p1",
      lookAt: "the lit SHIELD button on the band",
    },
    {
      name: "THE BUTTON GOING OUT",
      where: "the SHIELD button on P1's band, the moment the shield shuts",
      seat: "P1 — the seat that presses it",
      says:
        "The shield has just shut. The light fades for a moment instead of going " +
        "dark at once, so an eye that was not on the button still catches it going out.",
      source: "guard-lapse.ts, band.ts",
      pose: GUARD_FADING,
      role: "p1",
      lookAt: "the SHIELD button's glow, half gone",
    },
    {
      name: "DEFLECTED",
      where: "over the hull, the moment the shield turns a rock or a volley back up",
      seat: "BOTH",
      says:
        "The shield was in the right column on the right beat: the thing went back " +
        "up and the hull is whole. The word is gone in under a second.",
      source: "banner.ts, effects-ship.ts",
      pose: VOLLEY_TURNED,
      role: "test",
      lookAt: "the word DEFLECTED over the hull",
    },
    {
      name: "THE SKULL",
      where: "a tile over the dome, while the dome stands under a shut stretch of fence",
      seat: "BOTH",
      says:
        "Move the shield: the wall above it is shut, and the current will go to " +
        "ground through the dome. A skull struck out of the fence's own blue, lit " +
        "for as long as the column is wrong. Where the way through is, player 1 " +
        "is shown (THE FENCE'S DOORWAY).",
      source: "fence-skull.ts, fence-arc.ts",
      pose: FENCE_SKULL,
      role: "test",
      lookAt: "the electric skull hanging over the dome",
    },
    {
      name: "ONE LAST CHANCE",
      where: "over a body the shield has already pushed back up once",
      seat: "BOTH — both hands were in the push, and both must change what they do",
      says:
        "The shield will not save this one again: this fall is the cannon's or " +
        "the hull's. The push that earned it flashed the rim red for a moment; " +
        "the words stay. The body itself looks the same as the first time.",
      source: "last-chance.ts, shield-push-fx.ts",
      pose: PUSHED_ONCE,
      role: "test",
      lookAt: "the words over the body",
    },
    {
      name: "THE PUSH'S RED RIM",
      where: "the dome's rim and a spray off it, the moment the shield throws a body back up",
      seat: "BOTH",
      says:
        "The wrong answer, and it saved the hull once: a body is the cannon's. " +
        "The rim goes red for a moment and red sprays off the dome — no DEFLECTED, " +
        "no cyan — and the body carries ONE LAST CHANCE from then on.",
      source: "shield-push-fx.ts",
      pose: PUSH_FLASH,
      role: "test",
      lookAt: "the red rim on the dome and the red spray off it",
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
      name: "THE THROAT'S SHIELD FACE",
      where: "inside THE THROAT's mouth, while it is set to the shield",
      seat: "P1 — the seat that sets it; on P2's, her handle on the mouth covers the hole",
      says:
        "The mouth swallows what the shield would. The shield and the cyan shot " +
        "are one colour, so the panel's own SHIELD face is drawn in the hole to say which.",
      source: "throat-hue.ts, throat-mouth.ts",
      pose: THROAT_SHIELD,
      role: "p1",
      lookAt: "the SHIELD face inside the mouth's lip",
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
    {
      name: "SHIELD STUCK ON",
      where: "beside the lantern at the top, its beam down to the dome",
      seat: "BOTH — the beam lands on the dome on P2's screen, on GUARD on P1's",
      says:
        "A fault holds the shield up: it cannot be pressed off, and what it " +
        "catches it catches whether the pair wanted it or not. KEEP SHIELD MOVING " +
        "is the same lantern for a limpet on the dome.",
      source: "fault-label.ts, fault-emitter.ts, fault-beam-ends.ts",
      pose: SHIELD_FAULT,
      role: "p2",
      lookAt: "SHIELD STUCK ON beside the lantern and the beam down to the dome",
    },
  ],
};
