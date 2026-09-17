#!/usr/bin/env bun

/**
 * `bun run probe [file]` — run a script that needs a live world.
 *
 * With no argument it runs `example.ts`, which is the thing to copy. With one,
 * it runs that file, resolved inside this package: `bun run probe
 * scratch/where-is-it` and `bun run probe scratch/where-is-it.ts` are the same
 * command, and so is a full path to a file under `tools/probe/`.
 *
 * **The file has to live here**, and that is not a limitation this could lift.
 * A module's `@neon-spore/sim` is resolved from where the module *is*, so a
 * script in a session's scratch directory cannot import one however it is run —
 * which is the whole finding this package answers. `scratch/` is git-ignored,
 * so a probe left behind is neither committed nor in anybody's way.
 *
 * **And it is not typechecked**, which is the other half of that sentence and
 * was not true until 17 September 2026. `tsconfig.json` includes `tools/**`,
 * so for a while `bunx tsc --noEmit` read every probe anybody had left behind
 * — and a throwaway script written against `noUncheckedIndexedAccess` is red
 * ten times over, in a file `git status` cannot show. A lane inherited nine
 * such errors from its own probe and spent them as friction. `scratch` is in
 * that file's `exclude` now. A probe asserts nothing, is run by nothing and is
 * checked by nothing: a question worth asking twice is a test in the package
 * that owns the answer.
 */

import { existsSync } from "node:fs";
import { relative, resolve } from "node:path";

const HERE = Bun.fileURLToPath(new URL(".", import.meta.url));

/** The file to run: `example.ts` by default, and `.ts` appended if it is missing. */
function target(arg: string | undefined): string {
  const named = arg ?? "example.ts";
  for (const candidate of [named, `${named}.ts`]) {
    const path = resolve(HERE, candidate);
    if (existsSync(path)) return path;
  }
  throw new Error(
    `no such probe: ${named}
Probes live in tools/probe/ — scratch/ is the ignored place for a throwaway one.
\`bun run probe\` with no argument runs the worked example.`,
  );
}

const path = target(process.argv[2]);
console.log(`probe ${relative(HERE, path)}\n`);
await import(path);
