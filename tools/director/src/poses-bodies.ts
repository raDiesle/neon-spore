import { beatSeconds, DEFAULT_CONFIG, ghostRage } from "@neon-spore/sim";
import {
  EVENT_CADENCE_SECONDS,
  firstOfKind,
  fresh,
  living,
  type Pose,
  run,
  runUntil,
  POSE_TPB as TPB,
} from "./pose-kit.js";

/**
 * The pose a candidate for a *body* is judged on, as opposed to one for a
 * mechanism firing.
 *
 * `poses-versus.ts` next door is six states in which something happens — a
 * plate turns a shot away, a hand shoves a rock, a worm walks. Every one of
 * them is one creature doing one thing, because every slot over there is about
 * one creature. A slot about what a body is *made of*, or about the contour it
 * is cut to, is not: `creature:skin` patches the material every blob in the
 * game shares, and `creature:slick` and `creature:bulb` are contours that can
 * only be judged against the bodies they might be mistaken for. One pose
 * serves all three, and it lives here rather than growing that file past the
 * line ceiling a second time.
 *
 * `DART · THE RUN` joined it for the second half of that seam rather than the
 * first: a dart's thrust is not a mechanism the pair operates, it is something
 * a *body* does on its own every other beat, and `creature:dart` is a slot
 * about what that body looks like while it does it.
 */

/**
 * Four bodies of four kinds standing together, which is what a candidate for
 * the *skin* has to be judged on.
 *
 * Every pose next door is one creature doing one thing, because every slot
 * over there is about one creature. `creature:skin` patches the material
 * `drawLiving` gives to every blob in the game at once — slick, bulb, throb,
 * dart, wisp, choir and every lure wearing one of them — so a pose with one
 * body on it would answer a fifth of the question. Two colours and two
 * proportions, flat and round, so the one thing the pair reads off a body at
 * twenty-six pixels is on screen four ways at the same instant.
 *
 * It carries `cadenceSeconds` even though a skin is continuous, and the reason
 * is the field rather than the look: bodies **fall**. Left running, this pose
 * spends half its time as an empty field and the other half as four bodies
 * breaking up against the hull, which is a picture of a wave ending rather
 * than of a material. The two-second replay holds them where they can be
 * looked at.
 *
 * **Every slot judged against the bodies a body could be mistaken for lands
 * here**, which is why `versus-pose.ts` names it more than any other pose:
 * the two interiors (`creature:slick`, `creature:bulb`), the two outlines
 * (`slick:shape`, `bulb:shape`), the sway (`slick:motion` — a swing is only
 * told from a shiver beside it), and the space behind them all
 * (`field:backdrop`), whose question is not whether a back is handsome but
 * whether four bodies in front of it are easier to read; a back judged on an
 * empty field would win on exactly the thing it must lose on.
 */
export const BODIES_POSE: Pose = {
  name: "BODIES · FOUR KINDS AT ONCE",
  note: "A slick, a bulb, a dart and a throb standing on the field at once, two of them red and two cyan. Nothing is happening to any of them: what is being compared is what they are made of, on every frame, and four kinds at once is the only way to see whether one material serves all of them.",
  lookAt:
    "the inside of the four bodies — whether each reads as a solid thing under a light or as a shape cut out of the background",
  crop: "field",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    // The two colour-derived bodies go through `living`, which asks
    // `kindForColor`: a slick spelled out beside "red" is a second copy of the
    // one mapping the bestiary owns, and `copies.test.ts` says so. The other
    // two carry a colour that does not decide their shape, so they are spelled
    // out.
    // The columns are odd, even, even, odd on purpose. A dart does not hold
    // its lane: every other beat it takes two whole columns to one side or the
    // other, so from an even column it is only ever in an even one — and at
    // 6 with a throb at 8 it walked onto the throb inside the first replay and
    // the two bodies this pose exists to tell apart were drawn on top of each
    // other. The two standing bodies are odd now and the dart is even, which
    // no roll of its own can undo.
    const w = fresh([
      living("red", 1),
      living("cyan", 3),
      { beat: 0, col: 6, kind: "dart", color: "red" },
      { beat: 0, col: 9, kind: "throb", color: "cyan" },
    ]);
    // Long enough that all four have left the top row and are on the field
    // proper, and that their own-motions are out of phase with each other —
    // and short enough that two seconds of replay never reaches the hull.
    run(w, TPB * 4);
    return w;
  },
};

/**
 * A dart on the beat it is travelling, held on the tick its thrust is hottest.
 *
 * This creature spends every other beat hanging still and taking aim, and the
 * one after it thrown down a diagonal — `dartThrust` is at its maximum on the
 * first tick of the run and decays across it, so a pose that stopped anywhere
 * else would be a picture of a dart with no flame on it at all. `runUntil`
 * stops on the tick `dartFloat` goes false, which is that tick and not the one
 * after.
 *
 * It carries `cadenceSeconds` for the plainest reason on the sheet: the flame
 * lasts one beat. Left running, the body hangs unlit for half of every bar and
 * is off the tile crop within four, so the two-second replay is what puts the
 * thing being judged back on screen at a rhythm somebody can watch.
 *
 * `span` is 5 rather than a creature's usual 3 because the exhaust is the
 * subject and it reaches most of a tile back up the diagonal — a frame fitted
 * to the body would cut the picture off exactly where the argument is.
 */
export const DART_RUN_POSE: Pose = {
  name: "DART · THE RUN",
  note: "A dart on the beat it is thrown, at the instant its thrust is hottest. It hangs for a beat taking aim, then takes two rows and two columns down one diagonal; the flame is on for the second of those beats and nothing else on the field burns. It replays every two seconds.",
  lookAt: "the flame behind the body, along the diagonal it is taking",
  crop: "tile",
  span: 5,
  at: firstOfKind("dart"),
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    // Column 5 is the middle of eleven, so the run has room to go either way
    // and the crop is centred wherever the roll sent it.
    const w = fresh([{ beat: 0, col: 5, kind: "dart", color: "red" }]);
    runUntil(w, "a dart on its run", [], (x) => x.creatures[0]?.dartFloat === false);
    return w;
  },
};

/**
 * One ghost crossing, wearing the camouflage that is failing.
 *
 * **Only player two is ever shown one**, which is the creature rather than an
 * omission — `WISP · STANDING`'s case, and it needs no machinery here: the pair
 * draws both seats one above the other, so the row that matters is the lower
 * one and player one's correct picture of an empty field is part of what this
 * body is.
 *
 * Crossing rather than falling, because a falling ghost sits at `rage` nought
 * and the disguise barely moves. It is handed over part-way through the temper
 * and **before the last turn**, when the whole camouflage comes off and the
 * body dives: what a look here is about is on screen for the crossing and gone
 * after it. `ghost:tears` was judged here first and `creature:ghost` after it
 * was settled — the camouflage decided, the interior it is torn over open.
 *
 * It lives on this page rather than with the surfaces next door for the reason
 * `BODIES · FOUR KINDS AT ONCE` does — a slot about what a body is *made of* —
 * and because `poses-surface.ts` is four lines under its ceiling.
 */
export const GHOST_POSE: Pose = {
  name: "GHOST · TORN",
  note: "One ghost crossing the field on player two's screen and nothing at all on player one's. It is wearing torn bands of itself thrown sideways against each other, with a few flung clear of the outline — the disguise it wears instead of being invisible, and it gets worse the further through its temper it is.",
  lookAt:
    "the bands inside the outline — whether they read as a surface coming apart or as slabs sliding across a flat picture",
  crop: "field",
  build: () => {
    // `path: "across"` is what makes a ghost cross rather than fall
    // (`sim/spawn.ts`), and it sets off away from the nearer wall — so the
    // first column is where the long crossing starts.
    const w = fresh([{ beat: 0, col: 1, kind: "ghost", color: "cyan", path: "across" }]);
    // Two laps of three: far enough in that the temper has opened the throws
    // up, and short of the third, on which the camouflage comes off altogether
    // and the body dives.
    runUntil(w, "a ghost part-way through its temper", [], (x) =>
      x.creatures.some((c) => {
        if (c.kind !== "ghost") return false;
        const rage = ghostRage(x.cfg, c);
        return rage > 0.3 && rage < 1;
      }),
    );
    return w;
  },
};

/**
 * How long one echo takes to divide twice, in seconds, plus a beat.
 *
 * Derived rather than typed, `fallSeconds`'s way: the first wait is
 * `echoSplitBeats` and the second is twice that (`echoWaitBeats`), so the
 * window runs from one body to four and a beat past the second parting —
 * long enough that the eye sees the halves strain in their turn and the four
 * stand for a moment, and short of the third, which is `ECHO_AXES`'s
 * two-by-two and a different picture. Plus the beat the pose runs before it
 * is handed over, which the first wait is counted from.
 */
const ECHO_CADENCE_SECONDS = (DEFAULT_CONFIG.echoSplitBeats * 3 + 2) * beatSeconds(DEFAULT_CONFIG);

/**
 * One echo, from the beat it arrives to the beat its halves have parted in
 * their turn.
 *
 * Every other pose on this page holds a body so it can be looked at; this one
 * is watched **through** something, because the mark a look here is about is
 * the one that says *this body is about to come apart*, and a mark like that
 * is only judged as the parting arrives (`creature:echo`). So the world is handed over with the
 * body a beat old and left to run: the furrow deepens, the body necks, it
 * goes, and the two it leaves start their own longer wait — which is when the
 * seam turns to cut across the other axis (`ECHO_AXES`), the second thing the
 * pair reads off it.
 *
 * Cropped to a tile with a wide span rather than to the field, because an
 * echo is six tenths of a slick and the seam is a share of that; the window
 * follows the first echo there is, and after the parting the halves stand one
 * column either side of where it was, inside the span.
 */
export const ECHO_POSE: Pose = {
  name: "ECHO · ABOUT TO DIVIDE",
  note: "One cyan echo falling on its own. A dark line is cut across it from the moment it arrives, deepening as the beat comes, and on the third beat the body pulls itself in two and parts along that line. Each half then wears its own line the other way, for the parting that follows. It replays from the arrival.",
  lookAt:
    "the line across the body and how it deepens — whether it reads as a groove in something solid or as a scratch across a flat picture",
  crop: "tile",
  span: 5,
  at: firstOfKind("echo"),
  cadenceSeconds: ECHO_CADENCE_SECONDS,
  build: () => {
    const w = fresh([{ beat: 0, col: 5, kind: "echo", color: "cyan" }]);
    // A beat in, so the body is on the field and the furrow is already cut:
    // the floor of the seam is the part that never goes away, and the replay
    // should land on it rather than on an empty column.
    run(w, TPB);
    return w;
  },
};
