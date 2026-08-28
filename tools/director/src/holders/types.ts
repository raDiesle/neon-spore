import { DEFAULT_CONFIG } from "@neon-spore/sim";

/**
 * What a holder draft is, and what it is told.
 *
 * BULB QUEEN's flanking torches are drawn today with **nothing holding them**:
 * `packages/render/src/queen-egg.ts` places a bare rock in the flank column
 * and the picture never says why it stays there. The owner asked for three
 * answers to look at rather than one applied — so these live here, in the
 * tool, and the game's own draw path is untouched. `skins/index.ts` states the
 * same doctrine for the same reason: a card is where a look is decided before
 * the game learns to draw it.
 *
 * The types sit apart from the registry so a draft can import them without
 * importing its siblings — `index.ts` imports every draft, and a draft that
 * imported it back would be a cycle. Same arrangement as `skins/types.ts`.
 */

/** The page's heartbeat. The game's own tempo, not a number near it. */
export const BEAT_SECONDS = 60 / DEFAULT_CONFIG.bpm;

/** Beats in one hold-and-release cycle: three holding, one letting go. */
export const CYCLE_BEATS = 4;

/**
 * The moment a draft is drawn at.
 *
 * `release` is the whole reason this is an object rather than a time value.
 * A holder that only ever holds is a bracket, and every one of these three has
 * to answer the harder half — what it looks like at the instant it stops
 * holding. So the cycle is handed over already resolved: 0 while the rock is
 * held, running 0 → 1 across the beat it is let go.
 */
export interface HolderFrame {
  /** Seconds on the page clock, for anything free-running. */
  t: number;
  /** 0..1 through the current beat, the same value on every card in the frame. */
  beat: number;
  /** 0 while held; 0 → 1 over the release beat. */
  release: number;
}

export interface HolderContext {
  ctx: CanvasRenderingContext2D;
  /** Logical width and height of the card, before device pixel ratio. */
  w: number;
  h: number;
  /** Where the rock's centre sits, and how big it is. Shared by all three. */
  rockX: number;
  rockY: number;
  rockR: number;
  /** The queen's flank: her body's edge, as a circle the draft may draw against. */
  bodyX: number;
  bodyY: number;
  bodyR: number;
  /**
   * Draw the torch itself, at `rockX`/`rockY`/`rockR`.
   *
   * Handed to the draft rather than drawn around it, because the layering is
   * the argument: a collar has to pass *behind* the rock and then in front of
   * it or it reads as a ring painted on, and a claw's fingers close over the
   * front. A panel that drew the rock at a fixed moment would settle that for
   * all three and throw away the difference being looked at.
   *
   * It is the game's own `drawTorchRock`, not a stand-in, so what is being
   * compared is three holders and not three guesses at a rock.
   */
  drawRock(): void;
}

export interface Holder {
  id: string;
  /** Shown on the card. Named the way a player would name it. */
  name: string;
  /** One sentence: what this holder claims about the queen. */
  claim: string;
  /** The argument for it, and the argument against. Both, always. */
  note: string;
  draw(c: HolderContext, f: HolderFrame): void;
}
