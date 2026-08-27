import { describe, expect, test } from "bun:test";
import { CATALOGUE, SCENES } from "@neon-spore/shape-sheet";
import { DEFAULT_CONFIG, hullRow } from "@neon-spore/sim";
import { type Backlog, type BacklogGroup, buildBacklog } from "../src/backlog.js";
import { sceneWorld } from "../src/scene-world.js";

/**
 * A scene is a picture with three ways to go quietly wrong, and each of them
 * ends with a frame that draws perfectly and shows the wrong thing.
 *
 * It can name an idea the spec has renamed, and then it is a picture of
 * nothing in particular — the same failure `concept-art.test.ts` guards for
 * the contours, on the same join. It can name a contour the catalogue no
 * longer has, and the body silently does not draw at all. And its creatures
 * can land on rows nobody asked for, because the spawn arithmetic in
 * `scene-world.ts` reads a rule in `beat.ts` that it does not own: a creature
 * enters the beat *after* its own, and the day that changes every scene shifts
 * by a row without a single thing failing.
 *
 * The third is why this file builds the worlds rather than reading the data.
 */

const ROOT = new URL("../../../", import.meta.url);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT))).text();

async function realBacklog(): Promise<Backlog> {
  return buildBacklog(
    await read("docs/spec/bestiary.md"),
    await read("docs/spec/bosses.md"),
    await read("docs/spec/couplings.md"),
    await read("docs/spec/assists.md"),
    await read("docs/spec/systems.md"),
    await read("docs/spec/ideas.md"),
  );
}

const allNames = (backlog: Backlog): Set<string> =>
  new Set(
    Object.values(backlog)
      .flat()
      .flatMap((g: BacklogGroup) => g.entries.map((e) => e.name))
      .filter(Boolean),
  );

describe("a mechanic drawn on the field", () => {
  test("is a picture of a concept the backlog actually has", async () => {
    const names = allNames(await realBacklog());
    expect(SCENES.filter((s) => !names.has(s.suggests)).map((s) => s.suggests)).toEqual([]);
  });

  test("only places contours the catalogue holds", () => {
    const drawn = new Set(CATALOGUE.map((e) => e.subject.name));
    const missing = SCENES.flatMap((s) => s.bodies)
      .map((b) => b.shape)
      .filter((name) => !drawn.has(name));
    expect(missing).toEqual([]);
  });

  test("stays on the field, bodies and marks alike", () => {
    const last = hullRow(DEFAULT_CONFIG);
    for (const scene of SCENES) {
      for (const b of scene.bodies) {
        const span = b.span ?? 1;
        expect(b.col).toBeGreaterThanOrEqual(0);
        expect(b.col + span - 1).toBeLessThanOrEqual(DEFAULT_CONFIG.cols - 1);
        expect(b.row).toBeGreaterThanOrEqual(0);
        expect(b.row).toBeLessThanOrEqual(last);
      }
      for (const m of scene.marks ?? []) {
        expect(m.col).toBeGreaterThanOrEqual(0);
        expect(m.col).toBeLessThanOrEqual(DEFAULT_CONFIG.cols - 1);
      }
    }
  });

  test("puts every spawned creature on the row its scene asked for", () => {
    for (const scene of SCENES) {
      const falling = (scene.spawns ?? []).filter((s) => s.what !== "pod");
      if (falling.length === 0) continue;
      const world = sceneWorld(scene);
      const got = world.creatures.map((c) => `${c.col}@${c.row}`).sort();
      const want = falling.map((s) => `${s.col}@${s.row}`).sort();
      expect(`${scene.suggests}: ${got.join(" ")}`).toBe(`${scene.suggests}: ${want.join(" ")}`);
    }
  });

  test("hangs every pod where its scene asked", () => {
    for (const scene of SCENES) {
      const pods = (scene.spawns ?? []).filter((s) => s.what === "pod");
      if (pods.length === 0) continue;
      const world = sceneWorld(scene);
      // Thousandths, because the simulation stores integers — and a pod is
      // the one thing on the field whose column is not a whole one.
      const got = world.pods
        .map((p) => `${Math.round(p.colMilli / 1000)}@${Math.round(p.rowMilli / 1000)}`)
        .sort();
      expect(`${scene.suggests}: ${got.join(" ")}`).toBe(
        `${scene.suggests}: ${pods
          .map((s) => `${s.col}@${s.row}`)
          .sort()
          .join(" ")}`,
      );
    }
  });
});
