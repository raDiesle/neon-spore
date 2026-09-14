import type { CreatureKind } from "@neon-spore/sim";
import type { CreatureDef } from "./creatures.js";

/**
 * **The bodies held with one hand and shot with the other** — three of them.
 *
 * Next door to `creatures-handed.ts`, whose header had already named two of
 * these as "half here": those are answered by hands and nothing else, and
 * their `controls` row is empty to say so. These each name `aim`, because a
 * trigger finishes every one of them — but the trigger alone reaches none.
 * THE LID's plates part only while the pilot holds its cord aside; THE
 * MAGNET's poles are met only by a bolt that climbed from a cannon stood off
 * the column and a thumb on the body; THE CHOIR is two bodies no shot reaches
 * until the device is shaken into one. What the pair has to say is the hand's
 * half, since the panel already shows the trigger's.
 *
 * The other half of the answer is not a `ControlGroup` — a cord, a hand, a
 * shake — and each row below argues that on its own terms, because
 * `test/waves.test.ts` reads `controls` against the wave's panel and a group
 * named here that the panel cannot show is a red check.
 *
 * Cut out of `creatures-table.ts` on 14 September 2026, when that table stood
 * one row under its 250-line limit with a creature's row on the way.
 */
export type HeldKind = Extract<CreatureKind, "lid" | "magnet" | "choir">;

export const HELD_CREATURES: Record<HeldKind, CreatureDef> = {
  lid: {
    kind: "lid",
    // The cannon alone, and the panel a wave with one on it shows. The cord is
    // not a control group: `ControlGroup` is aim and guard, the two things a
    // wave may be missing, and a handle on the field is neither — it is drawn
    // where the body is, the way THE WARDEN's rope and THE MAZE's string are,
    // and no strip has to appear for it.
    controls: ["aim"],
    // No colour of its own: a wave authors one per arrival, the way it does
    // for a clasp. The colour is the *lens's* — what player 2 has to load
    // before the plates part — and it is visible on both screens the whole way
    // down, out of the seam between the plates. What the armour buys here is
    // not surprise, it is timing.
    color: null,
    authorsColor: true,
    // Player 2's strip, like every other aim target. Deliberately not player
    // 1's, for all that the cord is player 1's hand: the pilot already has the
    // body itself to look at from the moment it enters, and a strip announcing
    // one to the seat that cannot fire would be a warning aimed away from the
    // trigger that answers it.
    radar: "p2",
    blurb:
      "An armoured eye with a cord hanging off it. The two plates over the lens part from the middle outwards for exactly as long as the pilot keeps the cord pulled aside, and only while they stand fully apart does the lens's own colour land — so the pull and the shot are one moment in two hands.",
  },
  magnet: {
    kind: "magnet",
    // **Aim only, and that is the whole creature stated as a control group.**
    // A magnet is ended by the cannon and by nothing else — the shield does not
    // turn it, chip it or slow it — so a panel that could ward and not fire is a
    // panel this body cannot be answered on. It is deliberately *not*
    // `["aim", "guard"]`: the second half of the answer is a **hand**, and a
    // hand is not a control group (`test/waves.test.ts` reads this against the
    // panel).
    controls: ["aim"],
    // Authored, the way a clasp's and a dart's are — and it says more here
    // than anywhere else, because one authored colour is *both* poles: the
    // left one is what a wave writes and the right one is its opposite
    // (`magnetPoleColor`). So an author picks which way round the body stands,
    // and the pair reads the answer off the picture.
    color: null,
    // **The pilot's strip**, and the first arrival on it that is not a rock.
    // The rule is the split itself: the seat that is warned is the seat that
    // has to leave a column and put a thumb on the body, and the seat that
    // holds both triggers is told nothing — so the pilot has to say which side
    // they are coming in on before the colour means anything at all.
    radar: "p1",
    blurb:
      "A horseshoe on two poles, one red and one cyan, with an armoured plate slung under it on a staff. A shot up its own column meets the plate and is reflected straight back down. The only bolt that reaches a pole is one arriving sideways — so player 1 stands the cannon *off* the column and holds the body, and the shot climbs, turns level with it and comes in across. The side it arrives from is the pole it meets, and the pole it meets is the trigger that kills it.",
  },
  choir: {
    kind: "choir",
    // **Aim only, and the whole creature is stated by what is *not* here.**
    // A membrane is opened by a gesture that is not on either panel — the
    // device shaken, or two arrows carried off the edges of the field — and a
    // gesture is not a `ControlGroup`. What the wave's panel must be able to
    // answer is the body that comes out, which is a slick or a bulb, which is
    // the cannon. THE MAGNET's row makes the same argument about a hand.
    controls: ["aim"],
    // No colour of its own while it is two bodies: the membrane is grey and
    // nothing about it says which trigger will be right. The colour arrives
    // *with the merge*, from the wave, which is the one entry in this table
    // where `authorsColor` describes a colour the pair cannot see yet.
    color: null,
    authorsColor: true,
    // **The pilot's strip**, and the rule crossing the controls once more
    // rather than an exception to it: the seat warned is the seat that has to
    // put both hands on the glass, and the seat holding both triggers is told
    // nothing until the body is a body. Whichever way round they work it out,
    // somebody has to say when the shaking starts.
    radar: "p1",
    blurb:
      "Two grey balls standing apart in one lane, and no shot reaches either of them. Shake the phone twice — or carry the two arrows at the edges of the field outward, one and then the other — inside two beats, and they glow, draw together over a beat, and become a single slick or bulb. The colour bleeds in as they close and is only whole when they are one; until then there is nothing to shoot. Miss the window and it sings, and the hull pays for the chord.",
  },
};
