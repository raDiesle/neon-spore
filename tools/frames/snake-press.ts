import { DEFAULT_CONFIG } from "@neon-spore/sim";
import type { PressSpec } from "./spec.js";

/**
 * **SNAKE's two hands on the body, written on the press line.**
 *
 * Past `snakeGorgeTiles` the jaws stick and the pilot prises them apart on the
 * head; past `snakeShedTiles` the tail drags and the navigator lifts it clear
 * (`sim/snake-controls.ts`, `dragHeard`). Neither is a button on anybody's
 * panel — both are a thumb on the body (`render/snake-grip.ts`) — so until 23
 * September 2026 neither could be sent from the command line, and the jaws
 * were only ever photographed shut.
 *
 *   --press 700:1:snakeJaws            the jaws prised open, on the lift
 *   --press 700:2:snakeTail=30         the tail held up for thirty ticks
 *   --press 700:2:snakeTail=on         held up, and still up in the picture
 *
 * Both are refused by the round outside the grip that has them, which a
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
 * resting on the head, with nothing in the frame to say so. The tail reads no
 * travel at all: it is up for exactly as long as the thumb is down.
 */

const PRISE_MILLI = DEFAULT_CONFIG.snakeJawsMilli * 2;

export function isSnakeHand(kind: string): kind is "snakeJaws" | "snakeTail" {
  return kind === "snakeJaws" || kind === "snakeTail";
}

export function snakePresses(
  tick: number,
  player: 1 | 2,
  kind: "snakeJaws" | "snakeTail",
  argument: string | undefined,
  one: string,
  whole: string,
): PressSpec[] {
  const drag = (at: number, on: boolean, fromYMilli: number): PressSpec => ({
    tick: at,
    player,
    command: { kind: "drag", target: kind, on, fromMilli: 0, fromYMilli },
  });
  if (kind === "snakeJaws") {
    if (argument !== undefined) {
      throw new Error(`--press ${whole}: "${one}" — snakeJaws takes no value; a prise is one pull`);
    }
    return [drag(tick, true, 0), drag(tick + 1, false, PRISE_MILLI)];
  }
  if (argument === "on") return [drag(tick, true, 0)];
  if (argument === "off") return [drag(tick, false, 0)];
  const ticks = Number(argument);
  if (argument === undefined || !Number.isInteger(ticks) || ticks < 1) {
    throw new Error(
      `--press ${whole}: "${one}" — snakeTail takes the ticks the tail is held up, e.g. ` +
        "snakeTail=30, or on and off to write the two halves yourself",
    );
  }
  return [drag(tick, true, 0), drag(tick + ticks, false, 0)];
}
