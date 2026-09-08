import {
  EVENT_CADENCE_SECONDS,
  fresh,
  living,
  type Pose,
  run,
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
    const w = fresh([
      living("red", 2),
      living("cyan", 4),
      { beat: 0, col: 6, kind: "dart", color: "red" },
      { beat: 0, col: 8, kind: "throb", color: "cyan" },
    ]);
    // Long enough that all four have left the top row and are on the field
    // proper, and that their own-motions are out of phase with each other —
    // and short enough that two seconds of replay never reaches the hull.
    run(w, TPB * 4);
    return w;
  },
};
