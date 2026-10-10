import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gripsCreature, type World } from "@neon-spore/sim";
import { HELPER_GROUPS, helperPose } from "../src/helpers-page.js";
import {
  EMPTY_FIELD,
  LOCKED,
  LURE_UP,
  MAGNET_UP,
  MINE_UP,
  PUSHED_ONCE,
  STRIP_BUSY,
  TORCH_COMING,
  VEIL_UP,
  WISP_UP,
} from "../src/helpers-poses.js";
import { poseNamed } from "../src/poses.js";

/**
 * CONTROLS › HELPERS: every row's picture is a pose that exists and reaches
 * the moment its helper is drawn in, and every file a row names as its
 * source is a file. The drawing itself is a canvas and belongs to a browser;
 * what is drawn is a world, and a world is testable.
 */

const RENDER_SRC = join(import.meta.dir, "../../../packages/render/src");
const ROWS = HELPER_GROUPS.flatMap((g) => g.rows);

describe("CONTROLS › HELPERS", () => {
  test("every gallery pose a row names is in the gallery", () => {
    for (const h of ROWS) {
      if (typeof h.pose !== "string") continue;
      expect(() => poseNamed(h.pose as string), `${h.name} → ${h.pose}`).not.toThrow();
    }
  });

  test("every row resolves to a pose drawn as the screen it names", () => {
    for (const h of ROWS) expect(helperPose(h).role, h.name).toBe(h.role);
  });

  test("names are unique, so the contents list has one entry each", () => {
    const names = ROWS.map((h) => h.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("every source file a row names exists in packages/render/src", () => {
    for (const h of ROWS) {
      const files = h.source.match(/[a-z0-9-]+\.ts/g) ?? [];
      expect(files.length, h.name).toBeGreaterThan(0);
      for (const f of files) expect(existsSync(join(RENDER_SRC, f)), `${h.name} → ${f}`).toBe(true);
    }
  });

  test("the page has its tab and the tab has its page", () => {
    const html = readFileSync(join(import.meta.dir, "../index.html"), "utf8");
    expect(html).toContain('<button type="button" data-tab="helpers">HELPERS</button>');
    expect(html).toContain('id="ctl-helpers"');
    expect(html).toContain('data-contents="helpersBody"');
  });
});

describe("the frames built for HELPERS reach their moment", () => {
  const kinds = (p: { build: () => World }) => p.build().creatures.map((c) => c.kind);

  test("one body of each kind is on the field", () => {
    expect(kinds(LURE_UP)).toContain("lure");
    expect(kinds(VEIL_UP)).toContain("veil");
    expect(kinds(WISP_UP)).toContain("wisp");
    expect(kinds(MINE_UP)).toContain("mine");
    expect(kinds(MAGNET_UP)).toContain("magnet");
  });

  test("the gunsight's field is empty and its wave still running", () => {
    const w = EMPTY_FIELD.build();
    expect(w.creatures.length).toBe(0);
    expect(w.spawned).toBeLessThan(w.queue.length);
  });

  test("the torch and the strip's arrivals are still on the strip", () => {
    for (const p of [TORCH_COMING, STRIP_BUSY]) {
      const w = p.build();
      expect(w.creatures.length, p.name).toBe(0);
      expect(w.spawned, p.name).toBeLessThan(w.queue.length);
    }
  });

  test("the pushed body has been pushed, and the locked one is in player 1's hand", () => {
    expect(PUSHED_ONCE.build().creatures[0]?.pushed).toBe(true);
    const w = LOCKED.build();
    const c = w.creatures[0];
    expect(c).toBeDefined();
    expect(gripsCreature(w, 1, c?.id ?? -1)).toBe(true);
  });
});
