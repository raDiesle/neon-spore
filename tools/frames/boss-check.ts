/**
 * Whether `--boss`, `--boss-json` and `--creature` may be written, decided in
 * this process from what the page read off the installed boss.
 *
 * Lifted out of `boss-install.ts` (24 September 2026), where it ran inside
 * `page.evaluate` and so could be proved by nothing short of a browser. The
 * page now reads, this decides, and the page writes, so the rule has tests
 * (`test/boss-check.test.ts`). The keys are still checked against the boss
 * actually installed and never against a list kept in this tree — see
 * `boss-install.ts` for why.
 *
 * **The type of the value already there is the rule.** A field holding a
 * number takes a number, one holding a string takes a string, one holding a
 * boolean takes `true` or `false`. **A list takes a list of the same kind of
 * item, at any length.** It used to take only its own length, which was right
 * for THE BATON's thread and THE TASTER's blades and refused every list a boss
 * grows — THE SCUTTLE's `loose`, THE LEDGER's `beads`, THE SCOUT's `carrying`,
 * THE UNDERTOW's `lobes`, SNAKE's `body` — so the states most worth a
 * picture could not be posed. The owner chose the item's type over the
 * length. An item that is a shape must carry the keys the items already there
 * carry, and no key none of them has. An empty list has no item to judge by,
 * so it takes anything.
 */

import { type BossSpec, hasNow, nowShift } from "./boss.js";

/** What the page read off the boss for one field of the list. */
export interface FieldSeen {
  present: boolean;
  /** The fields that thing does have, for the refusal; filled only when absent. */
  have: string[];
  was: unknown;
}

/** What the page read off the boss, for `bossRefusal`. */
export interface BossSeen {
  kind: string;
  /** Whether the boss is drawn as a body on the field (`creatureId`). */
  hasBody: boolean;
  beatIsNumber: boolean;
  /** One per field written, in the same order. */
  fields: FieldSeen[];
}

/** A value's kind as a refusal says it. */
export function kindOf(v: unknown): string {
  if (v === null) return "nothing";
  if (Array.isArray(v)) return "list";
  if (typeof v === "object") return "shape";
  if (typeof v === "string") return "word";
  return typeof v;
}

/**
 * **The one refusal a pair can step past**: the boss has no field of that
 * name. A sha that adds or renames a field is the change most worth a picture,
 * and its parent cannot have the field yet — `bun run frames 13757cea1 --boss
 * catchTick=2375` was refused whole on 30 September 2026 because the parent
 * still called it `catchBeat`. So `run.ts` catches this on the *before* side
 * only and takes the after frame alone; on the after side, and from `.`, it
 * is an error like any other.
 */
export class NoSuchField extends Error {}

/** `p`, or the `NoSuchField` it threw — any other error still throws. */
export function unlessAbsent<T>(p: Promise<T>): Promise<T | NoSuchField> {
  return p.catch((error: unknown) => {
    if (error instanceof NoSuchField) return error;
    throw error;
  });
}

/** What the run says in place of the before frame it could not take. */
export function absentNote(absent: NoSuchField): string {
  return `before has no such field, so the after frame alone — ${absent.message}`;
}

/** What `installBoss` throws for a list, or null when every field may be written. */
export function bossError(list: BossSpec, seen: BossSeen): Error | null {
  const { said, absent } = firstRefusal(list, seen);
  if (said === "") return null;
  return absent ? new NoSuchField(said) : new Error(said);
}

/**
 * Why the list may not be written, or `""` when every field of it may.
 * Checked whole, so that nothing is written when one field is refused.
 */
export function bossRefusal(list: BossSpec, seen: BossSeen): string {
  return firstRefusal(list, seen).said;
}

function firstRefusal(list: BossSpec, seen: BossSeen): { said: string; absent: boolean } {
  const no = (said: string) => ({ said, absent: false });
  for (const [i, one] of list.entries()) {
    const mine = one.where === "creature";
    const flag = mine ? "--creature" : "--boss";
    if (mine && !seen.hasBody) {
      return no(`--creature ${one.key}: the ${seen.kind} is drawn as no body on the field`);
    }
    const field = seen.fields[i];
    if (!field?.present) {
      const what = mine ? `the ${seen.kind}'s body` : `the ${seen.kind}`;
      const have = field?.have.join(", ");
      return {
        said: `${flag} ${one.key}: ${what} has no such field. It has ${have}`,
        absent: true,
      };
    }
    if (one.key === "kind" || (mine && one.key === "id")) {
      return no(`${flag} ${one.key}: which body a wave installs is the wave's, not a flag's`);
    }
    const said = valueRefusal(flag, one.key, field.was, one.value, seen.beatIsNumber);
    if (said !== "") return no(said);
    if (hasNow(one.value) && !seen.beatIsNumber) {
      return no(
        `--boss-json ${one.key}: a now inside it, and this build has no world.beat to read`,
      );
    }
  }
  return no("");
}

function valueRefusal(
  flag: string,
  key: string,
  was: unknown,
  want: unknown,
  beatIsNumber: boolean,
): string {
  // A list and a shape arrive only from `--boss-json`, and both are the states
  // that could not be photographed at all until it existed.
  if (Array.isArray(was)) {
    if (!Array.isArray(want)) {
      return `${flag} ${key}: that field is a list — write it whole, with --boss-json`;
    }
    return itemRefusal(key, was, want);
  }
  if (was !== null && typeof was === "object") {
    if (kindOf(want) !== "shape") {
      return `${flag} ${key}: that field is a shape — write it whole, with --boss-json`;
    }
    return "";
  }
  if (Array.isArray(want) || (want !== null && typeof want === "object")) {
    return `--boss-json ${key}: that field holds ${typeof was}, not a list or a shape`;
  }
  const shown = `${flag} ${key}=${String(want)}`;
  const now = want === null || nowShift(want) !== undefined;
  if (typeof was === "number" && !now && typeof want !== "number") {
    return `${shown}: that field holds a number`;
  }
  if (typeof was === "string" && typeof want !== "string") {
    return `${shown}: that field holds a word, e.g. ${was}`;
  }
  if (typeof was === "boolean" && typeof want !== "boolean") {
    return `${shown}: that field holds true or false`;
  }
  if (now && !beatIsNumber) return `${flag} ...=now: this build has no world.beat to read`;
  return "";
}

/** A list's items against the items it already holds (`bossRefusal`). */
function itemRefusal(key: string, was: unknown[], want: unknown[]): string {
  if (was.length === 0) return "";
  const kinds = new Set(was.map(kindOf));
  const shapes = was.filter((w) => kindOf(w) === "shape") as Record<string, unknown>[];
  const known = new Set(shapes.flatMap((s) => Object.keys(s)));
  for (const [n, item] of want.entries()) {
    // A `now` is the beat it will be by the time it is written, not a word.
    const kind = nowShift(item) !== undefined ? "number" : kindOf(item);
    const at = `--boss-json ${key}[${n}]`;
    if (!kinds.has(kind)) {
      const holds = [...kinds].join(" or ");
      return `${at}: that list holds ${holds} items, e.g. ${JSON.stringify(was[0])}, and a ${kind} came`;
    }
    if (kind !== "shape" || shapes[0] === undefined) continue;
    const got = item as Record<string, unknown>;
    const missing = Object.keys(shapes[0]).find((k) => !(k in got));
    if (missing !== undefined)
      return `${at}: an item of that list carries ${missing}, and this one has none`;
    const extra = Object.keys(got).find((k) => !known.has(k));
    if (extra !== undefined) return `${at}: no item of that list carries ${extra}`;
  }
  return "";
}
