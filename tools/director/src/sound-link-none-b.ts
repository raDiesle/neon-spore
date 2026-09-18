/**
 * The sounds wired up with nothing to draw, the second page — from THE
 * SCUTTLE on.
 *
 * `sound-link-none.ts` is the list of one-offs and reached its length with
 * THE LEAD's fourteen; this is the same list continued, spread into
 * `NO_SUBJECT` at the end so `test/sound-link.test.ts` reads one table. The
 * seam is the order the bosses were built in and nothing depends on it.
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
};
