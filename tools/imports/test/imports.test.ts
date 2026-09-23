import { afterAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileCosts } from "../../test/figure.js";
import { pruneImports } from "../imports.js";

/**
 * The cap this file runs under, because one of its cases is not really a test
 * of a function at all: it writes a file and hands it to three `bunx biome`
 * child processes, and what those cost is what the machine happens to be doing.
 * It took 5059 ms under a `bun run land` on 17 September 2026 and went red on
 * bun's five-second default, with nothing wrong in the code; the landing was
 * rerun and passed, which is the worst shape a failure can have — it teaches
 * whoever meets it that a red check is something you run again.
 *
 * **It was a flat thirty seconds for a day**, copied from
 * `packages/render/test/canvas-stub.ts`, and `tools/test/repo-time.ts` landed
 * the same afternoon with the argument against it: a flat number is only ever
 * right for one machine under one load, and it is either too short on the
 * loaded one or says nothing on the idle one. `loadedTimeout` takes what the
 * case costs alone — 210 ms — and multiplies it by how much slower this
 * machine is measuring than an idle one, so the cap rises when the eight
 * shards do and stays tight when they do not.
 */
fileCosts(210);

describe("pruneImports", () => {
  it("takes a stranded name out of a list and leaves the comment above it", () => {
    const source = [
      "/** Stepping the world is the only way beats advance. */",
      'import { beatPhase, step, type World } from "./world.ts";',
      "",
      "export const phase = (w: World) => beatPhase(w);",
      "",
    ].join("\n");
    const { text, dropped, left } = pruneImports(source);
    expect(dropped.map((d) => d.name)).toEqual(["step"]);
    expect(left).toEqual([]);
    expect(text).toContain("/** Stepping the world is the only way beats advance. */");
    expect(text).toContain("import { beatPhase, type World }");
  });

  it("leaves a statement whose every name is unused, and says which", () => {
    const source = [
      "/** Only here for the scars decision of 3 September. */",
      'import { scars, type Scar } from "./scars.ts";',
      "",
      "export const beat = 1;",
      "",
    ].join("\n");
    const { text, dropped, left } = pruneImports(source);
    expect(text).toBe(source);
    expect(dropped).toEqual([]);
    expect(left).toHaveLength(1);
    expect(left[0]?.names).toEqual(["scars", "Scar"]);
    expect(left[0]?.line).toBe(2);
  });

  it("keeps the default when the list empties, and the list when the default goes", () => {
    const emptied = pruneImports('import def, { a, b } from "./m.ts";\nexport const z = def;\n');
    expect(emptied.text).toBe('import def from "./m.ts";\nexport const z = def;\n');
    expect(emptied.dropped.map((d) => d.name)).toEqual(["a", "b"]);

    const kept = pruneImports('import def, { a } from "./m.ts";\nexport const z = a;\n');
    expect(kept.text).toBe('import { a } from "./m.ts";\nexport const z = a;\n');
    expect(kept.dropped.map((d) => d.name)).toEqual(["def"]);
  });

  it("keeps a namespace and never cuts a side-effect import", () => {
    const source = 'import "./register.ts";\nimport * as ns from "./n.ts";\nexport const z = ns;\n';
    expect(pruneImports(source).text).toBe(source);
    expect(pruneImports(source).left).toEqual([]);
  });

  it("keeps a name written in a string, a type position or a template hole", () => {
    const cases = [
      'import { a, b } from "./m.ts";\nexport const z = "a" + b;\n',
      'import { a, b } from "./m.ts";\nexport const z = (x: a) => b;\n',
      // Written in pieces because `noTemplateCurlyInString` reads a hole in a
      // plain string as a mistake, and here it is the subject.
      `import { a, b } from "./m.ts";\nexport const z = \`$${"{a}"}\` + b;\n`,
    ];
    for (const source of cases) expect(pruneImports(source).text).toBe(source);
  });

  it("does not count a mention in a comment as a use", () => {
    const source =
      "// a is explained here and nowhere else\n" +
      'import { a, b } from "./m.ts";\nexport const z = b;\n';
    const { text, dropped } = pruneImports(source);
    expect(dropped.map((d) => d.name)).toEqual(["a"]);
    expect(text).toContain("// a is explained here and nowhere else");
  });

  it("reads a URL in a string as a string, not as the start of a comment", () => {
    // The dangerous direction: a `//` taken for a comment hides the use below
    // it, and the name is dropped out from under live code.
    const source =
      'import { a, b } from "./m.ts";\nconst u = "http://x/y";\nexport const z = u + a + b;\n';
    expect(pruneImports(source).text).toBe(source);
  });

  it("leaves a comment written inside the list where it is", () => {
    const source =
      'import { a, /* the 3 September decision */ b } from "./m.ts";\nexport const z = b;\n';
    const { text, dropped } = pruneImports(source);
    expect(dropped.map((d) => d.name)).toEqual(["a"]);
    expect(text).toContain("/* the 3 September decision */");
  });
});

/**
 * The whole command against biome itself: a file carrying a move's leftovers,
 * pruned and formatted, has no unused import left that would not take a whole
 * statement with it, and every comment it was written with is still in it.
 *
 * The fixture lives under `.claude/tmp`, where the repository keeps its litter:
 * git ignores it, so a file left behind by a crash can never fail
 * `bun run lint` for somebody else. biome skips an ignored path for the same
 * reason, which is what the ignore-file flag below turns off for this one file.
 */
const scratch = join(import.meta.dir, "..", "..", "..", ".claude", "tmp", "imports-test");

afterAll(() => rmSync(scratch, { recursive: true, force: true }));

async function biomeMessages(path: string, rule: string): Promise<string[]> {
  const child = Bun.spawn(
    [
      "bunx",
      "biome",
      "lint",
      "--vcs-use-ignore-file=false",
      `--only=${rule}`,
      "--reporter=json",
      path,
    ],
    { stdout: "pipe", stderr: "ignore" },
  );
  const out = await new Response(child.stdout).text();
  await child.exited;
  const report = JSON.parse(out) as { diagnostics?: { message?: string }[] };
  return (report.diagnostics ?? []).map((d) => d.message ?? "");
}

describe("a file with a move's leftovers in it", () => {
  const comments = [
    "/** The tick counter is the only clock the simulation has. */",
    "/** Kept for the hull decision of 3 September: a lobe is not a scar. */",
    "// the cannon slides, it never travels",
    "/** The shield went to guard.ts on 11 September; this is the last mention. */",
  ];
  const source = [
    comments[0],
    'import { beatPhase, step, type World } from "./world.ts";',
    comments[1],
    'import { hullRadiusMul, lobeOf } from "./hull.ts";',
    comments[2],
    'import { slide } from "./cannon.ts";',
    comments[3],
    'import { shieldArc } from "./shield.ts";',
    "",
    "export function frame(w: World): number {",
    "  return beatPhase(w) + lobeOf(w) + slide(w);",
    "}",
    "",
  ].join("\n");

  it("loses its stranded names, keeps its comments, and leaves the rest to a person", async () => {
    mkdirSync(scratch, { recursive: true });
    const path = join(scratch, "leftovers.ts");
    const { text, dropped, left } = pruneImports(source);
    expect(dropped.map((d) => d.name).sort()).toEqual(["hullRadiusMul", "step"]);
    expect(left.map((l) => l.names)).toEqual([["shieldArc"]]);
    await Bun.write(path, text);

    const format = Bun.spawn(["bunx", "biome", "format", "--write", path], {
      stdout: "ignore",
      stderr: "ignore",
    });
    await format.exited;

    const written = await Bun.file(path).text();
    for (const comment of comments) expect(written).toContain(comment);
    // What biome still has to say is the one statement a person must look at,
    // and nothing about the two lists the cut went through.
    expect(await biomeMessages(path, "correctness/noUnusedImports")).toEqual([
      "This import is unused.",
    ]);
    expect(await biomeMessages(path, "correctness/noUndeclaredVariables")).toEqual([]);
  });
});
