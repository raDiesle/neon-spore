import { describe, expect, it } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WAVES } from "@neon-spore/content";
import {
  deriveWaveFromChecks,
  framesIdentical,
  resolveWaveFlag,
  resolveWaveText,
  waveNamesAt,
} from "../run.js";

/**
 * `docs/queue.md`, "A FRAME OF THE WRONG WAVE PROVES NOTHING" — three faults
 * in one tool: it did not read `where`, `--wave N` disagreed with the HUD by
 * one, and an identical pair was written silently. These tests pin the fix
 * for each, against the real prose in `docs/checks/` rather than invented
 * examples — the brief's own point is that a parser tuned to one phrasing is
 * the same trap in a new place.
 */

describe("resolveWaveText", () => {
  it("reads a HUD wave number the same way the HUD prints it — wave 21 is W21", () => {
    const r = resolveWaveText(
      "`bun run preview`, right-arrow to wave 21, check both view modes",
      WAVES,
    );
    expect(r).toMatchObject({ kind: "hud", hudNumber: 21 });
  });

  it("reads a wave by its own name even when the where field names the director's editor to get there", () => {
    // docs/checks/18036b0.md — `bun run dev` is the wave editor, but the
    // field still names a real wave, and that wave wins over the director.
    const r = resolveWaveText(
      "`bun run dev` → THE THIRD SHOT wave; shell-draw.ts's own doc comment",
      WAVES,
    );
    expect(r).toMatchObject({ kind: "name", name: "THE THIRD SHOT" });
  });

  it("does not let a shorter wave name match inside a longer one — THE WARD is not THE WARDEN", () => {
    const r = resolveWaveText("`bun run preview`, THE WARDEN, watch the ring close", WAVES);
    expect(r).toMatchObject({ kind: "name", name: "THE WARDEN" });
  });

  it('defaults to wave 1 when the field says "any wave" — nothing turns on which one', () => {
    const r = resolveWaveText("`bun run preview`, any wave, watch the sky behind the grid", WAVES);
    expect(r).toMatchObject({ kind: "hud", hudNumber: 1 });
  });

  it("refuses a director page with no wave in it, rather than guessing wave 1", () => {
    const r = resolveWaveText("director → WAVE tab; director → ⎈ CONTROL SETS", WAVES);
    expect(r.kind).toBe("director");
  });

  it("refuses a NOT BUILT YET / SHAPES page the same way", () => {
    const r = resolveWaveText(
      "`DIRECTOR_HOST=127.0.0.1 bun run dev`, NOT BUILT YET → SHAPES, skin bar → CILIA",
      WAVES,
    );
    expect(r.kind).toBe("director");
  });

  it("refuses the wave list itself — it names a page, not one wave", () => {
    const r = resolveWaveText("`bun run dev`, the wave list on the left", WAVES);
    expect(r.kind).toBe("director");
  });

  it("does not read a where field's own `bun run frames --wave N` example as an instruction to itself", () => {
    // docs/checks/943c4f4.md — the check is about the frames tool, and its
    // where field is a worked example of a past, differently-numbered
    // invocation. Reading "--wave 1" out of it would silently reopen the
    // exact off-by-one trap the brief is about.
    const r = resolveWaveText(
      "`bun run frames 16efb33 --wave 1 --ticks 300 --out <dir>`, then open `<dir>/before.png` and `<dir>/after.png`",
      WAVES,
    );
    expect(r.kind).toBe("unknown");
  });

  it("says unknown, not director, when nothing placeable is named at all", () => {
    const r = resolveWaveText(
      "`bun run land` on a lane carrying a `Check:` trailer with a backticked command, then `bun run checks`",
      WAVES,
    );
    expect(r.kind).toBe("unknown");
  });
});

describe("resolveWaveFlag", () => {
  it("converts the HUD's W21 to jumpToWave's 0-based 20", () => {
    expect(resolveWaveFlag("21", WAVES)).toBe(20);
  });

  it("converts wave 1 (W1) to index 0", () => {
    expect(resolveWaveFlag("1", WAVES)).toBe(0);
  });

  it("accepts a wave name, case-insensitively", () => {
    expect(resolveWaveFlag("the third shot", WAVES)).toBe(
      WAVES.findIndex((w) => w.name === "THE THIRD SHOT"),
    );
  });

  it("rejects wave 0 — the HUD never shows W0", () => {
    expect(() => resolveWaveFlag("0", WAVES)).toThrow(/start at 1/);
  });

  it("rejects a name that matches no wave", () => {
    expect(() => resolveWaveFlag("NOT A REAL WAVE", WAVES)).toThrow(/no wave/);
  });
});

describe("deriveWaveFromChecks", () => {
  it("resolves docs/checks/4e577db.md's `wave 21` the same way resolveWaveText does", async () => {
    const r = await deriveWaveFromChecks("4e577db", WAVES);
    expect(r).toMatchObject({ kind: "hud", hudNumber: 21 });
  });

  it("resolves docs/checks/18036b0.md to THE THIRD SHOT by name", async () => {
    const r = await deriveWaveFromChecks("18036b0", WAVES);
    expect(r).toMatchObject({ kind: "name", name: "THE THIRD SHOT" });
  });

  it("refuses docs/checks/00c0d87.md — a director-only where field", async () => {
    const r = await deriveWaveFromChecks("00c0d87", WAVES);
    expect(r.kind).toBe("director");
  });

  it("falls through 16efb33.md's first 'any wave' entry rather than its second, name-less one", async () => {
    const r = await deriveWaveFromChecks("16efb33", WAVES);
    expect(r).toMatchObject({ kind: "hud", hudNumber: 1 });
  });

  it("finds the restatement by trailer text for a commit whose file is named after a different, pre-rebase sha, and resolves the index against that commit's OWN wave list", async () => {
    // docs/queue.md, "THIRTY-ONE OF THIRTY-THREE CHECK FILES ARE NAMED AFTER
    // A COMMIT THAT NEVER LANDED" — 35d59d4 is on `main` right now; its
    // restatement was written before `bun run land` rebased it, and sits
    // under docs/checks/18036b0.md, the pre-rebase sha. Looking up
    // docs/checks/35d59d4.md finds nothing — this is the exact repro the
    // brief gives (`bun run frames 35d59d4`), and the fix is a join on the
    // trailer's own text, not on the filename.
    //
    // docs/queue.md, "FRAMES PUTS THE WRONG WAVE IN THE PICTURE, AND SAYS THE
    // RIGHT NAME WHILE IT DOES" — this is the trap the brief warns about:
    // every test above passes against today's `WAVES`, which is exactly the
    // assumption being broken. At `35d59d4` there were 24 authored waves and
    // THE THIRD SHOT sat at index 19; today there are 25 (THE MAZE was
    // inserted ahead of it) and it sits at 20. Passing `WAVES` here would
    // pass this test while reproducing the bug — the historical list from
    // `waveNamesAt` is what makes the index assertion actually catch it.
    const historical = await waveNamesAt("35d59d4");
    expect(historical.length).toBe(24);
    const r = await deriveWaveFromChecks("35d59d4", historical);
    expect(r).toMatchObject({ kind: "name", name: "THE THIRD SHOT", index: 19 });
  });

  it("reports unknown for a sha with no docs/checks file", async () => {
    const r = await deriveWaveFromChecks("0000000", WAVES);
    expect(r.kind).toBe("unknown");
  });
});

describe("waveNamesAt", () => {
  it("reads today's WAVES from the working tree's own HEAD commit", async () => {
    const head = await Bun.$`git rev-parse HEAD`
      .cwd(join(import.meta.dir, "..", "..", ".."))
      .text();
    const names = await waveNamesAt(head.trim());
    expect(names.map((w) => w.name)).toEqual(WAVES.map((w) => w.name));
  });
});

describe("framesIdentical", () => {
  it("is true for byte-identical files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "neon-spore-frames-test-"));
    const a = join(dir, "a.png");
    const b = join(dir, "b.png");
    await Bun.write(a, new Uint8Array([1, 2, 3, 4]));
    await Bun.write(b, new Uint8Array([1, 2, 3, 4]));
    expect(await framesIdentical([a], [b])).toBe(true);
  });

  it("is false when a single byte differs", async () => {
    const dir = await mkdtemp(join(tmpdir(), "neon-spore-frames-test-"));
    const a = join(dir, "a.png");
    const b = join(dir, "c.png");
    await Bun.write(a, new Uint8Array([1, 2, 3, 4]));
    await Bun.write(b, new Uint8Array([1, 2, 3, 5]));
    expect(await framesIdentical([a], [b])).toBe(false);
  });

  it("is false when the frame counts differ", async () => {
    const dir = await mkdtemp(join(tmpdir(), "neon-spore-frames-test-"));
    const a = join(dir, "a.png");
    await Bun.write(a, new Uint8Array([1, 2, 3, 4]));
    expect(await framesIdentical([a], [a, a])).toBe(false);
  });
});
