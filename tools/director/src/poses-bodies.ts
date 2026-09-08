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
