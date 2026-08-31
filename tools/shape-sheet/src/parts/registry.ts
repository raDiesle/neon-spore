import { ALIENS } from "./alien.js";
import { DRIFTS } from "./drift.js";
import { GROWTHS } from "./growth.js";
import { LIMBS } from "./limbs.js";
import { RIMS } from "./rim.js";
import type { PartCategory, PartDef } from "./types.js";

/**
 * Every secondary form, in one list.
 *
 * The single registry is what makes the library a library: the sheet walks it,
 * `partById` looks up in it, and a composition names its parts as strings — so
 * a part is one entry in one file and nothing else has to be told about it.
 */
export const PARTS: PartDef[] = [...LIMBS, ...GROWTHS, ...ALIENS, ...RIMS, ...DRIFTS];

/** What each category is for, in the order the sheet prints them. */
export const CATEGORIES: Array<{ id: PartCategory; label: string; blurb: string }> = [
  { id: "reach", label: "REACH", blurb: "parts that leave the body" },
  { id: "growth", label: "GROWTH", blurb: "parts the body is turning into" },
  { id: "alien", label: "ALIEN", blurb: "parts that are not biology" },
  { id: "rim", label: "RIM", blurb: "parts that only bend the outline" },
  { id: "drift", label: "DRIFT", blurb: "parts that trail under a swimming bell" },
];

const BY_ID = new Map(PARTS.map((p) => [p.id, p]));

/**
 * Throws rather than returning undefined, and that is the whole error handling
 * in this library: a composition naming a part that does not exist would
 * otherwise draw a body with one fewer feature than it was written to have,
 * which is a picture nobody can tell is wrong.
 */
export function partById(id: string): PartDef {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`no part named "${id}"`);
  return found;
}
