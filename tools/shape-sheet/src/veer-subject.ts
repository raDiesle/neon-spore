import { clownFigure, clownLoops, type Point, VEER_CLOWN } from "@neon-spore/content";
import { linePath, type Subject } from "./contour.js";

/**
 * THE VEER: the meteor with its rider on it, and the one subject on this sheet
 * made of a shape already here plus something laid over the top.
 *
 * **Why it is a card at all.** The stone is `METEOR` and always was — a veer
 * is drawn through the same `drawMeteor` every other rock is — so on the
 * argument that this sheet holds one card per contour it had none. But what a
 * pair sees coming down the field is a stone with a figure in a pointed hat
 * sitting on it, and *that* is a different word: it is the only rock in the
 * game anybody would describe by pointing at what is on it. The director's
 * VEER brush drew the bare stone for want of a card, which is a palette
 * teaching that the two rocks look alike, and they do not.
 *
 * **It lives beside `subjects.ts` rather than in it** for `ring.ts`'s reason:
 * that file answers "what does the game draw" one shape at a time, and this is
 * the only entry that is two shapes stacked. It also took that file past its
 * line limit, which is the ordinary way a seam gets found here.
 *
 * **At rest, and standing straight.** The crouch and the hat's lean are the
 * beat talking (`content/veer-clown-shape.ts`), and a still card is the wrong
 * place to judge a tell. Loops rather than one contour, because the figure is
 * a pile of separate round things: joining them with a stroke across the gaps
 * would hide the one fact that makes it read as a passenger rather than as
 * something carved into the stone.
 */
export function veerSubject(rock: Subject, r: number): Subject {
  const loops = (t: number): Point[][] => [
    rock.pointsAt(t),
    ...clownLoops(clownFigure(VEER_CLOWN, 0, 0, r, 0, 0)),
  ];
  return {
    name: "VEER",
    note: "the dead rock, with the rider that steers it",
    open: false,
    loopsAt: loops,
    pointsAt: (t) => loops(t).flat(),
    // Corner to corner, nothing smoothed: the stone is faceted and the hat is
    // a triangle, and both lose their point to a curve fitted through them.
    // The discs are sampled fine enough that a straight run between two of
    // their points is shorter than a pixel at the size any of this is drawn.
    path: linePath,
  };
}
