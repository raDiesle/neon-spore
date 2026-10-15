import { GIMBAL_SCRIPT } from "../gimbal-script.js";
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
 * **THE OCULUS behind it** moved to its own page on 2 October 2026, when
 * the wave falling round it came in (`act-11b.ts`).
 */
export const WAVES_ACT_11: Wave[] = [
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
    id: "theHuskAgain",
    name: "HUSKS AGAIN",
    variant: true,
    entries: [
      { beat: 7, col: 0, kind: "moult", color: null, cargo: "ward" },
      { beat: 14, col: 9, kind: "weight", color: null },
      { beat: 27, col: 4, kind: "moult", color: null, cargo: "ward" },
    ],
    pods: [
      { beat: 0, col: 3, row: 4, kind: "purge", husk: true },
      { beat: 20, col: 7, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskSpread",
    name: "HUSKS SPREAD",
    variant: true,
    entries: [
      { beat: 7, col: 10, kind: "moult", color: null, cargo: "purge" },
      { beat: 13, col: 8, kind: "carom", color: "cyan" },
      { beat: 25, col: 1, kind: "moult", color: null, cargo: "ward" },
      { beat: 30, col: 6, kind: "carom", color: "red" },
    ],
    pods: [
      { beat: 0, col: 2, row: 4, kind: "purge", husk: true },
      { beat: 19, col: 2, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskReach",
    name: "HUSKS FAR APART",
    variant: true,
    entries: [
      { beat: 6, col: 0, kind: "moult", color: null, cargo: "ward" },
      { beat: 11, col: 8, kind: "shell", color: "cyan" },
      { beat: 21, col: 0, kind: "moult", color: null, cargo: "ward" },
      { beat: 26, col: 7, kind: "shell", color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 10, row: 4, kind: "purge", husk: true },
      { beat: 16, col: 4, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskPair",
    name: "HUSK AND MOULT",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 11, col: 1, color: "red" },
      { beat: 15, col: 9, kind: "moult", color: null, cargo: "purge" },
      { beat: 20, col: 2, color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 26, col: 7, kind: "meteor", color: null },
      { beat: 38, col: 0, color: "red" },
      { beat: 38, col: 10, color: "red" },
    ],
    pods: [
      { beat: 6, col: 10, row: 4, kind: "purge", husk: true },
      { beat: 32, col: 5, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskBreathe",
    name: "EASY HUSKS",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 20, col: 10, kind: "moult", color: null, cargo: "ward" },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 33, col: 7, kind: "fence", color: null },
      { beat: 40, col: 8, color: "cyan" },
    ],
    pods: [{ beat: 7, col: 4, row: 4, kind: "purge", husk: true }],
  },
  {
    id: "theHuskRecall",
    name: "HUSK RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 10, col: 2, color: "red" },
      { beat: 15, col: 1, kind: "lure", color: "cyan" },
      { beat: 20, col: 0, color: "red" },
      { beat: 20, col: 10, color: "red" },
      { beat: 32, col: 5, kind: "lure", color: "cyan" },
      { beat: 38, col: 0, color: "red" },
      { beat: 38, col: 10, color: "red" },
    ],
    pods: [
      { beat: 5, col: 8, row: 4, kind: "purge", husk: true },
      { beat: 26, col: 0, row: 4, kind: "purge", husk: true },
    ],
  },
];
