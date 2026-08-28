/**
 * VERSUS — the place a second answer to an existing shape can live.
 *
 * A draft shape gets two cards on the SHAPES tab and turns on the same clock.
 * A shape the game already draws got one, forever, because there was nowhere
 * for the second answer to sit: it cannot go in `packages/content`, which is
 * what ships, and it cannot go in a branch, because a branch cannot be beside
 * the thing it is arguing with at 26 px and at tempo.
 *
 * So a candidate look is a set of field assignments patched onto records the
 * game already exports, held for the length of one `draw()` and put back in a
 * `finally`. Nothing in the game's import graph names this directory. See
 * `docs/versus.md` for the whole design, and `README.md` beside this file for
 * how to write one.
 *
 * `tools/versus/` is a plain directory with a `test/` beside it, like
 * `tools/checks`, `tools/burn` and `tools/land`. That is why every import of
 * the game's own code here is a relative path into the package sources rather
 * than `@neon-spore/render`: workspace links live in each package's own
 * `node_modules`, so the bare specifier does not resolve from a directory that
 * has no `package.json`, and adding one would cost a `bun install` in every
 * fresh worktree forever. `tsconfig.json` already globs every TypeScript file
 * under `tools`, so the relative form is typechecked and linted for free.
 */

/**
 * Where a patched record lives, as prose a prompt can act on.
 *
 * This is not bookkeeping: the text a vote emits tells a cold session to open
 * one file and change one symbol, and every value in it is written `old ->
 * new` so a stale prompt is refused rather than half-applied. `file` is
 * repo-relative with forward slashes, because the prompt quotes it into a
 * `git grep -- packages apps tools` and into a staging list.
 */
export interface Where {
  /** Repo-relative, forward slashes: `packages/render/src/hull.ts`. */
  readonly file: string;
  /** The exported symbol, spelled as the file spells it: `OWN_SKIN`. */
  readonly symbol: string;
  /** Its type annotation, if it carries one — `HullSkin`. Prose only. */
  readonly type?: string;
}

/**
 * One record, and the fields to overwrite on it while the pair draws.
 *
 * `fields` is a partial of the target's own type, so it holds whatever the
 * record holds: a number, a colour string, a readonly tuple of four stops, or
 * a whole replacement function — `poseAt` is a method on `OwnMotion`, so a
 * candidate motion is a `fields` with one function in it and nothing else.
 *
 * `reached` is the route the *drawing code* takes to this record, written the
 * way the drawing code writes it — `() => livingSilhouette("bulb")`, never
 * `() => BULB`. The whole monkeypatch rests on the draw path reading this
 * exact object on every call, so `test/variants.test.ts` asserts the route
 * hands back the identical one. The day a lookup starts handing out a copy,
 * `bun test` says so instead of the pair quietly drawing a lie. Where the game
 * has no accessor and reads the export itself, the module namespace
 * (`() => hull.OWN_SKIN`) is the whole route there is — say that in one line
 * rather than leaving an optional field nobody fills.
 */
export interface Patch<T extends object = object> {
  readonly target: T;
  readonly reached: () => unknown;
  readonly where: Where;
  readonly fields: Partial<T>;
}

/**
 * Authoring form. `T` is inferred from `target` alone, so `fields` is checked
 * against the record's real type and a misspelled field is a typecheck error
 * at the candidate rather than a silent no-op at the pair.
 *
 * A record declared `as const` — `PALETTE` is — narrows every value to its own
 * literal, so a candidate for one of those passes a cast target. The cast
 * belongs at the edge, here or in `apply`, and never as a widened type on the
 * shipped record.
 */
export function patch<T extends object>(p: {
  target: T;
  reached: () => unknown;
  where: Where;
  fields: Partial<NoInfer<T>>;
}): Patch {
  return p as Patch;
}

/**
 * One candidate: a whole answer to one slot's question.
 *
 * A slot is the question (`ship:hull-skin`), a candidate is an answer
 * (`warm`), and the left-hand side of the pair is always what the game draws
 * today — it is not a candidate and is never in this registry. `dir` is the
 * directory `git rm -r` removes when the slot is decided; it is authored
 * rather than derived from `slot` and `name` because the two namings do not
 * agree by rule, and the test stats it so it cannot go stale.
 */
export interface Variant {
  /** The question, `area:thing`. Every candidate in a slot patches the same fields. */
  readonly slot: string;
  /** This answer, one word, unique within the slot. The vote button names it. */
  readonly name: string;
  /** One line in the author's own words. The emitted prompt quotes it verbatim. */
  readonly sentence: string;
  /** Repo-relative directory holding this candidate, `git rm -r`'d on a decision. */
  readonly dir: string;
  readonly patches: readonly Patch[];
}

/** What `apply` overwrote, and what was there before. */
interface Saved {
  target: Record<string, unknown>;
  field: string;
  value: unknown;
  /** Whether the field existed at all — an absent optional is deleted, not set to undefined. */
  had: boolean;
}

/** A live patch. Hand it back to `restore` — in a `finally`, always. */
export interface Applied {
  readonly variant: Variant;
  readonly saved: readonly Saved[];
}

/**
 * Overwrite every field of every patch, remembering what was there.
 *
 * The cast is the whole reason this is a function and not two lines at the
 * call site: a record may be `as const`, in which case its fields are readonly
 * and a plain assignment does not typecheck even though the object is an
 * ordinary mutable one at runtime. Nothing in `packages/render/src` or
 * `packages/content/src` calls `Object.freeze`, which is what makes this work
 * and what the identity test in `test/variants.test.ts` watches.
 */
export function apply(variant: Variant): Applied {
  const saved: Saved[] = [];
  for (const p of variant.patches) {
    const target = p.target as Record<string, unknown>;
    const fields = p.fields as Record<string, unknown>;
    for (const field of Object.keys(fields)) {
      saved.push({ target, field, value: target[field], had: field in target });
      target[field] = fields[field];
    }
  }
  return { variant, saved };
}

/**
 * Put every field back, last one first, so two patches that touched the same
 * field unwind to the value that was there before either of them ran.
 */
export function restore(applied: Applied): void {
  for (let i = applied.saved.length - 1; i >= 0; i--) {
    const s = applied.saved[i];
    if (!s) continue;
    if (s.had) s.target[s.field] = s.value;
    else delete s.target[s.field];
  }
}

/** The fields this patch overwrites, sorted — the pair's and the prompt's unit of comparison. */
export function patchedFields(p: Patch): string[] {
  return Object.keys(p.fields).sort();
}

/**
 * What the record says right now, for exactly the fields the patch would
 * overwrite. The emitted prompt's `old -> new` left-hand column, read off the
 * live object *before* anything is applied — never copied into the candidate,
 * because a copy of a shipped value in a tool is the drift this whole
 * arrangement exists to prevent.
 */
export function currentValues(p: Patch): Record<string, unknown> {
  const target = p.target as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const field of patchedFields(p)) out[field] = target[field];
  return out;
}

/** `hull.ts`, `export const OWN_SKIN: HullSkin` — the prompt's way of naming a record. */
export function declaration(where: Where): string {
  const base = where.file.slice(where.file.lastIndexOf("/") + 1);
  const decl = where.type
    ? `export const ${where.symbol}: ${where.type}`
    : `export const ${where.symbol}`;
  return `\`${base}\`, \`${decl}\``;
}

/** One open question, with every answer offered to it. */
export interface Slot {
  readonly slot: string;
  readonly candidates: readonly Variant[];
}

/** The registry, grouped into slots, in the order the candidates were registered. */
export function slots(variants: readonly Variant[]): Slot[] {
  const by = new Map<string, Variant[]>();
  for (const v of variants) {
    const list = by.get(v.slot);
    if (list) list.push(v);
    else by.set(v.slot, [v]);
  }
  return [...by].map(([slot, candidates]) => ({ slot, candidates }));
}
