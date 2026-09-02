import type { MazeVerdictReason } from "./maze-round.js";
import type { MirrorStep, MirrorVerdictReason } from "./simon.js";
import type { Color, Creature, CreatureKind, PodKind } from "./types.js";

/**
 * Everything the simulation reports about a tick, and the whole of what it
 * says to anybody. render/ and `packages/audio` read this list and nothing
 * writes back: the world does not know either of them exists.
 *
 * Its own file rather than `world.ts`, because it is the sim's *output*
 * vocabulary and not part of a world — the same argument `entries.ts` makes
 * about the input side. `packages/audio/test/bind.test.ts` reads this union
 * out of the source to check that every event has a sound, so a new one here
 * fails that test rather than going quietly silent.
 */
export type SimEvent =
  | { type: "beat"; beat: number }
  | { type: "waveStart"; wave: number }
  | { type: "needWave"; wave: number }
  /** `lance` is true when the shot left a full lobe — see `lance.ts`. */
  | { type: "fire"; col: number; color: Color; lance: boolean }
  /** The lobe came full: from this moment the next shot out of it is a lance. */
  | { type: "lanceFull"; col: number }
  /** A shot went out through a lobe that was not full yet, and took the fill with it. */
  | { type: "lanceSpilled"; col: number }
  | { type: "destroy"; col: number; row: number; color: Color }
  | { type: "hole"; col: number; row: number }
  | { type: "reject"; col: number; row: number }
  | { type: "deflect"; col: number; span: number; kind: Creature["kind"]; fromRow: number }
  /** A hand took hold. Only the moment it lands — the hold itself is state,
   * not an event, and render/ reads it off the world every frame. */
  | { type: "grip"; player: 1 | 2; col: number; row: number }
  | { type: "podLoose"; col: number; row: number }
  | { type: "podTaken"; col: number; kind: PodKind }
  | { type: "podLost"; col: number }
  | {
      type: "breach";
      col: number;
      damage: number;
      span: number;
      kind: Creature["kind"];
      fromRow: number;
      /** The beat this happened on — matches the `Scar`s it left, so render/
       * can tell a scar's crack apart from one an earlier beat left behind. */
      beat: number;
    }
  | { type: "petal"; col: number; row: number; left: number }
  | { type: "queenDown"; col: number; row: number }
  /**
   * THE WARDEN lowered a line out of the middle of its rim. `color` is what the
   * rim will carry until the line goes — the same colour the one shot into the
   * eye has to be.
   */
  | { type: "tether"; col: number; color: Color }
  /** The line came fully taut and the hatch stands open. One shot counts. */
  | { type: "eyeOpen"; col: number; color: Color }
  /** A plate off the rim. `color` is the rim's, which is what took it. */
  | { type: "plate"; col: number; row: number; left: number; color: Color }
  | { type: "wardenDown"; col: number; row: number }
  /**
   * THE MIRROR performed one step of a sequence. `index` is 1-based, and
   * `col` is the column its own cannon was standing in as it did — which is
   * where render/ drops the ghost of a shot it performed.
   */
  | { type: "mirrorShow"; step: MirrorStep; index: number; of: number; col: number }
  /** The pair answered one step of a sequence correctly. */
  | { type: "mirrorEcho"; step: MirrorStep; index: number; of: number }
  /** A round is settled — right or wrong, why, and where it landed. */
  | { type: "mirrorVerdict"; right: boolean; col: number; reason: MirrorVerdictReason }
  | { type: "mirrorDown"; col: number }
  /**
   * The pair fired into one of THE MAZE's three mouths. `col` is the column
   * that mouth hangs over, which is where the shot went in and — if the strand
   * behind it goes nowhere — where the answer comes back out.
   */
  | { type: "mazeCommit"; mouth: number; col: number }
  /**
   * The shot stands one cell further into the wheel. `ring` counts outward
   * from the mouths and `sector` is around, both in the wheel's own
   * coordinates and never the field's: the wheel is not on the grid.
   */
  | { type: "mazeProbe"; ring: number; sector: number; of: number }
  /** A round is settled — right or wrong, why, and the mouth it landed in. */
  | { type: "mazeVerdict"; right: boolean; col: number; reason: MazeVerdictReason }
  | { type: "mazeDown"; col: number }
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
   * A salvo into open water on THE FLEET's chart. `col` and `row` are the
   * square, in the chart's own coordinates — which are the field's, because
   * the chart stands on the grid rather than beside it.
   *
   * Its own event and not a `reject`, because the ear has to tell "that did
   * nothing" from "that was a square, and it was empty": a splash spends the
   * square and the rest between two salvoes, and a press onto a square already
   * fired at spends neither. Both seats hear it — the chart is the one thing
   * in this fight the two of them share.
   */
  | { type: "fleetSplash"; col: number; row: number }
  /** A salvo that found a hull. The square is now marked on both screens. */
  | { type: "fleetHit"; col: number; row: number }
  /**
   * The last square of one ship. `len` is how long it was and `left` how many
   * are still afloat, so the ear can say how big a thing just went down and
   * how much of the fight is left without either screen being read.
   */
  | { type: "fleetSunk"; col: number; row: number; len: number; left: number }
  /** The last ship of the fleet. The chart is clear and the wave is over. */
  | { type: "fleetDown"; col: number; row: number };
