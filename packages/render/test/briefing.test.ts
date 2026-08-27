import { beforeAll, describe, expect, it } from "bun:test";
import { BRIEFINGS } from "@neon-spore/content";
import {
  BRIEFING_SUBJECTS,
  type BriefingId,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  subjectIndex,
} from "@neon-spore/sim";
import { drawBriefing } from "../src/briefing.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * Every card, every role, through the strict canvas — the same rule as
 * `frame.test.ts`, because a card is the first thing a new pair ever sees and
 * a colour the browser cannot parse there is a game that never starts.
 *
 * The other half of this file is the catalogue itself. A card with an empty
 * line is a card that teaches half of a split, which is worse than no card:
 * one player is told to read something out and has nothing to read.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const ROLES: ViewRole[] = ["p1", "p2", "test"];

beforeAll(installCanvasGlobals);

describe("the catalogue", () => {
  it("has a card for every subject", () => {
    for (const id of BRIEFING_SUBJECTS) expect(BRIEFINGS[id]).toBeDefined();
  });

  it("never leaves a line empty", () => {
    for (const id of BRIEFING_SUBJECTS) {
      const card = BRIEFINGS[id];
      for (const [part, text] of Object.entries(card)) {
        expect(text.trim().length, `${id}.${part} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it("never says the same thing to both players", () => {
    for (const id of BRIEFING_SUBJECTS) {
      const card = BRIEFINGS[id];
      expect(card.p1, `${id} tells both players the same thing`).not.toBe(card.p2);
    }
  });

  it("keeps a line short enough to read on a phone under a beat", () => {
    for (const id of BRIEFING_SUBJECTS) {
      const card = BRIEFINGS[id];
      expect(card.title.length, `${id} has a long title`).toBeLessThanOrEqual(20);
      for (const part of [card.p1, card.p2]) {
        expect(part.length, `${id} has a long half: ${part}`).toBeLessThanOrEqual(130);
      }
    }
  });
});

/** A world holding exactly the card for `id`, whatever it takes to get there. */
function showing(id: BriefingId) {
  const world = createWorld(CFG, 3);
  startWave(world, 0, []);
  // Every wave opens on the split first; step past it, then plant the subject
  // under test where the next card comes from.
  step(world, [
    { tick: 0, player: 1, command: { kind: "brief" } },
    { tick: 0, player: 2, command: { kind: "brief" } },
  ]);
  world.brief.due = [subjectIndex(id)];
  return world;
}

describe("a card on the stage", () => {
  it("draws every subject in every role", () => {
    const { ctx } = stubCanvas();
    for (const role of ROLES) {
      const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, role);
      for (const id of BRIEFING_SUBJECTS) {
        const world = showing(id);
        drawBriefing(ctx as unknown as CanvasRenderingContext2D, l, world, role);
      }
    }
  });

  it("draws on a screen narrow enough that a word does not fit", () => {
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 240, height: 480, dpr: 1 }, CFG, "p1");
    for (const id of BRIEFING_SUBJECTS) {
      drawBriefing(ctx as unknown as CanvasRenderingContext2D, l, showing(id), "p1");
    }
  });

  it("draws nothing at all when no card is due", () => {
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
    const world = createWorld(DEFAULT_CONFIG, 3);
    startWave(world, 0, []);
    const calls = ctx.calls;
    drawBriefing(ctx as unknown as CanvasRenderingContext2D, l, world, "p1");
    expect(ctx.calls).toBe(calls);
  });
});
