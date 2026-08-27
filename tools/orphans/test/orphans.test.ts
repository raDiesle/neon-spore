import { describe, expect, it } from "bun:test";
import { type MechanicId, mechanic, unreachedMechanics } from "@neon-spore/content";
import { orphanReport } from "../orphans.js";

describe("orphanReport", () => {
  it("says nothing when nothing is unreached", () => {
    expect(orphanReport([])).toEqual([]);
  });

  it("carries one row per id unreachedMechanics reports, and never a run switch", () => {
    const ids = unreachedMechanics();
    const rows = orphanReport(ids);
    expect(rows.map((r) => r.id).sort()).toEqual([...ids].sort());
    for (const row of rows) {
      expect(row.reach).not.toBe("run");
      expect(row.what).toBe(mechanic(row.id).what);
      expect(row.fix.length).toBeGreaterThan(0);
    }
  });

  it("points a spawn mechanic at a wave and a gap mechanic at an interlude", () => {
    const rows = orphanReport(["purge", "gauge"] as MechanicId[]);
    expect(rows).toHaveLength(2);
    const [spawnRow, gapRow] = rows as [(typeof rows)[0], (typeof rows)[0]];
    expect(spawnRow.reach).toBe("spawn");
    expect(spawnRow.fix).toContain("waves.ts");
    expect(gapRow.reach).toBe("gap");
    expect(gapRow.fix).toContain("interludes.ts");
    expect(spawnRow.fix).not.toBe(gapRow.fix);
  });

  it("finds the two pods today's content leaves in no wave", () => {
    // Not a claim that this stays true — the lane that authors demonstration
    // waves for `purge` and `ward` makes it false, and rightly edits this.
    // It is here so the tool's very first run is on record as having found
    // something, not zero.
    expect(unreachedMechanics().sort()).toEqual(["purge", "ward"]);
  });

  it("refuses to report a run-wide switch, rather than silently drop it", () => {
    expect(() => orphanReport(["fork"])).toThrow();
  });
});
