import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  ANTIPHON_SHIP,
  type AntiphonState,
  antiphonBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import type { TextBox } from "./canvas-stub.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * The states `antiphon-frame.test.ts` and `antiphon-rail-frame.test.ts` both
 * set the body to — bare, an organ or a rail grown onto it, a ship named —
 * and the one way both files turn a `World` into a canvas's own text. Split
 * out so the two pages, each already at the 250-line ceiling on its own
 * tests, do not also carry two copies of this.
 */

export const TPB = ticksPerBeat(CFG);

/** A world with the body up, stepped enough beats that every `*Beat` set in the past is one it has seen. */
export function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("antiphon");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.antiphonOutBeats + 2); i++) step(world, []);
  return world;
}

/** The body bare: nothing standing, nothing on the rail, no pit. */
export function bare(world: World): AntiphonState {
  const s = antiphonBoss(world);
  if (s === null) throw new Error("the antiphon wave grew no body");
  s.organs = [];
  s.rail = [];
  s.pits = [];
  s.extra = 0;
  s.cycleBeat = world.beat;
  s.stillBeat = -1;
  s.downBeat = -1;
  s.turnTicks = 0;
  s.heldP1 = false;
  s.heldP2 = false;
  return s;
}

/** One organ grown over column 4, red, on a rail of three. */
export function grown(world: World, shape = 1): AntiphonState {
  const s = bare(world);
  s.organs = [{ shape, col: 4, color: "red", grownBeat: world.beat - CFG.antiphonGrowBeats }];
  s.rail = [
    { shape: 0, col: 2, color: "cyan" },
    { shape, col: 4, color: "red" },
    { shape: 3, col: 6, color: "red" },
  ];
  return s;
}

/** Their own ship, on a rail of hulls. */
export function ship(world: World): AntiphonState {
  const s = grown(world, ANTIPHON_SHIP);
  for (const c of s.rail) c.shape = ANTIPHON_SHIP;
  s.pits = [0, 5, 9, 12, 2, 7];
  return s;
}

/** The right ship was fired a beat ago. */
export function down(world: World): AntiphonState {
  const s = ship(world);
  s.organs = [];
  s.rail = [];
  s.downBeat = world.beat - 1;
  return s;
}

export function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
): { calls: number; text: string; words: string[] } {
  const log: string[] = [];
  const texts: TextBox[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
      c.texts = texts;
    },
  });
  return { calls: ctx.calls, text: log.join("|"), words: texts.map((t) => t.text) };
}

export const turnWord = (words: string[]): boolean => words.some((w) => w.includes("TURN"));
export const pullWord = (words: string[]): string[] => words.filter((w) => w.includes("PULL"));

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, with the body bare and then set as `arrange` says. */
export function frame(
  role: ViewRole,
  arrange: (world: World) => void,
): { calls: number; text: string; words: string[] } {
  const world = hung();
  bare(world);
  arrange(world);
  return drawn(world, role, 9);
}
