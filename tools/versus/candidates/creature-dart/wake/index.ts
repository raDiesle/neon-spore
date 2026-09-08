import { DART_LOOK } from "../../../../../packages/render/src/dart-look.js";
import { patch, type Variant } from "../../../variant.js";
import { wakeJet } from "./paint.js";

/**
 * `creature:dart` / `wake` — the thrust drawn as the line it has been thrown
 * down, rather than as anything burning on the back of the body.
 *
 * TORCH next door argues that the shipped plume is the wrong *flame*. This one
 * argues it is the wrong *subject*. What the pair has to read off this
 * creature is a diagonal: a dart takes two rows and two columns at a time, it
 * alternates, and the seat that can see which way it is going is not the seat
 * holding the cannon. A flame on the tail says "thrust", which the lean
 * already says, and it says it in the one place the eye is least likely to be
 * — behind a body that is moving.
 *
 * WAKE says the line instead. Four short bars lie across the diagonal behind
 * the body, each one shorter, thinner and dimmer than the one in front of it,
 * because distance from the body is age. The nearest is a hard bright mark a
 * hand's width off the tail; the far one is barely there. What is left on the
 * body is a single near-white bead at the tail — the burn is a point and the
 * picture is the track.
 *
 * **Bars and not arrowheads, and not a line down the axis either.** This game
 * has spent the arrow: the navigator's answer, the grip's carry and the
 * choir's prompt are all arrows, and a fourth would read as an instruction to
 * the pair rather than as something a creature is doing. A line *along* the
 * diagonal is spent too — that is the dotted leg player 2 already sees
 * (`dart-path.ts`), and two marks down one axis on the one screen that carries
 * both is one mark saying two things.
 *
 * **It says nothing the navigator's arrow says, and that is why the marks
 * trail rather than lead.** `dartDir` while a dart is travelling is the
 * direction it is *already going*, which both screens read off the lean;
 * `dartNext` is the secret, and it is on player 2's arrow alone
 * (`showsDartArrow`). Every mark here is behind the body, on ground it has
 * covered. One in front would be this creature's whole rule leaked onto the
 * pilot's screen.
 *
 * How it can lose. **Four marks in a tile is a lot of picture** for a body two
 * columns wide moving fast — it may simply read as busy, where a plume is one
 * shape. And **a track says the body is somewhere it is not**: the marks stand
 * on tiles the dart has left, and a pair reading columns out loud has to be
 * sure the brightest thing in a lane is the thing they are naming. Both are
 * questions for an eye at tempo.
 */
export const DART_WAKE: Variant = {
  slot: "creature:dart",
  name: "wake",
  sentence:
    "four short bars left standing across the diagonal behind it, shrinking and fading with age — the track it is on, not a flame on its tail",
  dir: "tools/versus/candidates/creature-dart/wake",
  patches: [
    patch({
      target: DART_LOOK,
      reached: () => DART_LOOK,
      where: {
        file: "packages/render/src/dart-look.ts",
        symbol: "DART_LOOK",
        type: "DartLook",
      },
      fields: { jet: wakeJet },
    }),
  ],
};
