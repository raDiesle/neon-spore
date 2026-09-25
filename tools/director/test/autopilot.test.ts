import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Field, touchDown, type Viewport } from "@neon-spore/render";
import {
  BOSS_KINDS,
  filamentBoss,
  filamentTracing,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { AUTOPILOT_HANDS } from "../src/autopilot-hands.js";
import { filamentHand } from "../src/boss-hands-handles.js";
import { bossWorld, phaseOf } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays one seat and the person the other** — the owner's ask of 25
 * September 2026, on THE FILAMENT: the pilot draws and the navigator follows,
 * and one mouse is one thumb. Pinned here: every boss the director has a hand
 * for is on the row; a seat on AUTO is the only seat it speaks for; a person
 * playing the pilot against AUTO's navigator pulls every filament out; and
 * the finger it draws is on the ring a thumb would be on.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

/** The two bosses no pose has a hand for. A new boss is a row or a name here. */
const NO_HAND = new Set(["pulse", "reprise"]);

function rig(w: () => World) {
  const l = computeLayout(VIEWPORT, w().cfg, "test");
  const field = (seat: 1 | 2): Field =>
    stageField(w(), "test", controlSet("default"), w().cfg, seat, null);
  return { l, field, auto: stageAutopilot({ layout: () => l, field }) };
}

describe("AUTO", () => {
  test("every boss the director has a hand for is on the row", () => {
    const missing = BOSS_KINDS.filter((k) => !NO_HAND.has(k) && !(k in AUTOPILOT_HANDS));
    expect(missing).toEqual([]);
  });

  test("OFF sends nothing, and P2 sends only player 2's commands", () => {
    let world = bossWorld("filament");
    const { auto } = rig(() => world);
    const seen: (1 | 2)[] = [];
    for (let i = 0; i < ticksPerBeat(world.cfg) * 8; i++) {
      expect(auto.commands(world)).toEqual([]);
      step(world, []);
    }
    world = bossWorld("filament");
    auto.setMode("p2");
    for (let i = 0; i < ticksPerBeat(world.cfg) * 40; i++) {
      const sent = auto.commands(world);
      seen.push(...sent.map((c) => c.player));
      for (const c of sent) expect(c.tick).toBe(world.tick);
      step(world, sent);
    }
    expect(seen.length).toBeGreaterThan(0);
    expect(new Set(seen)).toEqual(new Set([2]));
  });

  test("the mouse is taken off AUTO's seat, and keeps both when AUTO has both", () => {
    const world = bossWorld("filament");
    const { auto } = rig(() => world);
    expect(auto.seats([1, 2])).toEqual([1, 2]);
    auto.setMode("p2");
    expect(auto.seats([1, 2])).toEqual([1]);
    auto.setMode("p1");
    expect(auto.seats([1, 2])).toEqual([2]);
    auto.setMode("both");
    expect(auto.seats([1, 2])).toEqual([1, 2]);
  });

  test("a pilot against AUTO's navigator pulls THE FILAMENT out", () => {
    const world = bossWorld("filament");
    const { auto } = rig(() => world);
    auto.setMode("p2");
    const budget = ticksPerBeat(world.cfg) * 300;
    for (let i = 0; i < budget && phaseOf(world) !== "down"; i++) {
      // The person: the pilot's half of the hand, and nothing of the navigator's.
      const pilot = filamentHand(world)
        .filter((c) => c.player === 1)
        .map((c) => ({ ...c, tick: world.tick }));
      step(world, [...pilot, ...auto.commands(world)]);
    }
    expect(phaseOf(world)).toBe("down");
  });

  test("AUTO's finger rides the pilot's ring up the line", () => {
    const world = bossWorld("filament");
    const { l, field, auto } = rig(() => world);
    auto.setMode("both");
    let onRing = 0;
    let first: { x: number; y: number } | undefined;
    let travelled = 0;
    for (let i = 0; i < ticksPerBeat(world.cfg) * 40; i++) {
      step(world, auto.commands(world));
      const s = filamentBoss(world);
      const f = auto.fingers().find((x) => x.seat === 1);
      if (!s || !filamentTracing(s) || !f?.held) continue;
      first ??= { x: f.x, y: f.y };
      travelled = Math.max(travelled, Math.hypot(f.x - first.x, f.y - first.y));
      const t = touchDown(l, f.x, f.y, field(1));
      if (t?.hold?.kind === "drag" && t.hold.target === "filament") onRing++;
    }
    expect(first).toBeDefined();
    // Carried at least two tiles up the field, and on the ring most of the way.
    expect(travelled).toBeGreaterThanOrEqual(l.tile * 2);
    expect(onRing).toBeGreaterThan(ticksPerBeat(world.cfg));
  });
});
