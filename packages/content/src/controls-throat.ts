import type { ControlDef } from "./controls.js";

/**
 * **THE THROAT's four colours**, one row each — the only buttons on its panel.
 *
 * Its own file because `controls-round.ts` is at its line limit, and because
 * these are not a round's: THE THROAT is a field boss, played on the ordinary
 * falling field, and its panel is the ordinary panel's four *answers* with the
 * cannon taken away. What used to be four different things — a red shot, a
 * cyan shot, the shield and the maw — is one mouth set to one of four colours
 * (`sim/throat-hand.ts`), and the mouth swallows what that answer would have
 * answered (`sim/throat-suck.ts`).
 *
 * **Each seat keeps the half it already had.** The two shots were player 2's,
 * so RED and CYAN are; the shield's trigger and the maw were player 1's, so
 * SHIELD and SUCK are. A pair that has played the standard panel finds every
 * colour under the thumb it was under before.
 *
 * The carry and the pump are not here: both are drags on the field, the
 * mouth and its handle (`sim/drag-targets-c.ts` `throatAim`, `throatPump`),
 * and a panel row would be a second place to look for them.
 */
export const THROAT_CONTROLS: readonly ControlDef[] = [
  {
    id: "throatShield",
    player: 1,
    form: "lobe",
    label: "SHIELD",
    does: "Sets the mouth to the shield's colour. It swallows a rock and refuses everything else.",
  },
  {
    id: "throatSuck",
    player: 1,
    form: "lobe",
    label: "SUCK",
    does: "Sets the mouth to the maw's colour. It swallows a pod, and its cargo is given as the maw gives it.",
  },
  {
    id: "throatRed",
    player: 2,
    form: "lobe",
    label: "RED",
    does: "Sets the mouth red. It swallows a red living body — a slick — and refuses everything else.",
  },
  {
    id: "throatCyan",
    player: 2,
    form: "lobe",
    label: "CYAN",
    does: "Sets the mouth cyan. It swallows a cyan living body — a bulb — and refuses everything else.",
  },
];
