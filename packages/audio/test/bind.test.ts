import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SimEvent } from "@neon-spore/sim";
import { cueFor, panForCol, pitchForRow } from "../src/bind.js";
import { hasSound } from "../src/catalogue.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * The `SimEvent` union, read out of the simulation rather than copied here.
 * A copied list is a list that stops being true the day someone adds an event,
 * which is exactly the day the new event silently has no sound.
 *
 * **Both files**, because the union is written in two: everything one body did
 * is `CreatureEvent` in `events-creature.ts` — the same seam this package's
 * own `bind-creatures.ts` reads on — and `SimEvent` is that arm plus the ship,
 * the field, the pods and the bosses. Reading only the first would let a
 * creature event ship with no sound, which is the exact failure this test was
 * written for.
 */
async function eventTypes(): Promise<string[]> {
  const found: string[] = [];
  for (const [file, decl] of [
    ["packages/sim/src/events.ts", "export type SimEvent ="],
    ["packages/sim/src/events-creature.ts", "export type CreatureEvent ="],
  ] as const) {
    const src = await Bun.file(join(ROOT, file)).text();
    const start = src.indexOf(decl);
    expect(start, file).toBeGreaterThan(-1);
    const union = src.slice(start);
    found.push(...[...union.matchAll(/type:\s*"([a-zA-Z]+)"/g)].map((m) => m[1] as string));
  }
  return [...new Set(found)];
}

/** One of each event, filled with values a real world would carry. */
const SAMPLES: Record<string, SimEvent> = {
  beat: { type: "beat", beat: 4 },
  waveStart: { type: "waveStart", wave: 0 },
  needWave: { type: "needWave", wave: 1 },
  fire: { type: "fire", col: 3, color: "red", lance: false },
  lanceFull: { type: "lanceFull", col: 3 },
  lanceSpilled: { type: "lanceSpilled", col: 3 },
  destroy: { type: "destroy", col: 3, row: 4, color: "cyan" },
  hole: { type: "hole", col: 2, row: 5 },
  reject: { type: "reject", col: 2, row: 5 },
  deflect: { type: "deflect", col: 2, span: 1, kind: "meteor", fromRow: 9 },
  grip: { type: "grip", player: 1, col: 1, row: 3 },
  podLoose: { type: "podLoose", col: 4, row: 2 },
  podTaken: { type: "podTaken", col: 4, kind: "ward" },
  podLost: { type: "podLost", col: 4 },
  breach: { type: "breach", col: 5, damage: 12_000, span: 1, kind: "slick", fromRow: 10, beat: 8 },
  petal: { type: "petal", col: 3, row: 1, left: 2 },
  queenDown: { type: "queenDown", col: 3, row: 1 },
  tether: { type: "tether", col: 2, color: "cyan" },
  eyeOpen: { type: "eyeOpen", col: 5, color: "red" },
  plate: { type: "plate", col: 5, row: 2, left: 3, color: "red" },
  wardenDown: { type: "wardenDown", col: 5, row: 2 },
  mirrorShow: { type: "mirrorShow", step: "guard", index: 1, of: 3, col: 3 },
  mirrorEcho: { type: "mirrorEcho", step: "guard", index: 2, of: 3 },
  mirrorVerdict: { type: "mirrorVerdict", right: false, col: 3, reason: "bait" },
  mirrorDown: { type: "mirrorDown", col: 3 },
  mazeCommit: { type: "mazeCommit", mouth: 1, col: 5 },
  mazeProbe: { type: "mazeProbe", ring: 1, sector: 2, of: 3 },
  mazeVerdict: { type: "mazeVerdict", right: false, col: 5, reason: "silence" },
  mazeDown: { type: "mazeDown", col: 5 },
  lureHit: { type: "lureHit", col: 3, row: 4 },
  lureSeen: { type: "lureSeen", col: 3 },
  lureVanished: { type: "lureVanished", col: 3, row: 4, color: "cyan" },
  shellBreak: { type: "shellBreak", col: 3, row: 4, left: 1 },
  shellBare: { type: "shellBare", col: 3, row: 5, color: "cyan" },
  rindShed: { type: "rindShed", col: 3, row: 5, color: "red", left: 1 },
  claspBreak: { type: "claspBreak", id: 7, col: 3, row: 5, kind: "bulb", color: "cyan" },
  veilMorph: { type: "veilMorph", col: 3, row: 4, color: "red" },
  veilRebuff: { type: "veilRebuff", col: 3, row: 4 },
  veilTorn: { type: "veilTorn", col: 3, row: 4, color: "cyan", kind: "bulb" },
  wispHop: { type: "wispHop" },
  ghostRelease: { type: "ghostRelease", col: 3, row: 4, color: "red" },
  ghostTurn: { type: "ghostTurn", col: 0, row: 3, laps: 2 },
  ghostCharge: { type: "ghostCharge", col: 0, row: 3 },
  fleetSplash: { type: "fleetSplash", col: 4, row: 6 },
  fleetHit: { type: "fleetHit", col: 4, row: 6 },
  fleetSunk: { type: "fleetSunk", col: 4, row: 6, len: 3, left: 2 },
  fleetDown: { type: "fleetDown", col: 4, row: 6 },
};

describe("bindings", () => {
  it("has a sample for every event the simulation can report", async () => {
    expect(Object.keys(SAMPLES).sort()).toEqual((await eventTypes()).sort());
  });

  it("names a sound that exists for every event but the one that is bookkeeping", () => {
    for (const [type, e] of Object.entries(SAMPLES)) {
      const cue = cueFor(e, 7, 12);
      if (type === "needWave") {
        expect(cue).toBeNull();
        continue;
      }
      expect(cue, `${type} has no cue`).not.toBeNull();
      expect(hasSound(cue?.id ?? ""), `${type} names a sound that is not in the catalogue`).toBe(
        true,
      );
    }
  });

  /**
   * The one binding in the game whose *absence* of a pan is load-bearing.
   * A crossing ghost turns at a wall, so a cue placed where it happened would
   * tell player 1 — who is never shown the column — which edge of the field
   * it is standing at. Nothing else here needs a test of its own for a
   * missing field, and this one does, because the field being missing is a
   * decision that reads exactly like an oversight.
   */
  it("never places a ghost's turn in the stereo field", () => {
    const cue = cueFor({ type: "ghostTurn", col: 0, row: 3, laps: 1 }, 7, 12);
    expect(cue?.id).toBe("creature.ghostTurn");
    expect(cue?.pan).toBeUndefined();
  });

  it("tells the two colours apart in both directions", () => {
    expect(cueFor({ type: "fire", col: 0, color: "red", lance: false }, 7, 12)?.id).toBe(
      "ship.fireRed",
    );
    expect(cueFor({ type: "fire", col: 0, color: "cyan", lance: false }, 7, 12)?.id).toBe(
      "ship.fireCyan",
    );
    expect(cueFor({ type: "destroy", col: 0, row: 0, color: "red" }, 7, 12)?.id).toBe(
      "impact.destroyRed",
    );
    expect(cueFor({ type: "destroy", col: 0, row: 0, color: "cyan" }, 7, 12)?.id).toBe(
      "impact.destroyCyan",
    );
  });

  it("accents every fourth beat and no other", () => {
    const ids = [0, 1, 2, 3, 4].map((beat) => cueFor({ type: "beat", beat }, 7, 12)?.id);
    expect(ids).toEqual(["beat.accent", "beat.tick", "beat.tick", "beat.tick", "beat.accent"]);
  });

  it("splits a breach by what it cost, not by what hit", () => {
    const heavy = {
      type: "breach",
      col: 0,
      damage: 20_000,
      span: 1,
      kind: "meteor",
      fromRow: 9,
      beat: 1,
    } as const;
    const light = { ...heavy, damage: 3_000 };
    expect(cueFor(heavy, 7, 12)?.id).toBe("hull.breachHeavy");
    expect(cueFor(light, 7, 12)?.id).toBe("hull.breachLight");
  });

  it("gives each of THE MIRROR's steps its own sound", () => {
    const steps = ["fireRed", "fireCyan", "guard", "intake", "cannonLeft", "cannonRight"] as const;
    const ids = steps.map(
      (step) => cueFor({ type: "mirrorShow", step, index: 1, of: 1, col: 0 }, 7, 12)?.id,
    );
    expect(new Set(ids).size).toBe(steps.length);
    for (const id of ids) expect(hasSound(id ?? "")).toBe(true);
  });

  it("puts a column across the stereo field without ever reaching the edge", () => {
    expect(panForCol(0, 7)).toBeCloseTo(-0.75, 6);
    expect(panForCol(3, 7)).toBeCloseTo(0, 6);
    expect(panForCol(6, 7)).toBeCloseTo(0.75, 6);
    expect(panForCol(0, 1)).toBe(0);
  });

  it("raises the pitch of something that happened further up the field", () => {
    expect(pitchForRow(0, 12)).toBeCloseTo(1.5, 6);
    expect(pitchForRow(11, 12)).toBeCloseTo(1, 6);
    expect(pitchForRow(0, 1)).toBe(1);
  });
});
