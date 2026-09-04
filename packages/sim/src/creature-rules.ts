import { caromBecomes } from "./carom.js";
import { chuteBecomes } from "./chute.js";
import { claspBecomes } from "./clasp.js";
import type { SimConfig } from "./config.js";
import { hullRow } from "./config.js";
import { echoBecomes } from "./echo.js";
import { gyreBecomes } from "./gyre-rim.js";
import { recoilBecomes } from "./recoil.js";
import { rindBecomes } from "./rind.js";
import { shellBecomes } from "./shell.js";
import type { Creature, CreatureKind } from "./types.js";
import { veilBecomes } from "./veil.js";
import { volleyBecomes } from "./volley.js";

/**
 * The state machines the bestiary asks for that are small enough to be one
 * function each (docs/spec/bestiary.md 10.1). Neither kind here needs a fall
 * speed of its own — `fallTilesPerBeat` already answers one tile a beat for
 * anything it does not name — so this file holds only the part that is new.
 *
 * The Throb swells and shrinks on the shared beat, and `throbIsOpen` is the
 * whole of it.
 *
 * THE LURE has no cycle either, and two rules instead: which body it is
 * *drawn* as, and when it goes. Both live here rather than at the sites that
 * ask, because both are exactly the shape of thing a second reader writes out
 * again — and a second copy of the first one is a tell on player 1's screen.
 */

/**
 * Whether a Throb can be hit on this beat. A fixed cycle read straight off
 * `world.beat` — the same shared clock both players already read off the HUD
 * and the accent tone (docs/spec/systems.md 5.3) — rather than a phase of its
 * own, so two Throbs never drift apart and neither device has to store one.
 *
 * `beat.ts` calls this once a beat and stores the answer on the creature
 * (`Creature.throbOpen`); nothing else may ask `world.beat` this question a
 * second time, or a bullet resolved between two calls could read a different
 * answer than the one render/ drew.
 */
export function throbIsOpen(cfg: SimConfig, beat: number): boolean {
  return beat % cfg.throbPeriodBeats < cfg.throbOpenBeats;
}

/**
 * The kind a creature is *drawn* as, which is its own kind for everything but
 * a lure — and a lure's `wears` for that one.
 *
 * **Every appearance goes through this and nothing writes the ternary out
 * again.** A lure is a full-size slick or bulb in every pixel player 1 owns:
 * the contour (`livingSilhouette`), the own-motion (`livingMotion`), the
 * bulb's interior, the size, the wobble. One of those left reading `c.kind`
 * and player 1 has a way to tell a lure from a real body before it goes, at
 * which point the whole wave is decoration — so `purity.test.ts` carries a row
 * that fails on the ternary appearing anywhere but here.
 *
 * It is deliberately *not* what the rules read. `bullet-hit.ts` asks
 * `hit.kind === "lure"` on purpose: what a body is and what it looks like are
 * two different questions here, and that is the entire creature.
 *
 * A lure that was built without a `wears` is drawn as a slick. Not an error
 * and not a blank — a body has to be drawn as *something*, and that is the
 * same fallback `livingSilhouette` reaches for anyway. Nothing in the game
 * builds one: `queueFromWave` fills it from the authored colour.
 */
export function wornKind(c: Creature): CreatureKind {
  // A clasp is drawn as the body inside it, with its shield laid over the top
  // by render/ — so the contour, the own-motion and the interior are the
  // slick's or the bulb's for free, and the transformation changes no pixel of
  // the body when it lands. `claspBecomes` is the same call the break makes,
  // which is what stops the thing you were looking at and the thing you get
  // from ever being two different bodies.
  if (c.kind === "clasp") return claspBecomes(c);
  // A shelled body is the slick or the bulb inside the plating, with the
  // armour laid over the top by render/ — the same arrangement the clasp has,
  // and for the same reason with more riding on it: the body's colour is what
  // shines out of the splits in the shell and stands bare on the half that has
  // already been chipped, so it has to be that body's real colour and not a
  // grey stand-in. `shellBecomes` is the one copy of the pairing.
  if (c.kind === "shell") return shellBecomes(c);
  // A veil is drawn as the body inside the cloud, with the cloud laid over the
  // top — the clasp's arrangement again, with the one difference that render/
  // draws the body on player 1's screen only (`render/veil.ts`). `veilBecomes`
  // is the same call the kill makes, so what player 1 reads through the cloud
  // and what the shot has to match are never two different bodies.
  if (c.kind === "veil") return veilBecomes(c);
  // An echo is a slick or a bulb with nothing laid over the top at all — only
  // drawn small (`livingBodyMul` in render). It is here rather than given a
  // silhouette of its own because the pair already has a word for what it
  // looks like, and what they have to say about one is a count and an order
  // rather than a name. `echoBecomes` is the one copy of the pairing.
  if (c.kind === "echo") return echoBecomes(c);
  // A rind is the same arrangement again with nothing over the body and
  // nothing taken off its footprint either: it is a slick or a bulb drawn
  // three times the size and stepped down a body per hit (`livingBodyMul` in
  // render). No silhouette of its own, because what the pair says about one is
  // the same word plus a count of how many shots are left in it.
  // `rindBecomes` is the one copy of the pairing.
  if (c.kind === "rind") return rindBecomes(c);
  // A recoil is the slick or the bulb inside its cage, with the cage laid over
  // the top by render/ — the clasp's arrangement, with the one difference that
  // this body's colour *changes*: a bounce turns it over (`recoilStruck`), so
  // `recoilBecomes` is asked afresh every frame and the answer is a slick on
  // one shot and a bulb on the next. That is the whole creature, and it is why
  // the pairing is called here rather than resolved once at spawn.
  if (c.kind === "recoil") return recoilBecomes(c);
  // One of the six on THE GYRE's rim: a slick or a bulb with nothing laid over
  // it at all, the way an echo is, and drawn at full size. It is here rather
  // than given a silhouette of its own because the pair already has a word for
  // what it looks like — and because that word has to be the *same* word it is
  // for a body in a lane, or the alternation around the rim is a new
  // vocabulary rather than the one they already say out loud.
  if (c.kind === "mount") return gyreBecomes(c);
  // A carom is the slick or the bulb sealed inside its crust, with the crust
  // laid over the top by render/ — the clasp's arrangement, and its argument
  // one step further on: what the pair has to read through the shell is the
  // colour, because the colour is the only thing either of them can do about
  // this body while it is still crossing. `caromBecomes` is the one copy of
  // the pairing, and nothing asks it again once the crust is off — by then the
  // body is a `meteor` and has no colour to pair with.
  if (c.kind === "carom") return caromBecomes(c);
  // And the body once it is out of the crust: the same slick or bulb, still in
  // the colour it was sealed in, with a canopy drawn over it rather than a
  // shell around it (`render/chute.ts`). The pairing is called here for the
  // carom's reason one step on — what the pair has to say about the thing
  // hanging over the field is the same word they said about the thing inside
  // the rock, and a second copy of it is how those become two creatures.
  if (c.kind === "chute") return chuteBecomes(c);
  // A volley is the slick or the bulb sealed inside its shell, with the
  // plating laid over the top by render/ — THE CAROM's arrangement, and its
  // argument turned round: what the pair has to read through the seams is the
  // colour, because the colour is the only thing either of them can do about
  // this body *after* the shield has finished with it. `volleyBecomes` is the
  // one copy of the pairing, and it is the same call the hatch makes — so what
  // the pair has been looking at and what falls out are never two bodies.
  if (c.kind === "volley") return volleyBecomes(c);
  return c.kind === "lure" ? (c.wears ?? "slick") : c.kind;
}

/**
 * The row a lure stands on before it goes: `lureVanishRows` above the hull.
 * Authorable rather than a literal, and derived from `hullRow` rather than
 * counted from the top, because the distance that matters is the one to the
 * ship — close enough that player 1's eye is already on it, far enough that it
 * plainly never threatened anything.
 */
export function lureVanishRow(cfg: SimConfig): number {
  return hullRow(cfg) - cfg.lureVanishRows;
}

/**
 * Whether this creature's next step down is the one it does not take.
 *
 * Asked *before* the fall, so a lure spends the beat gliding into
 * `lureVanishRow` in plain sight of both players and goes on the beat it would
 * step off it. Deliberately not a beat of standing still: nothing else in the
 * field stops falling, so a pause would be the tell this creature exists not
 * to have — a player who learned it would know one beat early, and one beat
 * early is the beat the whole mechanic is made of.
 */
export function lureIsSpent(cfg: SimConfig, c: Creature): boolean {
  return c.kind === "lure" && c.row >= lureVanishRow(cfg);
}
