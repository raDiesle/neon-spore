import type { DragTarget } from "@neon-spore/sim";
import type { ControlId } from "./controls.js";

/**
 * **A page of a rehearsal, and the thing its words point at.**
 *
 * Cut out of `scene-types.ts` along the seam that file already had in it: next
 * door is a *thumb* — which control it presses, which handle it carries, when
 * it lets go — and this is the sentence the pair reads while it happens.
 * Neither reads the other, and `scene-types.ts` re-exports both so nothing
 * moved.
 */
/**
 * What a caption is pointing at, so it is drawn beside the thing it explains
 * rather than in a paragraph underneath the picture.
 *
 * The owner's instruction, and the whole reason there is no text block any
 * more: *show the text inside the screen, in the position where it is
 * explaining*. So a caption names a thing and the drawing finds it — a body on
 * the field, a control on the band, the ship, the hull bar — which means a
 * caption cannot drift away from its subject when the layout changes.
 */
/**
 * The parts of a boss a page can be about, beyond its main fixture. Grown a
 * name at a time, each answered by a line in `render/caption-anchor-boss.ts`
 * that asks the boss's draw file where it is.
 */
export type BossPart =
  /**
   * A row of counts a boss writes for one seat and not the other: THE TASTER's
   * two on the ridge, the navigator's, and THE GORGE's under its lobes, the
   * pilot's. One name because it is one thing — the number a seat has to say.
   */
  | "tally"
  /** THE SCUTTLE's live part hanging under its socket, in its colour — the navigator's. */
  | "live"
  /** THE ANTIPHON's grown organ under the middle of the body — the pilot's. */
  | "organ"
  /** THE ANTIPHON's rail of candidates along the underside — the navigator's. */
  | "rail"
  /**
   * One ring of a boss that has several and one of them matters: THE ORRERY's
   * orbit this seat alone sees true — the middle on the pilot's, the inner on
   * the navigator's — and THE THROAT's lowest muscle still holding.
   */
  | "ring"
  /** THE ORRERY's core in the middle of the orbits. */
  | "core"
  /** THE SCOUT's burning rocks crossing the arena — the navigator's. */
  | "hazard"
  /** THE CANDLE's face: the mouth of the cone it eats flashes out of — the pilot's. */
  | "face"
  /** THE DIASTOLE's left chamber, the pilot's count and grey on the navigator's screen. */
  | "left"
  /** THE LEDGER's cord, from the body's underside to the hull it is rooted in. */
  | "cord"
  /** THE LEDGER's lock on the socket's column, and its chevron — the navigator's. */
  | "lock"
  /**
   * A boss's mouth, where a body goes in: THE SPLICE's row of them over the
   * plating — the one part of it the pilot is shown — and THE THROAT's one,
   * with the gums a fling has to land between.
   */
  | "mouths"
  /** THE UNDERTOW's plate, bowing over a breach before its lobe is through — the pilot's. */
  | "plate"
  /** THE UNDERTOW's lobe, standing in the breach it came up through. */
  | "lobe"
  /**
   * THE HIVE's open breaches along its underside, all of them at once — what
   * a bolt has to be aimed at, and the one place the pilot's colour is.
   */
  | "breach"
  /** THE HIVE's site about to open, and its twin — the navigator's warning. */
  | "swell";

export type SceneAnchor =
  | { at: "body" }
  | { at: "control"; control: ControlId }
  /** Whatever a hand is holding — the subject of a page about THE GRIP, and
   * the one anchor that follows a body chosen by the world rather than named
   * by the author. */
  | { at: "held" }
  /** The pod hanging in the field — the subject of SALVAGE, THE PURGE and THE
   * WARD, and the one thing on the field that is neither a body nor a shot. */
  | { at: "pod" }
  /**
   * Both of the queen's marks at once, in one ring around the pair.
   *
   * The one anchor that is deliberately about *two* things. `one mark is real`
   * is a sentence about a pair, and it was pointed at `body` — which is her,
   * so the ring sat on her shell between the two marks and touched neither.
   * `render/queen-figure.ts` places them, and this asks it.
   */
  | { at: "marks" }
  /**
   * The swelling on the hull a control is reached through, rather than the
   * button for it on the panel — the cannon, or the plate. Which of the two
   * answers a given control is `shipCircle`'s, so a caption cannot point at
   * one swelling while the hand presses the other.
   */
  | { at: "ship"; control: ControlId }
  /** A handle on the field, wherever the hand has carried it — the maze's
   * string, the warden's rope or a lid's cord (`render/handles.ts`). */
  | { at: "handle"; target: DragTarget }
  /**
   * The warning strip along the top edge. It points at the blip when this
   * screen carries one and at the middle of the strip when it does not, which
   * is what makes *"player 2 sees nothing"* a page that can be drawn at all:
   * the same anchor, on the two screens, pointing at a thing and at its
   * absence.
   */
  | { at: "radar" }
  /**
   * A boss's own fixture — the collar on THE SINEW's tendon, the fan on THE
   * TASTER's crest — answered per kind in `render/caption-anchor-boss.ts` off
   * the boss's draw file, the way `handle` is off each handle's. `part` names
   * which, where a boss draws more than one thing a page can be about; left
   * off, the boss's main fixture. A film about a boss's own gauge pointed at
   * the hull before this, because nothing else was nameable.
   */
  | { at: "boss"; part?: BossPart }
  | { at: "hull" }
  /**
   * **What a miss costs**, pointed at where it lands: the hull. A place and a
   * cost are two anchors even where they draw in one spot — `hull` says
   * *there*, this says *that was paid for*, and the scene tests count a film's
   * pages on the cost (`scenes.test.ts`, `scene-pages.test.ts`).
   *
   * It was `health`, the hull bar, until the hull lost its points, then
   * `retries`, the run's line in the corner — until the clock left that corner
   * on 24 September 2026 and it stood empty until a first retry, which a guide
   * never has.
   */
  | { at: "hit" };

/**
 * One step of the film: a screen, a few words, and what they point at.
 *
 * **A step owns a seat, and that is what makes the switch legible.** The
 * rehearsal is drawn one screen at a time at full size — the owner asked for
 * the real screen and the room that buys — so the moment a step changes seat,
 * the picture slides from one device to the other and says whose it now is
 * (`guide-scene.ts`). A film that cut without saying would be two screens the
 * pair could not tell apart.
 */
export interface SceneStep {
  /**
   * Tick this step begins on. Ordered, and the first one starts at 0.
   *
   * A step runs until the next one begins, and the last until the loop ends:
   * that span is a **page**, and it is what repeats while a seat is reading it
   * (`stepSpan`). So a tick here is not a cue inside a film any more, it is a
   * page boundary — two steps close together are one page nobody can read.
   */
  tick: number;
  seat: 1 | 2;
  /** As few words as will do. It is read at a glance, beside its subject. */
  text: string;
  anchor: SceneAnchor;
  /**
   * The numbers the words name, and the world's field each one is read off.
   * A page that says `FIVE SCARS` in front of four was up for three seconds of
   * THE HIVE's film before anything noticed; `test/scene-pages.test.ts` reads
   * each of these back at both ends of the page.
   */
  counts?: readonly SceneCount[];
}

/** A number a page names, and which world field holds it (`scene-pages.test.ts`). */
export interface SceneCount {
  /**
   * THE HIVE's sealed sites (`hiveSealedCount`), those not yet sealed
   * (`hiveLeft`) and those spilling now (`hiveOpenCount`); THE CANDLE's steps
   * of glow; THE SCUTTLE's parts in their sockets (`scuttleLeft`); THE
   * ANTIPHON's candidates on the rail; THE ORRERY's rings still standing.
   */
  of:
    | "hiveScars"
    | "hiveLeft"
    | "hiveOpen"
    | "candleGlow"
    | "scuttleParts"
    | "antiphonRail"
    | "orreryRings";
  is: number;
  /**
   * The page plays *into* the number rather than opening on it, so it is read
   * on the frame the page stands on and not on its first. For a count that
   * changes on the boundary between two pages that each name it: a page
   * stands on the next one's first tick, so no tick can be both. THE HIVE's
   * `ONE SEALED · ONE SPILLING` opens ten ticks before the seal it names, and
   * `TWO OPEN · TWO COLOURS` before it stands in front of two.
   */
  played?: true;
}
