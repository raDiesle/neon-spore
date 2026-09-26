import { describe, expect, it } from "bun:test";
import { instarBetween } from "../src/instar-between.js";
import { POSES } from "../src/instar-poses.js";

/**
 * **A pose change is drawn, not blended** (`instar-between.ts`): it starts and
 * ends exactly on its two poses, so the marks glow where they always did, and
 * between them the parts move in their own order — the wings gathered, the
 * head ahead of the body, the eyes shut through a turn.
 */

const { breath, rear, moult, bare } = POSES;

describe("THE INSTAR between two poses", () => {
  it("is exactly the pose it came from at the start and the new one at the end", () => {
    expect(instarBetween(breath, rear, 0)).toEqual(breath);
    const end = instarBetween(breath, rear, 1);
    for (const k of Object.keys(rear) as (keyof typeof rear)[])
      expect(end[k]).toBeCloseTo(rear[k], 9);
  });

  it("gathers its wings through the middle of the change", () => {
    const mid = instarBetween(breath, rear, 0.5).wing;
    expect(mid).toBeLessThan(Math.min(breath.wing, rear.wing));
  });

  it("moves the head ahead of the body", () => {
    const f = instarBetween(breath, moult, 0.4);
    const head = (f.headY - breath.headY) / (moult.headY - breath.headY);
    const body = (f.side - breath.side) / (moult.side - breath.side);
    expect(head).toBeGreaterThan(body);
  });

  it("shuts its eyes through a turn, and not through a change that stays face-on", () => {
    const turned = instarBetween(breath, moult, 0.45);
    const even = breath.eye + (moult.eye - breath.eye) * 0.5;
    expect(turned.eye).toBeLessThan(even * 0.5);
    expect(instarBetween(moult, bare, 0.45).eye).toBeGreaterThan(
      Math.min(moult.eye, bare.eye) * 0.5,
    );
  });
});
