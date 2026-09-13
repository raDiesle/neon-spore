/**
 * The sounds that are wired up and have nothing to draw, with the reason.
 *
 * Every other bound sound gets a picture, and `tools/director/test/sound-link.test.ts`
 * holds that line — but forcing one on these would be a lie about the game.
 * A written exception is the same arrangement `pierce` makes in the catalogue
 * itself: the rule stands, and the way past it is to say why in a sentence.
 *
 * In a file of its own since `sound-link.ts` reached its length: that file
 * is the table of what a sound *is* attached to, and this is the list of what
 * honestly is not. THE PULSE's twelve share one answer and are next door
 * (`sound-link-pulse.ts`); everything here is a one-off.
 */
import { PULSE_NO_SUBJECT } from "./sound-link-pulse.js";

export const NO_SUBJECT: Record<string, string> = {
  "beat.tick": "the beat is the grid and the HUD dots. It belongs to no column and no creature.",
  "ruin.collapse":
    "THE GYRE's wheel failing. What comes apart is a rim, six spokes and a hub, drawn as an armature by render/gyre.ts rather than as a contour — and the sheet's cards are silhouettes of bodies, which is exactly what a wheel is not.",
  "beat.accent": "the same — the fourth beat is a moment, not an object.",
  "impact.hole":
    "a hole is punched in whatever was hit. The subject is the creature, and the creature differs every time.",
  "ui.waveOpen": "a wave opening is the whole field changing, not a thing standing in it.",
  "ui.waveClear": "likewise — what it marks is an absence.",
  "signal.lureWarn":
    "a lure is drawn as a slick or a bulb and never as itself, so there is no picture of one to put here — which is the creature rather than a gap in this page.",
  "creature.lureFold":
    "the same: what folds to a point is whichever body that lure was wearing, and the sheet has no card for a shape nothing has of its own.",
  "creature.veilFlash":
    "the same argument a third time: what shows for a quarter of a second when a cloud tears open is the slick or the bulb that was inside it, and the sheet has no VEIL contour because the cloud is weather laid over a body rather than a silhouette of its own.",
  "signal.radarUnknown":
    "a veil turning over is a body becoming a different body under weather neither player is looking through. There is nothing to draw that is not one of the two cards already on this page.",
  "impact.absorb":
    "a cloud shutting over a shot it took. What the picture would have to be is the two seconds afterwards, which is a state read off the world every frame and not a thing standing anywhere.",
  "boss.fleetLaunch":
    "a salvo leaving the cannon. What it is attached to is a flight rather than a body — the shell is drawn arcing over the chart for two beats (render/fleet-shell.ts) and there is no one moment of it a card could stand for.",
  "boss.fleetSplash":
    "a salvo into open water. The subject is the absence of a subject — the whole point of the sound is that there was nothing in the square.",
  "boss.fleetHit":
    "a hull holed. THE FLEET's ships are drawn from a length and a heading rather than from a contour (render/fleet-hulls.ts), so there is no one card for a ship the way there is for a slick — five lengths and two headings are ten pictures of the same thing.",
  "boss.fleetSunk": "the same hull, going under. Same argument.",
  "impact.graze":
    "THE FENCE going over the ship. What the picture would have to be is a wall the width of the field passing a dome that is standing in one of its gaps — a line and an absence, neither of which is a body, which is why the shape sheet has no FENCE card either.",
  "boss.choir":
    "THE CHOIR singing. What sings is two bodies in one membrane, and the sheet has no CHOIR card for the reason living-look.ts gives it no contour: it is not one body yet, so there is no silhouette of it to stand here. The moment the pilot's gesture lands it becomes a slick or a bulb, and both of those already have cards.",
  "signal.announce":
    "the first of THE CHOIR's two arrows going out. The subject is a gesture — a hand carrying a handle off the edge of the field — and there is no body anywhere in it; what the sound marks is that the pilot has started something and has two beats to finish.",
  "boss.fleetDown":
    "the last of them. What this marks is a chart with nothing left on it, which is an absence like ui.waveClear rather than a thing standing anywhere.",
  "assist.handOver":
    "THE HANDOVER trading the panels. What changes is the whole band — the other seat's buttons in the other seat's colours — and the hull above it does not move for it; the sheet has cards for bodies and there is no body in a screen changing hands.",
  "assist.takeOver": "the same panels coming back. Same argument.",
  "ui.menuBack":
    "QUIT pressed on the lost screen. What ends is the run, on both phones at once, and the menu coming up is the picture of it; the screen the press was on is a veil over a held field rather than a body on one (render/lost-screen.ts).",
  // THE PULSE's twelve, which are next door: a song has no bodies in it at all
  // (`sound-link-pulse.ts`).
  ...PULSE_NO_SUBJECT,
};
