import type { Color, CreatureKind } from "./types.js";

/**
 * Everything **one body** did, as an event: a disguise shot or leaving on its
 * own, armour chipping, a covering coming off, a cloud shutting over a shot or
 * torn open by one, a tile expiring, a ghost letting go, a layer shed.
 *
 * Split out of `events.ts` when THE RIND took that file past its 250-line
 * limit, along the seam `packages/audio` already reads on: `bind-creatures.ts`
 * was cut from `bind.ts` for the same reason and holds exactly these cases, so
 * the group is a fact about the field rather than a convenient cut. What stays
 * next door is the ship, the field, the hull, the pods and the bosses — events
 * about the *game*.
 *
 * It is one arm of `SimEvent` and not a union anything handles on its own:
 * every consumer still switches over the whole list, which is what keeps a new
 * event a compile error rather than a silence.
 */
export type CreatureEvent =
  /**
   * A lure was shot — a mistake, not a kill (`resolveLure`, bullet-hit.ts).
   * Its own event because the ear has to tell this apart from an ordinary
   * `destroy`: the same reflex that pays off everywhere else on the field is
   * wrong here, and a sound identical to a kill is the one that would hide
   * that from the pair.
   */
  | { type: "lureHit"; col: number; row: number }
  /**
   * A lure came onto the field. Player 2's alarm cue hangs off this and player
   * 1's device plays nothing for it: a chime both phones make would carry the
   * disguise straight through the speaker, in a room where the two of them are
   * sitting next to each other.
   */
  | { type: "lureSeen"; col: number }
  /**
   * A lure left the field on its own, `lureVanishRows` short of the hull. The
   * one moment of this creature both screens show identically, and player 1's
   * vindication: the body they were told to leave alone resolved itself.
   *
   * `color` is the disguise's — the only colour either player has ever seen it
   * in — so what fades is what was standing there, and nothing is revealed at
   * the last instant that was hidden a moment before it.
   */
  | { type: "lureVanished"; col: number; row: number; color: Color }
  /**
   * A piece of THE SHELL came off, in the column it was struck. `left` is how
   * many are still on, which is what the pair now has to name: after the first
   * break the two columns of one body stop being interchangeable.
   */
  | { type: "shellBreak"; col: number; row: number; left: number }
  /**
   * The last piece went and the body under it carries a colour for the first
   * time. `col` is the body's own leftmost column rather than the struck one,
   * because this is about the whole arrival and not about the tile a shot
   * landed in. Nothing knew this colour a tick ago — it is drawn at the break
   * (`shell-round.ts`), which is the only honest way to say so.
   */
  | { type: "shellBare"; col: number; row: number; color: Color }
  /**
   * A clasp was opened by the ward and is now the body it was hiding. `kind`
   * is what it *became*, not what it was: by the time anything reads this the
   * creature is already a slick or a bulb, and an event naming the old kind
   * would be describing something that no longer exists on the field.
   *
   * `color` is the body's, and it was never a secret — a clasp is visibly red
   * or cyan through its shield the whole way down, so that player 2 can be
   * told which trigger to load before the shield is anywhere near it. Absent
   * only for a colourless clasp, which nothing authors.
   */
  // `id` is the body the shield came off, and it is on this event for one
  // reason: the picture of a shield failing is drawn *around a creature that
  // is still falling* (`render/clasp-break.ts`), so the renderer has to be
  // able to find that body on every later frame. A column and a row are where
  // it was on the tick of the trigger, which is a different place one beat on.
  | {
      type: "claspBreak";
      id: number;
      col: number;
      row: number;
      kind: CreatureKind;
      color?: Color;
    }
  /**
   * The body inside a veil turned over — a slick became a bulb, or the other
   * way round. `color` is what it is *now*, which is the whole of what player 1
   * has to say next.
   *
   * Both devices carry it, and that is deliberate rather than an oversight of
   * the split: what player 2 is not told is *which* body, and a cloud that
   * visibly rolls over its own weather at the moment it turns is a fact both
   * screens already show. The ear gets the same thing — a turn nobody can read
   * the colour of — so player 2 knows the call they are holding has expired
   * without being told what replaced it.
   */
  | { type: "veilMorph"; col: number; row: number; color: Color }
  /**
   * A shot in the wrong colour struck a veil, and the cloud shut on it for
   * `veilArmourMs`. Its own event rather than a `reject`, because the ear has
   * to tell "that did nothing" from "that did something and it was bad": a
   * rebuff costs the pair a window as well as a shot, and the picture that
   * follows — red cloud, red lightning — is the only warning player 2 gets
   * that the next shot will bounce too.
   */
  | { type: "veilRebuff"; col: number; row: number }
  /**
   * The cloud came apart on a shot that matched, and what was inside it is
   * visible for the first time on player 2's screen. `kind` is the body that
   * was in there and `color` the shot that took it — the same colour, since
   * nothing else opens a veil.
   *
   * It rides beside the ordinary `destroy` on the same tick rather than in
   * place of it: the kill is a kill and gets the kill's burst, its sound and
   * its score, and this is the half-second of weather that comes off the top
   * of it (`render/veil-tear.ts`).
   */
  | { type: "veilTorn"; col: number; row: number; color: Color; kind: CreatureKind }
  /**
   * Every wisp on the field is somewhere else. **It carries no column and no
   * row, and that is the whole of the event**: a cue is panned by column and
   * pitched by row (`bind.ts`), and both devices play it, so an event with a
   * position on it would put the tile player 1 must not know into the speaker
   * of the phone in their hand — in a room where the two of them are sitting
   * next to each other. What it is allowed to say is the one thing player 1
   * *needs*: the call you are holding has just expired.
   *
   * One event for the whole field rather than one per body, because the hop
   * is read off the shared beat and every wisp takes it at once (`wispHops`).
   */
  | { type: "wispHop" }
  /**
   * A ghost was shot, and for the length of one escape both screens draw it.
   *
   * It rides beside the ordinary `destroy` on the same tick rather than in
   * place of it, exactly as `veilTorn` does: the kill is a kill and keeps its
   * burst, its sound and its score, and this is the body letting go and
   * climbing out of the top of the field (`render/ghost-release.ts`).
   *
   * Its own event and not a flag on `destroy`, because what it is for is the
   * *other* screen. Player 1 has never seen this body — only the band across
   * its row — so the one moment it is worth drawing for them is the moment it
   * is no longer a secret, and an event nobody could tell from a slick's death
   * could not carry that.
   */
  | { type: "ghostRelease"; col: number; row: number; color: Color }
  /**
   * A crossing ghost ran out of field, stood at the wall and turned back.
   * `laps` is how many walls it has now touched, which is the number the pair
   * is counting: at `ghostChargeLaps` it stops prowling.
   *
   * Both devices carry it, and that is deliberate rather than a leak of the
   * split. Player 1 cannot see the body and is not told which wall — only
   * that one more turn has gone by, which is the half of this creature that
   * is about *time* rather than about place, and time was never the secret.
   */
  | { type: "ghostTurn"; col: number; row: number; laps: number }
  /**
   * It has given up on prowling and is coming down at the ship, head first.
   * From this moment it is drawn on both screens (`showsGhostBody`): a hull
   * hit nobody could see coming is a hull hit the pair cannot learn from.
   */
  | { type: "ghostCharge"; col: number; row: number }
  /**
   * A layer came off THE RIND, and the body standing there is a size smaller.
   * `left` is how many it still wears, which is the number the pair is
   * counting down — at zero the next matching shot is an ordinary kill.
   *
   * Its own event rather than a `destroy` on a body that is still falling,
   * for `shellBreak`'s reason and rather more of it: the ear and the eye both
   * have to be able to tell "that one landed and it is still coming" from
   * "that one is gone", because the whole creature is the second shot the pair
   * would not otherwise have fired.
   *
   * It carries the colour that took the layer — which is the body's own, since
   * nothing else can shed one — so the burst is the body's colour rather than
   * a grey one: this was a hit and it should feel like one.
   */
  | { type: "rindShed"; col: number; row: number; color: Color; left: number }
  /**
   * THE GYRE's wheel failing, a beat after the last body left its rim
   * (`breakSpentGyres`). The hub's own tile and not the kill's: what breaks is
   * the armature, and the sixth `destroy` threw its particles two columns away
   * on the tick before this.
   */
  | { type: "gyreBroke"; col: number; row: number };
