import type { BossKind, RoundKind } from "./boss-strike.js";
import type { BreachWeight } from "./hull-damage.js";
import type { Color, Creature } from "./types.js";

/**
 * **What became of a body that fell**, as `SimEvent` arms: a kill, a crater,
 * a refusal, a bolt turned away, a rock turned at the shield, and the hull
 * broken through.
 *
 * Cut out of `events.ts` on 17 October 2026 with `events-hands.ts` and
 * `events-pod.ts`, for the reason that file gives. Only the union crosses.
 */
export type BodyEvent =
  /**
   * A body was destroyed. `kind` is what it was **drawn as** and not what it
   * was — `wornKind`, never `c.kind` — because a lure is a full-size slick or
   * bulb in every pixel player 1 owns right up to the beat it goes, and an
   * event naming the real kind would put a tell on that screen the frame it
   * dies.
   *
   * It carries the kind as well as the colour because the colour alone cannot
   * say what died: red is a slick and cyan a bulb, which is right for an
   * ordinary kill and wrong for every body that is neither. `effects-break.ts`
   * cuts the pieces of a broken body out of that body's own contour, and a
   * magnet cut into a slick's wedges is the wrong silhouette at a size where
   * the difference is visible.
   *
   * `of` is the creature it *was*, and it is set by exactly two kills — the
   * echo's and the rind's — because those are the two whose strike
   * (`render/body-hit.ts`, `hitFor`) differs from the worn body's. Neither is
   * a secret: both seats watch an echo divide and a rind shed. A lure never
   * sets it, for the reason above, and a kind whose strike is the worn body's
   * has no cause to.
   * `id` is the body's own — hashed, so both phones agree on it — and every
   * kill in `sim` sets it: a slick dies a different way each body.
   */
  | {
      type: "destroy";
      id?: number;
      col: number;
      row: number;
      color: Color;
      kind: Creature["kind"];
      of?: Creature["kind"];
    }
  /**
   * A crater, or a rock swept aside. `kind` and `span` are the body's, so a
   * rock's puffs are thrown where its bent fall draws it rather than at its
   * row (`render/rock-fall.ts`).
   */
  | { type: "hole"; col: number; row: number; kind: Creature["kind"]; span: number }
  | { type: "reject"; col: number; row: number }
  /**
   * A bolt turned away by a body that is not stone and cannot be broken — THE
   * LIMPET, THE LEECH, THE WEIGHT (`bullet-hit.ts`).
   *
   * Its own event and not `magnetPlate`, which carries the same three fields:
   * that one is drawn from the plate's own offset on the magnet's shape, and a
   * ricochet starting there would begin a tile below a limpet. The *look* is the
   * same one, called rather than copied (`render/magnet-bounce.ts`).
   */
  | { type: "bounce"; col: number; row: number; color: Color }
  /**
   * A rock turned at the shield. `seed` is the creature's id and `holes` its
   * craters — the two numbers `drawRockBody` paints a rock from — so the
   * bounce wears the look the pair watched fall (`render/deflect.ts`).
   */
  | {
      type: "deflect";
      col: number;
      span: number;
      kind: Creature["kind"];
      fromRow: number;
      seed: number;
      holes: number;
    }
  | {
      type: "breach";
      col: number;
      /** How it sounds: a rock going through the plate, or a body brushing
       * it (`hull-damage.ts`). It used to be the hull points it cost, which
       * `packages/audio` split its cue on; there are no points any more. */
      weight: BreachWeight;
      span: number;
      kind: Creature["kind"];
      fromRow: number;
      /** The body's id and craters, as on `deflect`; 0 and 0 when no body
       * fell — a round that breaks the hull with nothing on the field. */
      seed: number;
      holes: number;
      /** The colour of the body that broke through, for the burst
       * (`effects-breach.ts`); null for a rock, and for a round with no body. */
      color: Color | null;
      /** The beat this happened on — matches the `Scar`s it left, so render/
       * can tell a scar's crack apart from one an earlier beat left behind. */
      beat: number;
      /** The boss that struck, when a window ran out (`boss-strike.ts`):
       * render/ draws its own blow rather than a rock nobody saw fall. */
      by?: BossKind;
      /** Which of its blows, for a boss with more than one (THE RATCHET's
       * jam and its loose bolt); none for the rest. */
      blow?: string;
      /** The round whose window ran out (`roundStrikesHull`). */
      round?: RoundKind;
    };
