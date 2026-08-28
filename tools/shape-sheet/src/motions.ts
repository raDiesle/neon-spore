/**
 * The spare motions, which are now a folder: `motions/index.ts` is the
 * registry and `motions/plane.ts` holds the eleven that were once this file.
 *
 * This is the door they kept. Six files name `motions.js` — the catalogue and
 * the five draft groups — and each of them wants one motion by name, not the
 * folder's shape; rewriting all six would be six edits saying what the line
 * below says once, and each one a chance to import a motion that is not the
 * one the card had. Anything new imports `./motions/index.js` directly.
 */
export * from "./motions/index.js";
