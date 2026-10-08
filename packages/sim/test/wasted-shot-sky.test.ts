import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol } from "../src/config.js";
import { playDifficulty } from "../src/difficulty.js";
import { step } from "../src/index.js";
import { leadAim, leadBoss } from "../src/lead.js";
import { shotLeaves } from "../src/shot-out.js";
import type { Bullet } from "../src/types.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";
import * as capstan from "./capstan-rig.js";
import * as cyst from "./cyst-rig.js";
import * as davit from "./davit-rig.js";
import * as flue from "./flue-rig.js";
import * as gall from "./gall-rig.js";
import * as governor from "./governor-rig.js";
import * as grindstone from "./grindstone-rig.js";
import * as halter from "./halter-rig.js";
import * as hasp from "./hasp-rig.js";
import * as keel from "./keel-rig.js";
import * as mantle from "./mantle-rig.js";
import * as oculus from "./oculus-rig.js";
import * as plumb from "./plumb-rig.js";
import * as ratchet from "./ratchet-rig.js";
import * as rime from "./rime-rig.js";
import * as seam from "./seam-rig.js";
import * as sling from "./sling-rig.js";
import * as trapeze from "./trapeze-rig.js";
import * as trivet from "./trivet-rig.js";
import * as valve from "./valve-rig.js";
import * as vise from "./vise-rig.js";

/**
 * **On HARD a bolt into the sky above a boss is judged by that boss**
 * (`shot-out.ts`). The owner, 27 September 2026: *a shot that meets nothing
 * above a sky boss loses the wave; a shot into armour still costs nothing.*
 * Every world here is its boss as installed, every window shut, so what a
 * column answers is armour or sky and never a hit.
 */

const COLS = DEFAULT_CONFIG.cols;
const MID = midCol(DEFAULT_CONFIG);

/** A boss as it stands at the start of its wave, with only an explicit HARD rule turned on. */
function bare(kind: string): () => World {
  return () => {
    const world = createWorld({ ...DEFAULT_CONFIG }, 1);
    startWave(world, 9, [], [], { kind } as never);
    return world;
  };
}

/** Every column, one bolt out of the top each, on a fresh world: which of them lost it. */
function lost(make: () => World): number[] {
  const out: number[] = [];
  for (let col = 0; col < COLS; col++) {
    const world = make();
    world.cfg.wastedShotFails = true;
    shotLeaves(world, bolt(col), -500);
    if (world.failTick !== NOT_FAILED) out.push(col);
  }
  return out;
}

function bolt(col: number): Bullet {
  return {
    id: 9,
    col,
    row: 0,
    subMilli: 0,
    color: "red",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

const everyColumn = Array.from({ length: COLS }, (_, i) => i);

describe("a bolt out of the top on HARD, under a boss", () => {
  // The core stands in the middle column whether it is lit or shut.
  const CORED: Record<string, () => World> = {
    capstan: () => capstan.install(),
    cyst: () => cyst.install(),
    davit: () => davit.install(),
    gall: () => gall.install(),
    governor: () => governor.install(),
    grindstone: () => grindstone.install(),
    halter: () => halter.install(),
    keel: () => keel.install(),
    oculus: () => oculus.install(),
    plumb: () => plumb.install(),
    rime: () => rime.install(),
    sling: () => sling.install(),
    trivet: () => trivet.install(),
    vise: () => vise.install(),
  };
  for (const [kind, make] of Object.entries(CORED)) {
    it(`${kind}: the shut core is armour, every other column is sky`, () => {
      expect(String(make().boss?.kind)).toBe(kind);
      expect(lost(make)).toEqual(everyColumn.filter((c) => c !== MID));
    });
  }

  // A spark, a seam, a loose bolt: there only while it is open.
  const OPEN_ONLY: Record<string, () => World> = {
    gimbal: () => {
      const world = createWorld({ ...DEFAULT_CONFIG }, 0);
      startWave(world, 0, [], [], { kind: "gimbal", marks: [3, 6] } as never);
      return world;
    },
    hasp: () => hasp.install(),
    mantle: () => mantle.install(),
    ratchet: () => ratchet.install(),
    seam: () => seam.install(),
    valve: () => valve.install(),
  };
  for (const [kind, make] of Object.entries(OPEN_ONLY)) {
    it(`${kind}: nothing shut is up there, so every column is sky`, () => {
      expect(String(make().boss?.kind)).toBe(kind);
      expect(lost(make)).toEqual(everyColumn);
    });
  }

  // A housing, an underside, a fan: over every column there is.
  for (const kind of ["vane", "hive", "taster"]) {
    it(`${kind}: the body is over every column, so no bolt is wasted`, () => {
      expect(lost(bare(kind))).toEqual([]);
    });
  }

  // THE TRAPEZE's bolts are shoves at a swinging alien, never a shot at a
  // target, so HARD does not ask them (`shot-wasted.ts`).
  it("trapeze: a near miss at the swing is not a wasted shot", () => {
    expect(String(trapeze.install().boss?.kind)).toBe("trapeze");
    expect(lost(() => trapeze.install())).toEqual([]);
  });

  // THE FLUE's row, edge to edge: every shot stops on it and is judged there
  // (`flue-shot.ts`), so none goes on into the sky.
  it("flue: the flue is over every column, so no bolt is wasted", () => {
    expect(String(flue.install().boss?.kind)).toBe("flue");
    expect(lost(() => flue.install())).toEqual([]);
  });

  // A frame, a body: over the middle and not the edges.
  for (const kind of ["scuttle", "ledger"]) {
    it(`${kind}: the body's columns are armour, the edges are sky`, () => {
      const out = lost(bare(kind));
      expect(out).toContain(0);
      expect(out).toContain(COLS - 1);
      expect(out).not.toContain(MID);
    });
  }

  it("curtain: the fabric is on the field, so up here only the core's column meets it", () => {
    const make = bare("curtain");
    const c = make().boss;
    if (c?.kind !== "curtain") throw new Error("no curtain");
    expect(lost(make)).toEqual(everyColumn.filter((col) => col !== c.coreCol));
  });
});

describe("THE LEAD's flight, judged when it comes down", () => {
  function lead(level: "hard" | "medium"): World {
    const cfg = { ...DEFAULT_CONFIG };
    playDifficulty(cfg, level);
    const world = createWorld(cfg, 3);
    startWave(world, 6, [], [], { kind: "lead" });
    return world;
  }

  /** A bolt put in the air where the body will not be when it lands, stepped until it is judged. */
  function missed(world: World): void {
    const s = leadBoss(world);
    if (s === null) throw new Error("no lead");
    const col = leadAim(s, world.cfg) === 0 ? COLS - 1 : 0;
    shotLeaves(world, bolt(col), -500);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(s.flights.length).toBe(1);
    let said = false;
    for (let t = 0; t < 400 && s.flights.length > 0; t++) {
      step(world, []);
      said ||= world.events.some((e) => e.type === "leadMiss");
    }
    expect(said).toBe(true);
  }

  it("loses the wave on HARD when it lands where the body is not", () => {
    const world = lead("hard");
    missed(world);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });

  it("costs nothing on MEDIUM, where the miss only turns the body round", () => {
    const world = lead("medium");
    missed(world);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
