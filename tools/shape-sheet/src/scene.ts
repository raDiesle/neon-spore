/**
 * A scene: an unbuilt idea's *mechanic*, drawn on the field it would happen on.
 *
 * The catalogue answers "what does this thing look like" — one contour in a
 * frame, fitted so nothing clips. It cannot answer the question that actually
 * decides whether an idea survives, which is **what it looks like from the
 * seat**: at a lane's width, beside a hull, with the creatures the game
 * already has standing next to it. A shape that reads at 132 px on a card and
 * disappears at 26 px on a phone is not a shape, and no card can tell you
 * which one you have.
 *
 * So a scene is a placement, not a picture. It names the columns and rows
 * things stand in, and the drawing is left to the director — where the ship,
 * the band, the radar strip and any *built* creature in the scene are one
 * frame of the shipping renderer against a real `World`, exactly as the STATES
 * sheet is. Only the unbuilt bodies are drawn by the tool, in the draft colour,
 * on top. That division is the honest one and it is the whole arrangement: what
 * exists is drawn by the game, what is proposed is drawn as a proposal.
 *
 * Nothing here decides anything, the same rule the drafts run on. A scene is
 * an argument made in pictures, and a person accepts it or does not.
 */

/**
 * What colour an unbuilt body is drawn in.
 *
 * `draft` is the default and means *undecided* — the cyan every proposal on
 * the SHAPES tab already wears. A scene names a real colour only where the
 * mechanic is about colour, because "one kind, one colour, one silhouette" is
 * a bestiary rule and a picture that guesses at one is inventing a decision.
 */
export type SceneTint = "draft" | "red" | "cyan" | "rock" | "pod";

/** An unbuilt body standing somewhere on the field. */
export interface SceneBody {
  /** A subject name in `CATALOGUE` — a draft's, or a contour the game draws. */
  shape: string;
  /** Field column, 0 to `cols - 1`. Not an authored column: this is a screen. */
  col: number;
  /** Field row, 0 at the top. `hullRow` is where a creature dies. */
  row: number;
  /**
   * How many lanes wide it draws. 1 is the size the game gives every living
   * creature — `tile * 0.4` of radius — and is the size a claim about
   * legibility has to be tested at. More is a boss, or a question about
   * whether one lane is enough.
   */
  span?: number;
  /**
   * How much of each lane the body takes, edge to edge. The default is the
   * game's own answer: a creature is `tile * 0.4` of radius and a torch spans
   * two columns at `tile * 0.8`, so **nothing in the game fills its own lane**
   * — a five-column boss draws four lanes across.
   *
   * A body says `1` when the mechanic is about *which column* and the shape
   * was tuned to answer it: THE TITHE is seven plates across seven columns,
   * and a plate spanning anything other than one column is a body arguing with
   * the grid it is asking a question about (`drafts/collected.ts`).
   */
  fill?: number;
  tint?: SceneTint;
  /**
   * Turned, in degrees clockwise. Only two things need it and both are the
   * same thing: `arm` is sampled hanging straight down, and the two ideas that
   * carry one — a corridor across the columns, a pendulum caught mid-sweep —
   * are *about* not being vertical. A body with no reason to lean does not get
   * one, because a creature that has left its lane has broken spec 5.8.
   */
  turn?: number;
  /**
   * Drawn faint: a copy, a memory, a thing that cannot be hit. The Echo's
   * lagging body is the case this exists for — it is on one screen and not the
   * other, and a picture that draws both solid says the wrong thing.
   */
  ghost?: boolean;
  /** A word on the field, where two bodies in one scene have to be told apart. */
  label?: string;
}

/**
 * What the simulation puts there itself.
 *
 * A scene that wants a slick beside its draft does not draw one: it spawns
 * one, and the renderer draws it. That is the difference between a comparison
 * and an assertion — the Notch's whole open question is whether a barb reads
 * as a direction *given that the bulb already sways and the slick already
 * tilts*, and the only way to ask it is to have the real bulb and the real
 * slick in the frame, moving the way the game moves them.
 */
export interface SceneSpawn {
  /** A colour spawns the living kind that colour maps to; the rest are named. */
  what: "red" | "cyan" | "meteor" | "torch" | "pod";
  col: number;
  /** Where it should have got to by the time the frame is taken. */
  row: number;
}

/**
 * The small vocabulary of things a scene may draw that are not bodies.
 *
 * Deliberately three. A mark is a licence to draw anything, and a catalogue
 * with an open-ended one stops being a catalogue and becomes a drawing
 * program — so a new kind gets added when a mechanic cannot be said without
 * it, and not before.
 */
export type SceneMark =
  /** A line down a column: the Warden's tether, the Weight's stalk. */
  | { kind: "tether"; col: number; fromRow: number; toRow: number; note: string }
  /** Damage already taken, at a column. What the Notch steers for. */
  | { kind: "scar"; col: number; note: string }
  /** A lane called out, because the mechanic is about *which* one. */
  | { kind: "lane"; col: number; span?: number; note: string };

/** Which part of the phone the picture is cut out of. `pose-art` does the cutting. */
export type SceneCrop = "full" | "field" | "ship";

export interface Scene {
  /**
   * The concept this is a picture of, spelled as `docs/spec/` spells it — the
   * same join `CatalogueEntry.suggests` makes, and held by the same kind of
   * test. Renaming an idea has to break something loudly, or the picture goes
   * quietly back to being a picture of nothing in particular.
   */
  suggests: string;
  /**
   * Whose screen. A mechanic about the shield is drawn on the seat that holds
   * one; a band with the wrong half of the controls in it is a picture of a
   * game nobody is playing.
   */
  role: "p1" | "p2";
  /** What this picture claims, in one line. The reason it was worth drawing. */
  claim: string;
  crop?: SceneCrop;
  bodies: SceneBody[];
  spawns?: SceneSpawn[];
  marks?: SceneMark[];
}
