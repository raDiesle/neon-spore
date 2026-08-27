import type { CatalogueEntry } from "../catalogue.js";
import { arm, cluster, glyphed, sac } from "../forms.js";
import { HEAVE, SHIVER, SWELL, TOLL } from "../motions.js";

/**
 * Draft bosses: the three encounters set aside when The Warden took the slot
 * they were competing for, and the one that was deferred rather than rejected.
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
      spread: 2.2,
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
