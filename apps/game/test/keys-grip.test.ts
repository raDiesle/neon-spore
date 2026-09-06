import { afterEach, describe, expect, it } from "bun:test";
import { controlSet, DEFAULT_CONTROL_SET_ID } from "@neon-spore/content";
import type { Layout } from "@neon-spore/render";
import {
  type Command,
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  wardenPullMilli,
  wardenTether,
} from "@neon-spore/sim";
import { bindKeys } from "../src/keys.js";
import { deskGrip } from "../src/keys-grip.js";

/**
 * THE PUSH at a desk, driven rather than read.
 *
 * The mechanic was reachable only with a pointer for as long as `G` was the
 * whole of the rig's hand: a keyboard could take hold of a rock and had no way
 * to carry it, so a headless check and the director's stage both saw half a
 * gesture. What has to hold here is the half a key cannot fake — a `drag` is
 * **cumulative from the grab**, so two presses the same way say two tiles and
 * not one twice (`sim/grip-push.ts`).
 */

interface Listeners {
  [type: string]: ((e: unknown) => void)[];
}

const real = (globalThis as { window?: unknown }).window;
afterEach(() => {
  (globalThis as { window?: unknown }).window = real;
});

/** `nearestHull` reads three fields and nothing else, so the rig hands it
 * three rather than a whole body it would have to keep in step with. */
const rock = (id: number, row: number): Creature =>
  ({ id, kind: "meteor", row }) as unknown as Creature;

/** THE WARDEN's line. A tether refuses a hand outright (`sim/grippable.ts`),
 * so the only thing the rig can do with one is pull it by its handle. */
const tether = (id: number): Creature => ({ id, kind: "tether", row: 1 }) as unknown as Creature;

function desk(creatures: readonly Creature[]) {
  const listeners: Listeners = {};
  (globalThis as { window?: unknown }).window = {
    addEventListener(type: string, fn: (e: unknown) => void) {
      listeners[type] ??= [];
      listeners[type].push(fn);
    },
  };
  const sent: { player: 1 | 2; command: Command }[] = [];
  bindKeys({
    buffer: {
      push(player: 1 | 2, command: Command) {
        sent.push({ player, command });
      },
    } as never,
    layout: () => ({ cols: DEFAULT_CONFIG.cols }) as Layout,
    cfg: DEFAULT_CONFIG,
    isOver: () => false,
    creatures: () => creatures,
    guideHolds: () => false,
    snakeHolds: () => false,
    onPauseToggle: () => {},
    onWaveStep: () => {},
    onGuideReplay: () => {},
    // The ordinary panel: the keyboard is gated by the wave's own control set
    // now (`content/src/control-sets-keys.ts`), and the grip and THE PUSH are
    // reachable from every one of them.
    controls: () => controlSet(DEFAULT_CONTROL_SET_ID),
  });
  const fire = (type: string, code: string): void => {
    for (const fn of listeners[type] ?? []) fn({ code, preventDefault() {} });
  };
  return {
    sent,
    down: (code: string) => fire("keydown", code),
    up: (code: string) => fire("keyup", code),
    /** Every carry sent, as the pair a reader of the wire would read. */
    drags: () =>
      sent
        .filter((c) => c.command.kind === "drag")
        .map((c) => c.command as { target: string; fromMilli: number; id?: number }),
  };
}

describe("carrying a body at a desk", () => {
  it("names the body G took hold of, and a distance from where it grabbed", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    expect(d.drags()).toEqual([
      {
        kind: "drag",
        target: "gripBody",
        on: true,
        fromMilli: DEFAULT_CONFIG.gripPushMilli,
        id: 7,
      },
    ] as never);
  });

  it("adds up, because a drag is cumulative and never a step", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    d.up("Period");
    d.down("Period");
    expect(d.drags().map((c) => c.fromMilli)).toEqual([
      DEFAULT_CONFIG.gripPushMilli,
      DEFAULT_CONFIG.gripPushMilli * 2,
    ]);
  });

  it("goes back the way it came, and through nought", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    d.up("Period");
    d.down("Comma");
    d.up("Comma");
    d.down("Comma");
    expect(d.drags().map((c) => c.fromMilli)).toEqual([
      DEFAULT_CONFIG.gripPushMilli,
      0,
      -DEFAULT_CONFIG.gripPushMilli,
    ]);
  });

  it("says nothing at all with no hand on anything", () => {
    const d = desk([]);
    d.down("Period");
    d.down("Comma");
    expect(d.drags()).toEqual([]);
    // And with G pressed over an empty field there is still nothing to carry.
    d.down("KeyG");
    d.down("Period");
    expect(d.drags()).toEqual([]);
  });

  it("forgets the distance when the hand comes off, so the next grab starts at nought", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    d.up("Period");
    d.up("KeyG");
    d.down("KeyG");
    d.down("Period");
    expect(d.drags().map((c) => c.fromMilli)).toEqual([
      DEFAULT_CONFIG.gripPushMilli,
      DEFAULT_CONFIG.gripPushMilli,
    ]);
  });

  it("carries as player 2, the seat whose hand the grip is", () => {
    const d = desk([rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    expect(d.sent.filter((c) => c.command.kind === "drag").every((c) => c.player === 2)).toBe(true);
  });
});

/**
 * THE WARDEN at a desk.
 *
 * `G` used to take hold of the tether itself, which is a creature no hand may
 * hold: the command was thrown away by `setGrip` and the key did nothing at
 * all on the one boss it mattered on. What the rope takes is the drag a
 * pointer sends, and it takes it **from player 1** — the seat that is the only
 * one allowed to pull (`sim/warden-rope.ts`).
 */
describe("pulling THE WARDEN's rope at a desk", () => {
  /** The rope's own messages, whose hand each one is included. */
  const ropes = (d: ReturnType<typeof desk>) =>
    d.sent
      .filter(
        (c) =>
          c.command.kind === "drag" && (c.command as { target: string }).target === "wardenTether",
      )
      .map((c) => ({
        player: c.player,
        on: (c.command as { on: boolean }).on,
        y: (c.command as { fromYMilli?: number }).fromYMilli ?? 0,
      }));

  it("grabs the rope rather than the body, and pulls it down a step a press", () => {
    const d = desk([tether(4), rock(7, 3)]);
    d.down("KeyG");
    d.down("Period");
    d.up("Period");
    d.down("Period");
    expect(ropes(d)).toEqual([
      { player: 1, on: true, y: 0 },
      { player: 1, on: true, y: DEFAULT_CONFIG.gripPushMilli },
      { player: 1, on: true, y: DEFAULT_CONFIG.gripPushMilli * 2 },
    ]);
    // And no hand on the tether: it is not a body a grip may name.
    expect(
      d.sent.some((c) => c.command.kind === "grip" && (c.command as { id: number }).id !== 0),
    ).toBe(false);
  });

  it("lets a step back out, and never above where the hand took it", () => {
    const d = desk([tether(4)]);
    d.down("KeyG");
    d.down("Comma");
    expect(ropes(d).map((r) => r.y)).toEqual([0, 0]);
  });

  it("goes slack when the hand lifts", () => {
    const d = desk([tether(4)]);
    d.down("KeyG");
    d.down("Period");
    d.up("KeyG");
    expect(ropes(d).at(-1)).toEqual({ player: 1, on: false, y: DEFAULT_CONFIG.gripPushMilli });
  });
});

/**
 * And the same thing against the boss itself, because the wire being right is
 * not the claim — the claim is that the gate opens. Seven presses is
 * `wardenTautMilli` at a `gripPushMilli` each, which is what a pair at a desk
 * has to do to hold the hatch wide.
 */
it("opens the hatch all the way, which is what the key never did", () => {
  const world = createWorld({ ...DEFAULT_CONFIG }, 1);
  startWave(world, 0, [], [], { kind: "warden" });
  for (let t = 0; t < 8 * ticksPerBeat(DEFAULT_CONFIG) && !wardenTether(world); t++)
    step(world, []);
  expect(wardenTether(world)).not.toBeNull();

  const rig = deskGrip(DEFAULT_CONFIG);
  const presses = [...rig.take(world.creatures, 2)];
  for (let i = 0; i < DEFAULT_CONFIG.wardenTautMilli / DEFAULT_CONFIG.gripPushMilli; i++) {
    presses.push(...rig.carry(1));
  }
  for (const p of presses) {
    step(world, [{ tick: world.tick, player: p.player, command: p.command } as TimedCommand]);
    step(world, []);
  }
  const boss = world.boss;
  expect(boss?.kind).toBe("warden");
  expect(boss?.kind === "warden" ? wardenPullMilli(world, boss) : 0).toBe(1000);
});
