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
    id: "theBalloon",
    name: "THE BALLOON",
    guide: {
      scene: "theBalloon",
    },
    entries: [
      { beat: 0, col: 3, kind: "balloon", color: null },
      { beat: 6, col: 8, kind: "balloon", color: null },
      { beat: 16, col: 7, kind: "balloon", color: null },
      { beat: 24, col: 0, kind: "balloon", color: null },
      { beat: 26, col: 10, kind: "balloon", color: null },
      { beat: 36, col: 3, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonAgain",
    name: "BALLOONS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "balloon", color: null },
      { beat: 8, col: 3, kind: "choir", color: "cyan" },
      { beat: 14, col: 4, kind: "balloon", color: null },
      { beat: 22, col: 9, kind: "choir", color: "cyan" },
      { beat: 30, col: 8, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonSpread",
    name: "BALLOONS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "balloon", color: null },
      { beat: 5, col: 0, kind: "choir", color: "red" },
      { beat: 10, col: 10, color: "red" },
      { beat: 15, col: 9, kind: "balloon", color: null },
      { beat: 21, col: 2, kind: "choir", color: "cyan" },
      { beat: 26, col: 10, color: "red" },
    ],
  },
  {
    id: "theBalloonReach",
    name: "BALLOONS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "balloon", color: null },
      { beat: 6, col: 7, kind: "choir", color: "red" },
      { beat: 11, col: 2, kind: "meteorMedium", color: null },
      { beat: 17, col: 7, kind: "balloon", color: null },
      { beat: 22, col: 0, kind: "choir", color: "red" },
      { beat: 28, col: 8, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theBalloonPair",
    name: "BALLOON AND CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 3, kind: "balloon", color: null },
      { beat: 10, col: 9, color: "red" },
      { beat: 15, col: 0, kind: "choir", color: "red" },
      { beat: 19, col: 5, color: "cyan" },
      { beat: 19, col: 8, color: "cyan" },
      { beat: 25, col: 8, kind: "echo", color: "red" },
      { beat: 30, col: 4, kind: "balloon", color: null },
      { beat: 36, col: 3, color: "red" },
      { beat: 36, col: 7, color: "red" },
    ],
  },
  {
    id: "theBalloonBreathe",
    name: "EASY BALLOONS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 7, col: 3, kind: "balloon", color: null },
      { beat: 14, col: 1, color: "cyan" },
      { beat: 22, col: 9, kind: "choir", color: "red" },
      { beat: 30, col: 1, color: "red" },
      { beat: 37, col: 10, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theBalloonRecall",
    name: "BALLOON RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 0, kind: "balloon", color: null },
      { beat: 12, col: 1, color: "red" },
      { beat: 17, col: 3, kind: "gyre", color: null },
      { beat: 22, col: 2, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 0, kind: "balloon", color: null },
      { beat: 33, col: 6, kind: "gyre", color: null },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theBalloonBend",
    name: "BALLOONS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 0, kind: "balloon", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 16, col: 4, kind: "choir", color: "cyan" },
      { beat: 21, col: 8, kind: "balloon", color: null },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "cyan" },
      { beat: 32, col: 8, kind: "choir", color: "red" },
      { beat: 38, col: 7, kind: "balloon", color: null },
      { beat: 43, col: 0, color: "cyan" },
      { beat: 43, col: 10, color: "cyan" },
    ],
  },
];
