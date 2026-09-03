import { afterEach, describe, expect, test } from "bun:test";
import { buildPods, buildQueue } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, step, type TimedCommand } from "@neon-spore/sim";
import { workerWanted } from "../src/install.js";
import { createLink } from "../src/link.js";

/**
 * Playing alone must cost nothing: no socket, no room, no cache.
 *
 * The whole two-device layer is built on every run whether or not anybody is
 * in a room, because solo is meant to be the default and not a mode. That is
 * only safe while it is *inert* — and "inert" is the kind of claim that reads
 * true in the code and quietly stops being true when a timer, a ping or a
 * fingerprint gets moved above the check for a socket. So it is a test.
 */

const original = Object.getOwnPropertyDescriptor(globalThis, "WebSocket");

afterEach(() => {
  if (original) Object.defineProperty(globalThis, "WebSocket", original);
});

/** A `WebSocket` that fails the test by existing. */
function forbidSockets(): { count: () => number } {
  let made = 0;
  Object.defineProperty(globalThis, "WebSocket", {
    configurable: true,
    writable: true,
    value: class {
      constructor() {
        made++;
      }
    },
  });
  return { count: () => made };
}

describe("a link nobody joined", () => {
  test("opens no socket and reports nothing, however long it runs", () => {
    const sockets = forbidSockets();
    const cfg = { ...DEFAULT_CONFIG };
    const world = createWorld(cfg, 0, buildQueue(0, cfg.cols), buildPods(0, cfg.cols));
    let statuses = 0;
    let starts = 0;

    const link = createLink({
      cfg,
      world,
      buffer: { drain: (): TimedCommand[] => [] },
      onStart: () => {
        starts++;
      },
      onStatus: () => {
        statuses++;
      },
    });

    // Two thousand ticks is a good deal more than the run that would have
    // reached the first fingerprint exchange, the first clock ping and the
    // first confirmation, had any of them been reachable from here.
    for (let i = 0; i < 2000; i++) {
      expect(link.mayTick()).toBe(true);
      step(world, link.drain());
      link.checkpoint();
      link.frame(16);
    }

    expect(sockets.count()).toBe(0);
    expect(starts).toBe(0);
    // Not one status, not even a repeat of "solo": nothing about the link
    // changed, so nothing about it was said.
    expect(statuses).toBe(0);
    expect(world.tick).toBe(2000);

    const status = link.status();
    expect(status.state).toBe("solo");
    expect(status.room).toBe("");
    expect(status.player).toBe(0);
    // -1 is "never measured", and 0 is "no lay being carried". Both are the
    // shape of a link that was never asked to be one.
    expect(status.rttMs).toBe(-1);
    expect(status.delayMs).toBe(0);
    expect(status.desyncTick).toBeNull();
  });

  test("leaving a room it was never in stays quiet too", () => {
    const sockets = forbidSockets();
    const cfg = { ...DEFAULT_CONFIG };
    const world = createWorld(cfg, 0, buildQueue(0, cfg.cols), buildPods(0, cfg.cols));
    const link = createLink({
      cfg,
      world,
      buffer: { drain: (): TimedCommand[] => [] },
      onStart: () => {},
      onStatus: () => {},
    });
    link.leave();
    link.frame(16);
    expect(sockets.count()).toBe(0);
    expect(link.status().state).toBe("solo");
  });
});

/**
 * The other half of testing undisturbed: no service worker on a machine
 * somebody is testing on. A cache that answers when the server does not is how
 * a session reads a build that no longer exists.
 */
describe("workerWanted", () => {
  test("never on a local address", () => {
    for (const url of [
      "http://localhost:4173/",
      "http://localhost:3000/index.html",
      "http://localhost:4174/game?menu=1",
      "http://127.0.0.1:4173/",
      "http://localhost:4173/?room=ACDE",
    ]) {
      expect(workerWanted(url)).toBe(false);
    }
  });

  test("on the address the game is actually served from", () => {
    expect(workerWanted("https://neon-spore.example.workers.dev/")).toBe(true);
    expect(workerWanted("https://neon-spore.example.workers.dev/?room=ACDE")).toBe(true);
  });

  test("`?pwa` asks for one locally, for the case that wants to test it", () => {
    expect(workerWanted("http://localhost:4173/?pwa=1")).toBe(true);
    expect(workerWanted("http://localhost:4173/?pwa")).toBe(true);
  });
});
