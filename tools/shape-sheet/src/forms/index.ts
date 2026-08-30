/**
 * Contour forms the game does not have yet.
 *
 * `subjects.ts` can build two kinds of shape: a lobed blob and a faceted
 * crystal, because those are the two the game draws. Several of the ideas in
 * `docs/spec/ideas.md` are not describable as either — THE CHOIR is three
 * bodies that merge, THE WEIGHT hangs off a stalk, THE CONDUCTOR is an arm
 * rather than a body — and a draft drawn as "a blob, but imagine it merging"
 * is not a draft of anything.
 *
 * So these are generators, in the tool rather than in `packages/content`, on
 * the same rule the free contours follow: content is what the game ships, and
 * a form nothing carries is not content yet.
 *
 * Every one of them samples through `blobRadiusMul` wherever it can, so a
 * draft breathes with the same three wobble layers the built shapes do and can
 * be judged against them on equal terms.
 *
 * A directory rather than siblings, because `forms.ts` filled twice and each
 * time the overflow went to a file beside it — first `hooked`, then `hanging`,
 * with both saying in their own comments that the reason was a full file. The
 * seams they named were real and are kept; what changes is that they are now
 * inside the thing they are seams of, so a fourth one has somewhere to go:
 *
 * - `radial` — one radius per angle, symmetric or symmetric-with-a-wobble
 * - `anchored` — held to something: the anchor is part of the outline, and the
 *   asymmetry is fixed rather than a bearing the body keeps re-deciding
 * - `hooked` — the same sampling, asymmetric: the outlines that carry a facing
 * - `hanging` — a body whose mass has given way
 * - `cluster` and `pile` — a field walked on a grid, for anything that comes
 *   apart; two files because they agree on the machinery and disagree about
 *   what the field is made of, which is the whole shape in both cases
 * - `studded` — a rim of the same feature repeated: knobs, spines or hairs,
 *   which is what almost every other game reaches for to tell one falling body
 *   from another
 * - `walked` — an outline stepped corner to corner, for what a radius cannot
 *   say: an arm has no inside to have a radius of, and a rim of square plates
 *   is not a function of angle but a rule about one edge
 */

export { rooted, welling } from "./anchored.js";
export { type ClusterOpts, cluster, moulded } from "./cluster.js";
export { type SacSkin, sac, slumped } from "./hanging.js";
export { heeled, hooked } from "./hooked.js";
export { type PileOpts, pile } from "./pile.js";
export { bloom, glyphed, mawed, slab } from "./radial.js";
export { type StuddedOpts, studded } from "./studded.js";
export { arm, type PlatedOpts, plated, type VaneOpts, vane } from "./walked.js";
