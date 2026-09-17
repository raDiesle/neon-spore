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
};
