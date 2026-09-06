import { describe, expect, it } from "bun:test";
import { medianOf, readout } from "../src/perf-page.js";
import { type PhoneCost, perfRequested, WAVE_COUNT, waveName } from "../src/perf-sweep.js";

/**
 * The two halves of `?perf=1` that do not need a phone: whether the flag is on,
 * and what the readout says.
 *
 * The sweep itself is a browser measurement and cannot be asserted here — what
 * can is that the page it draws is the one somebody photographs, and that its
 * header does not quietly stop saying the thing that makes a phone run
 * meaningful: no throttle, so it is compared against other phone runs and never
 * against `tools/perf/baseline.json` (`docs/performance.md`).
 */

function cost(wave: number, name: string, typical: number, p90: number): PhoneCost {
  return { wave, name, bodies: 3, typical, mean: typical, p90, jitter: 0.05 };
}

describe("?perf=1", () => {
  it("is off unless asked for, and 0 turns it off", () => {
    expect(perfRequested("http://localhost:4173/")).toBe(false);
    expect(perfRequested("http://localhost:4173/?perf=0")).toBe(false);
    expect(perfRequested("http://localhost:4173/?perf=1")).toBe(true);
    // The flag's presence is the ask, the way `?raster` reads it.
    expect(perfRequested("http://localhost:4173/?play=1&perf")).toBe(true);
  });

  it("names every wave the sweep will walk", () => {
    expect(WAVE_COUNT).toBeGreaterThan(0);
    expect(waveName(0)).toBeTruthy();
    expect(waveName(WAVE_COUNT + 100)).toBe(`WAVE ${WAVE_COUNT + 101}`);
  });
});

describe("the readout", () => {
  const rows = [cost(1, "ALTERNATING", 3.2, 4.1), cost(2, "THE GHOST", 9.4, 11.2)];

  it("says the run carried no throttle", () => {
    expect(readout(rows, 2, "390x844 dpr 3")).toContain("no throttle");
  });

  it("leads with the median and the worst wave", () => {
    const text = readout(rows, 2, "390x844 dpr 3");
    expect(text).toContain("median  9.40 ms");
    expect(text).toContain("worst   THE GHOST at 11.20 ms");
  });

  it("says how far it has got while it is still going", () => {
    expect(readout(rows.slice(0, 1), 47, "phone")).toContain("measuring 1 of 47");
    expect(readout(rows, 2, "phone")).toContain("2 waves");
  });

  it("carries a line per wave, with the name and both timings", () => {
    const lines = readout(rows, 2, "phone").split("\n");
    const ghost = lines.find((l) => l.startsWith("  2  THE GHOST"));
    expect(ghost).toBeDefined();
    expect(ghost).toContain("9.40");
    expect(ghost).toContain("11.20");
  });

  /** An empty run is what the page shows for the first seconds after it opens. */
  it("draws before a single wave has been measured", () => {
    expect(() => readout([], 47, "phone")).not.toThrow();
    expect(medianOf([])).toBe(0);
  });
});
