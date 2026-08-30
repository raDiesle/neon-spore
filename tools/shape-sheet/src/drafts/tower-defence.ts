import type { CatalogueEntry } from "../catalogue.js";
import { guarded, haloed, shed, spanned, studded } from "../forms/index.js";
import { LURCH, SETTLE, SHIVER, SWELL, TURN, TWITCH, WIND } from "../motions.js";

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
      "nothing carries it: converted from the Bloons ceramic, whose shell cracks visibly so the player reads what is left off the body instead of off a bar. The conversion argues we can do better than crack — shrink — and the card is drawn to be watched rather than looked at: the size steps rather than eases, because a jump is an event and an ease is breathing, and the pair has to see an event to say the word again",
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
];
