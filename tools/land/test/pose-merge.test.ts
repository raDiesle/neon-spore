import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { withoutPoseRow } from "../../versus/pose-row.js";
import { mergePoses, POSE_FILE } from "../pose-merge.js";

/**
 * The director's `SLOT_POSE` rows merged when two lanes changed them in the
 * same hours. `pose-merge.ts` has the argument; every case is one a resolver
 * that quietly preferred a side would fail.
 */

function file(rows: Record<string, string>): string {
  const body = Object.entries(rows).map(([slot, pose]) => `  "${slot}": "${pose}",`);
  const map = body.length === 0 ? "{}" : `{\n${body.join("\n")}\n}`;
  return `import type { Pose } from "./pose-kit.js";\n\n/** The map. */\nconst SLOT_POSE: Record<string, string> = ${map};\n\nexport const X = 1;\n`;
}

const BASE = file({ "body:glow": "BODIES", "scuttle:hang": "HELD" });

describe("two lanes changing SLOT_POSE", () => {
  test("names the file the director keeps it in", async () => {
    const root = join(import.meta.dir, "..", "..", "..");
    expect(await Bun.file(join(root, POSE_FILE)).text()).toContain(
      "const SLOT_POSE: Record<string, string> =",
    );
  });

  test("one side drops a slot's row and the other adds one: both hold", () => {
    const trunk = withoutPoseRow(BASE, "scuttle:hang");
    const lane = file({ "body:glow": "BODIES", "scuttle:hang": "HELD", "cannon:shot": "FIRING" });
    expect(mergePoses(BASE, trunk, lane)).toBe(
      file({ "body:glow": "BODIES", "cannon:shot": "FIRING" }),
    );
  });

  test("both sides add a row: both rows, the trunk's first", () => {
    const trunk = file({ "body:glow": "BODIES", "scuttle:hang": "HELD", "a:one": "A" });
    const lane = file({ "body:glow": "BODIES", "scuttle:hang": "HELD", "b:two": "B" });
    expect(mergePoses(BASE, trunk, lane)).toBe(
      file({ "body:glow": "BODIES", "scuttle:hang": "HELD", "a:one": "A", "b:two": "B" }),
    );
  });

  test("the last row taken out on both sides leaves the map `{}`", () => {
    const one = file({ "body:glow": "BODIES" });
    expect(mergePoses(one, file({}), file({}))).toBe(file({}));
    expect(mergePoses(one, file({}), one)).toBe(file({}));
  });

  test("refuses when both sides give one slot different poses", () => {
    const trunk = file({ "body:glow": "BODIES", "scuttle:hang": "SWINGING" });
    const lane = file({ "body:glow": "BODIES", "scuttle:hang": "DROPPED" });
    expect(mergePoses(BASE, trunk, lane)).toBeNull();
  });

  test("refuses when one side drops a row the other re-posed", () => {
    const trunk = withoutPoseRow(BASE, "scuttle:hang");
    const lane = file({ "body:glow": "BODIES", "scuttle:hang": "DROPPED" });
    expect(mergePoses(BASE, trunk, lane)).toBeNull();
  });

  test("refuses when both sides rewrote what is outside the map", () => {
    const trunk = BASE.replace("/** The map. */", "/** Their words. */");
    const lane = BASE.replace("/** The map. */", "/** Mine. */");
    expect(mergePoses(BASE, trunk, lane)).toBeNull();
  });

  test("refuses a map holding anything but rows", () => {
    const lane = BASE.replace(`  "body:glow"`, `  // why\n  "body:glow"`);
    expect(mergePoses(BASE, BASE, lane)).toBeNull();
  });
});
