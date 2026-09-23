import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";
import type { Pose, PoseGroup } from "../src/pose-kit.js";
import { section } from "../src/states-section.js";
import { type FakeDom, type FakeEl, installDom } from "./fake-dom.js";

/**
 * The STATES room's own laziness, and the cache it leans on.
 *
 * The owner said the room opens slowly (`docs/queue.md`): every card ran its
 * pose's hand to a state and drew a frame in one synchronous pass, before
 * anything was on the page. `section` (`states-section.ts`) now fills a group's
 * row of cards only once the group scrolls into view or its heading is
 * clicked, and `poseArt`'s own build cache (`pose-art.ts`) keeps a pose's
 * hand from being walked twice for two callers that both draw it — the STATES
 * gallery and the ON THE FIELD row. Drawing a card still throws in this fake
 * DOM (`canvas.getContext` hands back no context), caught by `card`'s own
 * `is-broken` fallback — so what is provable here is only ever whether a
 * pose's hand was *walked*, counted on the fake pose below, never what the
 * canvas shows.
 *
 * One `installDom` for the whole file, not one per test: `section`'s watcher
 * is a module-level singleton, built once against whichever
 * `IntersectionObserver` is global the first time a section asks for one —
 * exactly as it would be in one real page's lifetime, and a second
 * `installDom` mid-file would leave it holding a class already torn down.
 */

let dom: FakeDom;
beforeAll(() => {
  dom = installDom();
});
afterAll(() => {
  dom.restore();
});

/** A pose that counts its own builds rather than walking a real hand — `calls` is shared by reference, so two `section`s of the same fake pose can be asked about it together. */
function fakePose(name: string, calls: { count: number }): Pose {
  return {
    name,
    note: "a stand-in pose, for a test that only asks whether it was built",
    crop: "full",
    build: () => {
      calls.count++;
      return createWorld(DEFAULT_CONFIG, 1);
    },
  };
}

function group(title: string, poses: Pose[]): PoseGroup {
  return { title, note: "a group for this test alone", poses };
}

describe("a STATES room's own section", () => {
  test("builds no pose until its section scrolls into view", () => {
    const calls = { count: 0 };
    const g = group("builds-on-entry", [fakePose("builds-on-entry · one", calls)]);
    const el = section(g) as unknown as FakeEl;
    const row = el.children[2];
    if (!row) throw new Error("section drew no row");
    expect(calls.count).toBe(0);
    expect(row.children.length).toBe(0);

    dom.intersect(el);
    expect(calls.count).toBe(1);
    expect(row.children.length).toBe(1);
  });

  test("fills on a click of its own heading, without waiting to be seen", () => {
    const calls = { count: 0 };
    const g = group("builds-on-click", [fakePose("builds-on-click · one", calls)]);
    const el = section(g) as unknown as FakeEl;
    const h2 = el.children[0];
    if (!h2) throw new Error("section drew no heading");
    h2.click();
    expect(calls.count).toBe(1);
    // And the scroll that follows finds it already filled.
    dom.intersect(el);
    expect(calls.count).toBe(1);
  });

  test("builds a shared pose once, across two of its own renders", () => {
    const calls = { count: 0 };
    const pose = fakePose("built-once · shared", calls);
    const first = section(group("first render", [pose])) as unknown as FakeEl;
    const second = section(group("second render", [pose])) as unknown as FakeEl;
    dom.intersect(first);
    dom.intersect(second);
    expect(calls.count).toBe(1);
  });

  test("names its group and each card where plain CSS can find them", () => {
    // `bun run shot --click` is `querySelectorAll`, and CSS cannot match a
    // heading by its text.
    const calls = { count: 0 };
    const el = section(
      group("THE GAUGE", [fakePose("THE GAUGE · jammed", calls)]),
    ) as unknown as FakeEl;
    expect(el.dataset.group).toBe("THE GAUGE");
    dom.intersect(el);
    expect(el.children[2]?.children[0]?.dataset.pose).toBe("THE GAUGE · jammed");
  });
});
