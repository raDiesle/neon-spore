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
  // THE CURTAIN's ten. The boss is a sheet the sheet has no card for, and
  // what these mark is fabric moving, never a body standing anywhere.
  "boss.curtainUnroll":
    "the sheet unrolling across the top of the frame. It is seven columns wide, which is not a card (`sim/curtain.ts`).",
  "boss.curtainShadow": "the core settling behind the fabric, seen by one seat. Same argument.",
  "boss.curtainSoft": "a lobe on the hem going soft for a cycle. Same argument.",
  "boss.curtainShove": "the whole sheet carried a column by two hands. Same argument.",
  "boss.curtainReroll": "the sheet rolling a column back over the core, unheld. Same argument.",
  "boss.curtainLobeOff": "a lobe dropping out of the hem. Same argument.",
  "boss.curtainCoreHit": "the bare core rung in its own colour. Same argument.",
  "boss.curtainFire": "the core letting a torch go down its column. Same argument.",
  "boss.curtainTear": "the sheet tearing off its rail. Same argument.",
  "boss.curtainOut":
    "the core going out. What this marks is a frame with nothing under its top — an absence like ui.waveClear rather than a thing standing anywhere.",
  "boss.tasterRise":
    "the crest coming in across the top of the frame. It is eleven columns of one long edge rather than a body, and a fan of blades is not a card (`sim/taster.ts`).",
  "boss.tasterGrow": "a blade coming out of the crest, no colour on it yet. Same argument.",
  "boss.tasterSet": "an edge taking the colour the pair has been spending. Same argument.",
  "boss.tasterThick": "its own colour going in and thickening the edge. Same argument.",
  "boss.tasterPare": "the other colour taking a layer off it. Same argument.",
  "boss.tasterShear": "a blade struck off for good. Same argument.",
  "boss.tasterCrest": "a shot into the soft crest where a blade used to be. Same argument.",
  "boss.tasterLift":
    "the crest cut through — what it marks is the fan losing the ability to taste, which is a rule and not a shape.",
  "boss.tasterTaste":
    "every standing edge turning over at once. The subject is eleven blades changing colour, not one of them.",
  "boss.tasterClose": "the last blades folding over the body. Same argument.",
  "boss.tasterRefused":
    "a single bolt turned away by the interlock. What it marks is nothing happening.",
  "boss.tasterOut":
    "the fan thrown open by the beam. Like boss.gorgeOut, what this marks is a frame with nothing under its top — an absence rather than a thing standing anywhere.",
  // THE LEDGER's eleven. The boss is a body and a cord, and the cord is what
  // every one of these is about: the sheet has cards for bodies, and a length
  // of tension between two of them is not one.
  "boss.ledgerRoot":
    "the cord paying out and going into the plating. What it marks is a line between the boss and the ship rather than either of them (`sim/ledger.ts`).",
  "boss.ledgerSeam": "the split down its middle widening by one. Same argument.",
  "boss.ledgerRefused":
    "a bolt off the plating or in the wrong colour. What it marks is nothing happening.",
  "boss.ledgerBead": "a return starting down the cord. Same argument as the root.",
  "boss.ledgerWard": "the return turned in the socket. Same argument.",
  "boss.ledgerWhip": "the same return thrown back up the cord. Same argument.",
  "boss.ledgerBill":
    "the return landing in the socket unanswered. What it marks is the hull taking a hit, which is `impact`'s subject and not a body of this boss's.",
  "boss.ledgerSocket": "the root sliding a column along the hull. Same argument as the root.",
  "boss.ledgerLast": "the fifth return, the one to let through. Same argument.",
  "boss.ledgerHeld":
    "the last return warded anyway and refused. What it marks is nothing happening.",
  "boss.ledgerTear":
    "the cord out of the ship and the halves parting. Like boss.gorgeOut, what this marks is a frame with nothing under its top — an absence rather than a thing standing anywhere.",
  // THE SINEW's thirteen. The boss is a rope the sheet has no card for, and
  // what these mark is a pull, a hold and a fall, never a body standing anywhere.
  "boss.sinewSettle":
    "the tendon taking the mass's weight over the middle column. It is a rope, which is not a card (`sim/sinew.ts`).",
  "boss.sinewGrip": "a hand closing on its handle. Same argument.",
  "boss.sinewRelease": "a hand off its handle. Same argument.",
  "boss.sinewEnter": "the sum coming into the band. Same argument.",
  "boss.sinewLoose": "the sum slipping out of the band. Same argument.",
  "boss.sinewPart": "a fibre parting under a hold kept. Same argument.",
  "boss.sinewSnap": "the rope whipping back and the hands thrown off. Same argument.",
  "boss.sinewRock": "a rock shaken out of the mass. Same argument.",
  "boss.sinewSlack": "the rope creeping slack under a held hand. Same argument.",
  "boss.sinewFall": "the last fibre gone and the mass falling. Same argument.",
  "boss.sinewSwing": "the falling mass walked a column. Same argument.",
  "boss.sinewOut":
    "the mass down at the wall. What this marks is a frame with nothing under its top — an absence like ui.waveClear rather than a thing standing anywhere.",
  "boss.sinewCrush": "the mass down on the hull. Same argument, with a breach under it.",
  // THE ORRERY's three. The boss is a core inside three orbits of organs
  // drawn by arithmetic (render/orrery-draw.ts), and the sheet has no card for
  // an orbit — what these mark is a ring gone, a core answering and a core out.
  "boss.orreryBreak":
    "a ring of organs parting at its gap. What comes off is an orbit, which is a circle the arithmetic draws and not a body the sheet has a contour for; the organs it sheds fall as rocks, and a rock already has a card.",
  "boss.orrerySpit":
    "the core letting an organ go down a column. The subject is the core, which is drawn as a blob in the middle of three orbits and has no card of its own; the rock is heard as a rock when it lands.",
  "boss.orreryOut":
    "the core going out from the centre outward. Like boss.gorgeOut, what this marks is a frame with nothing under its top — an absence rather than a thing standing anywhere.",
  // THE SURGE's twelve. The boss is a sac the sheet has no card for, and what
  // these mark is a press, a release and a burst, never a body standing anywhere.
  "boss.surgeSettle":
    "the bulb taking its place over the middle column. It is a sac, which is not a card (`sim/surge.ts`).",
  "boss.surgeGrip": "a thumb on the glass. Same argument.",
  "boss.surgeRelease": "a thumb off the glass. Same argument.",
  "boss.surgeNear": "the pressure coming into the band. Same argument.",
  "boss.surgeVent": "a notch of the seam parting. Same argument.",
  "boss.surgeBurst": "the sac bursting and the thumbs thrown off. Same argument.",
  "boss.surgeGum": "a gum thrown down one of its columns. Same argument.",
  "boss.surgeLost": "the charge lost to a release missed. Same argument.",
  "boss.surgeAbsorb": "a body eaten into the bulb. Same argument.",
  "boss.surgeClose": "a notch shutting again after a burst. Same argument.",
  "boss.surgeEvert": "the last notch gone and the sac turning inside out. Same argument.",
  "boss.surgeOut":
    "the bulb gone. What this marks is a frame with nothing under its top — an absence like ui.waveClear rather than a thing standing anywhere.",
  "boss.leadEnter":
    "the body taking its place over the middle column. It is a walker on a stalk, which is not a card (`sim/lead.ts`).",
  "boss.leadPace": "one pace along the top of the field. Same argument.",
  "boss.leadTurn": "the body turning at a wall. Same argument.",
  "boss.leadFlight": "a shot hanging over the top of the field. Same argument.",
  "boss.leadHit": "a segment coming off the stalk. Same argument.",
  "boss.leadMiss": "a shot judged against an empty column. Same argument.",
  "boss.leadReverse": "the body turning on a beat every shot missed. Same argument.",
  "boss.leadTorch": "a torch dropped behind. Same argument.",
  "boss.leadRock": "a rock let go ahead. Same argument.",
  "boss.leadStill": "the body stopping dead on its last segment. Same argument.",
  "boss.leadPass": "the pass to the farther wall. Same argument.",
  "boss.leadWall": "the pass hitting the wall. Same argument.",
  "boss.leadDown": "the last segment taken by the beam. Same argument.",
  "boss.leadOut":
    "the body gone. What this marks is a frame with nothing under its top — an absence like ui.waveClear rather than a thing standing anywhere.",
  "assist.handOver":
    "THE HANDOVER trading the panels. What changes is the whole band — the other seat's buttons in the other seat's colours — and the hull above it does not move for it; the sheet has cards for bodies and there is no body in a screen changing hands.",
  "assist.takeOver": "the same panels coming back. Same argument.",
  "ui.menuBack":
    "QUIT pressed on the lost screen. What ends is the run, on both phones at once, and the menu coming up is the picture of it; the screen the press was on is a veil over a held field rather than a body on one (render/lost-screen.ts).",
  // THE PULSE's twelve, which are next door: a song has no bodies in it at all
  // (`sound-link-pulse.ts`).
  ...PULSE_NO_SUBJECT,
};
