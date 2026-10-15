import { FILAMENT_SCRIPT } from "../filament-script.js";
import { GIMBAL_SCRIPT } from "../gimbal-script.js";
import { MANTLE_SCRIPT } from "../mantle-script.js";
import { NETTLE_SCRIPT } from "../nettle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p7.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P8: Wave[] = [
  {
    id: "theHusk",
    name: "THE HUSK",
    guide: {
      scene: "theHusk",
    },
    entries: [
      { beat: 3, col: 0, color: "red" },
      { beat: 9, col: 10, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 2, row: 3, kind: "ward" },
      { beat: 0, col: 5, row: 4, kind: "purge", husk: true },
      { beat: 6, col: 8, row: 3, kind: "purge" },
    ],
  },
  {
    id: "theFilament",
    name: "THE FILAMENT",
    entries: [],
    boss: { kind: "filament", filaments: FILAMENT_SCRIPT },
    bossType: "normal",
    controls: "scene",
  },
  {
    id: "theGimbal",
    name: "THE GIMBAL",
    guide: {
      scene: "theGimbal",
    },
    entries: [],
    boss: { kind: "gimbal", marks: GIMBAL_SCRIPT },
    bossType: "normal",
  },
  {
    id: "theSpool",
    name: "THE SPOOL",
    guide: {
      scene: "theSpool",
    },
    entries: [],
    boss: { kind: "spool" },
    bossType: "normal",
  },
  {
    id: "theHasp",
    name: "THE HASP",
    guide: {
      scene: "theHasp",
    },
    entries: [],
    boss: { kind: "hasp" },
    bossType: "normal",
  },
  {
    id: "theRatchet",
    name: "THE RATCHET",
    guide: {
      scene: "theRatchet",
    },
    entries: [],
    boss: { kind: "ratchet" },
    bossType: "normal",
  },
  {
    id: "theNettle",
    name: "THE NETTLE",
    guide: {
      both: "A jellyfish over the ship. Its rings say what to do. A hand is your thumb on it. SHOOT, SHIELD or SUCK is the panel, under the ring.",
      p1: "1. Pull, tap, turn or hold the rings on the left, and the shared ones.\n2. Move the cannon under SHOOT or SUCK. Hold SUCK yourself.\n3. When the shield is under SHIELD, press your shield button.",
      p2: "1. Pull, tap, turn or hold the rings on the right, and the shared ones.\n2. Fire when the cannon is under SHOOT.\n3. Move the shield under SHIELD, and say when.",
    },
    entries: [],
    boss: { kind: "nettle", steps: NETTLE_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "theMantle",
    name: "THE MANTLE",
    guide: {
      both: "Two handles, one each. Pull both down together, hard enough, to open one of its four joints. Letting go costs the whole pull. Then tap the bare core, turn about.",
      p1: "1. Drag the left handle down and hold it with the other screen's pull.\n2. Both must pull hard enough at once, or nothing shears.\n3. Once the core is bare, tap it only when it is your turn.",
      p2: "1. Drag the right handle down and hold it with the other screen's pull.\n2. Letting go costs the whole pull. Start again together.\n3. A spark leaks partway through. Shoot it before it reaches the hull.",
    },
    entries: [],
    boss: { kind: "mantle", thresholds: MANTLE_SCRIPT },
    bossType: "normal",
  },
  {
    id: "theKeel",
    name: "THE KEEL",
    guide: {
      both: "Six joints. When one lights, tap it if it is on your half. The middle opens: shoot it in its colour. Then the joints light fast. Shoot the rock.",
      p1: "1. Tap a lit joint on the left half of the spine.\n2. Move the cannon under the open middle, then under the rock.\n3. The joints light fast at the end. Watch which half.",
      p2: "1. Tap a lit joint on the right half of the spine.\n2. Fire the open middle in the colour it shows.\n3. Fire the rock the tail throws before it lands.",
    },
    entries: [],
    boss: { kind: "keel", socket: "red", reprise: [4, 3, 0] },
    bossType: "normal",
  },
  {
    id: "theValve",
    name: "THE VALVE",
    guide: {
      both: "One turns the wheel onto the mark. The other taps the pin to stop it. Then pull the pin down. Three pins. The last wants a full turn first.",
      p1: "1. Turn the wheel with your thumb until it sits on the mark.\n2. Hold it still. The other screen taps the pin.\n3. A spark falls after the first pin. Move the cannon under it.",
      p2: "1. When the wheel is on the mark, tap the pin once.\n2. Then drag the pin down before it thaws. Either of you may.\n3. Fire at the spark before it lands.",
    },
    entries: [],
    boss: { kind: "valve", marks: [250, 600, 850] },
    bossType: "normal",
  },
  {
    id: "theSeam",
    name: "THE SEAM",
    guide: {
      both: "A point on the crack lights in a colour. Shoot it in that colour. When grit flies, raise the shield under it. Three points close the crack. Never shoot grey.",
      p1: "1. Move the cannon under the lit point.\n2. When grit flies, press the shield.\n3. A rock falls to one side. Slide the cannon under it.",
      p2: "1. Fire the lit point in its colour. White takes either.\n2. Slide the shield under the ridge when grit flies.\n3. At the end one of you shields while the other fires.",
    },
    entries: [],
    boss: {
      kind: "seam",
      steps: [
        { ask: "point", color: "red", offset: 0, seals: false },
        { ask: "grit", color: "either", offset: 0, seals: false },
        { ask: "point", color: "cyan", offset: 0, seals: true },
        { ask: "blind", color: "either", offset: 0, seals: false },
        { ask: "point", color: "red", offset: 0, seals: false },
        { ask: "point", color: "cyan", offset: 0, seals: true },
        { ask: "grit", color: "either", offset: 0, seals: false },
        { ask: "decoy", color: "either", offset: 0, seals: false },
        { ask: "rock", color: "cyan", offset: 2, seals: false },
        { ask: "glow", color: "either", offset: 0, seals: false },
        { ask: "point", color: "either", offset: 0, seals: true },
        { ask: "both", color: "either", offset: -2, seals: false },
        { ask: "dark", color: "either", offset: 0, seals: false },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theOculus",
    name: "THE OCULUS",
    guide: {
      both: "Shut the eye's leaves together, three times: hold, then tap, then turn. After each, shoot the eye in its colour. Shoot what falls in between.",
      p1: "1. Hold the left half with the other one.\n2. Then tap it. Then turn it round.\n3. When the eye shows a colour, fire it.",
      p2: "1. Hold the right half with the other one.\n2. Then tap it. Then turn it round.\n3. White takes either colour.",
    },
    entries: [
      { beat: 6, col: 0, color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 2, color: "red" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 26, col: 0, color: "red" },
      { beat: 31, col: 10, color: "cyan" },
      { beat: 36, col: 2, color: "red" },
      { beat: 41, col: 8, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 51, col: 10, color: "cyan" },
      { beat: 56, col: 2, color: "red" },
      { beat: 61, col: 8, color: "cyan" },
      { beat: 66, col: 0, color: "red" },
      { beat: 71, col: 10, color: "cyan" },
      { beat: 76, col: 2, color: "red" },
      { beat: 81, col: 8, color: "cyan" },
      { beat: 86, col: 0, color: "red" },
    ],
    boss: {
      kind: "oculus",
      steps: [
        { ask: "shut", color: "either", beats: 6, fuse: 32 },
        { ask: "break", color: "either", beats: 2 },
        { ask: "fire", color: "red", beats: 0 },
        { ask: "tap", color: "either", beats: 32, need: 12 },
        { ask: "fire", color: "cyan", beats: 0 },
        { ask: "turn", color: "either", beats: 32, need: 8 },
        { ask: "fire", color: "either", beats: 0 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theVise",
    name: "THE VISE",
    guide: {
      both: "Pull your lobe shut until its seam cracks. Two seams each bare the kernel. Shoot it in its colour. When both light, pull together. Shield the bite. Shoot the seed.",
      p1: "1. Pull the left lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. When the kernel shows a colour, fire it.",
      p2: "1. Pull the right lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. White takes either colour. Pull with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "vise",
      steps: [
        { ask: "left", color: "either", beats: 5 },
        { ask: "left", color: "either", beats: 4 },
        { ask: "right", color: "either", beats: 5 },
        { ask: "right", color: "either", beats: 4 },
        { ask: "fire", color: "red", beats: 6 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "bite", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 6 },
        { ask: "spit", color: "red", beats: 4, offset: 2 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "fire", color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
];
