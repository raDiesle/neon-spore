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
 * THE GIMBAL's and THE BELLOWS's: from the second hasp a bolt works loose over
 * the middle column and strikes the hull if it is left there, and either
 * colour takes it (`sim/hasp-shot.ts`). It is the only thing in the encounter
 * neither of the two hands can answer, so somebody has to leave their control
 * to do it, and saying which of them is the beat this wave is about.
 *
 * **THE RATCHET came in behind it on 23 September 2026**, the newest act
 * still having room: the first boss where a step, once taken, is never taken
 * back. Every press climbs the rack a tooth; she decides only whether it was
 * clean, by holding the catch he cannot see (`sim/ratchet.ts`).
 */
export const WAVES_ACT_11: Wave[] = [
  {
    id: "theSpool",
    name: "THE SPOOL",
    sentence: "The one where the line runs out at the speed one of you reads.",
    guide: {
      both: "A spool pays a line down to the hull. One of you brakes it, the other reads how fast it should run. Hold it right and a rib eases.",
      p1: "1. The brake is yours. Hold it at a depth.\n2. Shallow lets the line run. Deep slows it. No hand at all runs fastest.\n3. You are shown nothing but your own grip. Ask them.",
      p2: "1. You see how much line should be out, and how much is.\n2. Say faster or slower, and keep saying it.\n3. Out of the band and the leg starts again. Later on, a rock falls down their column.",
      scene: "theSpool",
    },
    entries: [],
    boss: { kind: "spool" },
    bossType: "normal",
  },
  {
    id: "theHasp",
    name: "THE HASP",
    sentence: "The one where one of you only has to hold on, and cannot.",
    guide: {
      both: "Three hasps on a door. He holds the latch down. She turns the wheel, and it only moves while he holds. His hand burns if he holds too long.",
      p1: "1. Drag the latch down and keep holding it.\n2. The wheel only turns while you hold. Say the moment you let go.\n3. Your hand burns if you hold too long. Only you see the heat.",
      p2: "1. Drag round the wheel's rim and keep turning.\n2. It moves only while they hold. Say when it seizes, and how far round you are.\n3. The last hasp gives them less time. A piece works loose. Shoot it.",
    },
    entries: [],
    boss: { kind: "hasp" },
    bossType: "normal",
  },
  {
    id: "theRatchet",
    name: "THE RATCHET",
    sentence: "The one where every step you take stays taken.",
    guide: {
      both: "A rack of seven teeth. One of you holds the catch, the other presses the pawl. Every press climbs one tooth, for good. Five clean and it opens.",
      p1: "1. Press the pawl. Each press climbs one tooth.\n2. It is clean only while they hold the catch. You cannot see their hand.\n3. Wait until they say it is set. Wait too long and a tooth is lost.",
      p2: "1. Hold the catch down, then tell them it is set.\n2. After each clean tooth, lift your hand and hold again.\n3. Two teeth may be lost. A third and the rack jams. A piece works loose. Shoot it.",
    },
    entries: [],
    boss: { kind: "ratchet" },
    bossType: "normal",
  },
];
