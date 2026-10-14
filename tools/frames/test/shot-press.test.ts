import { describe, expect, it } from "bun:test";
import type { Page } from "playwright-core";
import { readShotFlags } from "../shot-flags.js";
import { parsePress } from "../shot-press.js";
import { reachState } from "../shot-state.js";

/**
 * `bun run shot --press`: a thumb held on a point of an element, and the
 * click after it (`shot-press.ts`). The argument is read without a browser,
 * and the order of what is pressed is held against a page that records it.
 */

describe("parsePress", () => {
  it("reads the point, the hold and the wait after", () => {
    expect(parsePress("#stage canvas@0.5,0.25,1200,3000")).toEqual({
      selector: "#stage canvas",
      fx: 0.5,
      fy: 0.25,
      ms: 1200,
      after: 3000,
    });
  });

  it("holds for a second and waits for nothing when only the point is said", () => {
    expect(parsePress("canvas@0,1")).toMatchObject({ ms: 1000, after: 0 });
  });

  it("splits on the last @, so a selector may carry one", () => {
    expect(parsePress('[data-x="a@b"]@0.5,0.5').selector).toBe('[data-x="a@b"]');
  });

  it.each([
    "canvas",
    "canvas@0.5",
    "canvas@1.5,0.5",
    "canvas@0.5,0.5,x",
    "@0.5,0.5",
    "c@0,0,1,2,3",
  ])("refuses %s, which names no point on the element", (value) => {
    expect(() => parsePress(value)).toThrow("--press wants");
  });

  it("is read off the command line with the click after it", () => {
    const flags = readShotFlags([
      "#stage",
      "out.png",
      "--press",
      "canvas@0.5,0.5",
      "--then-click",
      "#stills",
    ]);
    expect(flags.reach.press?.selector).toBe("canvas");
    expect(flags.reach.thenClick).toBe("#stills");
  });
});

/** A page that remembers, in order, every mouse move, press and click it was asked for. */
function recorder(): { page: Page; did: string[] } {
  const did: string[] = [];
  const box = { x: 100, y: 200, width: 40, height: 80 };
  const page = {
    locator: (sel: string) => ({
      first: () => ({
        count: async () => 1,
        scrollIntoViewIfNeeded: async () => {},
        boundingBox: async () => (sel === "none" ? null : box),
      }),
    }),
    mouse: {
      move: async (x: number, y: number) => {
        did.push(`move ${x},${y}`);
      },
      down: async () => {
        did.push("down");
      },
      up: async () => {
        did.push("up");
      },
    },
    waitForTimeout: async (ms: number) => {
      did.push(`wait ${ms}`);
    },
    evaluate: async (_fn: unknown, arg: { sel: string }) => {
      did.push(`click ${arg.sel}`);
      return true;
    },
  };
  return { page: page as unknown as Page, did };
}

describe("reaching a state through a held press", () => {
  it("presses at the point of the box, holds, lifts, waits, then clicks", async () => {
    const { page, did } = recorder();
    const press = parsePress("canvas@0.5,0.25,800,300");
    await reachState(page, { click: "#try", press, thenClick: "#stills" });
    expect(did).toEqual([
      "click #try",
      "wait 600",
      "move 120,220",
      "down",
      "wait 800",
      "up",
      "wait 300",
      "click #stills",
      "wait 600",
    ]);
  });

  it("says so when there is nothing to hold", async () => {
    const { page } = recorder();
    await expect(reachState(page, { press: parsePress("none@0.5,0.5") })).rejects.toThrow(
      "--press",
    );
  });
});
