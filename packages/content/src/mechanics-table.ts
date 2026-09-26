import type { Mechanic, MechanicId } from "./mechanics.js";
import { BEATBOX_MECHANIC } from "./mechanics-beatbox.js";
import { BOSS_MECHANICS } from "./mechanics-bosses.js";
import { HANDED_MECHANICS } from "./mechanics-handed.js";
import { ROCK_MECHANICS } from "./mechanics-rocks.js";
import { ROUND_MECHANICS } from "./mechanics-rounds.js";
import { RUN_MECHANICS } from "./mechanics-run.js";
import { SPLIT_MECHANICS } from "./mechanics-split.js";
import { WAVE_MECHANICS } from "./mechanics-wave.js";
import { WORN_MECHANICS } from "./mechanics-worn.js";

/**
 * The rows themselves, lifted out of `mechanics.ts` when that file crossed the
 * 250-line limit. What stayed there is the shape of a mechanic and the four
 * questions asked of the set; this is the data, and the half that grows.
 */
/**
 * One row per mechanic. `as const satisfies` rather than a type annotation on
 * purpose: `satisfies` still fails the type check when a kind is added to the
 * simulation and not to this table — a guard the retired briefing catalogue
 * proved twice in one afternoon — while `as const` keeps `waveNames` a literal
 * `true`, which is what lets `WaveKind` be read back out of it.
 */
export const MECHANICS = {
  slick: {
    what: "Flat, wide, and always red. It holds its lane and steps down one row on every beat.",
    reach: "spawn",
  },
  bulb: {
    what: "Round, swollen, and always cyan. Same fall, same lane — the colour is the whole of the difference.",
    reach: "spawn",
  },
  // The five bodies one seat cannot see whole are `mechanics-split.ts` next
  // door. Named one by one rather than spread, at exactly the positions they
  // have always held, so key order is untouched — `MECHANIC_IDS` is read off
  // it and the bestiary walks it.
  lure: SPLIT_MECHANICS.lure,
  throb: {
    what: "Red down one side and cyan down the other, and it turns as it falls. Shoot the colour of the half that points at the cannon.",
    reach: "spawn",
    waveNames: true,
  },
  shell: {
    what: "A slick or a bulb inside armour, in two pieces, one per column. Any colour chips a piece off. Only when both are gone does its own colour kill it.",
    reach: "spawn",
    waveNames: true,
  },
  dart: SPLIT_MECHANICS.dart,
  veil: SPLIT_MECHANICS.veil,
  wisp: SPLIT_MECHANICS.wisp,
  ghost: SPLIT_MECHANICS.ghost,
  countdown: SPLIT_MECHANICS.countdown,
  echo: {
    what: "A small slick or bulb at half speed. It splits after three, six and nine beats. Its seam shows which way. Shoot it early, before it splits.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // dart: the silhouette is a slick's or a bulb's and the colour is which
    // trigger answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  // Five of the six **worn bodies** — a slick or a bulb inside something that
  // has to come off first — next door in `mechanics-worn.ts`. Named one by one
  // rather than spread, for `mechanics-split.ts`' reason: `MECHANIC_IDS` is read
  // off this key order and the bestiary walks it.
  rind: WORN_MECHANICS.rind,
  recoil: WORN_MECHANICS.recoil,
  carom: WORN_MECHANICS.carom,
  chute: WORN_MECHANICS.chute,
  volley: WORN_MECHANICS.volley,
  crystal: WORN_MECHANICS.crystal,
  strand: {
    what: "Beads on a line. Shoot only the marked end. One of you sees the mark, the other sees the colours. A wrong shot brings a bead back.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for an
    // echo: the colour is the **leftmost** bead's, and every other one on the
    // thread follows from it by alternating — so what is authored is one end
    // of a pattern rather than one body.
    waveNames: true,
  },
  gyre: {
    what: "A wheel with six bodies on its rim, turning. It walks a diamond mid-field, faster and lower every lap. Opening the maw slows it for four beats.",
    reach: "spawn",
    // A wave names this kind and never a colour: what carries one is each of
    // the six on the rim, and each of those follows from its position rather
    // than from anything an author could write (`mountColor`).
    waveNames: true,
  },
  lid: {
    what: "An armoured eye. Hold the cord aside and the armour opens, bit by bit. Shoot its colour only when the eye is fully open. Let go and it shuts.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp: the silhouette is the lid's and the colour is the lens's, which
    // is which trigger answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  mount: {
    what: "One of the six bodies on a gyre's rim. Shoot it in its colour, in its column. It only stands there for one beat.",
    reach: "spawn",
    // Brought by the wheel, six at a time, the way the tether is brought by
    // THE WARDEN — so a wave reaches this without naming it, and there is no
    // wave anywhere that could name it (`addCarried`).
    carriedBy: "gyre",
    // Deliberately no `waveNames`: a mount is not a thing a wave may place. It
    // arrives because a `gyre` did, six at a time, and a brush for one would
    // be a body an author could put on the field with no wheel under it.
  },
  // The five speed tiers and the torch, next door in `mechanics-rocks.ts`.
  // Spread in here rather than listed, at exactly the position they have
  // always held, so key order is untouched — `MECHANIC_IDS` is read off it.
  ...ROCK_MECHANICS,
  // The bosses, and the line one of them throws — next door in
  // `mechanics-bosses.ts`. Named one by one rather than spread, for
  // `mechanics-split.ts`' reason: `MECHANIC_IDS` is read off this key order and
  // the bestiary walks it, so a group spread in one place would reorder them.
  queen: BOSS_MECHANICS.queen,
  warden: BOSS_MECHANICS.warden,
  cairn: BOSS_MECHANICS.cairn,
  tether: BOSS_MECHANICS.tether,
  mirror: BOSS_MECHANICS.mirror,
  maze: BOSS_MECHANICS.maze,
  splice: BOSS_MECHANICS.splice,
  reprise: BOSS_MECHANICS.reprise,
  stare: BOSS_MECHANICS.stare,
  baton: BOSS_MECHANICS.baton,
  throat: BOSS_MECHANICS.throat,
  undertow: BOSS_MECHANICS.undertow,
  gorge: BOSS_MECHANICS.gorge,
  curtain: BOSS_MECHANICS.curtain,
  taster: BOSS_MECHANICS.taster,
  sinew: BOSS_MECHANICS.sinew,
  ledger: BOSS_MECHANICS.ledger,
  surge: BOSS_MECHANICS.surge,
  lead: BOSS_MECHANICS.lead,
  scuttle: BOSS_MECHANICS.scuttle,
  antiphon: BOSS_MECHANICS.antiphon,
  hive: BOSS_MECHANICS.hive,
  instar: BOSS_MECHANICS.instar,
  nettle: BOSS_MECHANICS.nettle,
  filament: BOSS_MECHANICS.filament,
  gimbal: BOSS_MECHANICS.gimbal,
  spool: BOSS_MECHANICS.spool,
  hasp: BOSS_MECHANICS.hasp,
  ratchet: BOSS_MECHANICS.ratchet,
  vane: {
    what: "An arm sweeps the top of the field. It mirrors everything under it across the column it stands in.",
    reach: "spawn",
  },
  well: {
    what: "Player 1 sees the field as a clock, with the ship in the middle. Column four is four o'clock. The two ends of the field meet at twelve.",
    reach: "spawn",
  },
  purge: {
    what: "A pod that hangs still. Shoot it loose, then take it in, or you lose the wave. Taking this one clears everything that is falling.",
    reach: "spawn",
  },
  ward: {
    what: "This one holds the shield armed for six beats with no trigger at all.",
    reach: "spawn",
  },
  husk: {
    what: "A fake pod that carries nothing. Swallow it and you lose the wave. Only Player 2 sees which one. Player 1 keeps the maw shut.",
    reach: "spawn",
  },
  // The sixth worn body (`mechanics-worn.ts`), in the place it has always held.
  clasp: WORN_MECHANICS.clasp,
  ...ROUND_MECHANICS,
  crawler: {
    what: "A maggot walks the hull instead of falling. Take off every ring. A colour ring wants that colour. The rest want the shield. Finish before the far wall.",
    reach: "spawn",
    // A wave names this kind and never a colour, the way it does for a gyre:
    // what carries one is each segment, and each follows from its place along
    // the body (`segmentColor`) rather than from anything an author writes.
    waveNames: true,
  },
  choir: {
    what: "Two grey balls no shot touches. Player 1 shakes the phone twice inside two beats. They join into one body, and Player 2 shoots it.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp: the silhouette is the membrane's and the colour is the body it
    // draws together into, so neither can be worked out from the other — and
    // here the colour is the one thing that is not on the field yet at all.
    waveNames: true,
  },
  fence: {
    what: "A wire with gaps drops fast. No shot or shield stops it. Only Player 1 sees the gaps. Move the shield into one, or shoot a crack open.",
    reach: "spawn",
    // A wave names this kind and never a colour: a wall carries none at all,
    // the way a wisp does. What a wave authors instead is where the gaps are
    // and where the cracks are (`WaveEntry.gaps`, `WaveEntry.cracksRed`),
    // which is the one thing about this creature an author composes anything
    // else against. The colours on the entry are the *cracks*, not the wall.
    waveNames: true,
  },
  magnet: {
    what: "A horseshoe with a red and a cyan pole. Only a shot from the side hurts it. Lock on from another column. Match the pole it hits.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp and a dart — and here the colour is doing double work: it is the
    // *left* pole, and the right one is its opposite, so one authored word
    // says which way round the body stands.
    waveNames: true,
  },
  // THE BEATBOX, in `mechanics-beatbox.ts` next door — cut out for the reason
  // named there.
  beatbox: BEATBOX_MECHANIC,
  // THE BALLOON, next door in `mechanics-handed.ts`: named, so key order keeps.
  balloon: HANDED_MECHANICS.balloon,
  gum: HANDED_MECHANICS.gum,
  weight: HANDED_MECHANICS.weight,
  limpet: HANDED_MECHANICS.limpet,
  leech: HANDED_MECHANICS.leech,
  // The five that are not a thing the field sends — a wave's own opening, the
  // wind-up, and the three things a held thumb does — are `mechanics-run.ts`
  // next door, cut out when THE CRAWLER took this file past its limit along
  // the seam `reach` already names.
  ...RUN_MECHANICS,
  // And the two a wave turns on without sending anything at all, next door in
  // `mechanics-wave.ts` — the third cut, along that same seam.
  ...WAVE_MECHANICS,
  mine: {
    what: "A still body only one of you can see. The other touches its exact tile before the fuse runs out. Its four arms point at tiles that hurt.",
    reach: "spawn",
    // A wave names the kind, the tile it stands on, the colour the ship is
    // marked in when it goes off, and which seat is shown it — four things,
    // and none of them rolled. Where a mine is *is* the sentence the pair has
    // to say, and a wave cannot be composed against a tile its author does not
    // know.
    waveNames: true,
  },
  moult: {
    what: "It turns from rock to cargo every five beats. Put the shield under the rock. Swallow the cargo with the maw. Only Player 2 sees what comes next.",
    reach: "spawn",
    // A wave names the kind and what it is carrying — two things, and neither
    // of them rolled. **When** it turns over is not the wave's: that is one
    // clock read off the shared beat, so a field of them is one sentence to
    // say rather than one per body (`sim/moult.ts`).
    waveNames: true,
  },
} as const satisfies Record<MechanicId, Mechanic>;
