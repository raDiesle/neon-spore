import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Field, touchDown, type Viewport } from "@neon-spore/render";
import {
  BOSS_KINDS,
  filamentBoss,
  filamentTracing,
  pulseRound,
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
 * for is on the row; THE PULSE and THE REPRISE are played to their end; a
 * seat on AUTO is the only seat it speaks for; a person playing the pilot
 * against AUTO's navigator pulls every filament out; and the finger it draws
 * is on the ring a thumb would be on.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

/**
 * Bosses AUTO has no hand for. THE PULSE and THE REPRISE got theirs; THE
 * MANTLE, THE KEEL and THE VALVE are here for its own reason — only its simulation lane has landed
 * (`docs/spec/bosses.md` §11.40–§11.42), and an autopilot hand plays a boss against
 * poses that do not exist yet. A new boss is a row in `AUTOPILOT_HANDS` or a
 * name here.
 */
const NO_HAND = new Set(["mantle", "keel", "valve"]);

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

  test("BOTH plays THE PULSE through every stage with the meter full", () => {
    const world = bossWorld("pulse");
    const { auto } = rig(() => world);
    auto.setMode("both");
    for (let i = 0; i < 20_000 && pulseRound(world)?.phase !== "spent"; i++) {
      step(world, auto.commands(world));
    }
    const s = pulseRound(world);
    expect(s?.phase).toBe("spent");
    expect(s?.passed).toBe(true);
    expect(s?.meter).toBe(world.cfg.pulseMeterMaxMilli);
  });

  test("BOTH plays THE REPRISE out, echoes and all, with nothing reaching the hull", () => {
    const world = bossWorld("reprise");
    const { auto } = rig(() => world);
    auto.setMode("both");
    const echoed = new Set<number>();
    for (let i = 0; i < 20_000 && world.boss !== null; i++) {
      for (const c of world.creatures) if (c.unseen) echoed.add(c.id);
      step(world, auto.commands(world));
    }
    // The boss only takes itself off with the field empty (`sim/reprise.ts`).
    expect(world.boss).toBeNull();
    expect(echoed.size).toBeGreaterThan(0);
    expect(world.scars).toEqual([]);
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
