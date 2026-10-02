/**
 * **The commands that are a touch on the field rather than a button on a
 * panel, or no touch at all** — the shake, a tap on a body, a tap on a tile, a
 * light, and a sign drawn on the glass.
 *
 * Cut out of `command-types.ts` when THE MIMIC's glyph would have taken that
 * file past its 250-line limit, along the seam its own arms drew: every one of
 * these is answered by the field under the thumb, or by the device, and none
 * of them is a ship's control. `Command` is the same flat union it always was.
 */
export type TouchCommand =
  /**
   * THE CHOIR's shake, and the only command in this game that is not a thumb
   * on anything: the *device* was picked up and shaken, and the membrane draws
   * together (`choir-gesture.ts`).
   *
   * It carries nothing at all, for `reach`'s reason and one more of its own.
   * There is no column — a shake has no place to be — and no strength either:
   * whether a phone moved enough to count is decided where the accelerometer
   * is read, because that is the only side of the wire that has the numbers,
   * and a threshold crossed on one device is a fact the other must simply be
   * told rather than re-derive from a reading it never saw.
   *
   * The two arrows that stand in for it where no device reports a shake are
   * **not** this command: they are `drag`s at `choirLeft` and `choirRight`,
   * because they are a hand carrying something and not a press.
   */
  | { kind: "shake" }
  /**
   * **Player 2's thumb on a soundbox**, and the first command in this game that
   * is a press on a *body* rather than on a control (`beatbox-round.ts`).
   *
   * `grip` next door is the other thing a finger on the field can be, and the
   * two are deliberately different messages rather than one message read two
   * ways: a grip is a **hold**, so it has a lift to send and a state that lasts
   * as long as the thumb does, and this is instant and complete on the press —
   * what it says is *now*, and a moment cannot be released. A box refuses a
   * hand outright (`grippable.ts`) so that no finger is ever both.
   *
   * `id` names which box, for THE LID's cord's reason exactly: a wave may send
   * several down at once and each is counting its own run. It is safe to name
   * across the wire because ids are dealt out by the simulation, so both
   * devices already agree about which body is which; a stale one finds nothing
   * and does nothing (`beatboxTapped`).
   *
   * It carries no beat and no column. Which beat a press was *for* is decided
   * from the tick it lands on (`beatboxBeatFor`), on the same side of the wire
   * as every other timing in this game — a command that named its own beat
   * would be a device grading its own rhythm, and two devices would grade it
   * differently.
   */
  | { kind: "tap"; id: number }
  /**
   * **A finger on a tile of the field**, from the seat that cannot see what is
   * standing on it — THE MINE's whole answer (`mine.ts`).
   *
   * `tap` above names a **body**, by the id the simulation dealt out, and that
   * is exactly why it could not be reused here. A press this command describes
   * is one that landed on *nothing the sender knows about*: the whole point is
   * that the seat sending it is looking at an empty field, so there is no id
   * for it to carry and no way for the device to find one. What it can say,
   * and the only thing it can say, is the square the thumb came down on.
   *
   * So a column and a row, both in the simulation's own whole tiles — the
   * arrangement `cannonCol` has, one axis further. Not pixels, for that
   * command's reason: two phones of different widths share no pixel and do
   * share a tile. Not a tile index either, which would be the same two numbers
   * multiplied together by a device that would then have to agree with the
   * other one about the width of the field.
   *
   * Which seat's press counts is the creature's rule and not this file's
   * (`mineTapped`), on `tap`'s own terms: the command is what was pressed, and
   * whose press it was belongs to the body it was aimed at. A press on a field
   * with no mine on it at all finds nothing and does nothing.
   */
  | { kind: "tapTile"; col: number; row: number }
  /**
   * A finger on THE DARK's field, from either seat: the square to light
   * (`dark.ts`). `tapTile`'s two numbers for its reason — two phones share a
   * tile and no pixel — and its own kind rather than that one, because a
   * light is dragged and a mine's press must not be.
   */
  | { kind: "light"; col: number; row: number }
  /**
   * **A sign drawn on the glass**, THE MIMIC's answer (`mimic-hand.ts`): the
   * index into the five of `glyphs.ts` that the stroke came nearest to.
   *
   * The shake's argument, for a gesture with a shape: what the thumb drew is
   * judged on the phone it was drawn on, where milliseconds are allowed and
   * the points are, and the other phone is told the result — an index, never
   * a stroke, for a stroke is a reading only one side ever saw. It carries no
   * place, because the pad is the whole lower field and where on it the sign
   * was drawn means nothing. Whose sign it was is the boss's rule: the seat
   * that can read the sign has no pad, and its glyph is dropped.
   */
  | { kind: "glyph"; sign: number };
