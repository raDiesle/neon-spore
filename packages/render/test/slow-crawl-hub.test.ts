import { describe, expect, it } from "bun:test";
import { capsule } from "../src/slow-boss-aim-d.js";
import { crawlHub, crawlSkin } from "../src/slow-crawl.js";

/**
 * **Where THE SLOW's crawl gathers** (`render/src/slow-crawl.ts`): on a
 * head's centre, and on the middle of a body alike at both ends — THE FLUE's
 * light stood round the flue's left end until the owner, 7 October 2026:
 * *the center of slow visual should be in the center of boss flue*.
 */

describe("THE SLOW's crawl", () => {
  it("gathers on the middle of a capsule, not on its first end", () => {
    const flue = capsule({ x: 200, y: 300, rx: 180, ry: 40 });
    const hub = crawlHub(flue);
    expect(hub.x).toBeCloseTo(200);
    expect(hub.y).toBeCloseTo(300);
    expect(hub.h).toBeCloseTo(140);
    const tall = crawlHub(capsule({ x: 100, y: 200, rx: 30, ry: 90 }));
    expect(tall).toMatchObject({ x: 100, y: 200 });
    expect(tall.uy).toBeCloseTo(1);
  });

  it("gathers on a head's centre, where the head is not the whole body", () => {
    const head = { x: 50, y: 60, r: 20, ax: 50, ay: 0 };
    expect(crawlHub(head)).toMatchObject({ x: 50, y: 60, h: 0 });
    expect(crawlSkin(crawlHub(head), 20, 0, 1)).toBe(20);
  });

  it("stops the rays at the capsule's skin, flank and round end alike", () => {
    const hub = crawlHub(capsule({ x: 0, y: 0, rx: 180, ry: 40 }));
    // Off the flank, straight up or down.
    expect(crawlSkin(hub, 40, 0, 1)).toBeCloseTo(40);
    // Along the axis, out of the round end.
    expect(crawlSkin(hub, 40, 1, 0)).toBeCloseTo(180);
    expect(crawlSkin(hub, 40, -1, 0)).toBeCloseTo(180);
    // Every ray lands on the skin: distance to the axis's segment is the radius.
    for (let k = 0; k < 36; k++) {
      const a = (k / 36) * Math.PI * 2;
      const t = crawlSkin(hub, 40, Math.cos(a), Math.sin(a));
      const px = Math.cos(a) * t;
      const py = Math.sin(a) * t;
      const along = Math.max(-140, Math.min(140, px));
      expect(Math.hypot(px - along, py)).toBeCloseTo(40, 6);
    }
  });
});
