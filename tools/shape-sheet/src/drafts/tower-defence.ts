import type { CatalogueEntry } from "../catalogue.js";
import { studded } from "../forms/index.js";
import { LURCH, SHIVER, SWELL } from "../motions.js";

/**
 * Three bodies converted out of another game's frame — `docs/tower-defence.md`,
 * the Galaxy Defense: Fortress TD section.
 *
 * Filed apart from `collected.ts` for the reason that file was filed apart from
 * `bosses.ts`: these did not lose a slot and were not worked forward from the
 * idea store. They were *looked at*, in a screenshot, and asked the only
 * question a screenshot can settle — whether the thing that made that body
 * legible survives being redrawn in a vocabulary of closed contours with lobes.
 *
 * **Converted, not copied.** What is taken is the claim the outline makes, and
 * in all three cases the claim is the same one: a plain body wearing a rim of
 * repeated features. What is left behind is everything the source says with
 * fill and light — the interior blisters, the bright pustules, the pale core in
 * the capsule. None of that reaches a phone at 26 px, and a conversion that
 * kept it would be a picture of a picture rather than a proposal about a
 * silhouette. `forms/studded.ts` is the one thing the three needed that the
 * tool did not have.
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
    subject: studded("THE BURR", "a heavy body wearing blunt knobs, and a crown of longer ones", {
      rx: 88,
      ry: 82,
      studs: 13,
      reach: 0.3,
      width: 0.26,
      blunt: 0.85,
      lobes: 4,
      depth: 0.06,
      seed: 2.4,
      // Upward on the sheet's axis, which is where the source gathers its
      // bright swellings — so the longer knobs stand at the top of the body,
      // over the field, rather than at whichever side the wobble favours.
      crown: { reach: 0.56, at: -Math.PI / 2, spread: 0.75 },
    }),
    motion: SWELL,
    status: "free",
    slot: "boss",
    owner:
      "nothing carries it: it is the Galaxy Defense stage boss converted — a lobed blob with a knobbed rim and a cluster of bright swellings on top. Those swellings are the whole reason that body has a front, and they are light, which a silhouette cannot spend. So the conversion says it with length instead, and the question the card exists to answer is whether a crown of longer knobs reads as a front at all or only as a rim that got untidy",
  },
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
];
