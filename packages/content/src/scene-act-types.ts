import type { DragTarget } from "@neon-spore/sim";
import type { ControlId } from "./controls.js";

/**
 * **One moment of a rehearsal**, cut out of `scene-types.ts` the way the step
 * was: an act is a thumb on a control or a hand on the field, and it is the
 * shape that grows a field for every gesture the game learns to show — a
 * shake, a tap, a drag with a destination, a strip put where the body is. The
 * film that holds a list of them is next door and reads nothing here but the
 * name.
 *
 * `packages/render/src/guide-thumb.ts` reads exactly this list to place the
 * hand — a lobe's circle comes from `bandLobes`, a strip's from the strip and
 * the column — so the hand and the world are driven by one authored fact and
 * cannot come apart.
 *
 * **A grip is the one act that is not on a control**, because the gesture is
 * not: THE GRIP is a finger held on something falling, on the field itself
 * (`sim/grip.ts`), and it is the one verb either seat may use. It is authored
 * as a column and a span of ticks rather than as a creature, because a scene
 * is written before a world exists and ids are dealt out by the simulation —
 * the runner finds what is standing in that column at the moment the hand goes
 * down (`sim/scene.ts`). Exactly one gesture is ever set on an act;
 * `test/scenes.test.ts` holds that.
 */
export interface SceneAct {
  /** Tick within the loop. Ordered, and the first one places the hand. */
  tick: number;
  control?: ControlId;
  /** Where a strip is dragged to, in authored columns. Absent on a lobe. */
  col?: number;
  /**
   * **Where a strip is dragged to, in the field's own columns** — the sibling
   * `col` cannot always be, and the reason is `mapCol`'s: authoring runs 0..6
   * and the shipped field has eleven, so `mapCol`'s image is 0, 2, 3, 5, 7, 8,
   * 10 and world columns 1, 4, 6 and 9 have no authored column that lands on
   * them at all. A wave is written once and stretched over whatever `cols` the
   * config gives it, so it has to stay on the seven; a **film** is written
   * against the field the pair is actually looking at and its acts report a
   * boss's own column in world space, so it needs a way to say *this one*
   * beside the authored one every wave uses.
   *
   * `actCol` reads this first and `col` not at all when it is set — the two
   * are mutually exclusive, which `test/scenes.test.ts` holds, the way `tile`'s
   * `row` sits beside its own `col` rather than replacing it.
   */
  worldCol?: number;
  /**
   * **Put the strip where the body is**, instead of in an authored column.
   *
   * `col` goes through `mapCol`, which on the eleven columns the game ships
   * reaches seven of them and no others — for a strip that is a hole rather
   * than a rounding, and it is what stopped THE VOLLEY's film being written.
   * `SceneRun` resolves this against the world instead, taking the body
   * arriving first, the way it resolves a grip's id; `col` is what an empty
   * field falls back to. Why, at length: `sim/scene-aim.ts`. Only the two
   * strips take it, which `test/scenes.test.ts` holds.
   */
  atBody?: true;
  /**
   * **Put the strip where the boss is answered from**, for the same hole and
   * with no body to find: THE DIASTOLE's left chamber hangs over a column
   * `mapCol` never reaches, and THE UNDERTOW's first lobe comes up wherever
   * the rng put it. `SceneRun` asks `bossAnswerCol` at the moment the thumb
   * goes down (`sim/boss-answer.ts`), which is the boss's own reading of where
   * the cannon has to stand this phase; `col` is what a boss with no answer
   * falls back to. Only the two strips take it, as `atBody`.
   */
  atBoss?: true;
  /** A hand on the field instead of on the panel: which seat's. The column is
   * `col`, which a grip always carries. */
  grip?: 1 | 2;
  /**
   * **The device was shaken** — THE CHOIR's own gesture, and the only act here
   * that names nothing at all.
   *
   * There is no control, no column, no seat to author and nothing to hold: a
   * shake has no place to be, and whether a phone moved enough to count is
   * decided where the accelerometer is read (`sim/command-types.ts`). So the
   * act is the flag and the tick, and `sceneCommands` turns it into the one
   * command it is. The seat is the pilot's, unauthored, for the reason a drag's
   * is: the navigator carries both colours and fires, so a membrane either seat
   * could open would be a creature one phone could play.
   *
   * **Nothing is drawn for it**, and that is the honest picture rather than a
   * gap. A shake is not a hand anywhere on the screen — the ghost thumb has
   * nowhere to be put and putting one somewhere would teach a gesture that does
   * not exist. What the page shows is the membrane answering.
   */
  shake?: true;
  /**
   * A **thumb on a body**, which is the fourth gesture that is not a press on
   * a button and the only one that is a press at all.
   *
   * THE BEATBOX is answered by tapping the box itself, once a beat, on the
   * beat (`sim/beatbox-round.ts`). The seat is not authored, for the reason a
   * drag's is not: it is the navigator's alone, and that *is* the creature —
   * the number of beats asked for is on the pilot's screen and the thumb is on
   * the navigator's, so a pilot who could also tap would be a pilot who never
   * has to say anything.
   *
   * The column is authored and the body is not, exactly as a grip's is: ids
   * are dealt out by the simulation and a film is written before any world
   * exists, so `SceneRun` finds what is standing there at the moment the thumb
   * comes down.
   */
  tap?: true;
  /**
   * A **finger on a bare square of the field**, from the seat that cannot see
   * what is standing on it — THE MINE's answer (`sim/mine.ts`), and the fifth
   * gesture that is not a press on a button.
   *
   * The value is the **seat**, and it is authored, which no other gesture's
   * is: a tap is always the navigator's and a shake always the pilot's because
   * the creature is, but which seat is blind to a mine is the *arrival's*
   * (`SpawnEntry.sees`), so the film has to say whose finger this is the way
   * the wave said whose eyes those were. `col` goes through `mapCol` like
   * every other column; `row` is written as it stands, because the field's
   * rows are the same on the authored grid and the shipped one.
   *
   * Nothing is resolved by the runner. A grip and a tap name a column and let
   * `SceneRun` find the body, because the hand lands on a body; this lands on
   * a square, and the square is the whole of the command (`tapTile`). That is
   * also why the ghost hand for it is the one placed from the act rather than
   * from the world (`render/guide-hand.ts`) — there is nothing on the blind
   * seat's field to place it from, which is the creature.
   */
  tile?: 1 | 2;
  /** The row a `tile` act lands in. Only a tile carries one. */
  row?: number;
  /**
   * **The square is lit rather than pressed** — THE DARK's finger
   * (`sim/dark.ts`). The same hand on the same bare square, so it is a `tile`
   * with this beside it rather than a sixth gesture; it sends `light` in
   * place of `tapTile`. A film's swipe is a run of these a few ticks apart.
   */
  light?: true;
  /**
   * A hand on a **cord, a string or a rope** — the third gesture that is not a
   * press on a button, and the one that had no way of being written down.
   *
   * The seat is read off the target rather than authored beside it, the way a
   * press reads its seat off `ControlDef.player` (`dragSeat`). Every handle is
   * the pilot's but one: the navigator carries both colours and fires, so a
   * handle either seat could reach would be a round one phone could play
   * (`render/handles.ts` says it three times, once per handle). **A balloon's
   * right handle is the exception, and it is the creature** — one body with a
   * handle on each side and a hand from each phone, given only when both are
   * taut at the same instant.
   *
   * `col` says where the body is for the handles that hang off an ordinary
   * arrival — a lid's cord and a balloon's two — because those are the ones
   * there may be *many* of: a wave sends three lids or six balloons, and a
   * handle names the body it hangs off by an id no author can know. It is the grip's
   * arrangement exactly: the column is what an author can know, because it is
   * what they wrote the arrival in, and `SceneRun` fills the id in at the
   * moment the hand goes down. A maze has one string and a warden one rope, so
   * neither needs it.
   *
   * `until` is when the hand lets go, and it is required for the reason a
   * grip's is: a hold with no end is a hand still down on a world that is
   * about to be rebuilt.
   */
  drag?: DragTarget;
  /**
   * Whose thumb this is, on the two handles both seats hold.
   *
   * THE SURGE's bulb is one `DragTarget` and either seat's `drag` on it is
   * that seat's thumb on the glass (`sim/surge-hand.ts`), so the target
   * cannot say the seat the way every other handle's does — and which seat
   * lifts first is the whole boss. THE HIVE's lobe is the pilot's haul or the
   * navigator's pinch (`sim/hive-hand.ts`). So a film about either writes the
   * hand, the way a `tile` act writes the seat. Read only on those two; on
   * every other handle the seat is the target's (`dragSeat`), and this is
   * ignored.
   */
  hand?: 1 | 2;
  /**
   * How far the hand carries it, in thousandths of a tile — the units every
   * draggable control speaks (`Command` in `sim/command-types.ts`).
   *
   * Left out, it is the target's own taut distance, which is what a film about
   * a handle almost always wants: the plates fully apart, the hatch open, the
   * wheel round. Written down, it is a pull that stops short — the picture a
   * page about *not far enough* needs.
   */
  toMilli?: number;
  /**
   * Which way a carry goes, for the one handle that has a side rather than a
   * distance: a held body is carried into the column to its left or the one to
   * its right (`sim/grip-push.ts`).
   *
   * It exists so a film does not have to write a *negative distance* down. How
   * far one column is is `cfg.gripPushMilli`, and a scene that spelled the
   * number out would be a second copy of the rule — the class of drift
   * `packages/sim/test/purity.test.ts` carries a table against. So the film
   * says the side and `scene-script.ts` reads the distance off the config.
   *
   * Absent is `1`, the way an unwritten `toMilli` is the target's own taut
   * distance. Meaningless on the three handles that are pulled.
   */
  dir?: -1 | 1;
  /**
   * The tick the carry is *finished*, when that is not the tick the hand lets
   * go. The messages spread over `tick`..`by` and then stop; the hand stays
   * where it left them until `until`.
   *
   * Two clocks rather than one, because two of the three handles need them
   * apart. A lid's plates shut the instant the cord is released, so a film has
   * to fire while it is still held — and THE MAZE's wheel unlocks on the next
   * *movement* after a click, so a hand that carried on past the column took
   * it back off the pair. Absent, the carry runs to the release, which is a
   * hand that arrives and immediately lets go.
   */
  by?: number;
  /**
   * The tick the thumb lifts.
   *
   * A grip and a drag always say when they let go — a hold with no end is a
   * hand still down on a world that is about to be rebuilt. On an ordinary
   * **control** it is what makes the act a hold rather than a press, and only
   * the five that are held will take one: the lance, the gauge's two valve
   * slabs and the bucket's two (`ControlPress.up`). Absent, on a control, is a
   * press — which is what every other one is.
   */
  until?: number;
  /**
   * Draw the hand **on the ship** rather than on the panel below it.
   *
   * The command is unchanged and so is the seat: this is the same control
   * reached the other way. Six of them can be — the cannon slid on the hull,
   * a lift that carried it nowhere opening the maw, the plate dragged, the
   * plate pressed to fire it, and the muzzle carried left or right for a
   * colour (`render/src/touch-ship.ts`) — and a wave is playable with the band
   * alone, so this is never what a film shows unless the film is *about* it.
   *
   * Where the hand goes is not authored with it. The swelling is wherever the
   * world has left the cannon or the plate, so the drawing reads that rather
   * than a column somebody typed beside the act — the rule the ghost hand has
   * played by since it existed.
   */
  onField?: true;
}
