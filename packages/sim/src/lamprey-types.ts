import type { Color } from "./types.js";

/**
 * THE LAMPREY's shapes: the script a wave authors and the state the
 * simulation keeps (`lamprey.ts` for what they mean, `lamprey-roam.ts` for
 * the worm on the field). Cut out of `lamprey.ts` when the owner's request of
 * 6 October 2026 — *it eats what falls, crawls the field like a worm and
 * drops dung* — took it past its 250 lines.
 */

/** Teeth on the ring: one for each of the shipped script's nine stays with hands. */
export const LAMPREY_TEETH = 9;
/** How far round the ring the lit tooth jumps after a crack: never the one beside it. */
export const LAMPREY_JUMP = 2;
/** Places the head has been that the body is laid along, the newest first. */
export const LAMPREY_TRAIL = 8;

/**
 * Where the scene is: crawling in from the side, eating its meal, crawling
 * out of the picture and back, crawling the field between levels, bitten into
 * a tile, leaping to the next, reared on a tile with the gullet lit,
 * recoiling from a hit, and limp, falling away, spent.
 */
export const LAMPREY_PHASES = [
  "entering",
  "feeding",
  "away",
  "roam",
  "bite",
  "leap",
  "rearing",
  "recoil",
  "spent",
] as const;
export type LampreyPhase = (typeof LAMPREY_PHASES)[number];

/** What a stay asks: the teeth tapped, the head pulled, the two pulled apart, or the gullet shot. */
export const LAMPREY_ASKS = ["teeth", "pull", "apart", "gullet"] as const;
export type LampreyAsk = (typeof LAMPREY_ASKS)[number];

/** What the eel eats: three bodies the field already has. */
export const LAMPREY_FOODS = ["meteor", "slick", "bulb"] as const;
export type LampreyFood = (typeof LAMPREY_FOODS)[number];

/** One thing dropped for it to eat as it arrives: what, and in which column. */
export interface LampreyMorsel {
  kind: LampreyFood;
  col: number;
}

/** One stay of the script, authored on the wave. */
export interface LampreyStep {
  ask: LampreyAsk;
  /** The seat on the tail; the other works the head. A gullet reads nothing here. */
  holder: 1 | 2;
  /** Teeth a `teeth` stay asks to have knocked out. Nothing else reads it. */
  teeth: number;
  /** How far the leap onto this stay's tile goes, in tiles: authored rising. */
  jump: number;
  /** Beats the stay waits, under THE SLOW, before the bite goes through. */
  beats: number;
  /** The colour a gullet must be shot, or `"either"`. Only a gullet reads it. */
  color: Color | "either";
  /** Taps each lit tooth wants before it cracks; one when left out. Only a `teeth` stay reads it. */
  taps?: number;
  /** Whether the eel crawls the field before this stay instead of leaping to it: a new level. */
  crawl?: boolean;
  /** What falls for it to eat as it sets off on that crawl. */
  food?: LampreyFood;
  /** Whether it lets go of dung on that crawl, a rock for the shield. */
  dung?: boolean;
}

/** What a wave authors: the meal it arrives to, and the whole script, in order. */
export interface LampreyEntry {
  kind: "lamprey";
  meal?: readonly LampreyMorsel[];
  steps: readonly LampreyStep[];
}

export interface LampreyState {
  kind: "lamprey";
  /** Copied at install and never written again. */
  steps: LampreyStep[];
  /** The meal it arrives to, copied at install. */
  meal: LampreyMorsel[];
  phase: LampreyPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The stay on, or the next to land. */
  cursor: number;
  /**
   * The tile the eel is on, or is leaping to — and while it crawls, where its
   * head is, in whole tiles, the columns running off the field either side.
   */
  col: number;
  row: number;
  /** The tile it leapt from: where a leap is drawn starting. */
  fromCol: number;
  fromRow: number;
  /**
   * The tile the next stay lands on, drawn as this one landed, or -1 with
   * none to come. A crawl ends on it.
   */
  nextCol: number;
  nextRow: number;
  /** The way the tail lies from the head on the tile it is on, a unit long in thousandths (`lampreyTailWay`). */
  tailX: number;
  tailY: number;
  /** Where the head has been while it crawls, the newest first: what the body lies along. */
  trailCol: number[];
  trailRow: number[];
  /** `world.beat` the head last moved a tile. */
  headBeat: number;
  /** The leg of a crawl it is on, or of the way out and back. */
  leg: number;
  /** Which way across the field this crawl goes first: 1 to the right, -1 to the left. */
  roamSide: number;
  /** Morsels of the meal dropped so far. */
  served: number;
  /** The id of the body the head is after, or -1. */
  prey: number;
  /** The rocks it has let go of as dung that are still falling. */
  dung: number[];
  /** The teeth knocked out for good, a mask of `LAMPREY_TEETH` bits. */
  teethOut: number;
  /** The tooth lit: the one a tap must find, and the one a pull leaves behind. */
  litTooth: number;
  /** Taps the lit tooth has taken toward its step's `taps`. */
  toothTaps: number;
  /** The teeth cracked in this stay, in order; a snap puts the last one back. */
  pulled: number[];
  /** Shots the gullet has taken. */
  hits: number;
  /** Every tile bitten so far, `row * cols + col`, in order: what the picture scars. */
  bitten: number[];
  /** Whether each seat's thumb is down on the tail. */
  tailDown: [boolean, boolean];
  /** How far each seat has pulled the tail away from the head, thousandths of a tile. */
  tailMilli: [number, number];
  /** How far each seat has pulled the head up, thousandths of a tile. */
  headMilli: [number, number];
  /** Whether each seat's thumb is down on the teeth, so a tap is an edge. */
  tapDown: [boolean, boolean];
  /** Whether each seat's slip has been said for the press it is on, so it is said once. */
  slipped: [boolean, boolean];
}
