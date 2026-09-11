import { describe, expect, it } from "bun:test";
import { withoutPoseRow } from "../pose-row.js";

/**
 * The row a decided slot leaves in `SLOT_POSE`, and the edit that takes it
 * out with the slot. Line-level, so every other row stays where it was — the
 * director's own test reads that literal and would notice a reprint.
 */

const MAP = `const SLOT_POSE: Record<string, string> = {
  "ship:body": "SHIP · MEETING THE PANEL",
  "creature:torch": "TORCH · THE FALL",
  "torch:veil": "TORCH · THE FALL",
  "creature:tether": "TETHER · PULLED",
};
`;

describe("withoutPoseRow", () => {
  it("takes out the one row and nothing else", () => {
    expect(withoutPoseRow(MAP, "torch:veil")).toBe(
      `const SLOT_POSE: Record<string, string> = {
  "ship:body": "SHIP · MEETING THE PANEL",
  "creature:torch": "TORCH · THE FALL",
  "creature:tether": "TETHER · PULLED",
};
`,
    );
  });

  it("does not take a slot whose name is a prefix of another's", () => {
    const rest = withoutPoseRow(MAP, "creature:torch");
    expect(rest).toContain('"torch:veil"');
    expect(rest).not.toContain('"creature:torch"');
  });

  it("leaves a map that never named the slot exactly as it was", () => {
    expect(withoutPoseRow(MAP, "cannon:shot")).toBe(MAP);
  });
});
