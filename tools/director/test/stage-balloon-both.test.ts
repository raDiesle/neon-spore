import { describe, expect, it } from "bun:test";
import type { ViewRole } from "@neon-spore/render";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { balloonBothHands } from "../src/stage-balloon-both.js";

/**
 * **One mouse, both of THE BALLOON's handles** — the desk's exception, and the
 * one place the editor is deliberately not the phone.
 *
 * The creature only gives while *both* sides are taut at the same instant
 * (`sim/balloon-pull.ts`), and a stage has one pointer belonging to player 1.
 * So the one creature in the game built out of two seats was the one nobody
 * could watch work here. What is checked below is both halves of the fix: that
 * the mirror is made only under TEST and only for these two targets, and that
 * the pair of commands it produces actually reaches a rub when the simulation
 * is handed them.
 */

const cfg = DEFAULT_CONFIG;
const FAR = cfg.balloonTautMilli + 400;

/** A world with one balloon on the field, stepped until it has arrived and
 * finished swelling — nothing gives while a body is still filling. */
function withBalloon() {
  const world = createWorld(cfg, 1, [{ beat: 0, col: 3, kind: "balloon", color: null }]);
  for (let t = 0; t < 400 && world.creatures.length === 0; t++) step(world, []);
  if (world.creatures.length === 0) throw new Error("no balloon ever arrived");
  return world;
}

const pull = (target: "balloonLeft" | "balloonRight", fromMilli: number, id: number): Command => ({
  kind: "drag",
  target,
  on: true,
  fromMilli,
  fromYMilli: 0,
  id,
});

describe("the mirror is made under TEST and nowhere else", () => {
  it("answers a left handle with the right one, carried the other way", () => {
    const both = balloonBothHands("test", 1, pull("balloonLeft", -FAR, 7));
    expect(both?.player).toBe(2);
    expect(both?.command).toMatchObject({ target: "balloonRight", fromMilli: FAR, id: 7 });
  });

  it("answers a right handle with the left one, and keeps the body's id", () => {
    const both = balloonBothHands("test", 2, pull("balloonRight", FAR, 9));
    expect(both?.player).toBe(1);
    expect(both?.command).toMatchObject({ target: "balloonLeft", fromMilli: -FAR, id: 9 });
  });

  it("mirrors the grab and the release too, so no hand is left behind", () => {
    const grab = balloonBothHands("test", 1, pull("balloonLeft", 0, 3));
    expect(grab?.command).toMatchObject({ target: "balloonRight", fromMilli: 0, on: true });
    const off: Command = { kind: "drag", target: "balloonLeft", on: false, fromMilli: 0, id: 3 };
    expect(balloonBothHands("test", 1, off)?.command).toMatchObject({
      target: "balloonRight",
      on: false,
    });
  });

  it("says nothing on a phone's own role", () => {
    for (const role of ["p1", "p2"] as ViewRole[]) {
      expect(balloonBothHands(role, 1, pull("balloonLeft", -FAR, 1))).toBeNull();
    }
  });

  it("says nothing about any other handle, or about anything that is not a drag", () => {
    const cord: Command = {
      kind: "drag",
      target: "lidString",
      on: true,
      fromMilli: -FAR,
      fromYMilli: 0,
      id: 1,
    };
    expect(balloonBothHands("test", 1, cord)).toBeNull();
    expect(balloonBothHands("test", 1, { kind: "guard" })).toBeNull();
  });
});

describe("the pair it makes is a rub the simulation actually answers", () => {
  /** One hand's drag, and the mirror of it, on the same tick. */
  function carried(role: ViewRole, world: ReturnType<typeof withBalloon>): TimedCommand[] {
    const id = world.creatures[0]?.id ?? 0;
    const command = pull("balloonLeft", -FAR, id);
    const both = balloonBothHands(role, 1, command);
    return [
      { tick: world.tick, player: 1, command },
      ...(both ? [{ tick: world.tick, player: both.player, command: both.command }] : []),
    ];
  }

  it("splits the body under TEST, once both hands have held taut for the hold", () => {
    // The mirrored hand is sent every tick, the way the rig repeats a drag,
    // and the body gives `balloonHoldBeats` after the two first met taut —
    // not on that tick (`sim/balloon-rub.ts`).
    const world = withBalloon();
    const hold = world.cfg.balloonHoldBeats * ticksPerBeat(world.cfg);
    const seen: string[] = [];
    for (let i = 0; i <= hold; i++) {
      step(world, carried("test", world));
      for (const e of world.events) seen.push(e.type);
    }
    expect(seen).toContain("balloonSplit");
  });

  it("leaves it alone under p1, where one hand is one hand", () => {
    const world = withBalloon();
    const seen: string[] = [];
    // Long enough that a rub deferred a tick or two would still show up: what
    // is being held is that one hand never gives, not that it is slow.
    for (let i = 0; i < 6; i++) {
      step(world, carried("p1", world));
      for (const e of world.events) seen.push(e.type);
    }
    expect(seen).not.toContain("balloonSplit");
  });
});
