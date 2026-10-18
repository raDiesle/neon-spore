import type { Brush } from "./brush-lists.js";

/**
 * **What the pair does to get rid of it**, one short line per brush, for the
 * hover card (`brush-tooltip.ts`).
 *
 * The card used to print the bestiary's blurb, which is written for the
 * first-appearance preview and says everything true about a body — up to a
 * paragraph. The owner asked on 18 October 2026 for the card to say only what
 * a player has to do to kill it, very briefly. The blurb is still the
 * preview's, in `CREATURES`.
 *
 * Plain imperatives, full stops, no semicolon or dash, under sixty characters
 * (`test/brush-kill.test.ts`). A rock, a pod and a control are not killed but
 * still have a thing to do, so they carry a line too. A fault has no body and
 * nothing to do it to, so it has none here and the card falls back to the
 * palette's note.
 */
export const KILL_LINE: Partial<Record<Brush, string>> = {
  slick: "Shoot it red.",
  bulb: "Shoot it cyan.",
  fence: "Shield in the gap p1 sees. Or shoot its crack open.",
  coil: "Open the shield under it. Then shield the rock.",
  lure: "Do not shoot it. It leaves by itself.",
  throb: "Shoot the colour of the half facing the cannon.",
  shell: "Shoot both armour pieces off. Then its colour.",
  clasp: "Shield it at the right moment. Then shoot it.",
  dart: "Shoot it while it hangs. p2 says the next side.",
  veil: "p1 says the colour inside. Shoot before it turns.",
  wisp: "p2 says the tile. Shoot it, any colour.",
  ghost: "p2 says the column. Shoot it.",
  countdown: "p1 counts down. Shoot its colour on zero.",
  echo: "Shoot it early. If it splits, shoot every half.",
  rind: "Shoot its colour three times.",
  recoil: "Shoot it four times. Its colour flips each hit.",
  gyre: "Shoot each rim body in its colour. The maw slows it.",
  lid: "p1 holds the cord open. p2 shoots the lens.",
  carom: "Shoot it its colour. Then shield the rock.",
  crystal: "Shield under its middle, shoot it. Then both halves.",
  volley: "Shield it three times. Then shoot what hatches.",
  strand: "Shoot only the marked end. Say mark and colour.",
  magnet: "Hold it from another column. Match the pole hit.",
  choir: "Shake twice or swipe both arrows out. Then shoot.",
  beatbox: "p2 taps once a beat. Stop on p1's number.",
  crawler: "Shoot each colour ring. Shield each plate.",
  balloon: "Both pull a handle at once. Then again.",
  weight: "Both press it at the same moment.",
  mine: "Tap its exact tile. The one who sees it says where.",
  moult: "Shield it as rock. Swallow it as cargo.",
  morsel: "Shoot it limp. Then swallow it with the maw.",
  seeder: "Shoot it. Then free and swallow its pod.",
  glutton: "Shoot it. One shot more for each pod it ate.",
  rock: "Cannot be shot. Shield it.",
  torch: "Cannot be shot. Shield both its columns.",
  veer: "Cannot be shot. p1 says where it steps. Shield it.",
  pod: "Shoot it loose. Swallow it before the ring ends.",
  husk: "Never swallow it. p2 says which one it is.",
  "control:tap": "Tap it while it is up.",
  "control:hold": "Hold it down while it is up.",
  "control:swipe": "Pull it down its channel.",
  "control:turn": "Turn the knob round it.",
  "control:rub": "Rub it back and forth.",
  "control:combo": "Press it. Then pull the knob that comes.",
  "control:lever": "Carry its knob into the band and hold it.",
};
