import type { ControlSet } from "@neon-spore/content";
import type { BossState, Creature, PlacedFault, SimConfig } from "@neon-spore/sim";
import type { SurfaceY } from "./hull-frame.js";

/**
 * **What a hit test is handed**: the field as the control scheme needs to see
 * it, and nothing else.
 *
 * Split out of `touch.ts` when the drag grew its second axis and that file went
 * past its 250-line limit, along the seam `command-types.ts` was cut from
 * `types.ts`: this is a *shape*, and `touch.ts` next door is the decision
 * procedure that reads one. The shape is also the half that is scrolled past —
 * every field on it is a fact about the wave or the world that some hit test
 * happens to need, and each arrived one at a time with a paragraph explaining
 * why it is required rather than defaulted.
 *
 * Re-exported from `touch.ts`, so nothing that already reached for a `Field`
 * through that file had to move.
 */
export interface Field {
  creatures: readonly Creature[];
  /**
   * Where the two lobes are standing, in whole columns — the world's own
   * numbers, not the eased ones the renderer is carrying towards them.
   *
   * They are here because the ship became touchable where it is drawn
   * (`touch-ship.ts`), and they are **required and stated** for the reason
   * every field below is: a hit test that defaulted them to the middle column
   * would put both grab circles somewhere neither lobe is, and every press on
   * the hull would answer the wrong control or nothing at all.
   */
  cannonCol: number;
  shieldCol: number;
  /** 0..1 within the beat, so a grab lands on the creature as drawn. */
  beatPhase: number;
  /**
   * The ship's skin as the last frame drew it (`Canvas2DRenderer.skinY`), so a
   * body on its landing beat is answered where it rests in the plating: under
   * a raised lobe that is higher than the flat hull, by as much as the crown.
   * **Required and stated**, for the reason every field here is; `null` says
   * no frame was drawn under this field — a test's, or a stage before its
   * first — and the hit test stands on the flat hull (`creature-under.ts`).
   */
  skinY: SurfaceY | null;
  /**
   * The beat the field is standing on. **Required and stated rather than
   * defaulted**, for the reason every field below it is: THE BEATBOX's hit
   * test reaches as far as the body is *drawn* (`beatbox-tap.ts`), and how big
   * that is depends on whether this beat has already been tapped — so a
   * default of nought would make the target smallest at exactly the moment the
   * pair is aiming at it.
   */
  beat: number;
  /**
   * The beat **this wave** is standing on, counted from its own first.
   *
   * A second beat looks like one too many until you try to hit a boss that
   * moves on a table: THE VANE's arm sweeps on a cycle read off `waveBeat`
   * alone (`sim/vane-cycle.ts`), so the column its tip is in — the one thing
   * the pilot's thumb has to land on — cannot be worked out from `beat`, which
   * counts from the run and not from the wave.
   *
   * **Required and stated rather than defaulted**, for the reason every field
   * around it is, and the vane gives it its sharpest form: a caller that
   * quietly meant nought would answer the arm in the column it stood in on the
   * wave's first beat, which is a fixed place near the pivot the arm leaves
   * two beats later and never comes back to. A control answered where it is
   * not drawn — and, for most of a sweep, answered where nothing is at all.
   */
  waveBeat: number;
  /**
   * The tick the field is standing on — the simulation's own clock, and the
   * only one fine enough to place a thing that moves between beats.
   *
   * The interludes are what wanted it: SNAKE's body steps every `stepTicks`
   * and the picture slides it the whole way there (`render/snake-body.ts`),
   * so the head a thumb has to prise and the tail she has to lift are drawn
   * up to a tile away from the tiles the round stores. `beat` and `beatPhase`
   * cannot be made to answer that — a step is not a beat, and a tick worked
   * out from the two would be `beatPhase`'s rule copied into a file that does
   * not own it.
   *
   * **Required and stated rather than defaulted**, for the reason every field
   * around it is: a caller that quietly meant nought would answer the head on
   * the tile it is leaving for as long as that round lasts.
   */
  tick: number;
  /**
   * Whose hand a touch on the *field* is. The strips below say who they belong
   * to by where they are; the field belongs to both players, so it can only be
   * signed by the seat this screen holds.
   */
  seat: 1 | 2;
  /**
   * The numbers a hit test needs: how far a hand on a body reaches
   * (`creatureAt`), and how wide THE MAZE's drum stands. The whole config
   * rather than the one number picked out of it, which is what this was — the
   * second thing to want one would have been a second field to copy across.
   */
  cfg: SimConfig;
  /**
   * **The boss running, whatever it is**, `null` between them.
   *
   * This was thirteen fields — `maze`, `warden`, `orrery`, `sinew`, `surge`,
   * `antiphon`, `instar`, `filament`, `stare`, `queen`, `diastole`, `mirror`,
   * `gorge` — one per boss a thumb can reach, each written down four more
   * times in `apps/game/src/input.ts` and once in every `Field` literal in the
   * tests. Thirteen names for one fact is thirteen places a fourteenth boss
   * has to be added, and `input.ts` folded two comments to fit the thirteenth.
   *
   * **Required, and stated rather than defaulted**, which is the whole of what
   * the thirteen paragraphs this replaces were saying, each in its own boss's
   * words: a caller that quietly meant `null` would leave a handle that is
   * *drawn* answering nothing — the pilot's hand falling through THE ORRERY's
   * ring onto the rocks behind it, THE SURGE's one bulb with neither thumb on
   * it, THE INSTAR's marks dead on a wave that has no panel at all, THE
   * DIASTOLE's last chamber open on no beat. A control answered where it is
   * not drawn, and a control drawn where it is not answered, are the two
   * things this file exists to prevent, and a required field makes the
   * compiler ask about both.
   *
   * **Read it with `bossOf`, never with a `kind` check written out again.**
   * The narrowing is one line and there are thirteen callers; the row is in
   * `sim/test/copies-table.ts`.
   */
  boss: BossState | null;
  /**
   * The whole panel this wave is played on — both seats at once, never a
   * combination (`packages/content/src/control-sets.ts`).
   *
   * It is on the field for the same reason `wardenRow` is: this file is handed
   * a field, never a world, and which panel is up is a fact about the wave.
   *
   * It is **required** rather than defaulted, and that is the whole repair.
   * The band learned to walk a set and this file did not, so it went on
   * answering a fixed `l.lanceButton` whatever the wave said — the lance was
   * invisible on every ordinary wave and still primed under the thumb. A
   * default would put that back the first time a caller forgot to pass one;
   * a required field makes the compiler ask.
   */
  controls: ControlSet;
  /**
   * The fault this wave is played under, or `null`.
   *
   * **Required and stated rather than defaulted**, for the reason every field
   * above it is: a caller that quietly meant *none* would answer a button a
   * fault has taken over, so a thumb would fire a gun the pair can see is
   * broken — the one thing the picture and the simulation must never disagree
   * about. The faults **in force this beat**, since they are placed on beat
   * rows now and a wave may hold more than one (`sim/fault-placed.ts`).
   */
  faults: readonly PlacedFault[];
  /**
   * Whether **this screen** is drawn as THE WELL — the field turned inside out
   * (`render/src/well.ts`). It is a boolean rather than a state because the
   * boss has none: what a hit test needs to know is only that the picture in
   * front of this finger is not the one every circle in `touch.ts` is cut out
   * of.
   *
   * **Required and stated rather than defaulted**, for the reason every field
   * above it is, and with the sharpest version of it: a caller that quietly
   * meant `false` would answer the hull's two lobes at the bottom of a screen
   * that draws them at the middle, and a body in the column it would have
   * stood in on a flat field. A control answered where it is not drawn is the
   * one thing `touch.ts` exists to prevent.
   */
  well: boolean;
  /**
   * Whether the hull's two lobes answer a hand at all. `false` is a player who
   * has left SETTINGS' TOUCH THE SHIP off, which is the game's default: the
   * press goes on to whatever is behind the lobe, as though the ship were not
   * there, and the panel is the only way to the cannon and the shield.
   *
   * **Optional, and absent means yes** — the one field here that is. Its only
   * caller that can say no is the game (`apps/game/src/input-bindings.ts`),
   * which always states it, and every other caller — the director's stage and
   * the tests — is judging the whole control scheme, the hull included.
   */
  ship?: boolean;
}

/**
 * The boss on this field, if it is the kind asked for.
 *
 * One line, and it is here rather than written out at each of the thirteen hit
 * tests for the reason `sim/test/copies-table.ts` exists: `field.boss?.kind ===
 * k ? field.boss : null` is a rule, and a rule copied thirteen times is a rule
 * that will be copied a fourteenth time slightly differently. It is also the
 * one place the narrowing is explained — a hit test asks for the boss it draws
 * a handle for and is handed `null` on every wave that is not it, which is
 * exactly what each of the thirteen fields it replaces did.
 */
export function bossOf<K extends BossState["kind"]>(
  field: Field,
  kind: K,
): Extract<BossState, { kind: K }> | null {
  return field.boss?.kind === kind ? (field.boss as Extract<BossState, { kind: K }>) : null;
}
