import { smoothstep } from "@neon-spore/render";
import type { CatalogueEntry } from "../catalogue.js";
import { curled, valved } from "../forms/index.js";
import { SHIVER, SLITHER, SWELL, TUMBLE, TWITCH } from "../motions.js";

/**
 * Five bodies converted off a game that is not a shooter and two animals that
 * are not in any game — `docs/tower-defence.md`, the "Hard, and alive" section.
 *
 * Filed apart from `tower-defence.ts` because they were fished for rather than
 * found. That file holds nine bodies read off five games, and the last three
 * of those gave up one body each: the games this catalogue is near enough to
 * borrow from keep returning things it already draws under other names, which
 * that page lists one by one. So this lane went looking for the two things the
 * nine did not have, and picked its sources by whether they had one of them.
 *
 * **A silhouette that changes because of what the body is doing.** Not because
 * of what it is. Everything here is one outline breathing; the nearest thing
 * to a state is `shed`, which shrinks, and `plated`, which moves a live plate
 * along a slab. Neither of them stops being the same object. `curled` closes a
 * chain of plates into a disc and `valved` splits a shell in two, and both are
 * one parameter apart from their own other state rather than a second drawing.
 *
 * **Hard polygons carrying life rather than rock.** The page already records
 * why Neon Pulsefire's polygons were *not* converted: `crystal` draws every
 * one of them, and what that game does which we do not is spend a polygon on a
 * body that is alive. That is a real gap and it is not closed by softening an
 * edge. It is closed by there being several edges that are allowed to
 * disagree — articulation and grading, with every segment as hard as a
 * meteor's facet. `segmented.ts` is that argument drawn.
 *
 * They are `free`, not `draft`, on the same rule the converted nine follow: a
 * draft is drawn *at* a named idea in `docs/spec/ideas.md` and carries
 * `suggests`; nothing collected off a photograph is one. A free contour is a
 * picture looking for a behaviour, and handing one to a bestiary entry is a
 * decision somebody makes by looking at it.
 */
export const ARMOURED_DRAFTS: CatalogueEntry[] = [
  {
    subject: curled("THE SLATER", "a chain of hard plates that shuts into a disc and opens again", {
      plates: 7,
      step: 23,
      girth: 36,
      taper: 0.76,
      lap: 11,
      belly: 0.78,
      snake: 0.05,
      period: 3.1,
      // Open for the first two fifths, shut hard, hold, then ease back open.
      // The asymmetry is the claim, and it is `SETTLE`'s lesson borrowed
      // into a contour: a body that snaps shut has been *startled*, and a
      // body that eases open has decided the danger has passed. Reversed,
      // the same two states read as breathing.
      curl: (t) => {
        const p = (t % 6) / 6;
        if (p < 0.4) return 0;
        if (p < 0.48) return ((p - 0.4) / 0.08) ** 0.6;
        if (p < 0.74) return 1;
        if (p < 0.95) {
          const x = (p - 0.74) / 0.21;
          return 1 - smoothstep(x);
        }
        return 0;
      },
    }),
    motion: SHIVER,
    status: "free",
    slot: "creature",
    owner:
      "nothing carries it: converted from a woodlouse rolling up — Armadillidium, whose whole defence is that it stops being a long thing and becomes a closed one. What is taken is that the silhouette is the state: no colour changes, no bar moves, the body simply is not the shape it was a beat ago, and a pair can say `it shut` without agreeing on a word for it first. What is left behind is everything the animal says with its legs and its antennae — they are what make a photograph of one legible, they are also fourteen features under 3 px, and a body identified by its legs is a body that stops existing on a phone. The card is judged on whether the shut disc still reads as the same creature as the open chain, because if it does not, this is two bodies and not one that closed",
  },
  {
    subject: curled("THE SLATER — SHUT", "the same chain, pinned closed", {
      plates: 7,
      step: 23,
      girth: 36,
      taper: 0.76,
      lap: 11,
      belly: 0.78,
      snake: 0.05,
      period: 3.1,
      curl: 1,
    }),
    motion: TUMBLE,
    status: "free",
    slot: "creature",
    owner:
      "the second half of THE SLATER and useless without it: every parameter identical, with the curl pinned at 1 so the closed state can be judged on its own rather than glimpsed for a quarter of a cycle. It carries TUMBLE deliberately and the choice is the question rather than a decoration — a shut woodlouse is a ball, and a ball that rolls is the exact thing this game already draws nine of. If the seams are not enough to hold it apart from a meteor while it turns, then the whole roll costs a kind and buys a rock, and the pair should be retired together",
  },
  {
    subject: curled("THE CRAWLER", "a chain of hard plates with a flex running down it", {
      plates: 9,
      step: 20,
      girth: 25,
      taper: 0.58,
      lap: 9,
      belly: 0.86,
      curl: 0.04,
      snake: 0.2,
      period: 3.2,
    }),
    motion: SLITHER,
    status: "free",
    slot: "creature",
    owner:
      "nothing carries it: converted from Into the Breach's Centipede, and it is the same form as THE SLATER at nine plates instead of seven and no roll — the RASP-and-BRISTLE pairing made a second time, so the two differ in exactly the numbers that separate an armoured ball from an armoured chain. The claim is the one the catalogue has never made: hard edges that are *alive*, where the life is a wave running down nine straight-sided plates rather than any of them being rounded off. What it has to survive is the frame. It is the longest thin body here, and a long thin body is the first thing a card starves — the 26 px question arrives for this one as `can you still see that it is jointed`, which is the entire difference between this and RIBBON",
  },
  {
    subject: valved("THE CASE", "a hard shell that hinges open and shuts again", {
      ry: 60,
      rx: 48,
      facets: 5,
      swing: 0.36,
      hinge: 0,
      // Shut for two thirds, open fast, hold open, close slowly. The reverse
      // of THE SLATER on purpose: this one opens *to do something* and closes
      // when it is done, where the woodlouse shuts to survive and opens when
      // it is safe. The pair of timings is the pair of meanings.
      gape: (t) => {
        const p = (t % 5.6) / 5.6;
        if (p < 0.55) return 0;
        if (p < 0.62) return ((p - 0.55) / 0.07) ** 0.7;
        if (p < 0.8) return 1;
        const x = Math.min(1, (p - 0.8) / 0.2);
        return 1 - smoothstep(x);
      },
    }),
    motion: TWITCH,
    status: "free",
    slot: "creature",
    owner:
      "nothing carries it: converted from a beetle's elytra, which is the plainest version in nature of a hard thing that opens — shut and unremarkable most of the time, hinged up before anything happens. It is here because THE LURE's fold was the only silhouette in this game that changed for a reason, and one is not a vocabulary. What is left behind is the whole interior: a real one opens onto folded wings and a soft abdomen, and drawing those would be two mistakes — the cards fill with `evenodd`, so an inner loop punches a hole through the halves as they close over it, and `guarded` already draws a body beside a separate piece. What is only here is the split, so that is all it draws. It carries TWITCH because a body that waits and then flicks is what a telegraph is, and the two clocks are deliberately not in step: if the card only reads while they happen to agree, it is not reading",
  },
  {
    subject: valved("THE CASE — OPEN", "the same shell, pinned open", {
      ry: 60,
      rx: 48,
      facets: 5,
      swing: 0.36,
      hinge: 0,
      gape: 1,
    }),
    motion: SWELL,
    status: "free",
    slot: "creature",
    owner:
      "the second half of THE CASE, and the half that decides it: pinned at full gape so the open state is a picture rather than a fifth of a cycle. The question it exists to answer is narrow and is the only one worth asking — is a wedge of field between two hard halves legible as *one body that has opened*, or does it read as two bodies that happen to be near each other? THE HOOD asked the mirror of this and had the easier version of it, because an arc over a body is plainly a second object. This one has to hold the opposite: two outlines that must still be one thing. It carries SWELL because size is the only other way a body can say `now`, and putting the two claims on one card is how you find out whether the shape needed the help",
  },
];
