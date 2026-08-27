import type { CatalogueEntry } from "../catalogue.js";
import { arm, cluster, glyphed, sac } from "../forms.js";
import { HEAVE, SHIVER, SWELL, TOLL, TURN } from "../motions.js";
import { type RingSilhouette, ring } from "../ring.js";

/**
 * Draft bosses: The Warden, and the three encounters set aside when it took
 * the slot they were competing for, and the one that was deferred rather than
 * rejected.
 *
 * The Warden is the odd one here and is first for that reason. The other four
 * are shapes offered to ideas nobody has designed yet; its design is written
 * out in `bosses.md` 11.4, and that section describes *this* contour — so the
 * shape is not a proposal for the encounter, it is the encounter's body,
 * waiting only for something to draw it.
 *
 * A boss is a whole encounter, so a shape can only ever be part of the
 * proposal — but it is the load-bearing part. Each of these four was described
 * in `docs/spec/ideas.md` with its picture already inside the sentence: a
 * sagging sac on a taut stalk, three bodies in one soap-film membrane, a slab
 * carrying a scrolling glyph, a pendulum arm sweeping the top of the field.
 * Drawing them is how you find out whether the sentence was describing
 * something that can exist at 390 px wide.
 */
/**
 * The Warden's body: a ring with a hole through it, and the only contour drawn
 * for this game that you can see the field through.
 *
 * Two loops that deliberately disagree. The body is eight shallow lobes with
 * almost no wobble — rounder than any creature, faintly organic, so it reads
 * as a fixture rather than as something that fell. The pupil is five deeper
 * lobes with three times the wobble, because the inside is the part that is
 * alive: on a shape whose whole subject is an eye, the edge that moves has to
 * be the one you are looking through.
 *
 * The pupil sits off centre and slides, which is what makes it an eye rather
 * than a washer — the body's material bunches on one side and thins on the
 * other as it travels. `bosses.md` 11.4 has the choreography; these are only
 * the numbers.
 */
const WARDEN: RingSilhouette = {
  outer: { lobes: 8, depth: 0.035, wobble: 0.012, seed: 5.0 },
  pupil: { lobes: 5, depth: 0.1, wobble: 0.075, seed: 9.0 },
  rx: 100,
  ry: 100,
  pupilMul: 0.44,
  pupilDx: 0.1,
};

/**
 * The pupil run out to the edge of its travel. Far enough that the body's
 * material visibly bunches on one side and thins on the other — a smaller
 * offset reads as a hole that happens to be off centre, which is a
 * manufacturing defect rather than a thing looking at you.
 */
const WARDEN_LOOKING: RingSilhouette = { ...WARDEN, pupilDx: 0.28 };

/**
 * The eye open: the two beats the core is exposed. Half again as wide, and
 * that is close to as far as it can ever go — `ringClearance` puts the pupil
 * out of body somewhere past 0.66 of the radius, where it breaches the rim and
 * the shape quietly stops being a ring. `ring.test.ts` holds that floor.
 *
 * Which settles what the last phase looks like, and settles it by measurement
 * rather than by taste. GLARE cannot be *a wider opening* — there is no room.
 * It is this pupil at rest: by the end the eye is permanently as wide as it
 * used to get for two beats, which is the health bar drawn as a silhouette.
 * It gets no card of its own because a still cannot show "all the time", and
 * the card would be this one twice. Anything that wants to dilate further has
 * to thin the body from the outside instead.
 */
const WARDEN_OPEN: RingSilhouette = { ...WARDEN, pupilMul: 0.62, pupilDx: 0.06 };

export const BOSS_DRAFTS: CatalogueEntry[] = [
  {
    subject: ring("WARDEN", WARDEN, "8 lobes · pupil of 5 · a hole you see the field through"),
    motion: TURN,
    status: "draft",
    slot: "boss",
    suggests: "The Warden",
    owner:
      "the boss's own body, and the only contour in the game you can see the field through: a ring whose pupil slides a column a beat, so the column that matters changes while the body does not",
  },
  {
    subject: ring(
      "WARDEN · LOOKING",
      WARDEN_LOOKING,
      "the pupil run out to the edge of its travel",
    ),
    motion: TURN,
    status: "draft",
    slot: "boss",
    suggests: "The Warden",
    owner:
      "far enough off centre that the body visibly bunches on one side and thins on the other — a smaller offset reads as a hole that happens to be off centre, which is a manufacturing defect rather than a thing looking at you",
  },
  {
    subject: ring("WARDEN · OPEN", WARDEN_OPEN, "the two beats the core is exposed"),
    motion: TURN,
    status: "draft",
    slot: "boss",
    suggests: "The Warden",
    owner:
      "the only window the core can be hit in, and near the widest the pupil can ever be: `ringClearance` puts it out of body past about 0.66 of the radius, which is what settles the last phase as this pupil at rest rather than a wider one",
  },
  {
    subject: sac("THE WEIGHT", "a sac hung heavy, narrow at the top", 0.46, 74, 96),
    motion: HEAVE,
    status: "draft",
    slot: "boss",
    suggests: "THE WEIGHT",
    owner:
      "the only boss that descends continuously, so its shape has to say heavy before it has moved: mass pulled to the bottom, a narrow top where the stalk takes the load, and a lift that comes fast and falls back slowly",
  },
  {
    subject: cluster("THE CHOIR", "three bodies in one film, apart and then one", {
      bodies: 3,
      radius: 34,
      spread: 3.0,
      period: 6,
      floor: 0.08,
    }),
    motion: SHIVER,
    status: "draft",
    slot: "boss",
    suggests: "THE CHOIR",
    owner:
      "it takes damage only on the beat the two players act together, and the shape says so without a word: the three bodies merge into one contour and part again, and the merged instant is short and unmistakable",
  },
  {
    subject: glyphed("THE CODEX", "a slab whose rim scrolls a key", 96, 54, 13, 1.4),
    motion: SWELL,
    status: "draft",
    slot: "boss",
    suggests: "THE CODEX",
    owner:
      "it rewrites what a colour means and the current key is legible only on its own skin, which only the other player can read — so the key is cut into the silhouette and travels, and a player reading it aloud is the fight",
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
