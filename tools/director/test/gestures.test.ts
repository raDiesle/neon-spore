import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GESTURES } from "../src/gesture-catalogue.js";
import { BROWSER_EVENTS } from "../src/gesture-events.js";
import { LABEL_X, layoutFigure, textWidth, VIEW_H, VIEW_W } from "../src/gesture-figure.js";
import { PHONE } from "../src/gesture-phone.js";
import type { Prim } from "../src/gesture-prims.js";
import { STATE_TITLES } from "../src/gesture-types.js";

/**
 * CONTROLS › GESTURES says which file each built gesture lives in and which
 * file listens for each browser event. Both are claims about the tree, and a
 * page of claims nobody re-checks is a page that goes stale the first time a
 * file moves — so this re-checks them. The pictures are held inside their
 * frame here too, because a figure is laid out as numbers before it is drawn.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

/** The corners a primitive reaches, before any transform. */
function extent(p: Prim): [number, number, number, number] {
  switch (p.t) {
    case "rect":
      return [p.x, p.y, p.x + p.w, p.y + p.h];
    case "circle":
      return [p.cx - p.r, p.cy - p.r, p.cx + p.r, p.cy + p.r];
    case "line":
      return [
        Math.min(p.x1, p.x2),
        Math.min(p.y1, p.y2),
        Math.max(p.x1, p.x2),
        Math.max(p.y1, p.y2),
      ];
    case "path": {
      const n = (p.d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
      const xs = n.filter((_, i) => i % 2 === 0);
      const ys = n.filter((_, i) => i % 2 === 1);
      // An arc's radii and flags are numbers too; they are small and inside.
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    }
    case "text": {
      const w = textWidth(p.text, p.size);
      const x0 = p.anchor === "middle" ? p.x - w / 2 : p.anchor === "end" ? p.x - w : p.x;
      return [x0, p.y - p.size, x0 + w, p.y];
    }
  }
}

describe("the gesture catalogue", () => {
  test("every state has cards, and every name is unique", () => {
    for (const state of Object.keys(STATE_TITLES)) {
      expect(GESTURES.filter((g) => g.state === state).length, state).toBeGreaterThan(2);
    }
    expect(new Set(GESTURES.map((g) => g.name)).size).toBe(GESTURES.length);
  });

  test("a built gesture names files that exist", () => {
    for (const g of GESTURES.filter((x) => x.state === "built")) {
      expect(g.where?.length ?? 0, g.name).toBeGreaterThan(0);
      for (const file of g.where ?? [])
        expect(existsSync(join(ROOT, file)), `${g.name}: ${file}`).toBe(true);
    }
  });

  test("an unbuilt gesture says why", () => {
    for (const g of GESTURES.filter((x) => x.state === "consider" || x.state === "missed")) {
      expect(g.why?.length ?? 0, g.name).toBeGreaterThan(20);
    }
  });

  test("every timeline is drawn in events the events table defines", () => {
    const known = new Set(BROWSER_EVENTS.map((e) => e.name));
    for (const g of GESTURES) {
      expect(g.timeline.lanes.length, g.name).toBeGreaterThan(0);
      for (const lane of g.timeline.lanes)
        expect(known.has(lane.event), `${g.name}: ${lane.event}`).toBe(true);
    }
  });

  test("an event the game listens for is listened for in the file named", () => {
    for (const e of BROWSER_EVENTS) {
      if (!e.used) continue;
      const source = readFileSync(join(ROOT, e.used), "utf8");
      const needle = e.name === "coalesced" ? "getCoalescedEvents" : `"${e.name}"`;
      expect(source.includes(needle), `${e.name} in ${e.used}`).toBe(true);
    }
  });
});

describe("a gesture's figure", () => {
  for (const g of GESTURES) {
    test(`${g.name} stays inside its frame and inside its half`, () => {
      for (const p of layoutFigure(g)) {
        if (p.tf) continue; // a tilted phone is scaled down to fit; drawn, not measured
        const [x0, y0, x1, y1] = extent(p);
        const label = `${p.t} ${"text" in p ? p.text : ""}`;
        expect(x0, label).toBeGreaterThanOrEqual(-0.5);
        expect(y0, label).toBeGreaterThanOrEqual(-0.5);
        expect(x1, label).toBeLessThanOrEqual(VIEW_W + 0.5);
        expect(y1, label).toBeLessThanOrEqual(VIEW_H + 0.5);
        // Words on the glass stay on the glass; words in the timeline stay right of it.
        if (p.t === "text" && p.x < LABEL_X)
          expect(x1, label).toBeLessThanOrEqual(PHONE.x + PHONE.w);
      }
    });
  }
});
