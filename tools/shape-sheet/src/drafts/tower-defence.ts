import type { CatalogueEntry } from "../catalogue.js";
import { clubbed, guarded, haloed, shed, spanned, studded } from "../forms/index.js";
import { LURCH, SETTLE, SHIVER, SWELL, TURN, TWITCH, WIND } from "../motions.js";

/**
 * Bodies converted out of other games' frames — `docs/tower-defence.md`, the
 * Galaxy Defense: Fortress TD section and the pages that grew off it.
 *
 * Three came out of that first screenshot: the stage boss and the two things
 * that fall around it. The boss is at the bottom of this file as THE POMMEL,
 * drawn with `clubbed`; it was drawn once before that with `studded`, as THE
 * BURR, and that entry is now in `retired.ts` with the reason it lost. One
 * body does not get two entries.
 *
 * Filed apart from `collected.ts` for the reason that file was filed apart from
 * `bosses.ts`: these did not lose a slot and were not worked forward from the
 * idea store. They were *looked at*, in a screenshot, and asked the only
 * question a screenshot can settle — whether the thing that made that body
 * legible survives being redrawn in a vocabulary of closed contours with lobes.
 *
 * **Converted, not copied.** What is taken is the claim the outline makes, and
 * in every case off that frame the claim is the same one: a plain body wearing
 * a rim of repeated features. What is left behind is everything the source says with
 * fill and light — the interior blisters, the bright pustules, the pale core in
 * the capsule. None of that reaches a phone at 26 px, and a conversion that
 * kept it would be a picture of a picture rather than a proposal about a
 * silhouette. `forms/studded.ts` is the one thing they needed that the tool did
 * not have — and `forms/clubbed.ts` is the thing `studded` turned out not to be
 * able to say.
 *
 * **They are `free`, not `draft`, and the distinction is the whole filing.**
 * A draft is drawn *at* a named idea and carries `suggests`; a free shape is a
 * picture looking for a behaviour. These are the second thing exactly: they
 * came from another game's *look*, nothing in `docs/spec/ideas.md` asked for
 * them, and marking one a draft would quietly promote a row off a page that
 * says of itself that it is a shelf and not a decision. So they sit on the
 * SHAPES tab among the spare contours, where a bestiary entry can be handed
 * one — which is the move `docs/tower-defence.md` is arguing for and has no
 * authority to make.
 */
export const TOWER_DEFENCE_DRAFTS: CatalogueEntry[] = [
  {
    subject: studded("THE RASP", "a small round body under a dense ring of short spines", {
      rx: 44,
      ry: 42,
      studs: 20,
      reach: 0.26,
      width: 0.34,
      blunt: 0.0,
      lobes: 3,
      depth: 0.04,
      seed: 6.7,
    }),
    motion: SHIVER,
    status: "free",
    slot: "creature",
    owner:
      "nothing carries it: converted from the small spiked discs falling around that boss, the ones that read as viruses. Spines rather than lobes is a claim this bestiary has never made — every living body it draws is smooth — so a rim of two dozen needles is the cheapest way to add a kind that is unmistakable at creature size and says nothing about colour. What it has to survive is 26 px, where a needle is one pixel and a slick's outline is already ragged with its own wobble",
  },
  {
    subject: studded("THE BRISTLE", "a lozenge in a fine fringe, longer than it is tall", {
      rx: 54,
      ry: 30,
      studs: 44,
      reach: 0.15,
      width: 0.2,
      blunt: 0.0,
      boxy: 3.4,
      lobes: 2,
      depth: 0.03,
      seed: 1.9,
    }),
    motion: LURCH,
    status: "free",
    slot: "creature",
    owner:
      "nothing carries it: converted from the capsule-shaped bodies in the same frame, which wear a fringe of fine hairs all round a rounded rectangle. It is deliberately the same form as THE RASP at more than twice the count and half the width, so the two differ in exactly the numbers that separate a spine from a hair, and the body under it is squared off rather than round — and standing them beside each other is how you find out whether that difference is visible on a phone or only in the source file",
  },
  {
    subject: haloed("THE CORONA", "a ring of nodes that turns, with one wide gap in it", {
      r: 96,
      // Wide: `ring.test.ts` holds a ring to enclosing its material rather than
      // its opening, and a band this thin is also truer to the source, which
      // is a small core inside a wide circle of satellites.
      hole: 0.56,
      nodes: 11,
      bump: 0.2,
      // A shade under a fifth of a turn per beat: the gap comes round in about
      // six beats, which is long enough to be waited for and short enough that
      // waiting is a decision rather than a delay.
      spin: 0.19,
      missing: 2,
      seed: 8.3,
    }),
    motion: TURN,
    status: "free",
    slot: "boss",
    owner:
      "nothing carries it: converted from Neon Pulsefire's arena boss, a core inside a circle of orbiting satellites. It is very nearly THE WARDEN arrived at independently, and that is the reason to be careful with it rather than the reason to build it — what it has that ours does not is that the opening *comes round* instead of being moved, so waiting is a thing the pair can do. It belongs beside the warden in a VERSUS pair and never instead of it",
  },
  {
    subject: shed("THE RIND", "three sizes, stepped down, and the rim smooths as it goes", {
      r: 52,
      layers: 3,
      step: 0.19,
      dwell: 4,
      teeth: 9,
    }),
    motion: TWITCH,
    status: "free",
    slot: "creature",
    owner:
      "THE RIND is built and does not carry this: it wears the slick's contour or the bulb's, three sizes stepped down a whole body per hit (rind.ts), so this card is the shape it was not given rather than the shape it has. What it still argues, and what the built one took, is the second half — the size steps rather than eases, because a jump is an event and an ease is breathing, and the pair has to see an event to say the word again. What is on offer here is the first half: a rim that goes from toothed to smooth as the layers go, which the shipped body says nothing about",
  },
  {
    subject: spanned("THE CANOPY", "a faceted arc over the whole hull, with the middle spent", {
      rx: 124,
      rise: 64,
      facets: 9,
      // Two facets gone from the middle, which is where a barrier is hit
      // first. A whole one is the other half of the card and is what the
      // director's own pair view is for.
      gone: 2,
    }),
    status: "free",
    slot: "field",
    owner:
      "nothing carries it: converted from the Galaxy Defense dome, the one object on that page the ask named by hand. What is worth taking is not that it is a shield — we have a shield — but that it is *faceted*, so how much is left is a shape rather than a brightness, and a pair can say which part of it is gone. Drawn with two facets already spent, because a barrier at full strength is just an arc and says nothing about the mechanic",
  },
  {
    subject: studded("THE SMART", "a rock that has been turned and is coming back onto its line", {
      rx: 46,
      ry: 44,
      studs: 7,
      reach: 0.12,
      width: 0.62,
      blunt: 0.4,
      lobes: 2,
      depth: 0.07,
      seed: 4.4,
    }),
    motion: SETTLE,
    status: "free",
    slot: "creature",
    owner:
      "nothing carries it, and it is the one card here whose argument is the motion rather than the contour: the body is deliberately near a meteor, because Missile Command's smart bomb is an ordinary warhead that *steers*. SETTLE is the whole proposal — it wanders off its line and snaps back — and the shape is only there so that something is carrying it. If the motion reads on this, it reads on the rock we already draw",
  },
  {
    subject: guarded("THE HOOD", "a body under an arc that is not attached to it", {
      r: 46,
      span: 1.5,
      sweep: 2.5,
      thick: 0.22,
      held: 1,
      lobes: 3,
      seed: 9.2,
    }),
    motion: WIND,
    status: "free",
    slot: "creature",
    owner:
      "nothing carries it: converted from Nova Drift's enemy line-up, which is drawn as white silhouettes on dark and is therefore the strictest test of the only thing that matters here. Almost all of that line-up is already in this catalogue under other names; the one arrangement that is not is a body with a detached piece standing over it, touching nothing. It is the only way this catalogue can draw protection that is a separate object rather than a thickness — and the state worth judging is `held: 0`, where the arc is gone and the body has to read as exposed rather than merely as smaller",
  },
  {
    subject: guarded("THE HOOD — BROKEN", "the same body with the arc gone", {
      r: 46,
      span: 1.5,
      sweep: 2.5,
      thick: 0.22,
      held: 0,
      lobes: 3,
      seed: 9.2,
    }),
    motion: SHIVER,
    status: "free",
    slot: "creature",
    owner:
      "the second half of THE HOOD and useless without it: identical in every parameter except that the guard is gone. The pair of cards is the proposal, not either one of them — a guard that can be broken is worth having only if the broken state is legible on its own, and one card cannot answer that. It carries SHIVER where the whole one carries WIND, which is the same claim made in motion: the thing that was winding up has stopped",
  },
  {
    subject: clubbed("THE POMMEL", "a heavy body wearing balls on stalks, no two the same", {
      rx: 92,
      ry: 86,
      clubs: 12,
      reach: 0.2,
      cap: 0.19,
      neck: 0.52,
      vary: 0.2,
      lobes: 4,
      depth: 0.05,
      seed: 2.4,
    }),
    motion: SWELL,
    status: "free",
    slot: "boss",
    owner:
      "nothing carries it: the same Galaxy Defense stage boss THE BURR was converted from, converted a second time because the first one got the rim wrong. THE BURR reads as a sea urchin — `studded` samples one radius per angle, and a club is wider at its tip than at its waist, so the neck is the one part a radius function cannot keep. This is the same body walked instead of sampled, which is the only way this catalogue can draw a ball on a stalk. The two were judged side by side and this is the one that stands; THE BURR is in `retired.ts` with the reason it lost. The **walk** it is drawn with has since been claimed — THE THROB wears six clubs on a small core, so `clubbedPoints` is `packages/content/src/body-path.ts` now and this card reads the same copy. The body is still free: what a creature took was the construction, not this tuning of it",
  },
];
