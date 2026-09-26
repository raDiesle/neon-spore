import type { Wave } from "../wave-types.js";

/**
 * Act twelve, opened for THE VISE on 26 September 2026 — `act-11.ts` had
 * seventeen lines left under the 250-line ceiling, which is less than one
 * wave with its argument written above it (`waves.ts`).
 *
 * **THE VISE is the first boss answered by a pinch.** A case of two lobes
 * clamps a kernel over the middle column; each seat has one lobe, and a seam
 * cracks when its lobe is pinched shut and kept shut for the count
 * (`docs/spec/bosses-choreographed.md` §28, `sim/vise.ts`). Two seams a lobe
 * bare the kernel, which is shot in its colour; between the shots both lobes
 * are pinched at once to hold the case off it.
 *
 * It authors the whole script, and nothing that falls: the pilot's two seams,
 * the navigator's two, then fire and hold in turn up to the white last hit.
 *
 * **THE RIME is the first boss answered by a rub.** Each seat wipes its own
 * half of a frosted lens back and forth, and the frost it has not rubbed this
 * beat grows back (§29, `sim/rime.ts`). Two wipes a half bare the core, which
 * is shot in its colour; between the shots a surge of frost comes, and the
 * shield under the middle turns it. Its script runs as THE VISE's does, with
 * the shield where the hold was. A half's first wipe is from solid frost and
 * gets the longer window; the second is from the film the first left.
 *
 * **THE TRIVET is the first boss answered by a chord**, the same shape a
 * third time: a stand of three legs over the middle column, each seat's foot
 * planted by holding two — then three — of its own pads down together for
 * the count (`docs/spec/bosses-choreographed.md` §30, `sim/trivet.ts`). Both
 * feet home light the hub, which is shot in its colour; between the shots
 * both seats chord at once to keep the feet planted under it.
 *
 * **THE PLUMB is the first boss answered by the phone itself**, the same
 * shape a fourth time: a bob over the middle column, each seat's weight hung
 * true by holding its own phone level, inside a range that narrows on the
 * second settle (`docs/spec/bosses-choreographed.md` §31, `sim/plumb.ts`).
 * Both weights true light the core, which is shot in its colour; between the
 * shots both seats hold level at once to keep the weights true under it.
 *
 * **THE SLING is the first boss answered at the lift**, the same shape a
 * fifth time: a fork over the middle column, each seat's arm drawn by
 * holding a finger down for the count and loosed by swiping toward the lit
 * side as it leaves (`docs/spec/bosses-choreographed.md` §32,
 * `sim/sling.ts`). Both arms drawn light the yoke, which is shot in its
 * colour; between the shots both seats draw and loose at once to keep it lit.
 *
 * **THE GRINDSTONE is the first boss spent on two gestures already built**,
 * the same shape a sixth time: a wheel over the middle column, each seat's
 * flat rubbed clean twice as THE RIME's halves are, then a caliper both
 * seats hold shut with every pad as THE TRIVET's feet are planted
 * (`docs/spec/bosses-choreographed.md` §33, `sim/grindstone.ts`). Both flats
 * clean lock the caliper and light the axle, which is shot in its colour;
 * between the shots both seats clamp at once to keep it locked.
 *
 * **THE CYST is the first boss where one seat's tap is the other's cue**:
 * a sac over the middle column whose lit flank shudders until the partner
 * taps it still, then is pinched shut by its own seat to crack
 * (`docs/spec/bosses-choreographed.md` §34, `sim/cyst.ts`). Both flanks
 * cracked bare the core, which is shot in its colour; between the shots a
 * cracked flank is stilled and pinched again to hold it off the core.
 */
export const WAVES_ACT_12: Wave[] = [
  {
    id: "theVise",
    name: "THE VISE",
    guide: {
      both: "Pinch your lobe shut until its seam cracks. Two seams each bare the kernel. Shoot it in its colour. When both light, pinch together. Shield the bite. Shoot the seed.",
      p1: "1. Pinch the left lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. When the kernel shows a colour, fire it.",
      p2: "1. Pinch the right lobe shut and say so.\n2. Keep it shut until the seam cracks.\n3. White takes either colour. Pinch with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "vise",
      steps: [
        { ask: "left", color: "either", beats: 5 },
        { ask: "left", color: "either", beats: 4 },
        { ask: "right", color: "either", beats: 5 },
        { ask: "right", color: "either", beats: 4 },
        { ask: "fire", color: "red", beats: 3 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "bite", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 3 },
        { ask: "spit", color: "red", beats: 4, offset: 2 },
        { ask: "both", color: "either", beats: 3 },
        { ask: "fire", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theRime",
    name: "THE RIME",
    guide: {
      both: "Rub your half of the lens back and forth until it clears. Two wipes each bare the core. Shoot it in its colour. When the surge comes, shield it.",
      p1: "1. Rub the left half back and forth and say so.\n2. Keep rubbing until it clears. If you stop, the frost grows back.\n3. When the core shows a colour, fire it. Press the shield when it is under the lens.",
      p2: "1. Rub the right half back and forth and say so.\n2. Keep rubbing until it clears.\n3. White takes either colour. When the surge comes, move the shield under the lens.",
    },
    entries: [],
    boss: {
      kind: "rime",
      steps: [
        { ask: "left", color: "either", beats: 6 },
        { ask: "left", color: "either", beats: 4 },
        { ask: "right", color: "either", beats: 6 },
        { ask: "right", color: "either", beats: 4 },
        { ask: "fire", color: "red", beats: 3 },
        { ask: "shield", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 3 },
        { ask: "shield", color: "either", beats: 3 },
        { ask: "fire", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theTrivet",
    name: "THE TRIVET",
    guide: {
      both: "Hold your foot's lit pads down together until it plants. Two plants each light the hub. Shoot it in its colour. When both light, hold together.",
      p1: "1. Hold the front foot's lit pads down together and say so.\n2. Keep every one down until the foot plants.\n3. When the hub shows a colour, fire it.",
      p2: "1. Hold the rear foot's lit pads down together and say so.\n2. Keep every one down until the foot plants.\n3. White takes either colour. Hold with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "trivet",
      steps: [
        { ask: "front", pads: 2, color: "either", beats: 5 },
        { ask: "front", pads: 3, color: "either", beats: 4 },
        { ask: "rear", pads: 2, color: "either", beats: 5 },
        { ask: "rear", pads: 3, color: "either", beats: 4 },
        { ask: "fire", pads: 2, color: "red", beats: 3 },
        { ask: "both", pads: 2, color: "either", beats: 3 },
        { ask: "fire", pads: 2, color: "cyan", beats: 3 },
        { ask: "both", pads: 2, color: "either", beats: 3 },
        { ask: "fire", pads: 2, color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "thePlumb",
    name: "THE PLUMB",
    guide: {
      both: "Hold your phone level until your weight hangs true. Both weights true light the core. Shoot it in its colour. When both levels light, hold both phones level.",
      p1: "1. Hold your phone flat and still when the left weight lights, and say so.\n2. Keep it level until the weight hangs true.\n3. When the core shows a colour, fire it.",
      p2: "1. Hold your phone flat and still when the right weight lights, and say so.\n2. Keep it level until the weight hangs true.\n3. White takes either colour. Hold level with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "plumb",
      steps: [
        { ask: "left", rangeMilli: 8000, color: "either", beats: 6 },
        { ask: "left", rangeMilli: 4000, color: "either", beats: 4 },
        { ask: "right", rangeMilli: 8000, color: "either", beats: 6 },
        { ask: "right", rangeMilli: 4000, color: "either", beats: 4 },
        { ask: "fire", rangeMilli: 0, color: "red", beats: 3 },
        { ask: "both", rangeMilli: 6000, color: "either", beats: 3 },
        { ask: "fire", rangeMilli: 0, color: "cyan", beats: 3 },
        { ask: "both", rangeMilli: 5000, color: "either", beats: 3 },
        { ask: "fire", rangeMilli: 0, color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theSling",
    name: "THE SLING",
    guide: {
      both: "Hold until your arm is drawn home, then swipe toward the lit side. Both arms drawn light the yoke: shoot it in its colour. When both light, draw together.",
      p1: "1. Hold a finger down when the left arm lights, and say which side is lit.\n2. Keep holding until the arm is home.\n3. Swipe toward the lit side as you let go.",
      p2: "1. Hold a finger down when the right arm lights, and say which side is lit.\n2. Keep holding until the arm is home.\n3. White takes either colour. Draw with the other one when both light.",
    },
    entries: [],
    boss: {
      kind: "sling",
      steps: [
        { ask: "left", aim: "left", color: "either", beats: 5 },
        { ask: "left", aim: "right", color: "either", beats: 4 },
        { ask: "right", aim: "right", color: "either", beats: 5 },
        { ask: "right", aim: "left", color: "either", beats: 4 },
        { ask: "fire", aim: "left", color: "red", beats: 3 },
        { ask: "both", aim: "left", color: "either", beats: 3 },
        { ask: "fire", aim: "left", color: "cyan", beats: 3 },
        { ask: "both", aim: "right", color: "either", beats: 3 },
        { ask: "fire", aim: "left", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theGrindstone",
    name: "THE GRINDSTONE",
    guide: {
      both: "Rub your flat back and forth until clean, twice. Both flats clean lock the caliper: shoot the axle in its colour. When the jaws light, both hold every pad.",
      p1: "1. Rub the left flat back and forth when it lights, until it is clean.\n2. Rub it again when the film comes back.\n3. When the jaws light, hold both of your pads down with the other one.",
      p2: "1. Rub the right flat back and forth when it lights, until it is clean.\n2. Rub it again when the film comes back.\n3. White takes either colour. Hold both pads down when the jaws light.",
    },
    entries: [],
    boss: {
      kind: "grindstone",
      steps: [
        { ask: "left", color: "either", beats: 6 },
        { ask: "left", color: "either", beats: 4 },
        { ask: "right", color: "either", beats: 6 },
        { ask: "right", color: "either", beats: 4 },
        { ask: "fire", color: "red", beats: 3 },
        { ask: "clamp", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 3 },
        { ask: "clamp", color: "either", beats: 3 },
        { ask: "fire", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theCyst",
    name: "THE CYST",
    guide: {
      both: "When a flank shakes, your partner taps it still: pinch it shut to crack it. Both cracked: shoot the core in its colour. Then crack each flank once more.",
      p1: "1. When the left flank shakes, your partner taps it. Then pinch it shut.\n2. When the right flank shakes, tap its mark so it stops.\n3. Shoot the bare core in its colour.",
      p2: "1. When the left flank shakes, tap its mark so it stops.\n2. When the right flank shakes, your partner taps it. Then pinch it shut.\n3. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "cyst",
      steps: [
        { ask: "left", color: "either", beats: 4 },
        { ask: "right", color: "either", beats: 4 },
        { ask: "fire", color: "red", beats: 3 },
        { ask: "left", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 3 },
        { ask: "right", color: "either", beats: 2 },
        { ask: "fire", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
];
