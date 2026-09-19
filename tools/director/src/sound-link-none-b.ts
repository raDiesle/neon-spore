/**
 * The sounds wired up with nothing to draw, the second page — from THE
 * LEAD on.
 *
 * `sound-link-none.ts` is the list of one-offs and reached its length with
 * THE LEAD's fourteen; this is the same list continued, spread into
 * `NO_SUBJECT` at the end so `test/sound-link.test.ts` reads one table. The
 * seam is the order the bosses were built in and nothing depends on it.
 *
 * THE LEAD's own fourteen came over on 19 September 2026, by the same rule
 * and for the same reason THE SCUTTLE's did: page one went over, so page one
 * handed its last boss across. They are the walker on the stalk, which is
 * not a card (`sim/lead.ts`) — a body the shape sheet has no contour for,
 * the way a rack of sockets is not one.
 *
 * THE SCUTTLE's ten share THE LEAD's argument: the boss is a frame of
 * sockets over the field and not a body, and the sheet's cards are
 * silhouettes of bodies. What it throws *is* a body — a meteor, a slick, a
 * bulb, a pod — and those have their cards already; the throw itself is the
 * frame's moment, not the part's (`sim/scuttle.ts`).
 *
 * THE HIVE's nine share it again: the boss is a mass over the top of the
 * field with breaches in its underside, and what a breach spills is a
 * meteor, which has its card already; the spill is the breach's moment,
 * not the rock's (`sim/hive.ts`).
 */
export const NO_SUBJECT_B: Record<string, string> = {
  // THE SURGE's twelve came over on 19 September 2026, by the same rule and
  // for the same reason THE LEAD's did: page one went over, so page one handed
  // its last boss across. The boss is a sac over the middle column, which is
  // not a card (`sim/surge.ts`).
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
  "boss.leadGrip": "the navigator's thumb closing on the stalk. Same argument.",
  "boss.leadRelease": "her thumb coming off the stalk, which sets the pass going. Same argument.",
  "boss.leadTear": "the stalk tearing out of a thumb that held it too long. Same argument.",
  "boss.leadPass": "the pass to the farther wall. Same argument.",
  "boss.leadWall": "the pass hitting the wall. Same argument.",
  "boss.leadDown": "the last segment taken by the beam. Same argument.",
  "boss.leadOut":
    "the body gone. What this marks is a frame with nothing under its top — an absence like ui.waveClear rather than a thing standing anywhere.",
  "boss.scuttleEnter":
    "the frame taking its place over the middle columns. It is a rack of sockets, which is not a card (`sim/scuttle.ts`).",
  "boss.scuttleLoose": "a part coming loose in its socket and hanging. Same argument.",
  "boss.scuttleThrow":
    "a part thrown down its column. What falls is a meteor, a slick, a bulb or a pod, and each of those has its own card; the throw is the frame's.",
  "boss.scuttleStruck": "a hanging part cracked off the frame by a bolt. Same argument.",
  "boss.scuttleRebuff": "a bolt of the wrong colour going dull against a part. Same argument.",
  "boss.scuttleSlack": "the frame's next window a beat longer for a pod taken. Same argument.",
  "boss.scuttleWind": "the last part winding up over its socket. Same argument.",
  "boss.scuttleLast": "the last part thrown into the hull. Same argument.",
  "boss.scuttleDown": "the last part taken by the beam in the wind-up. Same argument.",
  "boss.scuttleOut":
    "the frame gone. What this marks is a field with nothing over its top — an absence like ui.waveClear rather than a thing standing anywhere.",
  // THE ANTIPHON's ten share it too: the boss is a body that grows contours
  // no card has — that is the whole question of it — and what falls off its
  // rail is a slick or a bulb, which have their cards (`sim/antiphon.ts`).
  "boss.antiphonEnter":
    "the body rising over the middle columns. It is a surface with nothing on it yet, which is not a card (`sim/antiphon.ts`).",
  "boss.antiphonGrow":
    "an organ pushing out of the surface. Its contour is one nobody has a word for, which is the point; a card would name it.",
  "boss.antiphonPit": "an organ shrivelling to a pit. Same argument.",
  "boss.antiphonHarden": "the organ hardening on a wrong answer. Same argument.",
  "boss.antiphonSink": "an organ drawing back under the surface. Same argument.",
  "boss.antiphonSpill":
    "a rejected candidate falling as a body. What falls is a slick or a bulb, with its own card; the spill is the rail's.",
  "boss.antiphonStill": "the surface going still with every pit taken. Same argument.",
  "boss.antiphonShip":
    "their own ship grown out of the body. It is the hull, which is the ship's and not a card's.",
  "boss.antiphonBurst": "every pit erupting at once. Same argument.",
  "boss.antiphonOut":
    "the body gone. An absence like ui.waveClear rather than a thing standing anywhere.",
  "boss.hiveEnter":
    "the mass settling over the top of the field, every site shut. It is an underside with sites in it, which is not a card (`sim/hive.ts`).",
  "boss.hiveSwell": "a site swelling before it opens. Same argument.",
  "boss.hiveOpen": "a site opening into a breach. Same argument.",
  "boss.hiveSpill":
    "a breach spilling a rock down its column. The rock has its own card; the spill is the breach's moment. Same argument.",
  "boss.hiveSkin": "a bolt going dull against the shut skin between breaches. Same argument.",
  "boss.hiveWrong": "the mass clenching at a bolt of the wrong colour. Same argument.",
  "boss.hiveSeal": "a breach sealed for good by a bolt of its colour. Same argument.",
  "boss.hiveDown": "the last breach sealed under THE SLOW. Same argument.",
  "boss.hiveOut":
    "the mass gone. What this marks is a field with nothing over its top — an absence like ui.waveClear rather than a thing standing anywhere.",
  "boss.instarEnter":
    "the body settling over the field with its first pose to take. It is a body that changes shape, which no one card is (`sim/instar.ts`).",
  "boss.instarMorph": "the body morphing into its next pose. Same argument.",
  "boss.instarShow": "the marks lighting on the body. Same argument.",
  "boss.instarRefuse": "a thumb from the wrong seat on a mark. The mark's, not a card's.",
  "boss.instarAnswer": "one unit of a mark's need given. Same argument.",
  "boss.instarDone": "a mark reaching its need. Same argument.",
  "boss.instarSlip": "a done mark slipping back to nought. Same argument.",
  "boss.instarLand": "every mark of a step done together. Same argument.",
  "boss.instarStrike":
    "a part striking the hull. It is the hull, which is the ship's and not a card's.",
  "boss.instarDown": "the last step landed under THE SLOW. Same argument.",
  "boss.instarOut":
    "the body gone. An absence like ui.waveClear rather than a thing standing anywhere.",
  "boss.filamentEnter":
    "the bundle settling over the field. It is a body of lines nobody can see whole, which no card is (`sim/filament.ts`).",
  "boss.filamentArm": "a filament lit at its free end. The filament's, not a card's.",
  "boss.filamentDrawn": "the pilot's thumb lighting the next tile. Same argument.",
  "boss.filamentFollowed": "the navigator's thumb taking the tile behind his. Same argument.",
  "boss.filamentSnap": "a filament snapping under a thumb carried too fast. Same argument.",
  "boss.filamentRecoil": "the two thumbs meeting and the filament recoiling. Same argument.",
  "boss.filamentDark": "the lit part going dark behind a gap too wide. Same argument.",
  "boss.filamentPulled": "a filament pulled out whole and the body narrowing. Same argument.",
  "boss.filamentDown": "the last filament out under THE SLOW. Same argument.",
  "boss.filamentOut":
    "the body gone. An absence like ui.waveClear rather than a thing standing anywhere.",
  // THE STARE's lid, the two moments of it. The eye is a thing in the sky the
  // sheet has no card for (`sound-link-none.ts`, boss.stareCaught).
  "boss.stareShut":
    "the lid pulled down to the bottom over the eye, by the seat it was not looking at. The eye's, and the sheet has no card for the eye (`sim/stare-hand.ts`).",
  "boss.stareOpen":
    "the lid starting back up — the thumb lifted, or the eye forced it — and the eye about to look at whoever pulled it. Same argument.",
  // THE DIASTOLE's clamp, the two moments of it. The twin lobe is a fixture
  // over the field the sheet has no card for (`sim/diastole-hand.ts`).
  "boss.diastoleClamp":
    "player 1's thumb catching the alone chamber on its contraction, and holding it open for the beam. The lobe's, and the sheet has no card for the lobe.",
  "boss.diastoleSpasm":
    "the chamber refusing a clamp on the wrong beat, or one held too long: eight beats in which nothing lands. Same argument.",
  // THE GORGE's two thumbs and the clench. The sack is the fixture the first
  // page has no card for (`sound-link-none.ts`, boss.gorgeSettle).
  "boss.gorgePinch":
    "player 1's thumb closing on a full intake, its vent held off while the thumb stays. The sack's, and the sheet has no card for the sack (`sim/gorge-hand.ts`).",
  "boss.gorgePry":
    "player 2's thumb prying the mouth open — a window of gorgePryBeats the beam ends the fight in. Same argument.",
  "boss.gorgeClench":
    "the mouth clenching on a beam nobody pried it open for, or on a thumb held past its window, thrown off with a bead. Same argument.",
  // THE WARDEN's second and third hands. The ring is a fixture the sheet has
  // a card for, but these are the hatch's, not the ring's (`sim/warden-hand.ts`).
  "boss.wardenHold":
    "player 2's thumb landing on the eye under NARROW: the lids behind the hatch part while it stays. The hatch's, and the sheet has no card for the hatch.",
  "boss.wardenThrow":
    "player 1's swipe throwing the hatch open under GLARE, when no line comes down — three beats to fire. Same argument.",
  "boss.wardenSlam":
    "the thrown hatch shutting of its own weight when its window ran out. Same argument.",
  // THE VANE's two hands. Nothing of this boss is a body at all — it is a
  // mechanism hung off the top edge, and the sheet's cards are for creatures
  // and fixtures on the grid (`sim/vane-hand.ts`, `docs/spec/bosses.md` §11.5).
  "boss.vanePin":
    "player 1's thumb landing on the sweeping arm under VEER: it stops in the column it was in, and the fold line stops with it. The arm's, and nothing of the arm is on the grid.",
  "boss.vaneSlip":
    "the arm let go, or torn out of the thumb when its beats ran out, sweeping on from wherever the cycle has got to. Same argument.",
  "boss.vaneHaul":
    "player 2 carrying the seized housing off a pinned arm under SEIZE, which is the only way the last pin can be answered. Same argument.",
  // SNAKE's two hands on its own body. The sheet's cards are for creatures and
  // fixtures on the field, and in this round the field is gone altogether
  // (`sim/snake-controls.ts`, `docs/spec/interludes.md`).
  "boss.snakePrise":
    "player 1 hauling the stuck jaws apart under gorge, where the MAW press has stopped working. The head's, on an arena that is not the field and has no cards.",
  "boss.snakeLift":
    "player 2's thumb lifting the last tiles of the tail clear of the arena under shed, so the head may pass through where they stood. Same argument.",
  "boss.snakeDrop": "the same tail back down when her thumb comes off it. Same argument.",
  // PINBALL's two hands on the table. The subject is a cabinet, and the sheet
  // has no card for one — the round throws the field away altogether
  // (`sim/pinball-hand.ts`, `docs/spec/interludes.md`).
  "boss.pinWind":
    "player 1 winding the plunger back after his own hard launch left the spring slack, which is the only thing that starts the bar running again. The plunger's, and the sheet has no card for a cabinet.",
  "boss.pinNudge":
    "player 2 shoving the table through a flight, which moves the ball the way she shoved and is the one thing she has while it falls. Same argument.",
  "boss.pinTilt":
    "the shove after the last one she had: the table tilts and her hand is dead for the rest of the flight. Same argument.",
  // THE SCOUT's two hands. The subject is a little ship in an arena of its
  // own, and the sheet's cards are for the creatures and fixtures of a field
  // this round has put away (`sim/scout-hand.ts`).
  "boss.scoutReel":
    "player 2 putting a line on a laden scout and pulling it straight home, with player 1's turn and burn dead while it runs. The little ship's, and the sheet has no card for it.",
  "boss.scoutSlip":
    "the same line coming off, which hands the ship back to player 1 wherever it has got to. Same argument.",
  "boss.scoutPrime":
    "player 1 priming a thruster three motes have made labour, without which a heavy scout's burn does nothing at all. Same argument.",
  // THE PULSE's hand on the bar. The subject is a meter, which is a reading
  // rather than a body, and the round has thrown the field away as the others
  // have (`sim/pulse-hand.ts`).
  "boss.pulseBrace":
    "a seat putting a thumb on the shared meter under flutter, which takes it out of the song and softens what the other one's misses cost. The bar's, and the sheet has no card for a reading.",
  "boss.pulseSlip":
    "the same thumb coming off, which puts that seat back in the song. Same argument.",
  "boss.pulseArrest":
    "both thumbs on an arrested bar at once, the one moment in the round neither seat can reach alone. Same argument.",
  // THE BATON's arm under a thumb. The subject is the arm itself — a swelling
  // socket, two beads being drawn into one — and the arm is the fixture over
  // the field whose look half is still owed (`sim/baton-hand.ts`).
  "boss.batonSwell":
    "a dead socket beginning to let go of its shell, which is the window a thumb has to take it off clean. What it is attached to is THE BATON's arm, a fixture hanging from the top of the field that no sheet has a card for yet.",
  "boss.batonStripped":
    "the locked-out seat taking that shell off, so no rock falls. Same argument.",
  "boss.batonRefused":
    "a thumb on the arm from the seat whose beat it is not. Same argument — and what it marks is a refusal, which stands nowhere at all.",
  "boss.batonHeld":
    "a thumb landing on one of the two beads the pair is drawing together. Same argument.",
  "boss.batonParted":
    "the drawing-together window closed short, and the bead that waited shaken back to the top of the arm. Same argument.",
  // THE THROAT's two hands on the gullet, and the gullet's own clock beside
  // them. The subject is the tube itself — a fixture hanging from the top of
  // the field with nothing of it among the creatures — so there is no body a
  // sheet could card (`sim/throat.ts`).
  "boss.throatCinch":
    "player 2's thumb landing on a ring the pair has already choked: the gullet stops breathing while she holds it. What it is on is THE THROAT's tube, a fixture that is not a creature and stands on no card.",
  "boss.throatSlip":
    "that hold lost — lifted, or torn out of her thumb when its beats ran out — and the gullet breathing again. Same argument.",
  "boss.throatHaul":
    "player 1 dragging the whole tube a column sideways, which is the only way in this fight to take a body back out of the mouth. Same argument.",
  "boss.throatInhale":
    "the gullet drawing breath — the beat player 2 has been counting down to out loud. It is the tube's own clock and not a thing either thumb did, so it stands on the same fixture and on no card.",
  "boss.throatChoke":
    "a flung gum arriving in the mouth and a ring going slack under it. The gum has a card of its own, but what this sound says happened is the tube's, so it stands with the rest of the fixture.",
  "boss.throatSwallow":
    "the mouth taking what stood in it, and a slack ring drawing tight again. Same argument — the body that was eaten is gone by the time it is heard.",
  "boss.throatEvert":
    "the last ring gone slack and the tube turning through its own mouth. Same argument, and there is no contour for it: the eversion is the fixture unmaking itself.",
  // THE GAUGE's four, the round's first sounds at all. The subject is a dial
  // and a band on a plate, and the round has thrown the field away like the
  // others (`sim/events-gauge.ts`, `docs/spec/interludes.md`).
  "boss.gaugeMark":
    "a call landing between the two marks. The needle's, and the sheet has no card for a dial.",
  "boss.gaugeMiss":
    "a call that missed — free the first time, and the valve sticks beside it. Same argument.",
  "boss.gaugeJam":
    "the miss beside this one sticking the valve: the needle answers his hand until the next call lands. Same argument.",
  "boss.gaugeBind":
    "the mark beside this one winding the band tight: she cannot call while her thumb is not holding it open. Same argument.",
};
