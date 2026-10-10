/**
 * **What one GOO look is made of** — the four answers to the owner's notes
 * on OOZE (10 October 2026), built on its drop, its neck and its place to go,
 * and none of them cyan: *colour is not ideal because it reminds of cyan
 * shoot colour*. Each is one record the shared engine reads, so the four
 * differ in what they are made of, not in how a pull goes.
 */
export interface GooStyle {
  /** One word: the name on the lab's LOOK picker. */
  readonly name: string;
  readonly sentence: string;
  /** The slime's own colour, its dark edge, its lit core, and the neon its rim glows. */
  readonly body: string;
  readonly deep: string;
  readonly core: string;
  readonly neon: string;
  /** How much of the field shows through the body, 0..1. */
  readonly clear: number;
  /** How lumpy the rim is, and how fast its lumps creep. */
  readonly lumpy: number;
  readonly creep: number;
  /** Bubbles hung inside the body. */
  readonly bubbles: number;
  /** Drops that hang off the neck and the drop's underside and fall. */
  readonly drips: boolean;
  /** Bubbles that fizz up out of the slime and pop. */
  readonly fizz: boolean;
  /** A wet oily sheen sliding over the top. */
  readonly sheen: boolean;
  /** How strongly the drop jiggles when it is let go or lands. */
  readonly jiggle: number;
}

/** Violet-pink jelly, see-through, bubbles inside, wobbling hardest. */
export const JELLY: GooStyle = {
  name: "jelly",
  sentence:
    "OOZE as see-through orchid jelly — bubbles hang inside it, it wobbles hard when let go, and its rim glows neon",
  body: "#C548FF",
  deep: "#3A0B5C",
  core: "#F6D9FF",
  neon: "#E58CFF",
  clear: 0.45,
  lumpy: 0.14,
  creep: 1.4,
  bubbles: 5,
  drips: false,
  fizz: false,
  sheen: false,
  jiggle: 1.3,
};

/** Thick amber, slow, with drops hanging off it under their own weight. */
export const HONEY: GooStyle = {
  name: "honey",
  sentence:
    "OOZE as thick glowing amber — it moves slow and heavy, and drops hang off the neck and the drop and fall",
  body: "#FFAA1F",
  deep: "#4A2400",
  core: "#FFF1C4",
  neon: "#FFC94D",
  clear: 0.15,
  lumpy: 0.1,
  creep: 0.6,
  bubbles: 2,
  drips: true,
  fizz: false,
  sheen: false,
  jiggle: 0.7,
};

/** Acid yellow that fizzes: bubbles boil off it and pop, along the way it went. */
export const ACID: GooStyle = {
  name: "acid",
  sentence:
    "OOZE as acid-yellow goo that fizzes — bubbles boil off it and pop round the drop and along the way it was pulled",
  body: "#D9F51F",
  deep: "#283600",
  core: "#FBFFD6",
  neon: "#EEFF5C",
  clear: 0.25,
  lumpy: 0.17,
  creep: 2.2,
  bubbles: 0,
  drips: false,
  fizz: true,
  sheen: false,
  jiggle: 1,
};

/** Black tar with a hot magenta neon edge and an oily sheen. */
export const TAR: GooStyle = {
  name: "tar",
  sentence:
    "OOZE as glossy black tar with a hot magenta neon edge — an oily sheen slides over it and it stretches like rubber",
  body: "#24113A",
  deep: "#05030A",
  core: "#7A5A9E",
  neon: "#FF4FE6",
  clear: 0,
  lumpy: 0.11,
  creep: 0.9,
  bubbles: 0,
  drips: false,
  fizz: false,
  sheen: true,
  jiggle: 0.9,
};

export const GOO_STYLES: readonly GooStyle[] = [JELLY, HONEY, ACID, TAR];
