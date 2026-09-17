import { describe, expect, it } from "bun:test";
import { WAVES } from "../src/index.js";
import { SCENES } from "../src/scenes.js";

/**
 * **The guides that are still prose, and the count of the ones that are
 * not.**
 *
 * `docs/spec/briefings.md` said *one rehearsal exists* and *FIRST STEP has the
 * only one* for as long as it took to write fifty-five more — a sentence
 * nobody had a reason to open, contradicted by a directory anybody could count.
 * A document that states a number about the code is a copy of the code, and the
 * rule this repository already plays by is that a copy is held by a test
 * (`sim/test/copies-table.ts`). So the numbers in that section are here, in the
 * package that owns them.
 *
 * Both directions matter. A film written for one of the six below fails this
 * and the failure says to update the section; a guide that loses its film fails
 * it the other way. Neither is a defect in the film — it is the document being
 * asked to keep up, which is the only thing that was ever wrong with it.
 */

/**
 * The guided waves whose opening is the three strings and the two circles.
 *
 * Five of them are films nobody has written yet. THE MINE stood here as *the
 * one that cannot have one* — every act was a thumb on a named control and
 * its answer is a finger on a bare square — until the act grew a `tile`
 * gesture that names the square and the seat (`scene-act-types.ts`), and the
 * hand landing on nothing turned out to be exactly the picture.
 */
const STILL_PROSE = [
  "THE COUNT",
  "THE CHOKE",
  "THE LIMPET",
  "THE LEECH",
  "THE CODEX",
  // THE SCOUT's film is owed rather than impossible: the round is built and
  // nothing of it is drawn yet, so the rehearsal has nothing to choreograph.
  // It comes off this list with the lane that draws the little ship.
  "THE SCOUT",
  // THE REPRISE is owed for the same reason and comes off with the lane that
  // draws the mechanism at the top of the field. Its rehearsal has something
  // harder than usual to choreograph, too: what the film has to show is a
  // stretch of field the pair can no longer see.
  "THE REPRISE",
  // And THE STARE, owed by the lane that draws the eye. Its rehearsal is the
  // hardest of the three to choreograph: a film is a thumb landing on a named
  // control, and what this boss teaches is a thumb **not** landing — which
  // needs an eye on the screen to not touch anything under.
  "THE STARE",
  // And THE FLIP's, owed by the lane that finishes it. A rehearsal is the
  // game's own screen played at full size, one device at a time — and this
  // wave's whole content is that one of those two screens is a mirror, which
  // a film has to show by turning and then by being believed.
  "THE FLIP",
  // And THE BATON, owed by the lane that draws the arm. Its film is a bead in
  // the air and a panel going grey under a thumb that must not land — the same
  // "not touching" THE STARE's needs, with the arm drawn to give it a reason.
  "THE BATON",
  // And THE THROAT, owed by the lane that draws the gullet. A film of it would
  // have to show a mouth sliding along a row and a bar filling under it, and
  // neither is drawn yet; until they are there is nothing to choreograph.
  "THE THROAT",
  // And THE HUSK, owed by the lane that films it. A rehearsal is a thumb
  // landing on a named control, and half of this wave's answer is a thumb that
  // must **not** land — the maw left shut while a pod arrives, which is THE
  // STARE's and THE BATON's problem a third time — with the other half being a
  // mark drawn on one seat's screen and not the other's, so the film has to be
  // shot twice and read as one lesson.
  "THE HUSK",
  // And THE UNDERTOW, whose floor is drawn now and whose film is queued with
  // the three above it (`docs/queue.md`, "Four drawn bosses still owe their
  // rehearsal film"). It is a plate of hull bowing on one screen and not the
  // other, and a maw opened under a lobe.
  "THE UNDERTOW",
  // And THE ORRERY, owed by the lane that draws the three orbits. Its film
  // would have to show the same ring drawn true on one screen and as solid
  // armour on the other, which is the whole boss and not a thumb landing
  // anywhere; until the rings are drawn there is nothing to shoot it against.
  "THE ORRERY",
  // And THE CANDLE, owed by the lane that draws the dark. Its film is a black
  // field lit a column at a time by the pair's own shots, and a glow that
  // turns to face one seat's column — nothing of which is drawn yet.
  "THE CANDLE",
  // And THE GORGE, owed by the lane that draws the sack: seven intakes, the
  // beads inside them and a rupture at a size nothing has asked for yet.
  "THE GORGE",
  // And THE CURTAIN, owed by the lane that draws the membrane: a sheet seven
  // columns wide with a shadow behind it, shoved by two hands at once.
  "THE CURTAIN",
  // And THE TASTER, owed by the lane that draws the fan: eleven blades with an
  // edge each, a thickness each, and a crest they grow out of — none of which
  // is drawn yet.
  "THE TASTER",
  // And THE SINEW, owed by the lane that draws the rope: six fibres, two
  // handles and a mass that falls, none of which is drawn yet.
  "THE SINEW",
  // And THE LEDGER, owed by the lane that draws the cord: the split body, the
  // cord itself and the bead coming down it, none of which is drawn yet.
  "THE LEDGER",
];

const guided = WAVES.filter((w) => w.guide);

describe("what `docs/spec/briefings.md` §3.2 says about the rehearsals", () => {
  it("names exactly the guided waves that carry no film", () => {
    const prose = guided.filter((w) => !w.guide?.scene).map((w) => w.name);
    expect(prose.sort(), "update §3.2 of docs/spec/briefings.md and the list above").toEqual(
      [...STILL_PROSE].sort(),
    );
  });

  it("counts one film per guided wave that carries one, and no film unused", () => {
    const filmed = guided.filter((w) => w.guide?.scene);
    const fix = "update §3.2 of docs/spec/briefings.md, which counts sixty films";
    expect(filmed.length, fix).toBe(guided.length - STILL_PROSE.length);
    // Sixty, which is the number in the section. A film with no wave
    // showing it is `scenes.test.ts`'s own failure; this is the other half —
    // the two counts are the same number only while that holds.
    expect(Object.keys(SCENES).length, fix).toBe(filmed.length);
  });

  it("counts the guided waves the opening section names", () => {
    // "seventy-four of the eighty-three waves today" — the one figure in §1
    // that goes stale the same way, and it went stale at sixteen of twenty-six.
    const fix = "update §1 of docs/spec/briefings.md, which says eighty-one of ninety";
    expect(guided.length, fix).toBe(81);
    expect(WAVES.length, fix).toBe(90);
  });

  it("keeps the prose beside a film rather than instead of it", () => {
    // The section says a wave with a film keeps its three strings. A film that
    // arrived with the prose deleted would leave a pair with nothing to read on
    // the second time through.
    for (const w of guided) {
      expect(w.guide?.both, `${w.name} carries a guide with no words in it`).toBeTruthy();
    }
  });
});
