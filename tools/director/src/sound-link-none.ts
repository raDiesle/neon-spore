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
  // THE SPLICE's four. Every one of them happens at a *mouth*, and a mouth is
  // an opening in the plating rather than a body — the sheet's cards are
  // silhouettes of things that stand on the field, and the one thing this
  // fight puts on the field is a tangle of lines nobody has a contour for.
  "boss.spliceFeed":
    "a suck taking hold of a straw. What it is attached to is a mouth two tiles over the plating and a number leaving the far end of a line, neither of which is a body the sheet has a card for.",
  "boss.spliceFed": "the same mouth, swallowing the number it was owed. Same argument.",
  "boss.spliceWrong":
    "the wrong number arriving, or a round's beats running out. The second of those has no place on the field at all — it is a clock — and the two share a sound because they cost the pair the same thing.",
  "boss.spliceDown":
    "the last tangle coming apart. What this marks is a field with no straws left over it, which is an absence like ui.waveClear rather than a thing standing anywhere.",
  "boss.stareCaught":
    "a thumb landing while the eye was watching that seat. What it is attached to is not a body at all — it is a *button*, on a panel, pressed by the wrong person at the wrong moment — and the eye itself is a thing in the sky the sheet has no card for yet (`sim/stare.ts`).",
  // THE BATON's seven. Every one of them happens to a *bead* in a socket of an
  // arm that hangs from the top of the field, and neither the arm nor the bead
  // is drawn yet (`docs/spec/bosses.md`) — the sheet has cards for bodies that
  // stand on the field, and this is a fixture over it whose look half is owed.
  "boss.batonLaunch":
    "a bead leaving its socket. What it is attached to is THE BATON's arm, a fixture hanging from the top of the field that no sheet has a card for yet (`sim/baton.ts`).",
  "boss.batonStruck": "the same bead, hit in the air between two sockets. Same argument.",
  "boss.batonLanded":
    "the bead landing a socket lower, and the one it left going dark. Same argument.",
  "boss.batonRelit": "the bead landing back where it was, untouched. Same argument.",
  "boss.batonSettled":
    "the bead going back to the top of the arm after a missed turn. Same argument.",
  "boss.batonShed":
    "a dark socket parting from the arm. What falls is a meteor, which has a card; what it fell *from* is the arm, which does not.",
  "boss.batonDown":
    "the last drop taken and the arm coming off at every joint. What this marks is a field with no arm left over it — an absence like ui.waveClear rather than a thing standing anywhere.",
  // THE UNDERTOW's nine. Every one of them happens to the *hull* — a plate
  // bowing, parting, scarring, closing — and the hull's own edge is drawn,
  // but not yet lifting (`docs/spec/bosses.md`); the sheet has cards for
  // bodies on the field, and this boss is never a body on it.
  "boss.undertowBow":
    "a plate of the hull bowing upward. What lifts is the hull's own edge, which no sheet has a card for (`sim/undertow.ts`).",
  "boss.undertowLobe": "a lobe standing up through the plate. Same argument.",
  "boss.undertowTaken": "the lobe drawn into the maw and the plate closing. Same argument.",
  "boss.undertowScar":
    "the lobe withdrawing and the breach staying. What is left is a scar, which is drawn on the hull rather than standing on the field.",
  "boss.undertowWidened": "a breach grown wide enough for a second lobe. Same argument.",
  "boss.undertowUnseated":
    "the floor coming up under the cannon. What it happens to is the cannon's mount, not a body.",
  "boss.undertowRise":
    "the whole edge lifting at once. What lifts is every column of hull, which is the ship and not a card.",
  "boss.undertowSwallowed":
    "the body following its lobe down through the hole. What this marks is a hull closed over a thing inside it — an absence like ui.waveClear rather than a thing standing anywhere.",
  "boss.undertowThrough":
    "the last lobe coming through the other way. What gives is the hull, and the wave with it.",
  // THE CANDLE's seven. The boss is a glow in a dark the sheet has no card
  // for, and none of these is a body standing anywhere: a light going down a
  // step, drifting, turning, brightening, going out.
  "boss.candleDark":
    "the field going black as the boss arrives. What changes is the whole field, which is not a card (`sim/candle.ts`).",
  "boss.candleDim": "the glow losing a step to a shot or the beam. Same argument.",
  "boss.candleMove": "the glow drifting a column. Same argument.",
  "boss.candleTurn": "the glow turning to face a column, seen on one seat. Same argument.",
  "boss.candleFed": "a flash swallowed and the glow brightening a step. Same argument.",
  "boss.candleLast": "the glow down to its last step and standing still. Same argument.",
  "boss.candleOut":
    "the last step gone. What this marks is a field with no light in it — an absence like ui.waveClear rather than a thing standing anywhere.",
  // THE GORGE's nine. The boss is a sack the sheet has no card for, and
  // what these mark is fluid moving in and out of it, never a body standing.
  "boss.gorgeSettle":
    "the sack settling into the top of the frame. It is as wide as seven columns, which is not a card (`sim/gorge.ts`).",
  "boss.gorgeSwallow": "a shot swallowed, one bead in. Same argument.",
  "boss.gorgeEmptied": "a bead let go for the wrong colour. Same argument.",
  "boss.gorgeFull": "an intake at four beads, clear and about to vent. Same argument.",
  "boss.gorgeRupture": "a full intake pierced for good. Same argument.",
  "boss.gorgeVent": "a full intake nobody pierced, venting a torch. Same argument.",
  "boss.gorgeSpit": "a swallowed bead spat back as a body. Same argument.",
  "boss.gorgeMouth": "the last whole intake becoming the mouth. Same argument.",
  "boss.gorgeOut":
    "the sack ruptured along its width by the beam. What this marks is a frame with nothing under its top — an absence like ui.waveClear rather than a thing standing anywhere.",
  "assist.handOver":
    "THE HANDOVER trading the panels. What changes is the whole band — the other seat's buttons in the other seat's colours — and the hull above it does not move for it; the sheet has cards for bodies and there is no body in a screen changing hands.",
  "assist.takeOver": "the same panels coming back. Same argument.",
  "ui.menuBack":
    "QUIT pressed on the lost screen. What ends is the run, on both phones at once, and the menu coming up is the picture of it; the screen the press was on is a veil over a held field rather than a body on one (render/lost-screen.ts).",
  // THE PULSE's twelve, which are next door: a song has no bodies in it at all
  // (`sound-link-pulse.ts`).
  ...PULSE_NO_SUBJECT,
};
