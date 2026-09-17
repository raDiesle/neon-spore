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
};
