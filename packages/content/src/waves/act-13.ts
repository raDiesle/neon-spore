import type { Wave } from "../wave-types.js";

/**
 * Act thirteen, opened for THE DAVIT on 26 September 2026 — `act-12.ts` had
 * fourteen lines left under the 250-line ceiling, which is less than one
 * wave with its argument written above it (`waves.ts`).
 *
 * **THE DAVIT is the first boss where one seat aims what the other looses.**
 * A crane boom pivoted off the hull's spine: on each swing one seat's thumb
 * carries the boom onto a lit target and keeps it there while the other holds
 * a draw, and the draw lands only if it lifts while the steer still holds,
 * swiping toward the target's half (`docs/spec/bosses-choreographed.md` §35,
 * `sim/davit.ts`). Two looses a swing light the pivot, which is shot in its
 * colour; between the shots either seat steers for the other to reland it.
 *
 * It authors the whole script, and nothing that falls: the left swing twice,
 * the right swing twice, each to one half and then the other, then fire and
 * reland in turn up to the white last hit.
 *
 * **THE HALTER is the first boss that asks a seat to do nothing.** A wary
 * seam on the hull's spine: on each lit segment one seat sends no command at
 * all while the other holds both grips, and held together the segment cracks
 * (§36, `sim/halter.ts`). The left mark rests the navigator and the right the
 * pilot; after the bare, a guard takes either way round. Three shots at the
 * bared centre, the last one white.
 *
 * **THE CAPSTAN is the first boss one seat turns for the other to work.** A
 * rusted drum on a cradle: one seat drags the drum to rock a face toward the
 * pair, the other wipes that face's band bright, and only the bared face
 * wears (§37, `sim/capstan.ts`). The left mark is the pilot's pull and the
 * right the navigator's; after the bare, a hold takes either way round. Three
 * shots at the core, the last one white.
 *
 * **THE GALL is the first boss that moves when it is answered.** A soft
 * nodule on a raised seam across the hull: the seat nearer it pinches it
 * shut and keeps it shut, and the instant it closes it jumps to another of
 * the seam's four points, for whichever seat is nearer there (§38,
 * `sim/gall.ts`). Three closes bare the root, and one shot in red ends it.
 *
 * **THE BURGEE is the first boss the simulation keeps moving for a seat to
 * still.** A pennant on a free boom mid-hull swings across the three middle
 * columns on its own: one seat taps it still over the lit column, the other
 * holds a draw and lets go toward it while it is still held (§39,
 * `sim/burgee.ts`). Two catches, the seats swapped, light the spindle; three
 * shots at it, each after the flag has been caught back, the last one white.
 * Every catch's window outlasts a lap of the flag at its sweep.
 *
 * **THE FLUE is the first boss only one seat can see.** An ember runs along
 * a flue across the top of the field, end to end and back, over the cannon
 * held still under the middle (§11.57, `sim/flue.ts`). The pilot sees it and
 * the navigator does not, so the pilot says when, early by the shot's own
 * delay: a bolt climbs for most of a beat, a beam fills for three. Six
 * levels, each one weapon in one colour, the ember at its own speed and THE
 * SLOW at its own strength; three shots a level, and the third one missed is
 * the wave. The levels climb from a slow bolt to a fast beam, and the slow
 * comes in as the ember speeds up.
 */
export const WAVES_ACT_13: Wave[] = [
  {
    id: "theDavit",
    name: "THE DAVIT",
    guide: {
      both: "Your partner drags the boom onto the lit side: hold a draw, then swipe that way. Two each way light the pivot. Shoot it in its colour. Then reland it.",
      p1: "1. On the left swing, drag the boom onto the lit side and hold it there.\n2. On the right swing, hold a draw while your partner steers, then swipe toward the lit side.\n3. Shoot the pivot in its colour.",
      p2: "1. On the left swing, hold a draw while your partner steers, then swipe toward the lit side.\n2. On the right swing, drag the boom onto the lit side and hold it.\n3. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "davit",
      steps: [
        { ask: "left", leanMilli: -20000, rangeMilli: 8000, color: "either", beats: 6 },
        { ask: "left", leanMilli: 15000, rangeMilli: 8000, color: "either", beats: 4 },
        { ask: "right", leanMilli: 20000, rangeMilli: 8000, color: "either", beats: 6 },
        { ask: "right", leanMilli: -15000, rangeMilli: 8000, color: "either", beats: 4 },
        { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "red", beats: 3 },
        { ask: "reland", leanMilli: -10000, rangeMilli: 8000, color: "either", beats: 3 },
        { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "cyan", beats: 3 },
        { ask: "reland", leanMilli: 10000, rangeMilli: 8000, color: "either", beats: 3 },
        { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theHalter",
    name: "THE HALTER",
    guide: {
      both: "One of you touches nothing while the other holds both grips. Hold it together and the seam opens. Then shoot the bared centre.",
      p1: "1. Left mark: hold both grips down while your partner keeps still.\n2. Right mark: let go and touch nothing at all.\n3. When the seam starts to close, do it again, either way round.\n4. Shoot the centre in its colour.",
      p2: "1. Left mark: let go and touch nothing at all.\n2. Right mark: hold both grips down while your partner keeps still.\n3. When the seam starts to close, do it again, either way round.\n4. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "halter",
      steps: [
        { ask: "left", color: "either", beats: 10 },
        { ask: "right", color: "either", beats: 10 },
        { ask: "fire", color: "red", beats: 3 },
        { ask: "guard", color: "either", beats: 8 },
        { ask: "fire", color: "cyan", beats: 3 },
        { ask: "guard", color: "either", beats: 6 },
        { ask: "fire", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theCapstan",
    name: "THE CAPSTAN",
    guide: {
      both: "One of you drags the drum to turn a band toward the other, who rubs it bright. Both bands bright bare the core. Shoot it in its colour.",
      p1: "1. Left mark: drag the drum left and hold it.\n2. Right mark: rub the band your partner turns to you.\n3. When rust creeps back, do it again, either way round.\n4. Shoot the core in its colour.",
      p2: "1. Left mark: rub the band your partner turns to you.\n2. Right mark: drag the drum right and hold it.\n3. When rust creeps back, do it again, either way round.\n4. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "capstan",
      steps: [
        { ask: "left", color: "either", beats: 12 },
        { ask: "right", color: "either", beats: 12 },
        { ask: "fire", color: "red", beats: 3 },
        { ask: "hold", color: "either", beats: 8 },
        { ask: "fire", color: "cyan", beats: 3 },
        { ask: "hold", color: "either", beats: 6 },
        { ask: "fire", color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theGall",
    name: "THE GALL",
    guide: {
      both: "Pinch the gall shut where it sits, on your half. It jumps: find it and pinch it there. Three closes bare the root. Shoot it in its colour.",
      p1: "1. When the gall sits on your half, the left, pinch it shut and keep it shut.\n2. When it jumps, say where it went.\n3. After three closes, shoot the root in its colour.",
      p2: "1. When the gall sits on your half, the right, pinch it shut and keep it shut.\n2. When it jumps, say where it went.\n3. After three closes, shoot the root in its colour.",
    },
    entries: [],
    boss: {
      kind: "gall",
      steps: [
        { ask: "close", color: "either", beats: 6 },
        { ask: "close", color: "either", beats: 5 },
        { ask: "close", color: "either", beats: 5 },
        { ask: "fire", color: "red", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theBurgee",
    name: "THE BURGEE",
    guide: {
      both: "One of you taps the flag still over the lit column. The other holds a draw and swipes toward it. Two catches light the spindle. Shoot it in its colour.",
      p1: "1. First, tap the flag still when it swings over the lit column.\n2. Next, hold a draw and swipe toward the column once it stops.\n3. Shoot the spindle. Catch the flag back when it creeps loose.",
      p2: "1. First, hold a draw and swipe toward the column once it stops.\n2. Next, tap the flag still when it swings over the lit column.\n3. Shoot the spindle. Catch the flag back when it creeps loose.",
    },
    entries: [],
    boss: {
      kind: "burgee",
      steps: [
        { ask: "catch", freezer: 1, offset: -1, sweepMilli: 1000, color: "either", beats: 6 },
        { ask: "catch", freezer: 2, offset: 1, sweepMilli: 1000, color: "either", beats: 5 },
        { ask: "fire", freezer: "either", offset: 0, sweepMilli: 0, color: "red", beats: 3 },
        {
          ask: "recatch",
          freezer: "either",
          offset: 1,
          sweepMilli: 500,
          color: "either",
          beats: 7,
        },
        { ask: "fire", freezer: "either", offset: 0, sweepMilli: 0, color: "cyan", beats: 3 },
        {
          ask: "recatch",
          freezer: "either",
          offset: 1,
          sweepMilli: 1000,
          color: "either",
          beats: 5,
        },
        { ask: "fire", freezer: "either", offset: 0, sweepMilli: 0, color: "either", beats: 3 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theFlue",
    name: "THE FLUE",
    guide: {
      scene: "theFlue",
    },
    entries: [],
    boss: {
      kind: "flue",
      levels: [
        { weapon: "bolt", color: "red", speedMilli: 1000, slowMilli: 1000, from: "left", needs: 1 },
        {
          weapon: "bolt",
          color: "cyan",
          speedMilli: 1000,
          slowMilli: 1000,
          from: "right",
          needs: 1,
        },
        { weapon: "bolt", color: "red", speedMilli: 1500, slowMilli: 1000, from: "left", needs: 1 },
        {
          weapon: "beam",
          color: "cyan",
          speedMilli: 1000,
          slowMilli: 1000,
          from: "left",
          needs: 1,
        },
        {
          weapon: "bolt",
          color: "cyan",
          speedMilli: 1500,
          slowMilli: 1000,
          from: "left",
          needs: 2,
        },
        { weapon: "beam", color: "red", speedMilli: 1500, slowMilli: 500, from: "right", needs: 1 },
        { weapon: "bolt", color: "red", speedMilli: 2250, slowMilli: 750, from: "right", needs: 1 },
        { weapon: "beam", color: "cyan", speedMilli: 2000, slowMilli: 500, from: "left", needs: 1 },
        { weapon: "bolt", color: "cyan", speedMilli: 3000, slowMilli: 500, from: "left", needs: 2 },
        { weapon: "bolt", color: "red", speedMilli: 3600, slowMilli: 250, from: "right", needs: 1 },
        { weapon: "beam", color: "red", speedMilli: 2250, slowMilli: 250, from: "left", needs: 2 },
      ],
    },
    bossType: "normal",
    controls: "shots",
  },
];
