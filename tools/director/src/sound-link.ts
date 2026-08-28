/**
 * What a sound is attached to.
 *
 * A catalogue of 190 names is a list; a catalogue that shows the bulb beside
 * the sound a bulb makes is a thing you can check. So every sound resolves to
 * a picture of its subject, and the picture is never invented here — it is
 * either a contour out of `shape-sheet` (the same geometry the canvas draws)
 * or a control glyph out of `render/simon-glyph.ts` (the same button the band
 * draws). A sound whose subject has no drawn shape yet shows nothing, and that
 * gap is worth seeing: it is the same gap the BESTIARY panel shows, arrived at
 * from the other side.
 */

import type { SoundDef } from "@neon-spore/audio";
import type { MirrorStep } from "@neon-spore/sim";

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
  "ship.cannonStep": control("cannonRight"),
  "ship.cannonEdge": control("cannonLeft"),
  "ship.shieldStep": control("guard"),
  "ship.fireRed": control("fireRed"),
  "ship.fireCyan": control("fireCyan"),
  "ship.fireBlocked": control("fireRed"),
  "ship.reload": control("fireCyan"),
  "ship.charge": control("fireRed"),
  "ship.merge": control("fireCyan"),
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

  "impact.destroyRed": shape("SLICK"),
  "impact.destroyCyan": shape("BULB"),
  "impact.reject": shape("METEOR"),
  "impact.deflect": ARMED,
  "impact.petal": QUEEN,
  "impact.wrongTarget": shape("SLICK"),
  // Both of THE SHELL's moments are about the same body: a piece coming off
  // it, and the last piece coming off it. Neither is a picture of armour on
  // its own, because there is no separate contour for a piece — the pieces are
  // slices of this one.
  "impact.split": shape("SHELL"),
  "creature.moult": shape("SHELL"),

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

  "hull.mend": HULL,
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

/**
 * The sounds that are wired up and have nothing to draw, with the reason.
 *
 * Every other bound sound gets a picture, and `tools/director/test/sound-link.test.ts`
 * holds that line — but forcing one on these would be a lie about the game.
 * A written exception is the same arrangement `pierce` makes in the catalogue
 * itself: the rule stands, and the way past it is to say why in a sentence.
 */
export const NO_SUBJECT: Record<string, string> = {
  "beat.tick": "the beat is the grid and the HUD dots. It belongs to no column and no creature.",
  "beat.accent": "the same — the fourth beat is a moment, not an object.",
  "impact.hole":
    "a hole is punched in whatever was hit. The subject is the creature, and the creature differs every time.",
  "ui.waveOpen": "a wave opening is the whole field changing, not a thing standing in it.",
  "ui.waveClear": "likewise — what it marks is an absence.",
};

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
