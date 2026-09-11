import { beforeAll, describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { LID_LOOK, VEIL_LOOK, VOLLEY_LOOK, WARDEN_LOOK, WISP_LOOK } from "@neon-spore/render";
import { installCanvasGlobals, stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import { ASSETS, BEAT_SECONDS } from "../src/library/index.js";

/**
 * The LIBRARY view on GRAPHICS: the game's own looks on cards.
 *
 * Two things can go wrong here that nothing else would catch. An asset's draw
 * is the game's real function called from outside the game, at a card's size,
 * with a body the card made up — so every one of them is drawn through a
 * beat's worth of frames, on the stub canvas that validates every value the
 * way `frame.test.ts` does. And each `*-stage.ts` swaps a field on a shipped
 * record for the length of a card and promises to put it back; if it ever
 * did not, the *game* would draw whichever card was drawn last, which is
 * the one way a tool could change a look without anyone deciding it.
 */

beforeAll(installCanvasGlobals);

const DIR = join(import.meta.dir, "..", "src", "library");
const FILES = readdirSync(DIR).filter((f) => f.endsWith(".ts"));

describe("the library", () => {
  it("gives every asset its own id and its own label", () => {
    expect(ASSETS.length).toBeGreaterThan(0);
    expect(new Set(ASSETS.map((a) => a.id)).size).toBe(ASSETS.length);
    expect(new Set(ASSETS.map((a) => a.label)).size).toBe(ASSETS.length);
  });

  it("says where to look, in plain words, on every card", () => {
    for (const a of ASSETS) {
      expect(a.claim, a.id).toContain("Look at");
      expect(a.note.length, a.id).toBeGreaterThan(10);
      expect(a.from.length, a.id).toBeGreaterThan(3);
    }
  });

  it("marks exactly the looks the game draws today", () => {
    // One look per record: each creature's record wears one, and one card in
    // that creature's group says so.
    const groups = new Map<string, number>();
    for (const a of ASSETS) {
      const creature = a.from.split(" · ")[0] ?? a.from;
      groups.set(creature, (groups.get(creature) ?? 0) + (a.inGame ? 1 : 0));
    }
    expect(groups.size).toBeGreaterThan(1);
    for (const [creature, n] of groups) expect(n, creature).toBe(1);
  });

  it("draws every asset through a beat of frames", () => {
    const { ctx } = stubCanvas();
    const c = { ctx: ctx as unknown as CanvasRenderingContext2D, w: 300, h: 300 };
    for (const a of ASSETS) {
      for (let i = 0; i < 12; i++) {
        const t = (i / 12) * BEAT_SECONDS * 4;
        const beats = t / BEAT_SECONDS;
        const beat = Math.floor(beats);
        a.draw(c, { t, beat, beatPhase: beats - beat });
      }
    }
  });

  it("leaves the game's own records as it found them", () => {
    const fringe = WISP_LOOK.fringe;
    const surface = WARDEN_LOOK.surface;
    const stone = VOLLEY_LOOK.stone;
    const seams = VOLLEY_LOOK.seams;
    const mass = VEIL_LOOK.mass;
    const plates = LID_LOOK.plates;
    const { ctx } = stubCanvas();
    const c = { ctx: ctx as unknown as CanvasRenderingContext2D, w: 300, h: 300 };
    for (const a of ASSETS) a.draw(c, { t: 1, beat: 1, beatPhase: 0.5 });
    expect(WISP_LOOK.fringe).toBe(fringe);
    expect(WARDEN_LOOK.surface).toBe(surface);
    expect(VOLLEY_LOOK.stone).toBe(stone);
    expect(VOLLEY_LOOK.seams).toBe(seams);
    expect(VEIL_LOOK.mass).toBe(mass);
    expect(LID_LOOK.plates).toBe(plates);
  });

  it("keeps every file in the folder a part of the registry or its plumbing", () => {
    // A look moved here and never listed is a look nobody can see — the same
    // trap the tail registry guards against.
    const src = FILES.map((f) => readFileSync(join(DIR, f), "utf8")).join("\n");
    for (const f of FILES) {
      if (f === "index.ts" || f === "types.ts") continue;
      const stem = f.replace(/\.ts$/, "");
      expect(src.includes(`./${stem}.js`), `${f} is imported by nothing in the folder`).toBe(true);
    }
  });
});
