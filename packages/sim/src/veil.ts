import { metColor, missedColor } from "./balance.js";
import { msToTicks, type SimConfig } from "./config.js";
import { livingKindForColor } from "./kinds.js";
import { nextInt } from "./rng.js";
import type { Bullet, Color, Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE VEIL: a thundercloud with a body inside it, and the first creature whose
 * hidden half is hidden from **player 2**.
 *
 * THE LURE put the secret on player 1's side of the split — a body player 1
 * sees as real and player 2 sees a ring around. This is that arrangement
 * turned over. The cloud is opaque on the navigator's screen and the pilot can
 * see into it, so the seat that knows which colour is needed is the seat that
 * cannot fire, and the seat holding both triggers has nothing but a question
 * mark. Neither half is worth anything alone, which is the whole design rule
 * (docs/spec/systems.md 5.2, where the veil's row has stood unbuilt since the
 * spec was written).
 *
 * **The body morphs, so the call expires.** A colour said once would be a
 * colour said once: player 1 would read the cloud, name it, and the pair would
 * be done talking. Instead the body inside turns over from a slick to a bulb
 * and back every `veilMorphBeats` — a little over three seconds, which is
 * about one spoken exchange (docs/spec/latency.md) — so what player 1 has to
 * say is not a colour but a colour *and how long it is good for*. Which of the
 * two it arrives as is rolled from the world's own rng (`veilOnSpawn`), which
 * is the randomness rule exactly: the only thing that stays random is what one
 * player knows and the other does not (docs/spec/structure.md 7.3).
 *
 * **The morph is read off the shared beat and stored in `color`.** Not a phase
 * of its own on the creature: `throbIsOpen` next door makes the same argument
 * and it holds harder here, because the timer over the cloud on player 1's
 * screen and the body under it have to be two pictures of one number. Two
 * veils on the field therefore turn over together, which is a feature — the
 * pair reads one clock, not two.
 *
 * **A wrong colour arms it.** The mistake this creature punishes is firing on
 * a call that has gone stale, so the answer to a stale call cannot be "nothing
 * happened": for `veilArmourMs` the cloud is armoured, lit red, and no shot of
 * any colour reaches the body. That is long enough to cost the pair a morph
 * boundary, so the sentence has to be said again rather than repeated louder.
 */

/** How many ticks a wrong colour keeps the cloud shut. */
export function veilArmourTicks(cfg: SimConfig): number {
  return msToTicks(cfg, cfg.veilArmourMs);
}

/**
 * A creature that has never been struck. Far enough back that the window has
 * always expired — the same sentinel `World`'s own tick fields use, and for
 * the same reason: tick 0 is a real tick, so 0 would arm every veil on the
 * first frame of a wave.
 */
export const VEIL_UNSTRUCK = -1_000_000;

/**
 * Whether this body is shut. Call it rather than comparing ticks by hand: the
 * picture render/ draws of the red cloud and the rule a shot is refused by are
 * one fact, and a second copy of the window is how a shot lands into a cloud
 * that is still visibly angry.
 */
export function veilIsArmoured(world: World, c: Creature): boolean {
  return world.tick - (c.veilStruckTick ?? VEIL_UNSTRUCK) < veilArmourTicks(world.cfg);
}

/** How far through the armour window this body is, 0..1, or 1 when it is open
 * again. Render's whole reading of the red flash, so the flash cannot outlive
 * the rule or stop before it. */
export function veilArmourPhase(world: World, c: Creature): number {
  const ticks = veilArmourTicks(world.cfg);
  if (ticks <= 0) return 1;
  const since = world.tick - (c.veilStruckTick ?? VEIL_UNSTRUCK);
  return Math.max(0, Math.min(1, since / ticks));
}

/**
 * The body inside the cloud. Read off its colour through the one function that
 * owns the colour-to-silhouette pairing, exactly as `claspBecomes` and
 * `shellBecomes` do — a second copy of the pairing is how the three would
 * drift the first time a third colour existed.
 *
 * A veil built without a colour is drawn as a slick, the same fallback the
 * other two reach for. Nothing in the game builds one: `veilOnSpawn` rolls a
 * colour before the body reaches the field.
 */
export function veilBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * Whether the body inside every cloud turns over on this beat. A fixed cycle
 * read straight off `world.beat`, the shared clock both players already have
 * on the HUD and in the ear — so the two devices never have to store a phase,
 * and the timer player 1 reads is the same arithmetic run backwards.
 */
export function veilMorphs(cfg: SimConfig, beat: number): boolean {
  return beat % cfg.veilMorphBeats === 0;
}

/**
 * Beats until the body turns over, counted from `beat`. Never zero: on the
 * beat it morphs, the answer is the whole period again, because the thing
 * standing there now is what has just arrived and it has a full cycle to run.
 */
export function veilBeatsToMorph(cfg: SimConfig, beat: number): number {
  const into = ((beat % cfg.veilMorphBeats) + cfg.veilMorphBeats) % cfg.veilMorphBeats;
  return cfg.veilMorphBeats - into;
}

/** The colour a veil enters the field carrying, from the world's own stream.
 * The one thing about this creature nobody may know in advance. */
export function veilOnSpawn(world: World): { color: Color } {
  return { color: nextInt(world.rng, 2) === 0 ? "red" : "cyan" };
}

/**
 * Turn the body over, if this beat is one it turns on. Called once a beat from
 * `onBeat`, on the beat the creature now stands on — nothing else may ask
 * `veilMorphs` a second time, or a shot resolved between two calls could be
 * answered by a body neither screen had drawn yet.
 */
export function veilMorph(world: World, c: Creature): void {
  if (c.color === null || !veilMorphs(world.cfg, world.beat)) return;
  c.color = c.color === "red" ? "cyan" : "red";
  world.events.push({ type: "veilMorph", col: c.col, row: c.row, color: c.color });
}

/**
 * A shot met a cloud. Returns whether the bullet goes on, the same contract
 * `resolve` has — a lance that killed the body inside carries on up the
 * column like any other kill, because what stopped it would have been the
 * body and the body is gone.
 *
 * It lives here rather than in `bullet-hit.ts` for the reason `claspStruck`
 * and `shellStruck` do: it is a rule about one creature, and that file is at
 * its length limit.
 */
export function veilStruck(world: World, b: Bullet, hit: Creature): boolean {
  if (veilIsArmoured(world, hit)) {
    // Shut. Deliberately **not** a colour miss: the ammunition may have been
    // exactly right and the cloud simply still angry, which is a failure of
    // the pair's patience rather than of player 2's choice. `claspStruck` and
    // `resolveWarden` make the same argument about their own rejections.
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }
  if (hit.color !== b.color) {
    // The call went stale, or was never made. This one *is* the colour
    // balance's, and it costs the pair the window as well as the shot.
    missedColor(world);
    hit.veilStruckTick = world.tick;
    world.events.push({ type: "veilRebuff", col: hit.col, row: hit.row });
    return false;
  }

  metColor(world);
  world.score += world.cfg.scoreVeilKill;
  // The cloud coming apart *and* the body inside it going, on one tick. The
  // two are separate events because they are two pictures: render/ tears the
  // cloud open and shows what was in it (`veil-tear.ts`) while the ordinary
  // destroy burst throws the body's own colour away from the same tile.
  world.events.push({
    type: "veilTorn",
    col: hit.col,
    row: hit.row,
    color: b.color,
    kind: veilBecomes(hit),
  });
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  world.creatures = world.creatures.filter((c: Creature) => c.id !== hit.id);
  b.pierced += 1;
  return b.lance && b.pierced < world.cfg.lancePierce;
}
