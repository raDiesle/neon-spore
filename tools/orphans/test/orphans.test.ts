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

  it("points every spawn mechanic at a wave, THE GAUGE included", () => {
    // It used to point THE GAUGE at a table of gaps instead, and that class of
    // reach is gone: a round is a boss wave, so there is one place to put one.
    const rows = orphanReport(["purge", "gauge"] as MechanicId[]);
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.reach).toBe("spawn");
      expect(row.fix).toContain("waves.ts");
    }
  });

  it("finds nothing in today's content", () => {
    // It once found `purge` and `ward`, the two pod kinds that were built and
    // hung in no wave; THE PURGE and THE WARD were written for them and this
    // line was flipped in the same commit. It is deliberately an equality
    // against nothing rather than a claim about which two are missing: the
    // tool is worth running only while the catalogue is expected to be clean,
    // and a red line here is the whole point of the tool.
    expect(unreachedMechanics()).toEqual([]);
  });

  it("refuses to report a run-wide switch, rather than silently drop it", () => {
    expect(() => orphanReport(["briefing"])).toThrow();
  });
});
