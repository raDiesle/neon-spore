import { FAULT_LABEL } from "@neon-spore/render";
import type { HelperGroup } from "./helpers-def.js";
import { BATON_GREY } from "./helpers-poses-band.js";
import { CANNON_FAULT, CANNON_FAULT_BAND, CODEX_ON, FLIP_ON } from "./helpers-poses-faults.js";
import { HANDOVER_PLATE } from "./helpers-poses-marks.js";

/**
 * CONTROLS › HELPERS, **WHEN A CONTROL BREAKS**: what the field draws while a
 * fault holds one of the ship's controls (`sim/malfunction.ts`) — the thing
 * at the top doing it, the words for what it is doing, the button it tore.
 * The owner's rule of 12 September 2026 is that a malfunction always has a
 * visible cause, and these are it. SHIELD STUCK ON and KEEP SHIELD MOVING are
 * the shield's, and stand in THE SHIELD (`helpers-shield.ts`). A boss that
 * takes the band away is no fault, but its picture is the same argument — a
 * control taken is drawn dead, not removed — and stands here beside them.
 */

export const FAULT_GROUP: HelperGroup = {
  title: "WHEN A CONTROL BREAKS",
  sub:
    "a fault has hold of a control: what is doing it, what it is doing, and which " +
    "button it took — and the words beside the lantern, one a fault",
  table: faultWordsTable,
  rows: [
    {
      name: "THE LANTERN",
      where: "at the top of the field, a beam from it down to the control it has taken",
      seat: "BOTH — the beam lands on what each screen holds: P1's guard or muzzle, P2's dome or colours",
      says:
        "Something out there has a control of the ship, and this is the one. " +
        "Beside it, one line a fault in force: what it is making the ship do.",
      source: "fault-emitter.ts, fault-beam-ends.ts, fault-label.ts",
      pose: CANNON_FAULT,
      role: "p1",
      lookAt:
        "the lantern at the top, its beam down to the cannon, and CANNON FIRES ALONE beside it",
    },
    {
      name: "THE TORN BUTTON",
      where: "on the band, over the button the fault has taken",
      seat: "the seat whose control broke",
      says:
        "This button is not yours to press while the fault holds: torn open and " +
        "bleeding, with the button that holds it off lit beside it.",
      source: "malfunction-look.ts",
      pose: CANNON_FAULT_BAND,
      role: "p2",
      lookAt: "the torn button on the band and the one beside it",
    },
    {
      name: "LOCKED — WATCH",
      where: "over the whole band, while THE MIRROR shows its pattern",
      seat: "BOTH",
      says:
        "Nothing on this band answers now: watch the ship play the steps back and " +
        "count them. The buttons stay, dimmed, so the band reads as taken and not broken.",
      source: "band-lock.ts (drawLock)",
      pose: "THE MIRROR · SHOW",
      role: "p1",
      crop: "band",
      lookAt: "the dark scrim over the band and LOCKED — WATCH between its two red rules",
    },
    {
      name: "THE GREY PANEL",
      where: "over the band of the seat that just acted on THE BATON, for one beat",
      seat: "the seat that pressed — the other's band is lit",
      says:
        "Your turn is over: the bead is your partner's now. Grey and no words, and " +
        "it clears on the next beat by itself, so taking turns reads as a metronome.",
      source: "band-lock.ts (drawBatonGrey)",
      pose: BATON_GREY,
      role: "p1",
      lookAt: "the grey over P1's whole band",
    },
    {
      name: "THE HAZE",
      where: "slow bands of light moving across the whole field",
      seat: "P1 only — the navigator's screen is clear",
      says:
        "THE CODEX is on: the colours are swapped. The pilot is shown it and the " +
        "navigator is not, so it has to be said before the next colour is fired.",
      source: "codex.ts",
      pose: CODEX_ON,
      role: "p1",
      lookAt: "COLOURS SWAP by the lantern, and the bands of light over the field under it",
    },
    {
      name: "THE MIRRORED SCREEN",
      where: "a pane of glass down the middle of the field, on the turned screen",
      seat: "the seat whose screen is turned — the other sees the true field",
      says:
        "MIRRORED: left is right on this screen, about the middle. What falls " +
        "here falls in a column it is not in, until two tiles above the ship the " +
        "false picture tears up and the body shows in its true column.",
      source: "flip-seam.ts, flip-reveal.ts, fault-label.ts",
      pose: FLIP_ON,
      role: "p1",
      lookAt: "the glass down the middle with its arrows, and MIRRORED by the lantern",
    },
    {
      name: "THE HANDOVER'S PLATE",
      where:
        "on the lip of the band, two beats before the panels trade and all the while they are traded",
      seat: "BOTH, the same words",
      says:
        "When. The band changing colours says the panels have traded; the plate " +
        "counts down to the trade — PANELS TRADE IN 2 — and then back: THEIR PANEL — BACK IN 5.",
      source: "handover-look.ts",
      pose: HANDOVER_PLATE,
      role: "p1",
      lookAt: "THEIR PANEL — BACK IN on the band's lip, and the band in the other seat's colours",
    },
  ],
};

/** Every fault's words beside the lantern, read off the renderer's own table. */
export function faultWordsTable(): HTMLElement {
  const table = document.createElement("table");
  table.className = "siren-roster";
  const row = (cells: string[], tag: "th" | "td"): void => {
    const tr = document.createElement("tr");
    for (const c of cells) {
      const cell = document.createElement(tag);
      cell.textContent = c;
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  };
  row(["FAULT", "THE WORDS BY THE LANTERN"], "th");
  for (const [kind, words] of Object.entries(FAULT_LABEL)) row([kind.toUpperCase(), words], "td");
  return table;
}
