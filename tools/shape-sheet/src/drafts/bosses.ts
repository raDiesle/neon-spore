import type { CatalogueEntry } from "../catalogue.js";
import { arm, bloom, glyphed, mawed, sac } from "../forms/index.js";
import { HEAVE, SWELL, TOLL, TURN } from "../motions.js";

/**
 * Draft bosses: encounters nobody has built yet.
 *
 * The Warden used to be first here, as a body waiting for something to draw
 * it. It is drawn now — the shape moved to `packages/content/silhouettes.ts`
 * with every other silhouette the game carries, and its cards are in the
 * catalogue under `taken`.
 *
 * A boss is a whole encounter, so a shape can only ever be part of the
 * proposal — but it is the load-bearing part. Each of these four was described
 * in `docs/spec/ideas.md` with its picture already inside the sentence: a
 * sagging sac on a taut stalk, three bodies in one soap-film membrane, a slab
 * carrying a scrolling glyph, a pendulum arm sweeping the top of the field.
 * Drawing them is how you find out whether the sentence was describing
 * something that can exist at 390 px wide.
 */
export const BOSS_DRAFTS: CatalogueEntry[] = [
  {
    subject: mawed(
      "THE MOTHER",
      "a mouth with arms, and what you killed comes back out of it",
      68,
      6,
      0.5,
      0.62,
      7,
    ),
    motion: SWELL,
    // Taken 25 September 2026, by THE GAUGE's alien. Her design is still
    // bosses.md 11.1, unbuilt: the round wears the shape, not the boss.
    status: "taken",
    slot: "boss",
    owner:
      "THE GAUGE's alien, taken 25 September 2026: centred on the cannon's pivot with its mouth open round our crown, the rim of the mouth held still as the dial and armoured, and the wound the navigator calls torn in it (`render/gauge-alien.ts`). Before that: drawn for The Mother while she held act 70 — she gives back what the pair destroyed, so the shape is built around the opening it comes back out of rather than around a body with an attack: the arms say how far she reaches and the mouth says what she is for, and the pair can name both before anything happens",
  },
  {
    subject: bloom("THE VESSEL", "one core, six arms, each at its own length", 60, 6, 0.62, 9),
    motion: TURN,
    // Free since 11 September 2026, when it left the act order with every
    // other unbuilt name (docs/decisions.md #30). The design is 11.2.
    status: "free",
    slot: "boss",
    owner:
      "nothing wears it: drawn for The Vessel while it held the finale — the navigator reads a target combination and the pilot only the current states, so the silhouette has to *be* several readings at once — six arms on six periods, never in step, so the shape at any instant is a set of numbers and not a mood",
  },
  {
    subject: sac("THE WEIGHT", "a sac hung heavy, narrow at the top", 0.46, 74, 96),
    motion: HEAVE,
    // Free, not draft, since 16 September 2026: the owner cut the whole BOSS
    // IDEAS group, so there is no heading left for this card to be offered to.
    // It is still the shape that was drawn for the encounter, and the encounter
    // is still there to be wanted — a picture waiting for a boss, which is what
    // `free` means and how THE CODEX's card left the same list.
    status: "free",
    slot: "boss",
    owner:
      "the only boss that descends continuously, so its shape has to say heavy before it has moved: mass pulled to the bottom, a narrow top where the stalk takes the load, and a lift that comes fast and falls back slowly",
  },
  {
    subject: glyphed("THE CODEX", "a slab whose rim scrolls a key", 96, 54, 13, 1.4),
    motion: SWELL,
    // Free, not draft, since 13 September 2026: the owner asked for THE CODEX as
    // a **fault on a wave** rather than as an encounter, and that shipped — the
    // two colours swapped for the navigator, the shimmer that says so on the
    // pilot's screen alone (`sim/codex.ts`). So the mechanic is built and the
    // *idea* left `ideas.md`'s list with it, which leaves this card with nothing
    // to be offered to. It is still the shape drawn for a codex **body**, and
    // that body is still wanted if anybody wants it — a picture waiting for a
    // boss, which is what `free` means. What the shipped fault does *not* do is
    // write the key anywhere: it is the air that is wrong, so the question this
    // card was drawn to answer — can a key be read off a travelling rim at boss
    // size — is untouched rather than settled. Taken 26 September 2026 by THE
    // VALVE's drum, whose rim is scrolled by its wheel rather than by a key.
    status: "taken",
    slot: "boss",
    owner:
      "THE VALVE, taken 26 September 2026, combined with THE TITHE: the notched slab is the drum, and its notches scroll with the wheel's bearing, so a turned wheel runs the rim round and a frozen one stops it dead (`render/valve-shape.ts`); the same form in miniature is the wheel in its face. No key is cut into it. Before that, nothing wore it: drawn for THE CODEX while it was an encounter — it rewrites what a colour means and the current key is legible only on its own skin, which only the other player can read, so the key is cut into the silhouette and travels, and a player reading it aloud is the fight. The fault that shipped instead writes no key at all",
  },
  {
    subject: arm("THE CONDUCTOR", "an arm, not a body — it sweeps the top of the field", 150, 0.9),
    motion: TOLL,
    status: "draft",
    slot: "boss",
    suggests: "THE CONDUCTOR, bending the tempo",
    owner:
      "deferred, not rejected: a boss that bends the shared beat attacks the wall that makes speech survive a two-second delay. The pendulum survives the objection — an open contour with no inside, unlike anything else on the field — and could be spent on a boss that bends something else",
  },
];
