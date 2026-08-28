import { describe, expect, it } from "bun:test";
import { BOSS_KINDS, type CreatureKind, DEFAULT_CONFIG, isBossBody } from "@neon-spore/sim";
import { CREATURES, categoryOf } from "../src/creatures.js";
import {
  MECHANIC_IDS,
  MECHANICS,
  type MechanicId,
  mechanic,
  mechanicOn,
  mechanicsInWave,
  unreachedMechanics,
} from "../src/mechanics.js";
import { WAVES } from "../src/waves.js";

const POD_KINDS = ["mend", "purge", "ward"] as const;

describe("the registry is closed over what already exists", () => {
  it("has a row for every creature, pod and boss", () => {
    const ids = new Set<string>(MECHANIC_IDS);
    for (const kind of Object.keys(CREATURES)) expect(ids.has(kind)).toBe(true);
    for (const kind of POD_KINDS) expect(ids.has(kind)).toBe(true);
    for (const kind of BOSS_KINDS) expect(ids.has(kind)).toBe(true);
  });

  it("says something about every one of them", () => {
    for (const id of MECHANIC_IDS) expect(mechanic(id).what.length).toBeGreaterThan(20);
  });

  it("names only switches the configuration actually has", () => {
    for (const id of MECHANIC_IDS) {
      const s = mechanic(id).switch;
      if (!s) continue;
      expect(DEFAULT_CONFIG).toHaveProperty(s.field);
      expect(typeof DEFAULT_CONFIG[s.field]).toBe(typeof s.off);
    }
  });

  it("carries only mechanics that are themselves on the list", () => {
    for (const id of MECHANIC_IDS) {
      const by = mechanic(id).carriedBy;
      if (by) expect(MECHANIC_IDS).toContain(by);
    }
  });
});

describe("which kinds a wave may name", () => {
  /**
   * The rule, called rather than restated: a wave writes a `kind` only for a
   * creature that carries no colour (a coloured one follows from its colour),
   * that is not a boss body (the boss panel places those) and that is not the
   * one `special` kind, the tether, which a boss installs.
   */
  const nameable = (Object.keys(CREATURES) as CreatureKind[]).filter(
    (kind) => CREATURES[kind].color === null && !isBossBody(kind) && categoryOf(kind) !== "special",
  );

  it("is exactly what the bestiary says it should be", () => {
    const flagged = MECHANIC_IDS.filter((id) => mechanic(id).waveNames);
    expect([...flagged].sort()).toEqual([...nameable].sort());
  });

  it("is the union `WaveEntry.kind` is typed against", () => {
    // A compile-time assertion with a runtime body: each of these is only
    // assignable if `WaveKind` really was derived from the flags above.
    const kinds: NonNullable<import("../src/wave-types.js").WaveEntry["kind"]>[] = [
      "meteor",
      "meteorMedium",
      "meteorFast",
      "meteorFaster",
      "meteorFastest",
      "torch",
      "runt",
      "throb",
      "shell",
    ];
    expect([...kinds].sort()).toEqual([...nameable].sort() as typeof kinds);
  });
});

describe("what a wave reaches", () => {
  it("reads a wave through content's own translation", () => {
    const found = mechanicsInWave({
      name: "T",
      sentence: "s",
      hint: "h",
      entries: [
        { beat: 0, col: 1, color: "red" },
        { beat: 1, col: 2, color: "cyan" },
        { beat: 2, col: 3, kind: "meteorFast", color: null },
      ],
      pods: [{ beat: 0, col: 1, row: 2, kind: "purge" }],
    });
    expect([...found].sort()).toEqual(["bulb", "meteorFast", "purge", "slick"]);
  });

  it("follows what a boss brings with it", () => {
    const warden = mechanicsInWave({
      name: "T",
      sentence: "s",
      hint: "h",
      entries: [],
      boss: { kind: "warden" },
    });
    expect(warden.has("tether")).toBe(true);

    const queen = mechanicsInWave({
      name: "T",
      sentence: "s",
      hint: "h",
      entries: [],
      boss: { kind: "queen", col: 3, petals: 9 },
    });
    expect(queen.has("torch")).toBe(true);
  });

  it("reads THE GAUGE out of a wave, the same as any other boss", () => {
    // It used to be read out of a table of gaps and out of no wave at all,
    // which is exactly what stopped being true — one wave carries it now.
    const carrying = WAVES.filter((w) => mechanicsInWave(w).has("gauge"));
    expect(carrying).toHaveLength(1);
    expect(carrying[0]?.name).toBe("THE GAUGE");
  });
});

describe("what nothing plays through", () => {
  const unreached = unreachedMechanics();

  it("never reports a run-wide switch, because no wave decides one", () => {
    for (const id of unreached) expect(mechanic(id).reach).not.toBe("run");
  });

  it("counts a mechanic as reached the moment one wave carries it", () => {
    const anyWave: MechanicId = "slick";
    expect(unreached).not.toContain(anyWave);
    expect(unreachedMechanics([])).toContain(anyWave);
  });

  /**
   * Not a list of names, on purpose: the point of the registry is that this
   * number moves when a wave or a mechanic is added, and a test pinning the
   * names would have to be edited by the same lane that caused the change.
   */
  it("agrees with itself over the shipped waves", () => {
    const reached = MECHANIC_IDS.filter(
      (id) => mechanic(id).reach !== "run" && !unreached.includes(id),
    );
    expect(reached.length + unreached.length).toBe(
      MECHANIC_IDS.filter((id) => mechanic(id).reach !== "run").length,
    );
  });
});

describe("whether a run has a mechanic at all", () => {
  it("is true for anything without a switch", () => {
    expect(mechanicOn(DEFAULT_CONFIG, "slick")).toBe(true);
    expect(mechanicOn(DEFAULT_CONFIG, "grip")).toBe(true);
  });

  it("reads the switch where there is one", () => {
    expect(mechanicOn(DEFAULT_CONFIG, "fork")).toBe(false);
    expect(mechanicOn({ ...DEFAULT_CONFIG, forkBetweenWaves: true }, "fork")).toBe(true);
  });

  it("knows the wind-up's off value is a zero grid and not a false", () => {
    expect(MECHANICS.windup.switch.off).toBe(0);
    expect(mechanicOn(DEFAULT_CONFIG, "windup")).toBe(false);
    expect(mechanicOn({ ...DEFAULT_CONFIG, shotChargeBeats: 0.5 }, "windup")).toBe(true);
  });
});
