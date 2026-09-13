/**
 * What a sound is attached to.
 *
 * A catalogue of 190 names is a list; a catalogue that shows the bulb beside
 * the sound a bulb makes is a thing you can check. So every sound resolves to
 * a picture of its subject, and the picture is never invented here — it is
 * either a contour out of `shape-sheet` (the same geometry the canvas draws)
 * or a control glyph out of `render/simon-glyph.ts` (the same button the band
 * draws). A sound whose subject has no drawn shape yet shows nothing, and that
 * gap is worth seeing: it is the same gap a creature idea with no draft at it
 * shows on the NOT BUILT YET page, arrived at from the other side.
 */

import type { SoundDef } from "@neon-spore/audio";
import type { MirrorStep } from "@neon-spore/sim";
import { NO_SUBJECT } from "./sound-link-none.js";

/** The bound sounds with nothing to draw, and why — `sound-link-none.ts`. */
export { NO_SUBJECT } from "./sound-link-none.js";

/** A contour by its `shape-sheet` name, or one of the six controls. */
export type Subject =
  | { kind: "shape"; name: string }
  | { kind: "control"; step: MirrorStep }
  | { kind: "none" };

const shape = (name: string): Subject => ({ kind: "shape", name });
const control = (step: MirrorStep): Subject => ({ kind: "control", step });
const NONE: Subject = { kind: "none" };

const HULL = shape("HULL · PASSIVE");
const ARMED = shape("HULL · ARMED");
const MAW = shape("HULL · MAW");
const QUEEN = shape("BULB QUEEN");
const WARDEN = shape("WARDEN");
const WARDEN_OPEN = shape("WARDEN · OPEN");

/**
 * By id, where the id is the only honest answer. Everything not named here
 * falls through to `byFamily` below — a table that had to list all 190 would
 * be a second copy of the catalogue, and it would rot.
 */
const BY_ID: Record<string, Subject> = {
  // THE BEATBOX's three, all pointed at the one body: a tap landing, a run
  // committed right and a run committed wrong are three moments about the
  // same soundbox, and the sheet has one card for it.
  "creature.throbSwell": shape("BEATBOX"),
  "beat.drift": shape("BEATBOX"),
  "beat.wrong": shape("BEATBOX"),
  "beat.lock": shape("BEATBOX"),
  "ship.cannonStep": control("cannonRight"),
  "ship.cannonEdge": control("cannonLeft"),
  "ship.shieldStep": control("guard"),
  "ship.fireRed": control("fireRed"),
  "ship.fireCyan": control("fireCyan"),
  "ship.fireBlocked": control("fireRed"),
  "ship.reload": control("fireCyan"),
  "ship.charge": control("fireRed"),
  "ship.merge": control("fireCyan"),
  // The beam that takes a stripped worm. Its own family would send it to the
  // field's generic card, and what goes up the lane is two links of a crawler —
  // the head and the tail, the only two things on this creature nothing can
  // take off. So the picture is the link, which is the card the sheet has.
  "motion.teleport": shape("CRAWLER"),
  "boss.warden": WARDEN_OPEN,
  "boss.wardenTether": WARDEN,
  "boss.wardenPlate": WARDEN,

  "ship.guard": ARMED,
  "ship.guardLapse": ARMED,
  "ship.intake": MAW,
  "ship.intakeShut": MAW,

  // THE LANCE is the cannon lobe filling and then emptying, so all three
  // belong to the ship's own contour. There is no `HULL · LANCE` pose on the
  // shape sheet yet — a full lobe is drawn in the game (`render/lance.ts`) and
  // has never been drawn as a still.
  "signal.markSet": HULL,
  "signal.markHit": HULL,
  "signal.markMissed": HULL,

  // THE MAGNET's two, and both are pictures of the same body: the plate
  // turning a bolt away is one edge of it, and the break is the whole of it
  // coming apart. The card the sheet has is the whole body, which is the
  // honest answer to both.
  "creature.magnetPlate": shape("MAGNET"),
  "creature.magnetBreak": shape("MAGNET"),

  // THE COIL's charge leaving one failed dome for the next. The card is the
  // rock, because that is what a dome has inside it and what drops out of the
  // one this bolt is on its way to — the bolt itself is drawn nowhere but on
  // the field, and only on one of the two screens (`render/coil-jump.ts`).
  "impact.chain": shape("METEOR"),

  "impact.destroyRed": shape("SLICK"),
  "impact.destroyCyan": shape("BULB"),
  "impact.reject": shape("METEOR"),
  "impact.deflect": ARMED,
  "impact.petal": QUEEN,
  "impact.wrongTarget": shape("SLICK"),
  // Both of THE SHELL's moments are about the same body: a piece of plating
  // coming off it, and the last piece coming off it. Neither is a picture of
  // armour on its own — armour has no contour of its own at all now
  // (`shellBecomes`), and what is underneath is a slick or a bulb. The bulb,
  // because a Shell-Bulb is the one this act's wave opens with.
  // The wisp's hop, and the one sound in the catalogue whose whole point is
  // that it says nothing about *where*. The body is still what it is about, so
  // the card shows the contour.
  "signal.bearing": shape("WISP"),
  "impact.split": shape("BULB"),
  // THE CRYSTAL's shell turning a wrong shot away. The body has no card of
  // its own on the sheet — it is a slick and a bulb under one shell
  // (`render/crystal.ts`) — and the slick is the half the wave opens on the
  // left, where a shot at the wrong tile most often lands.
  "creature.crystalFacet": shape("SLICK"),
  // THE GUM taking hold. The card is the body in the air — the sac — because
  // the smear it becomes on the ship is drawn off the world and has no still.
  "creature.gumStick": shape("GUM"),
  // The dock is the clingers' now (`audio/bind-cling.ts`): the leech, since
  // it is the one on the cannon, which is what the sound was written for.
  "creature.chokeDock": shape("LEECH"),
  "creature.moult": shape("BULB"),
  // THE RECOIL bouncing. The slick, because a recoil arrives red in the wave
  // that introduces it — and because the body is the subject rather than the
  // cage: what the sound says is that the thing standing there went somewhere
  // else, and the cage has no contour of its own (`recoilBecomes`).
  "impact.bounce": shape("SLICK"),

  "boss.arrive": QUEEN,
  "boss.queenStep": QUEEN,
  "boss.queenOpen": QUEEN,
  "boss.queenShut": QUEEN,
  "boss.queenDown": QUEEN,
  "boss.markReal": QUEEN,
  "boss.torchDrop": shape("TORCH"),
  "boss.torchWarn": shape("TORCH"),

  "mirror.showFireRed": control("fireRed"),
  "mirror.showFireCyan": control("fireCyan"),
  "mirror.showGuard": control("guard"),
  "mirror.showIntake": control("intake"),
  "mirror.showCannonLeft": control("cannonLeft"),
  "mirror.showCannonRight": control("cannonRight"),

  "creature.slickGlide": shape("SLICK"),
  "creature.bulbPump": shape("BULB"),
  "creature.meteorTumble": shape("METEOR"),
  "creature.gateHold": shape("METEOR"),
  "creature.gateLoop": shape("METEOR"),
  // THE GHOST's three, and the one creature on this page whose sounds *do*
  // get a picture where a lure's and a veil's cannot: it has a contour of its
  // own (`GHOST`), even though only one of the two players will ever see it
  // on the field. A card here is not a leak — this page is the director's.
  "creature.ghostRelease": shape("GHOST"),
  "creature.ghostTurn": shape("GHOST"),
  "creature.ghostCharge": shape("GHOST"),

  "hull.ward": ARMED,
  "hull.purge": MAW,
};

/** The rest, by the family they are in. */
function byFamily(def: SoundDef): Subject {
  switch (def.family) {
    case "hull":
      return HULL;
    case "pod":
      return shape("POD");
    case "ship":
      // What is left of `ship` after the table is THE GRIP, and the grip is a
      // hand on the field rather than a control on the band.
      return HULL;
    case "mirror":
      return shape("HULL · MOVING");
    case "impact":
    case "boss":
    case "beat":
    case "ui":
    case "ambient":
    case "creature":
    case "assist":
    case "signal":
    case "swarm":
    case "motion":
    case "ruin":
    // `music` never reaches here — its cells are not in `CATALOGUE` — but the
    // switch is exhaustive on purpose and an unlisted family should fail the
    // typecheck rather than fall through to a picture it has no claim to.
    case "music":
      return NONE;
  }
}

export function subjectFor(def: SoundDef): Subject {
  if (def.id in NO_SUBJECT) return NONE;
  return BY_ID[def.id] ?? byFamily(def);
}

/**
 * The one line under the picture. A bound sound says what fires it; a spare
 * one says what it is waiting for, which is its `use` field and needs no
 * second wording here.
 */
export function triggerFor(def: SoundDef): string {
  return def.status === "bound" ? `PLAYS ON — ${def.use}` : `WAITING FOR — ${def.use}`;
}
