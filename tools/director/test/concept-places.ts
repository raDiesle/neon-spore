/**
 * Every place one new concept has to reach, named in one list and checked in
 * one pass.
 *
 * A lane on 16 September 2026 lost twenty minutes to four tests going red in
 * sequence, each one a different copy of the same fact: the name in the spec,
 * the shape join in `concept-art.test.ts`, the scene join in `scenes.test.ts`,
 * and the draft count in `docs/asset-catalogue.md`. Six lanes and 165 friction
 * minutes in `docs/time-log.md` have that shape. None of the checks is wrong —
 * they hold different things about the same name — and what cost the minutes
 * is that the fifth place was only ever learned from the fourth red run, one
 * process start at a time.
 *
 * So the *list of places* is stated once, here, and `concept-places.test.ts`
 * fails with **all** of them at once. The four tests that were there before
 * keep their own cases: this does not replace a single one of them, it only
 * arrives first and says everything.
 *
 * **Pure, over a record of what the tree holds.** The reading is the test
 * file's job, so a place can be exercised with one row missing without a spec
 * file being edited to make it happen — which is the only way to prove that
 * the message names every place rather than the first.
 */

/** What the tree holds, read once, so a check is arithmetic rather than IO. */
export interface Tree {
  /** Every name the design has, lower-cased (`spec-names.ts`). */
  readonly specNames: ReadonlySet<string>;
  /** `suggests` on every shape in the catalogue, drafts and taken alike. */
  readonly draftSuggests: readonly string[];
  /** `suggests` on every scene. A scene whose concept was cut carries none. */
  readonly sceneSuggests: readonly string[];
  /** Shapes whose `status` is `draft` and which name nothing at all. */
  readonly draftsOfferedToNothing: readonly string[];
  /** How many drafts the catalogue actually holds. */
  readonly drafts: number;
  /** The number the `**Status:` line of `docs/asset-catalogue.md` says, or null. */
  readonly draftsSaid: number | null;
  /** Every name the director's NOT BUILT YET page shows. */
  readonly backlogNames: readonly string[];
}

/** One place, and what it is for — the `where` is what a lane goes and edits. */
export interface Place {
  readonly where: string;
  /** What is wrong here, one line each, or nothing. */
  readonly missing: (tree: Tree) => string[];
}

/**
 * The places, in the order a lane meets them.
 *
 * A row belongs here when it is a *copy of one fact* — a name, a count, a join
 * — that a new concept has to be written into. A check that holds a thing to
 * its own shape (a scene's creatures landing on the rows it asked for) is not
 * one of these and stays where it is.
 */
export const PLACES: readonly Place[] = [
  {
    where: "docs/spec/ideas.md or docs/spec/bosses.md",
    missing: (t) =>
      unknown(t, t.draftSuggests).map(
        (n) => `a shape is drawn at "${n}" and the spec names nothing like it`,
      ),
  },
  {
    where: "docs/spec/ideas.md or docs/spec/bosses.md, for the scenes",
    missing: (t) =>
      unknown(t, t.sceneSuggests).map(
        (n) => `a scene is a picture of "${n}" and the spec names nothing like it`,
      ),
  },
  {
    where: "tools/shape-sheet/src/drafts/",
    missing: (t) =>
      t.draftsOfferedToNothing.map(
        (n) => `the draft ${n} is offered to nothing — a draft with no concept is a picture`,
      ),
  },
  {
    where: "docs/asset-catalogue.md, the **Status:** line",
    missing: (t) => {
      if (t.draftsSaid === null) return ["no `**Status: N drafts` line to read at all"];
      if (t.draftsSaid === t.drafts) return [];
      return [`it says ${t.draftsSaid} drafts and the catalogue holds ${t.drafts}`];
    },
  },
  {
    where: "the director's NOT BUILT YET page",
    missing: (t) =>
      unknown(t, t.backlogNames).map(
        (n) =>
          `the page shows "${n}" and the spec names nothing like it — a rename emptied a column`,
      ),
  },
];

/** The names in `claimed` the spec does not have, each said once. */
function unknown(tree: Tree, claimed: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of claimed) {
    const key = name.toLowerCase();
    if (tree.specNames.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

/**
 * Every place that is not right, as the lines a failure prints.
 *
 * All of them, and that is the whole point: the four tests each answered for
 * one, so a lane learned the list one process start at a time. An empty array
 * is the green case and reads as one in a diff.
 */
export function missingPlaces(tree: Tree): string[] {
  return PLACES.flatMap((place) => place.missing(tree).map((what) => `${place.where} — ${what}`));
}
