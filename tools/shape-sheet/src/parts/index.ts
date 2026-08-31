/**
 * The parts library, as one import.
 *
 * `registry.ts` holds the list and the lookup; `grown.ts` holds the composer
 * that spends them. They are separate files because the composer *calls* the
 * lookup, and a registry that imported the thing it is looked up by would be a
 * cycle for the sake of one fewer filename.
 */

export { type Attachment, type GrownOpts, grown } from "./grown.js";
export { CATEGORIES, PARTS, partById } from "./registry.js";
export type { Part, PartCategory, PartCtx, PartDef, Site } from "./types.js";
