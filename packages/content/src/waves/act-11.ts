import { MANTLE_SCRIPT } from "../mantle-script.js";
import { NETTLE_SCRIPT } from "../nettle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Act eleven, opened for THE SPOOL on 22 September 2026 — `act-10.ts` had
 * twenty-nine lines left under the 250-line ceiling, which is one wave with
 * its argument written above it and nothing after (`waves.ts`).
 *
 * **THE SPOOL is the first boss whose question is whether you can let it
 * run.** Every other boss in the game is answered by doing something: a shot,
 * a shove, a stroke, a turn. This one is answered by choosing how *fast* a
 * thing that is already happening should happen, and holding that choice
 * still while the other seat reads out whether it is right — so the whole
 * fight is a number nobody is shown whole (`sim/spool.ts`).
 *
 * **The split is the gauge.** The pilot holds the brake and is shown nothing
 * but the mark's own grip: no rate, no length, no zone, ever. The navigator
 * is shown how much line should be out by now against how much is, and has
 * no way to touch the brake. `SplitGauge`, a third time after THE SINEW's
 * strain band and THE SURGE's seam, and the first time the two halves are a
 * *speed* rather than an amount — which is why saying it is hard: a pair can
 * point at an amount and has to describe a rate.
 *
 * **Its health is four wooden ribs that ease open, and never crack.** The
 * fight has one hull cost in it, a rock thrown down the pilot's own column
 * when the line slips a second time, and its finish is the only calm one in
 * the game: the line goes slack and the spool drifts free.
 *
 * **THE HASP came into the same act the same day**, rather than opening a
 * page of its own: two lanes cut act ten's tail in the same sitting, and the
 * newest act is where a new wave lands (`waves.ts`).
 *
 * **THE HASP is the first boss where one seat's whole job is to not let go.**
 * A wheel opens the hasps and only the navigator can turn it; it only moves
 * while the pilot is holding the latch down, so his gesture has no progress of
 * its own and is read entirely off hers. That is the split: the hands are
 * divided rather than the eyes, and neither half is a fight alone — a latch
 * held over a wheel nobody is turning is a thumb resting on a picture, and a
 * wheel turned with the latch up is a rim that will not move.
 *
 * **The clock is on the seat that cannot see the progress.** He is given a
 * fuse — `haspHoldBeats` from the beat he takes the latch — and when it runs
 * out his hand is burnt off it and has to cool before he can take it again
 * (`sim/hasp-step.ts`). He is shown the heat and she is shown the winding, so
 * the only way either of them knows how much of both is left is to say it. On
 * the last hasp the fuse is `haspLastHoldBeats`, which is shorter: the fight
 * ends on the beat their two readings have to be exchanged fastest.
 *
 * **A seize costs the turning and not the place.** The gate is read after her
 * bearing is recorded, so a wheel let go of resumes exactly where it stopped
 * rather than snapping back — what a dropped latch takes is the beats she
 * spent turning nothing, which is the cost the pair can hear in their own
 * voices and the one they can do something about.
 *
 * **The cannon has one job in the whole fight**, and it is the same shape as
 * THE GIMBAL's: from the second hasp a bolt works loose over
 * the middle column and strikes the hull if it is left there, and either
 * colour takes it (`sim/hasp-shot.ts`). It is the only thing in the encounter
 * neither of the two hands can answer, so somebody has to leave their control
 * to do it, and saying which of them is the beat this wave is about.
 *
 * **THE RATCHET came in behind it on 23 September 2026**, the newest act
 * still having room: the first boss where a step, once taken, is never taken
 * back. Every press climbs the rack a tooth; she decides only whether it was
 * clean, by holding the catch he cannot see (`sim/ratchet.ts`).
 *
 * **THE NETTLE came in behind that on 26 September 2026**: THE INSTAR's
 * engine, a jellyfish for a body, and the ship's panel given back — STANDARD
 * 5, every button without the lance, so a SHOOT mark is a shot and not a
 * charge. Like THE INSTAR it authors its script and nothing that falls
 * (`nettle-script.ts`). It carries a guide in words, because a wave goes
 * without one only on the owner's word (`content/test/waves.test.ts`), and
 * the new thing in it is that the panel answers a mark.
 *
 * **THE MANTLE came in behind that on 26 September 2026**: a hinged shell
 * pried open by two hands pulling together, the shared brief's first answer —
 * both screens read the true combined pull, never one seat's own half of it
 * (`docs/spec/bosses-choreographed.md` §23). Four plate-pairs, then the bare
 * core's alternating tap.
 *
 * **THE KEEL came in behind that the same day**: a spine of six joints, and
 * whose tap a joint wants is read off which half of the screen it sits on,
 * never authored (`docs/spec/bosses-choreographed.md` §24). It authors the
 * socket's colour and the order of the fast run, and nothing that falls.
 *
 * **THE VALVE came in behind that on 26 September**: a wheel one seat turns
 * and a pin the other taps to stop it (`docs/spec/bosses-choreographed.md`
 * §25). It authors where each movement's mark sits, and nothing that falls.
 *
 * **THE SEAM the same day**: a ridge answered with nothing but the cannon
 * and the shield, one step at a time (`docs/spec/bosses-choreographed.md`
 * §26). It authors the whole script, and nothing that falls: three
 * movements, one sealing point each — learn the crack, both colours closer
 * together, then the white point and both at once.
 *
 * **THE OCULUS behind it**: an eye both seats shut by holding their leaves
 * together, then shoot in the socket it cracks
 * (`docs/spec/bosses-choreographed.md` §27). It authors the whole script, and
 * nothing that falls: three pairs of leaves, the break, then fire and reseal
 * in turn up to the white last hit.
 */
export const WAVES_ACT_11: Wave[] = [
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
      both: "A point on the crack lights in a colour. Shoot it in that colour. When grit flies, bring the shield up under it. Three points close the crack.",
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
        { ask: "point", color: "red", offset: 0, seals: false },
        { ask: "point", color: "cyan", offset: 0, seals: true },
        { ask: "grit", color: "either", offset: 0, seals: false },
        { ask: "rock", color: "cyan", offset: 2, seals: false },
        { ask: "point", color: "either", offset: 0, seals: true },
        { ask: "both", color: "either", offset: -2, seals: false },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theOculus",
    name: "THE OCULUS",
    guide: {
      both: "Hold your leaf with the other one's until the pair shuts. Three pairs crack the eye. Shoot it in its colour. When leaves open, hold both again.",
      p1: "1. Hold the left leaf down and say so.\n2. Keep holding until the pair shuts.\n3. When the eye shows a colour, fire it. Then hold again.",
      p2: "1. Hold the right leaf down and say so.\n2. Keep holding until the pair shuts.\n3. White takes either colour. Hold again if leaves open.",
    },
    entries: [],
    boss: {
      kind: "oculus",
      steps: [
        { ask: "shut", color: "either", beats: 4 },
        { ask: "shut", color: "either", beats: 4 },
        { ask: "shut", color: "either", beats: 4 },
        { ask: "break", color: "either", beats: 2 },
        { ask: "fire", color: "red", beats: 3 },
        { ask: "reseal", color: "either", beats: 3 },
        { ask: "fire", color: "cyan", beats: 3 },
        { ask: "reseal", color: "either", beats: 4 },
        { ask: "fire", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
];
