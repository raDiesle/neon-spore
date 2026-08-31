import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Point } from "@neon-spore/content";
import { grown, PARTS } from "../src/parts/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * What a part has to be true of, as opposed to what it has to look like.
 *
 * `drafts.test.ts` already walks the catalogue and proves every *body* draws,
 * the fourteen grown ones included. What it cannot see is a part that is in
 * the registry and in no recipe: those draw nowhere, so a piece can rot in the
 * library for a month and the failure shows up as a cell missing off a sheet
 * nobody regenerated. Each one is therefore mounted on a plain round host here
 * — the same host `parts-sheet.ts` draws it on — and asked the two questions
 * that decide whether it is a part at all.
 *
 * Neither of them is "is it good". That needs an eye, and the sheet is where
 * the eye goes.
 */

const HOST = 40;

/** One part on a plain round body, which is what the sheet draws too. */
function loopsOf(id: string, t: number): Point[][] {
  const subject = grown(id, "", {
    rx: HOST,
    ry: HOST,
    lobes: 1,
    depth: 0,
    wobble: 0,
    parts: [{ part: id, at: 0 }],
  });
  return subject.loopsAt?.(t)?.slice(1) ?? [];
}

const TIMES = [0, 0.4, 1.3, 2.7, 5.5, 9.9, 21.3];

describe("the parts library", () => {
  it("names each part once", () => {
    expect(new Set(PARTS.map((p) => p.id)).size).toBe(PARTS.length);
    expect(new Set(PARTS.map((p) => p.label)).size).toBe(PARTS.length);
  });

  it("says how many parts it has in docs/parts.md, and is right about it", async () => {
    const page = await Bun.file(join(ROOT, "docs/parts.md")).text();
    expect(page).toContain(`Sixty of them live`);
    expect(PARTS.length).toBe(60);
  });

  for (const def of PARTS) {
    describe(def.label, () => {
      it("still draws something after the rim clamp", () => {
        // The clamp pushes a part out to the rim it stands on and drops what
        // is left under it. A part authored too small for a body of this size
        // survives `bun run check` as an empty cell, which is the one way a
        // piece can be wrong here without anything else noticing.
        for (const t of TIMES)
          expect({ t, loops: loopsOf(def.id, t).length > 0 }).toEqual({
            t,
            loops: true,
          });
      });

      it("changes the silhouette it is attached to", () => {
        // A part that never reaches past its host is decoration on a body
        // nobody can see it on — except a vein, which is under the skin and
        // says so.
        if (def.under) return;
        let out = 0;
        for (const t of TIMES) {
          for (const loop of loopsOf(def.id, t)) {
            for (const p of loop) out = Math.max(out, Math.hypot(p.x, p.y) - HOST);
          }
        }
        expect({ id: def.id, past: out > 1 }).toEqual({ id: def.id, past: true });
      });

      it("samples to finite points", () => {
        for (const t of TIMES) {
          for (const loop of loopsOf(def.id, t)) {
            for (const p of loop) expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
          }
        }
      });
    });
  }
});
