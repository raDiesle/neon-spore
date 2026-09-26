import { describe, expect, it } from "bun:test";
import { WAVES, type WaveKind } from "../src/index.js";

/**
 * A guided wave carries its lesson and nothing else.
 *
 * The owner's rule, 12 September 2026: a wave that teaches something has
 * only the minimum number of enemies the lesson needs, and no other enemy
 * kind. Rocks and every other special kind that are not the lesson go; plain
 * slicks stay only where the lesson needs a target, at the fewest that make
 * the point. Until then most guided waves carried a stray rock and a couple
 * of slicks beside the thing they were about — padding a wave with entries,
 * which `waves.test.ts` names as the same failure as padding it with a guide.
 *
 * What a test can hold of that: every entry with a `kind` on a guided wave is
 * either a kind that first appears on that wave — the thing the guide is
 * about — or one the table below says the lesson keeps, with the reason. How
 * *many* slicks a lesson needs is a judgement, so plain slicks are not counted
 * here. The films (`scenes/`) are not touched by the rule; it is about the
 * wave the pair plays.
 */

/** The kinds a guided wave keeps although it did not introduce them, and why. */
const THE_LESSON_KEEPS: Record<string, readonly WaveKind[]> = {
  // Two rocks on one beat, then three: the rock is the lesson, a wave on.
  "TWO ROCKS": ["meteor"],
  "THE HAND": ["meteor"],
  // The arm folds what comes in under it, and the guide names the rocks.
  "THE VANE": ["meteor"],
  // Four rocks answered untriggered and a fifth on its own — the rocks are
  // what the ward is shown against, the plain one included.
  "THE WARD": ["meteor"],
  // A rock in the lane between plate and dome takes the whole reach; the
  // guide says so, and one rock is kept to show it.
  "THE COIL": ["meteor"],
  // The jammed gun's lesson is what not to point it at.
  "THE JAM": ["lure"],
  // The fence waves after THE FENCE: the wire is the material of both.
  "THE GAP": ["fence"],
  "THE CUT": ["fence"],
  // The hand reaches for rocks, in two sizes.
  "THE CLAW": ["meteor", "meteorMedium"],
  // A rock over a side wall is a rock; what is new is the `cross`.
  "THE CROSSING": ["meteor"],
  // A rock is what asks the plate to stand somewhere, and a plate that has
  // to meet one and be gone on the next beat is the limpet's lesson.
  "THE LIMPET": ["meteor"],
  // The one answer in this game that needs both seats at the same moment — the
  // plate in the column and the dome up on the beat — which is the whole of what
  // the traded panels break. One rock, timed to land inside the window.
  "THE HANDOVER": ["meteor"],
  // THE MOULT is a body whose answer expires, and one rock is what an answer
  // that *keeps* looks like. Without it the lesson has nothing to be measured
  // against: every arrival on an empty field would be a thing that turns over,
  // and the pair would read that as the game rather than as the creature.
  "THE MOULT": ["meteor"],
  // THE STARE introduces no creature at all — what is new is that one of you
  // may not touch anything — so every arrival on it is a kept kind, and the
  // rock is the one that makes the lesson playable. A rock is answered by the
  // *dome*, which is player 1's, and a colour is answered by the *trigger*,
  // which is player 2's: putting rocks inside the looks is what makes "park
  // the plate before it turns" a sentence with a consequence, and what lets a
  // pair play on through a look that took the other seat.
  "THE STARE": ["meteor"],
  // THE BATON introduces no creature either — what is new is that a seat is
  // locked out of its own phone for the beat after it acts — so every arrival
  // on it is a kept kind. The rock is what puts the lockout on the *shared*
  // control: a ward needs her plate and his trigger, and on this wave one of
  // them is always a beat behind the other.
  "THE BATON": ["meteor"],
  // THE THROAT introduces no creature at all — what is new is a boss answered
  // by feeding it — so every arrival on it is a kept kind, and the two are
  // the whole lesson rather than beside it. The gum is the *only* thing that
  // hurts the boss, and the rock is the body in the mouth's column that no
  // shot answers: it is player 1's to brake out of the pull, which is what
  // makes THE DRAG legible in a wave where everything else is a colour.
  "THE THROAT": ["meteor", "gum"],
  // THE GORGE introduces no creature at all — what is new is a boss that
  // swallows every shot that goes past a body, so the lesson is the miss —
  // and every arrival on it is a kept kind. The rock is what gives the pair
  // something to answer *without* firing: a rock is the dome's, and a wave
  // with nothing under the sack but colours would be a wave where every
  // answer feeds it.
  "THE GORGE": ["meteor"],
  // THE TASTER introduces no creature either — what is new is that a blade is
  // broken by the colour it is *not* — and the rock is the only arrival on the
  // wave that can be answered without spending a colour. On a boss that reads
  // what the pair has fired, a field of nothing but colours would be a field
  // where clearing it is what grows the armour, and the lesson would read as
  // the game being unfair rather than as the boss counting.
  "THE TASTER": ["meteor"],
  // THE SINEW introduces no creature either — what is new is a sum the two
  // hands make against a zone one of them cannot see — and every arrival on
  // it is a kept kind, there so that letting go is a decision. The rock is
  // the one body the guard answers rather than the cannon: a hand off the
  // rope to shield is the whole cost of step 7, and a wave with nothing but
  // colours under the mass would let the navigator shoot without letting go.
  "THE SINEW": ["meteor"],
  // THE LEDGER introduces no creature either — what is new is that a hit the
  // pair lands comes back at their own hull — and every arrival on it is a
  // kept kind. The rock is the one arrival the *guard* answers rather than
  // the cannon, and on this boss that is the whole lesson: from the second
  // hit the cord bills every shot the cannon takes, so a wave of nothing but
  // colours would be a wave where answering the field is the thing that
  // kills them, and the pair would read the bill as unfair rather than as a
  // choice about what to shoot at all.
  "THE LEDGER": ["meteor"],
  // THE SURGE introduces no creature either — what is new is a release both
  // thumbs make inside a band only one seat sees — and the rock is on it for
  // the bulb's sake: from its second notch the bulb eats what falls into its
  // columns, and a rock is the one body a pair with both thumbs on the glass
  // would otherwise have to let go to guard against. A field of colours alone
  // would let the navigator shoot without a thumb coming off.
  "THE SURGE": ["meteor"],
  // THE LEAD introduces no creature either — what is new is a shot judged a
  // beat after it leaves, against a column the body has walked to — and the
  // rock is on it for the shield's sake: a body under the lead costs a shot
  // fired at where something *is*, and a rock is the one body the pilot can
  // answer without the cannon leaving the column the pair has agreed on.
  "THE LEAD": ["meteor"],
  // ONE LAST CHANCE introduces no creature — what is new is that the shield
  // pushes a creature back up once and never kills it — and the rock is the
  // contrast the lesson is made of: the one body the shield *is* for, in the
  // same column as a slick the shield will only send back.
  "ONE LAST CHANCE": ["meteor"],
};

describe("a guided wave's entries", () => {
  it("are the kind it introduces, the kinds its lesson keeps, and plain slicks", () => {
    const seen = new Set<WaveKind>();
    for (const [i, wave] of WAVES.entries()) {
      const introduced = new Set<WaveKind>();
      for (const e of wave.entries) {
        if (e.kind === undefined || seen.has(e.kind)) continue;
        seen.add(e.kind);
        introduced.add(e.kind);
      }
      if (!wave.guide) continue;
      const kept = new Set(THE_LESSON_KEEPS[wave.name] ?? []);
      for (const e of wave.entries) {
        if (e.kind === undefined) continue;
        expect(
          introduced.has(e.kind) || kept.has(e.kind),
          `wave ${i + 1} · ${wave.name} teaches ${[...introduced].join(", ") || "nothing new"} and carries a ${e.kind} at beat ${e.beat}`,
        ).toBe(true);
      }
    }
  });

  it("names in the table only waves that exist, carry a guide, and carry the kind", () => {
    for (const [name, kinds] of Object.entries(THE_LESSON_KEEPS)) {
      const wave = WAVES.find((w) => w.name === name);
      expect(wave, `${name} is in the table and not in the game`).toBeDefined();
      expect(wave?.guide, `${name} is in the table and carries no guide`).toBeDefined();
      for (const kind of kinds) {
        expect(
          wave?.entries.some((e) => e.kind === kind),
          `${name} is said to keep a ${kind} and carries none`,
        ).toBe(true);
      }
    }
  });
});
