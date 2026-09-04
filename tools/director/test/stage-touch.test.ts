import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { controlSetForWave } from "@neon-spore/content";
import { computeLayout, type ViewRole } from "@neon-spore/render";
import {
  briefingHolds,
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  mazeRound,
  PAIR_ON,
  readyHoldTicks,
  seatReady,
  startWave,
  step,
  type TimedCommand,
} from "@neon-spore/sim";
import { bindStageTouch, pointerSeat } from "../src/stage-touch.js";

/**
 * Split out of `stage.test.ts`, which held this beside two unrelated subjects
 * and installed a fake `window` on `globalThis` inside a helper without ever
 * removing it. `bun test` runs every file in one process, so every file loaded
 * after it inherited that window. It goes up in `beforeAll` and comes down in
 * `afterAll` here.
 *
 * `bindStageTouch` binds the press on the canvas and the release on the window,
 * and both have to reach the same `fire`, so the stub window forwards to
 * whichever map the current stub canvas is holding.
 */

type WindowListener = (e: unknown) => void;
let windowOn = new Map<string, WindowListener[]>();
let hadWindow: unknown;

beforeAll(() => {
  const g = globalThis as { window?: unknown };
  hadWindow = g.window;
  g.window = {
    addEventListener: (type: string, fn: WindowListener): void => {
      const list = windowOn.get(type) ?? [];
      list.push(fn);
      windowOn.set(type, list);
    },
  };
});

afterAll(() => {
  const g = globalThis as { window?: unknown };
  if (hadWindow === undefined) delete g.window;
  else g.window = hadWindow;
});

/**
 * THE STAGE IS THE BUTTON: A HOLD FILLS THE GATE, A TAP STILL STEPS THE CARD.
 *
 * `bindStageTouch`'s own `pointerdown`/`pointerup` pair now answers the guide
 * the way `apps/game/src/briefing.ts` answers it on the phone — a hold fills
 * the ready circles (`ready-circles.ts`), and letting go before READY empties
 * them. Two landings once disagreed here without either noticing: one made
 * `test` step a card through two presses, the other made the gate a hold —
 * and because each was tested against its own stub world, a single director
 * press satisfied the gate outright and the circles were never seen. See the
 * commit that rewrote this block for the fix and the two-surfaces failure.
 *
 * The stepping stays, because the reason it exists stays: a phone only ever
 * holds one seat, `test` holds both, and reading each half in turn is still
 * worth doing at one desk. It no longer gates the fill, though — a release
 * that did not reach READY is what steps `test` onward, so holding straight
 * from the very first press still opens the gate, and stepping through both
 * halves first is a choice, not a toll.
 *
 * `push` here plays the sim's own dispatch for real, through `step()`
 * (`packages/sim/src/step.ts`), rather than the shortcut `ackBriefing` gives a
 * caller with no thumbs — the whole point of this block is that a hold has to
 * take real ticks, and `ackBriefing` would paper over exactly the bug that got
 * past review once already.
 */
describe("bindStageTouch answers the guide with a hold, and a tap with a step", () => {
  const VIEWPORT = { width: 400, height: 800, dpr: 1 };
  const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON };
  // A single creature keeps this to exactly two cards due: "opening" (every
  // first wave) and "slick" (what the queue actually contains) — enough to
  // prove a card that opens right behind the one just dismissed starts its
  // own step over from player one, not from wherever the last card left off.
  const queue = [{ beat: 0, col: 0, kind: "slick" as const, color: null }];

  type Listener = (e: unknown) => void;

  function stubCanvas() {
    const on = new Map<string, Listener[]>();
    const add =
      (map: Map<string, Listener[]>) =>
      (type: string, fn: Listener): void => {
        const list = map.get(type) ?? [];
        list.push(fn);
        map.set(type, list);
      };
    // The window stub above forwards here, so a release reaches the same
    // listeners the press was bound into.
    windowOn = on as Map<string, WindowListener[]>;
    return {
      canvas: {
        addEventListener: add(on),
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: VIEWPORT.width,
          height: VIEWPORT.height,
        }),
      } as unknown as HTMLCanvasElement,
      fire(type: string, e: unknown): void {
        for (const fn of on.get(type) ?? []) fn(e);
      },
    };
  }

  function armed(role: ViewRole) {
    const world = createWorld(cfg, 0);
    // A guide as well as an introduction, because the stepping under test is
    // the guide's: the introduction is the same on both screens and takes one
    // press whatever the role.
    startWave(world, 0, queue, [], null, true);
    let cardStepAt: 0 | 1 | 2 = 0;
    const sent: { player: 1 | 2; command: Command }[] = [];
    let pending: TimedCommand[] = [];
    const stub = stubCanvas();
    bindStageTouch({
      canvas: stub.canvas,
      layout: () => computeLayout(VIEWPORT, cfg, role),
      field: () => ({
        creatures: world.creatures,
        cannonCol: world.cannonCol,
        shieldCol: world.shieldCol,
        beatPhase: 0,
        seat: pointerSeat(role),
        cfg,
        maze: mazeRound(world),
        warden: world.boss?.kind === "warden" ? world.boss : null,
        controls: controlSetForWave(world.wave),
      }),
      push: (player, command) => {
        sent.push({ player, command });
        pending.push({ tick: world.tick, player, command });
      },
      world: () => world,
      role: () => role,
      cardStep: () => cardStepAt,
      setCardStep: (s) => {
        cardStepAt = s;
      },
    });
    const layout = computeLayout(VIEWPORT, cfg, role);
    // Real ticks, through the sim's own `step()` — a `brief` only ever fills
    // for as long as `stepReady` has actually run, and a stub that acked it
    // outright would hide the very bug this file exists to catch.
    const tick = (n = 1): void => {
      for (let i = 0; i < n; i++) {
        step(world, pending);
        pending = [];
      }
    };
    const down = (): void =>
      stub.fire("pointerdown", {
        pointerId: 1,
        clientX: VIEWPORT.width / 2,
        clientY: layout.cannonStrip.y,
        preventDefault: () => {},
      });
    const up = (): void => {
      stub.fire("pointerup", { pointerId: 1 });
      tick(); // the release's own `on: false` has to reach the sim too
    };
    /** A tap: down, one tick, straight back up. Never enough to fill a circle. */
    const tap = (): void => {
      down();
      tick();
      up();
    };
    /** Down, held for a full gate's worth of real ticks, then let go. */
    const hold = (): void => {
      down();
      tick(readyHoldTicks(cfg));
      up();
    };
    return { tap, down, up, hold, tick, sent, world, step: () => cardStepAt };
  }

  it("a tap steps `test` through player one's half, then two's, filling neither circle", () => {
    const s = armed("test");
    s.tap(); // the introduction, which is not stepped
    s.sent.length = 0;
    s.tap();
    expect(s.step()).toBe(1);
    s.tap();
    expect(s.step()).toBe(2);
    expect(briefingHolds(s.world)).toBe(true);
    expect(seatReady(s.world, 1)).toBe(false);
    expect(seatReady(s.world, 2)).toBe(false);
  });

  it("a hold from the very first press fills both circles and opens the gate — stepping is never a toll", () => {
    const s = armed("test");
    s.tap(); // the introduction
    s.sent.length = 0;
    s.down();
    // Both circles fill in lockstep in `test`, so they land on `full` on the
    // very same tick — one short of it, neither has latched READY yet.
    s.tick(readyHoldTicks(cfg) - 1);
    expect(seatReady(s.world, 1)).toBe(false);
    expect(briefingHolds(s.world)).toBe(true);
    s.tick(1); // the tick both circles complete on together
    expect(briefingHolds(s.world)).toBe(false);
    s.up(); // the gate is already open; letting go now reaches nobody's fill
  });

  it("letting go before READY empties the circle instead of latching it", () => {
    const s = armed("test");
    s.tap(); // the introduction
    s.down();
    s.tick(1); // some fill, nowhere near a full gate
    s.up();
    expect(seatReady(s.world, 1)).toBe(false);
    expect(seatReady(s.world, 2)).toBe(false);
    expect(briefingHolds(s.world)).toBe(true);
    expect(s.step()).toBe(1); // a release that did not fill it still steps `test`
  });

  it("only a hold that opens the gate lets the next press reach the cannon", () => {
    const s = armed("test");
    s.tap(); // the introduction
    s.hold(); // the guide, filled for real
    expect(briefingHolds(s.world)).toBe(false);
    s.sent.length = 0;

    s.tap();
    expect(s.sent).toEqual([
      { player: 1, command: { kind: "cannonCol", col: expect.any(Number) } },
    ]);
  });

  it("a hold in a single seat's own screen (p1/p2) fills only that seat, unstepped", () => {
    const s = armed("p1");
    s.tap(); // the introduction — one press, both seats ack (never stepped)
    s.sent.length = 0;
    s.hold();
    expect(seatReady(s.world, 1)).toBe(true);
    expect(seatReady(s.world, 2)).toBe(false);
    // `cardStep` never left 0 — `role() !== "test"` never steps at all.
    expect(s.step()).toBe(0);
  });
});
