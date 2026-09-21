import { describe, expect, test } from "bun:test";
import { bindAwake, type ScreenLock, type ScreenLocks } from "../src/awake.js";
import { createRunState } from "../src/run-state.js";

/**
 * The screen staying on for as long as the world ticks.
 *
 * None of this can be seen in `bun test` by looking at a phone, and all of it
 * is a question about *when the lock is asked for* rather than about the lock
 * — so the browser's half is the four lines of it this file uses, handed in.
 * The one that is easy to get wrong is the third test: the browser takes the
 * lock away while the tab is hidden and does not give it back.
 */

class FakeLock implements ScreenLock {
  released = false;
  async release(): Promise<void> {
    this.released = true;
  }
}

interface Fake extends ScreenLocks {
  made: FakeLock[];
}

/** A browser that hands one out every time it is asked. */
function fakeLocks(): Fake {
  const made: FakeLock[] = [];
  return {
    made,
    request: async () => {
      const lock = new FakeLock();
      made.push(lock);
      return lock;
    },
  };
}

/** Long enough for the chain inside `bindAwake` to reach its next step. */
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

describe("keeping the screen on", () => {
  test("the lock follows the run, and nothing else decides", async () => {
    const run = createRunState();
    const locks = fakeLocks();
    run.hold("menu", true);
    const awake = bindAwake(run, locks);
    await awake.settled();
    // The menu is up: there is nothing to keep a screen on for.
    expect(locks.made).toHaveLength(0);
    expect(awake.held()).toBe(false);

    run.release();
    await awake.settled();
    expect(locks.made).toHaveLength(1);
    expect(awake.held()).toBe(true);

    run.hold("hand", true);
    await awake.settled();
    expect(locks.made[0]?.released).toBe(true);
    expect(awake.held()).toBe(false);
  });

  test("a road that puts no hold down still asks", async () => {
    // `?play=1` goes straight to the field. A lock taken only on the first
    // change of answer would never be taken there at all.
    const run = createRunState();
    const locks = fakeLocks();
    const awake = bindAwake(run, locks);
    await awake.settled();
    expect(awake.held()).toBe(true);
  });

  test("coming back to the tab asks again", async () => {
    const run = createRunState();
    const locks = fakeLocks();
    const awake = bindAwake(run, locks);
    await awake.settled();
    const first = locks.made[0] as FakeLock;

    // What the browser does on its own, and the whole of the bug: the lock is
    // gone and no event gives it back.
    first.released = true;
    run.hold("hidden", true);
    await awake.settled();
    run.hold("hidden", false);
    await awake.settled();

    expect(locks.made).toHaveLength(2);
    expect(locks.made[1]).not.toBe(first);
    expect(awake.held()).toBe(true);
  });

  test("a deliberate pause is not undone by the tab coming back", async () => {
    const run = createRunState();
    const locks = fakeLocks();
    const awake = bindAwake(run, locks);
    await awake.settled();
    run.hold("hand", true);
    run.hold("hidden", true);
    run.hold("hidden", false);
    await awake.settled();
    // One lock, taken at the start and let go by the thumb. The tab coming
    // back changed no answer, so it asked for nothing.
    expect(locks.made).toHaveLength(1);
    expect(awake.held()).toBe(false);
  });

  test("a phone that refuses is not a reason for the run not to start", async () => {
    const run = createRunState();
    const refuses: ScreenLocks = {
      request: async () => {
        throw new Error("battery saver");
      },
    };
    const awake = bindAwake(run, refuses);
    await awake.settled();
    expect(awake.held()).toBe(false);
    // And the holds go on working over the top of it.
    run.hold("menu", true);
    run.hold("menu", false);
    await awake.settled();
    expect(awake.held()).toBe(false);
  });

  test("a browser without the API binds to nothing at all", async () => {
    const run = createRunState();
    const awake = bindAwake(run, null);
    run.hold("menu", true);
    run.hold("menu", false);
    await awake.settled();
    expect(awake.held()).toBe(false);
  });

  test("a pause that overtakes a request in flight leaves no lock held", async () => {
    const run = createRunState();
    const asked: ((lock: ScreenLock) => void)[] = [];
    const slow: ScreenLocks = {
      request: () => new Promise<ScreenLock>((resolve) => asked.push(resolve)),
    };
    run.hold("menu", true);
    const awake = bindAwake(run, slow);
    run.release();
    await tick();
    expect(asked).toHaveLength(1);

    // The request is in flight and the thumb arrives before the browser
    // answers. Without the chain the release would find nothing to let go of
    // and the phone would be left holding a lock nobody had asked for.
    run.hold("hand", true);
    const lock = new FakeLock();
    asked[0]?.(lock);
    await awake.settled();

    expect(awake.held()).toBe(false);
    expect(lock.released).toBe(true);
  });
});
