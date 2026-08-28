import { describe, expect, test } from "bun:test";
import { computeLayout, interludeControls } from "@neon-spore/render";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  type InterludeEntry,
  startInterlude,
} from "@neon-spore/sim";
import { bindStageInterlude } from "../src/stage-interlude.js";

/**
 * THE GAUGE'S SLABS ARE DRAWN BY THE DIRECTOR AND WERE ANSWERED BY NOBODY.
 *
 * The owner reported it as "i cannot test the gauge": a click on the valve did
 * nothing, because `stage-touch.ts` routes the canvas through `touchDown`,
 * which is handed a `Field` whose controls come from `controlSetForWave` — and
 * a round's own three slabs are in none of them. The keyboard had no valve or
 * call either, so there was no way into the round at all.
 *
 * The motion cannot be checked here and is not what this file is for:
 * `requestAnimationFrame` does not run in a backgrounded headless pane, which
 * is why the needle was never seen to move while this was written. What is
 * checkable, and is the whole of the defect, is that a press inside a slab
 * emits the round's own command for the right seat — so the test asks
 * `interludeControls` where the slabs are, exactly as the binding does, and
 * presses in the middle of each.
 */

type Listener = (e: unknown) => void;

/** The smallest canvas that can be bound to and pressed. */
function stubCanvas(width: number, height: number) {
  const on = new Map<string, Listener[]>();
  const add = (map: Map<string, Listener[]>) => (type: string, fn: Listener) => {
    const list = map.get(type) ?? [];
    list.push(fn);
    map.set(type, list);
  };
  // A lift is bound on the window rather than the canvas — a hand that leaves
  // the picture still has to let go — so the stub has to offer one, and both
  // sets of listeners share a map so `fire` reaches either.
  (globalThis as { window?: unknown }).window = { addEventListener: add(on) };
  return {
    canvas: {
      addEventListener: add(on),
      getBoundingClientRect: () => ({ left: 0, top: 0, width, height }),
    } as unknown as HTMLCanvasElement,
    fire(type: string, e: unknown): void {
      for (const fn of on.get(type) ?? []) fn(e);
    },
  };
}

const VIEWPORT = { width: 400, height: 800, dpr: 1 };
const GAUGE: InterludeEntry = { kind: "gauge" };

function armed(role: "test" | "p1" | "p2") {
  const cfg = { ...DEFAULT_CONFIG, interludes: true };
  const world = createWorld(cfg, 10);
  startInterlude(world, GAUGE, 10);
  const layout = computeLayout(VIEWPORT, cfg, role);
  const sent: { player: 1 | 2; command: Command }[] = [];
  const stub = stubCanvas(VIEWPORT.width, VIEWPORT.height);
  bindStageInterlude({
    canvas: stub.canvas,
    layout: () => layout,
    role: () => role,
    world: () => world,
    push: (player, command) => sent.push({ player, command }),
  });
  return { stub, sent, controls: interludeControls(layout, role), world };
}

/** A press in the middle of a slab, in the canvas's own coordinates. */
function press(
  stub: ReturnType<typeof stubCanvas>,
  slab: { x: number; y: number; w: number; h: number },
): void {
  stub.fire("pointerdown", {
    pointerId: 1,
    clientX: slab.x + slab.w / 2,
    clientY: slab.y + slab.h / 2,
  });
}

describe("the director answers a round's own controls", () => {
  test("the left slab turns the pilot's valve down", () => {
    const { stub, sent, controls } = armed("test");
    expect(controls.down).toBeTruthy();
    press(stub, controls.down!);
    expect(sent).toEqual([{ player: 1, command: { kind: "valve", on: true, dir: -1 } }]);
  });

  test("the right slab turns it up", () => {
    const { stub, sent, controls } = armed("test");
    press(stub, controls.up!);
    expect(sent).toEqual([{ player: 1, command: { kind: "valve", on: true, dir: 1 } }]);
  });

  // The call is the navigator's and the mouse is the pilot's hand, so this is
  // the one place the stage signs a press with the other seat — the same
  // choice `keys.ts` makes for `KeyG` and `KeyC`.
  test("the call slab is signed by the navigator, not by the hand pressing it", () => {
    const { stub, sent, controls } = armed("test");
    press(stub, controls.call!);
    expect(sent).toEqual([{ player: 2, command: { kind: "call" } }]);
  });

  test("letting go releases the valve, so the needle stops", () => {
    const { stub, sent, controls } = armed("test");
    press(stub, controls.down!);
    stub.fire("pointerup", { pointerId: 1 });
    expect(sent.at(-1)).toEqual({ player: 1, command: { kind: "valve", on: false, dir: -1 } });
  });

  // The whole point of the round is that the two screens are not the same one.
  test("a seat is offered only the slabs its own screen carries", () => {
    expect(interludeControls(computeLayout(VIEWPORT, DEFAULT_CONFIG, "p1"), "p1").call).toBeNull();
    expect(interludeControls(computeLayout(VIEWPORT, DEFAULT_CONFIG, "p2"), "p2").up).toBeNull();
  });

  test("a press outside every slab says nothing", () => {
    const { stub, sent } = armed("test");
    stub.fire("pointerdown", { pointerId: 1, clientX: 2, clientY: 2 });
    expect(sent).toEqual([]);
  });

  // While a wave is running the round does not hold the world, and the same
  // canvas belongs to `stage-touch.ts`. The two are exclusive by state.
  test("nothing is sent when no round is open", () => {
    const cfg = { ...DEFAULT_CONFIG, interludes: true };
    const world = createWorld(cfg, 10);
    const layout = computeLayout(VIEWPORT, cfg, "test");
    const sent: unknown[] = [];
    const stub = stubCanvas(VIEWPORT.width, VIEWPORT.height);
    bindStageInterlude({
      canvas: stub.canvas,
      layout: () => layout,
      role: () => "test",
      world: () => world,
      push: (player, command) => sent.push({ player, command }),
    });
    const controls = interludeControls(layout, "test");
    press(stub, controls.down!);
    expect(sent).toEqual([]);
  });
});
