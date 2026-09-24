import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, NO_LIFT, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { pairCall } from "../src/pair-call.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The second seat's clock, said on every boss that has one** — the owner's
 * rule of 20 September 2026, THE INSTAR's line carried to the others
 * (`pair-call.ts`).
 *
 * Each coupling is pinned from the state its rule reads: the seat named is the
 * one still out, the number is the window's own width at the moment it opens,
 * and the line goes the moment the rule stops judging. And the bosses read and
 * found to have no coupling are pinned silent, so the reading does not have to
 * be done again.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

type Kind = Parameters<typeof waveWith>[0];

/** A wave carrying this boss, stepped until its body is hung, on a beat boundary. */
function hung(kind: Kind): World {
  const world = createWorld(CFG, 3);
  const index = waveWith(kind);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  while (world.tick % TPB !== 0) step(world, []);
  if (world.boss?.kind !== kind) throw new Error(`the ${kind} wave hung no ${kind}`);
  return world;
}

function boss<K extends Kind>(world: World, kind: K) {
  const b = world.boss;
  if (b?.kind !== kind) throw new Error(`no ${kind}`);
  return b as Extract<NonNullable<World["boss"]>, { kind: K }>;
}

describe("the second seat's clock, read", () => {
  it("THE TASTER: the pilot's pry puts the navigator on the beam's window", () => {
    const world = hung("taster");
    boss(world, "taster").pryBeat = world.beat;
    const n = CFG.tasterPryBeats;
    expect(pairCall(world, 0)).toEqual({ kind: "P2 NOW", word: `${n} BEATS LEFT` });
    world.beat += n - 1;
    expect(pairCall(world, 0.5)?.word).toBe("1 BEAT LEFT");
    world.beat += 1;
    expect(pairCall(world, 0)).toBeNull();
  });

  it("THE DIASTOLE: the pilot's clamp puts the navigator on its window", () => {
    const world = hung("diastole");
    const b = boss(world, "diastole");
    b.phase = "alone";
    b.clampBeat = world.beat;
    b.clampUntil = world.beat + CFG.diastoleClampBeats;
    const n = CFG.diastoleClampBeats;
    expect(pairCall(world, 0)).toEqual({ kind: "P2 NOW", word: `${n} BEATS LEFT` });
    // Caught on the next contraction: the window has not opened yet.
    b.clampBeat = world.beat + 1;
    expect(pairCall(world, 0)).toBeNull();
    // Both chambers beating: there is no clamp to be on the clock of.
    b.clampBeat = world.beat;
    b.phase = "two";
    expect(pairCall(world, 0)).toBeNull();
  });

  it("THE BATON: a launched bead puts the navigator on its flight", () => {
    const world = hung("baton");
    const b = boss(world, "baton");
    b.stage = "passing";
    const bead = b.beads[0];
    if (bead === undefined) throw new Error("THE BATON hung no bead");
    bead.flying = true;
    bead.final = false;
    bead.struck = false;
    bead.flightTick = world.tick;
    const n = CFG.batonFlightBeats;
    expect(pairCall(world, 0)).toEqual({ kind: "P2 NOW", word: `${n} BEATS LEFT` });
    bead.struck = true;
    expect(pairCall(world, 0)).toBeNull();
  });

  it("THE SURGE: the first thumb off puts the other on one beat", () => {
    const world = hung("surge");
    const s = boss(world, "surge");
    s.heldP1 = false;
    s.heldP2 = true;
    s.liftTick = world.tick;
    expect(pairCall(world, 0)).toEqual({ kind: "P2 NOW", word: "1 BEAT LEFT" });
    world.tick += TPB + 1;
    expect(pairCall(world, 0)).toBeNull();
    world.tick -= TPB + 1;
    s.heldP1 = true;
    s.heldP2 = false;
    expect(pairCall(world, 0)?.kind).toBe("P1 NOW");
    s.liftTick = NO_LIFT;
    expect(pairCall(world, 0)).toBeNull();
  });

  // Read on 23 September 2026 and found with no seat judged against the
  // other's moment: a live check of two hands, a world clock, or two acts of
  // one seat. Played through untouched, the line never stands.
  it.each(["gorge", "cairn", "orrery", "hasp", "gimbal", "ratchet", "spool"] as const)(
    "says nothing on %s, which has no second seat's clock",
    (kind) => {
      const world = hung(kind);
      for (let i = 0; i < TPB * 24; i++) {
        step(world, []);
        expect(pairCall(world, 0)).toBeNull();
      }
    },
  );
});

describe("the second seat's clock, drawn", () => {
  it.each(ROLES)("stands on the glass, the same sentence, on %s", (role) => {
    const world = hung("taster");
    boss(world, "taster").pryBeat = world.beat;
    const texts: TextBox[] = [];
    runFrames(world, role, 9, {
      every: 3,
      onCanvas: (c) => {
        c.texts = texts;
      },
    });
    const said = texts.map((t) => t.text);
    expect(said).toContain("P2 NOW");
    expect(said.some((t) => t.endsWith("BEATS LEFT"))).toBe(true);
  });
});
