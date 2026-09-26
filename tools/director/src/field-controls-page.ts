import type { FieldControlDef } from "./field-control-def.js";
import { BOSS_FIELD_CONTROLS } from "./field-controls-bosses.js";
import { SHIP_FIELD_CONTROLS } from "./field-controls-ship.js";
import { tetherExamples } from "./field-controls-tether.js";

/**
 * The other half of the CONTROLS tab (`controlsets-page.ts`) — split out on
 * line count, the way `handles.ts` split out of `touch.ts` for the same
 * reason: what is touched **on the field itself**, never on the panel below
 * it. It is not a `ControlSet` — `packages/content` has no vocabulary for one
 * of these, because a wave does not pick them by name the way it picks a
 * panel.
 *
 * The list that used to sit under it, of controls tried and set aside, is in
 * `tried-controls-page.ts`: this file went over its own limit in turn, and the
 * two lists only ever shared a tab. What one row *is* went the same way when
 * THE PUSH arrived — `field-control-def.ts`, re-exported below so nothing that
 * reached for a `FieldControlDef` through here had to move — and how a row is
 * *drawn* to `field-controls-rows.ts` (12 September 2026): each names its pose.
 *
 * The fourth cut is the first that moved rows rather than machinery: every
 * boss's own row is in `field-controls-bosses.ts`, spread in below in one
 * place, and what is left here is the handles the game has always had
 * (19 September 2026). The ship's own lobes went the same way on 26
 * September 2026, to `field-controls-ship.ts`. The page grows now only when
 * the game does.
 */

export type { FieldControlDef } from "./field-control-def.js";

export const FIELD_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "GRIP",
    where: "on the field, over anything currently falling",
    seat: "either seat — the field is not split between them",
    gesture: "hold",
    does:
      "Slows whatever the finger landed on for as long as it stays down. " +
      "Letting it through is what costs the hull (sim/grip.ts).",
    source: "touch.ts — creatureAt() under touchDown()",
    holdKind: "grip",
    sends: ["grip"],
    pose: "GRIP · ONE HAND",
  },
  {
    name: "THE PUSH",
    where: "on the same held body, on either screen",
    seat: "either seat — the same hand the grip is",
    gesture: "grab and drag",
    does:
      "Carry the finger a tile sideways and the body under it steps one " +
      "column that way, then stands still for a beat. One hold and two " +
      "gestures, the arrangement the cannon has: the press slows the fall " +
      "and the move takes a lane. Two hands against each other cancel " +
      "(sim/grip-push.ts).",
    source: "touch-move.ts — the grip branch of touchMove()",
    holdKind: "grip",
    dragTarget: "gripBody",
    sends: ["drag"],
    pose: "GRIP · THE PUSH PAUSE",
  },
  // The ship's own lobes, cannon to muzzle: `field-controls-ship.ts`.
  ...SHIP_FIELD_CONTROLS,
  // THE MAZE's string moved out with its heart: `field-controls-maze.ts`.
  {
    name: "THE WARDEN'S TETHER",
    where: "on the tether's resting circle, while one hangs from the rim",
    seat: "player 1 — the pilot pulls, player 2 keeps both colours",
    gesture: "grab and drag",
    does:
      "Pulls the line taut; held taut long enough it opens a hatch " +
      "(render/tether.ts, sim/config-boss.ts).",
    source: "touch.ts — wardenRopeUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "wardenTether",
    sends: ["drag"],
    pose: "TETHER · HELD TAUT",
    examples: tetherExamples,
  },
  {
    name: "THE LID'S CORD",
    where: "on the cord's resting circle, under every armoured eye on the field",
    seat: "player 1 — the pilot pulls, player 2 keeps both colours",
    gesture: "grab and drag",
    does:
      "Parts the plates over the lens in proportion to the pull, and only " +
      "while they stand fully apart does a shot land. Letting go shuts them " +
      "(sim/lid.ts, render/lid-string.ts). The one drag target that is a " +
      "creature, so the command names which body by id.",
    source: "touch.ts — lidCordUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "lidString",
    sends: ["drag"],
    pose: "LID · THE EYE OPEN",
  },
  {
    name: "THE CHOIR'S LEFT ARROW",
    where: "against the left wall of the field, while a membrane is up",
    seat: "player 1 — the pilot makes the gesture, player 2 finishes the body",
    gesture: "grab and drag",
    does:
      "Carried outward — leftward, over the wall it stands against — it opens " +
      "a two-beat window and the whole screen starts shaking. Carried inward " +
      "it is wrong, and the thing sings: the hull pays for the chord. It is " +
      "the alternative to shaking the phone, drawn always rather than behind " +
      "a check, because no browser can be asked reliably whether a shake is " +
      "available (sim/choir-gesture.ts, render/choir-arrows.ts).",
    source: "touch.ts — choirArrowUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "choirLeft",
    sends: ["drag"],
    pose: "CHOIR · TWO VOICES",
  },
  {
    name: "THE CHOIR'S RIGHT ARROW",
    where: "against the right wall of the field, while a membrane is up",
    seat: "player 1 — the pilot makes the gesture, player 2 finishes the body",
    gesture: "grab and drag",
    does:
      "The same control at the other wall, and the second half of one " +
      "gesture: carried outward inside the window the first one opened, the " +
      "two draw together into a single slick or bulb. Two pulls on one side " +
      "is one gesture done twice and opens nothing (sim/choir-gesture.ts).",
    source: "touch.ts — choirArrowUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "choirRight",
    sends: ["drag"],
    pose: "CHOIR · TWO VOICES",
  },
  // Every boss's own rows, in the order they were built, next door:
  // `field-controls-bosses.ts`.
  ...BOSS_FIELD_CONTROLS,
  {
    name: "THE LIGHT",
    where: "anywhere on the field, while THE DARK is down",
    seat: "either seat — the light is on both screens",
    gesture: "press",
    does:
      "Lights the square under the finger for darkLitBeats, and every " +
      "square a drag crosses; the bodies there show again (sim/dark.ts).",
    source: "dark-tap.ts — darkUnder() under touchDown(), lightMove()",
    holdKind: "light",
    sends: ["light"],
    pose: "DARK · A SWIPE OF LIGHT",
  },
  {
    name: "THE GUIDE'S HOLD",
    where: "anywhere on the screen, while a guide or the ready gate is up",
    seat: "both, independently — each seat fills its own circle",
    gesture: "hold",
    does:
      "Fills this seat's ready circle; the wave starts once both are full " +
      "(sim/briefing.ts). Letting go before it is full empties it again.",
    source:
      "apps/game/src/briefing.ts — bindBriefing(), a second listener on the " +
      "same canvas rather than a case in touch.ts, by design",
    holdKind: null,
    sends: ["brief"],
    pose: "GUIDE · THE READY CIRCLES",
  },
];
