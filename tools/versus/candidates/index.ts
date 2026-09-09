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
 *
 * **The list itself is next door and is generated.** `registry.ts` is written
 * by `bun run versus index` from the directories under this one, and this file
 * re-exports it. It was an array here, and every lane that opened a slot added
 * an import and a line to it: fine with one lane open, a rebase conflict every
 * time with several, in a file neither session was really changing. A
 * generated file is resolved by running its command, which is a conflict
 * nobody has to read. `test/registry.test.ts` fails when the file and the
 * directories disagree.
 *
 * The left-hand side of the pair is in neither file. It is whatever the game
 * draws today, read off the live records, and giving it an entry would be a
 * second copy of shipped values in a tool.
 *
 * An empty registry is a correct state, not a broken one: `variant.ts`,
 * `seed.ts`, `run.ts` and this file all stay whether or not a slot is open.
 * They are the seam, the way `Effects` stays whether or not anything is
 * exploding.
 *
 * **What this page has already decided is `../DECIDED.md`.** Every slot that
 * has been opened and how it left — taken into the game, cut, rehoused, or
 * taken and changed — used to be this comment, and it had become a changelog
 * long enough to push the file past its 250-line ceiling. It is worth reading
 * before a slot is opened: two of the questions on it were asked, answered and
 * then asked again in a better shape, and one look was taken and immediately
 * changed, none of which the candidates still standing show.
 */

export { VARIANTS } from "./registry.js";
