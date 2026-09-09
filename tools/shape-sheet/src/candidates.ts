import type { CreatureSilhouette } from "@neon-spore/content";
import { VARIANTS } from "../../versus/candidates/index.js";
import type { Variant } from "../../versus/variant.js";
import type { CatalogueEntry } from "./catalogue.js";
import { blob } from "./subjects.js";

/**
 * EVERY CONTOUR CANDIDATE, AS A SHAPE THAT CAN BE MEASURED.
 *
 * A candidate for a creature's outline patches a `CreatureSilhouette` and
 * exists for the length of one `draw()` — it is a set of fields held over a
 * shipped record while the pair is on screen, and nothing else in the
 * repository can see it. So the two questions this project insists on about a
 * silhouette could not be asked of one: **does it survive its own drawn size**
 * (the 20 px floor, the 11 px cliff) and **does the nameability gate still
 * separate it from its neighbours**. Both are the cheap disqualifiers
 * `docs/art-review.md` puts first, and the vote is the expensive step they
 * exist to save — so being unable to ask them until after the vote is exactly
 * backwards.
 *
 * The join is derived and never authored. A shape written by hand beside a
 * candidate would be a second copy of the numbers, and the two would drift the
 * first time either moved: this keeps the patches that name the silhouette
 * file, applies each one's `fields` to a copy of its target, and hands the
 * result to the same `blob` builder every shipped body goes through. The
 * candidate's own contour, measured on the same terms as the shape it wants to
 * replace.
 *
 * **They are `candidate` and not `draft`, and the difference matters.** A
 * draft is a shape drawn at an idea nobody has built, and every draft names
 * the idea it is offered to; a candidate is a second answer to a body already
 * on the field, offered to a vote that is open this week. Keeping them apart
 * is also what stops a lane that opens a contour candidate from having to
 * edit `docs/asset-catalogue.md`'s count of drafts, which would be a trap
 * rather than a rule.
 */

/** The file a creature's own outline is written in. A patch anywhere else is
 * a look — a colour, a light, a skin — and has no contour to measure. */
export const CONTOUR_FILE = "packages/content/src/silhouettes.ts";

/** A candidate's patched contour, under the candidate's own name. */
export interface ContourCandidate {
  /** `creature:slick`, the question it answers. */
  slot: string;
  /** `pinch`, the answer. */
  name: string;
  /** `SLICK · PINCH` — how it is named on the sheet and in the report. */
  subjectName: string;
  /** The shipped record with this candidate's fields written over it. */
  shape: CreatureSilhouette;
  /** The candidate's own sentence, so the card says what it is arguing. */
  sentence: string;
}

/** Whether a patched record is a creature's outline rather than a look. */
function isSilhouette(value: object): value is CreatureSilhouette {
  const s = value as Partial<CreatureSilhouette>;
  return typeof s.rx === "number" && typeof s.ry === "number" && typeof s.lobes === "number";
}

/**
 * Every contour candidate open in `tools/versus/candidates/`.
 *
 * A candidate patching several records contributes one shape per contour it
 * patches, which is right rather than tidy: two outlines changed at once are
 * two shapes to measure, and a card that showed only the first would be
 * silent about the other.
 */
export function contourCandidates(variants: readonly Variant[]): ContourCandidate[] {
  const out: ContourCandidate[] = [];
  for (const variant of variants) {
    for (const patch of variant.patches) {
      if (patch.where.file !== CONTOUR_FILE) continue;
      if (!isSilhouette(patch.target)) continue;
      out.push({
        slot: variant.slot,
        name: variant.name,
        subjectName: `${patch.where.symbol} · ${variant.name.toUpperCase()}`,
        shape: { ...patch.target, ...(patch.fields as Partial<CreatureSilhouette>) },
        sentence: variant.sentence,
      });
    }
  }
  return out;
}

/** Those shapes as catalogue entries, so every reader of the catalogue —
 * the report, the drawn-size floor, the director's SHAPES page — sees them. */
export function candidateEntries(variants: readonly Variant[]): CatalogueEntry[] {
  return contourCandidates(variants).map((c) => ({
    subject: blob(c.subjectName, c.shape),
    status: "candidate" as const,
    slot: "creature" as const,
    owner: `offered on VERSUS as \`${c.slot}\` / \`${c.name}\` — ${c.sentence}`,
  }));
}

export const CANDIDATE_SHAPES: CatalogueEntry[] = candidateEntries(VARIANTS);
