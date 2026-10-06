import { DEFAULT_CONFIG } from "@neon-spore/sim";
import type { PressSpec } from "./spec.js";

/**
 * **SNAKE's hand on the body, written on the press line.**
 *
 * Past `snakeGorgeTiles` the jaws stick and the pilot prises them apart on the
 * head (`sim/snake-controls.ts`, `dragHeard`). It is not a button on anybody's
 * panel — it is a thumb on the body (`render/snake-grip.ts`) — so until 23
 * September 2026 it could not be sent from the command line, and the jaws
 * were only ever photographed shut. The navigator's tail, held up, was the
 * second hand until the owner took it out on 6 October 2026.
 *
 *   --press 700:1:snakeJaws            the jaws prised open, on the lift
 *
 * The prise is refused by the round outside the grip that has it, which a
 * capture has to reach first: a body grown past the tiles, driven or posed
 * with `--boss grow=…`. A prise on a body still in `crawl` is dropped, the
 * same as it is from a thumb, and the run's `unheard:` line names it.
 *
 * **Play begins at `world.tick` 600 on the first round**, after the morph; a
 * press before it is dropped, turns included. Left alone the body walks into
 * the enemy above it and crashes by 680, so a sequence starts with a turn:
 * `--boss grow=9 --press 600:2:snakeTurn=left,740:1:snakeJaws` with
 * `--until snakePrise` photographs the prise. Skipping the morph with
 * `--boss phase=play,phaseBeat=now` is no shortcut — both captures that tried
 * it came back WAVE LOST.
 *
 * **The prise is the lift, and it carries its travel.** The simulation reads
 * nothing off the press and refuses a lift that moved less than
 * `snakeJawsMilli`, so the lift here says twice that — a director retune of
 * the threshold would otherwise turn every prise on this line into a thumb
 * resting on the head, with nothing in the frame to say so.
 */

const PRISE_MILLI = DEFAULT_CONFIG.snakeJawsMilli * 2;

export function isSnakeHand(kind: string): kind is "snakeJaws" {
  return kind === "snakeJaws";
}

export function snakePresses(
  tick: number,
  player: 1 | 2,
  kind: "snakeJaws",
  argument: string | undefined,
  one: string,
  whole: string,
): PressSpec[] {
  const drag = (at: number, on: boolean, fromYMilli: number): PressSpec => ({
    tick: at,
    player,
    command: { kind: "drag", target: kind, on, fromMilli: 0, fromYMilli },
  });
  if (argument !== undefined) {
    throw new Error(`--press ${whole}: "${one}" — snakeJaws takes no value; a prise is one pull`);
  }
  return [drag(tick, true, 0), drag(tick + 1, false, PRISE_MILLI)];
}
