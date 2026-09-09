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
    what: "Cut down the middle: red down one side and cyan down the other. It turns clockwise the whole way down, and the half pointing at the cannon is the colour that answers a shot. The other colour is a colour miss, so the turn never shuts it — it swaps which trigger is the right one.",
    reach: "spawn",
    waveNames: true,
  },
  shell: {
    what: "Plating a size too big for the slick or the bulb inside it, split down the middle: one piece in front of each of its two columns, and the body's own colour shining out through the cracks the whole way down. Any colour chips a piece off. A shot up a column already bared does nothing — and only once both pieces are gone does that colour finish it.",
    reach: "spawn",
    waveNames: true,
  },
  dart: SPLIT_MECHANICS.dart,
  veil: SPLIT_MECHANICS.veil,
  wisp: SPLIT_MECHANICS.wisp,
  ghost: SPLIT_MECHANICS.ghost,
  echo: {
    what: "A small slick or bulb that comes down half as fast as anything else, and divides while it falls: three beats, then six, then nine. Every division turns a corner — sideways, then up and down, then both at once — and the seam across it says which way and how soon. The matching cannon kills any of them, and a shot that catches one early is paid for every body it would have become.",
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
  strand: {
    what: "Two to five slicks and bulbs threaded on one line, alternating red and cyan. It is eaten from its ends inward and only one bead can be shot at a time — one of the two ends, decided again after every shot. One of you is shown which that is and no colours; the other is shown the colours and no mark. A shot at the wrong one swells a dead bead back to life.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for an
    // echo: the colour is the **leftmost** bead's, and every other one on the
    // thread follows from it by alternating — so what is authored is one end
    // of a pattern rather than one body.
    waveNames: true,
  },
  gyre: {
    what: "A wheel with six bodies bolted round its rim, alternating red and cyan, turning as it comes. It falls to the middle of the field and then walks a diamond there, faster every beat and a row lower every lap, until the bottom of it grinds along the ship. Opening the maw slows the turn for four beats, wherever the cannon is standing — it is the only thing either of you can do about the speed.",
    reach: "spawn",
    // A wave names this kind and never a colour: what carries one is each of
    // the six on the rim, and each of those follows from its position rather
    // than from anything an author could write (`mountColor`).
    waveNames: true,
  },
  lid: {
    what: "An armoured eye. The plates over its lens part from the middle outwards, by degrees, for exactly as long as one of you keeps the cord pulled aside — and only while they stand fully apart does the lens's colour land. Let go and they shut.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp: the silhouette is the lid's and the colour is the lens's, which
    // is which trigger answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  mount: {
    what: "One of the six on that rim. An ordinary slick or bulb, answered by the ordinary rule — the matching colour, in the column it is standing in — except that it is only standing there for a beat.",
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
  // The four bosses, and the line one of them throws — next door in
  // `mechanics-bosses.ts`. Named one by one rather than spread, for
  // `mechanics-split.ts`' reason: `MECHANIC_IDS` is read off this key order and
  // the bestiary walks it, so a group spread in one place would reorder them.
  queen: BOSS_MECHANICS.queen,
  warden: BOSS_MECHANICS.warden,
  tether: BOSS_MECHANICS.tether,
  mirror: BOSS_MECHANICS.mirror,
  maze: BOSS_MECHANICS.maze,
  vane: {
    what: "An arm sweeping the top of the field. Everything that comes in under it is folded about the column it is standing in — as far the other side of the arm as it came in.",
    reach: "spawn",
  },
  mend: {
    what: "It hangs where it was left. Shooting it loose is only half of getting it — after that it sinks and drifts.",
    reach: "spawn",
  },
  purge: {
    what: "The same pod with different cargo: taking this one in clears the field of everything that is falling.",
    reach: "spawn",
  },
  ward: {
    what: "This one holds the shield armed for six beats with no trigger at all.",
    reach: "spawn",
  },
  // The sixth worn body (`mechanics-worn.ts`), in the place it has always held.
  clasp: WORN_MECHANICS.clasp,
  ...ROUND_MECHANICS,
  crawler: {
    what: "A maggot that comes over a side wall and walks the ship's surface instead of falling on it, a column every other beat, costing the hull nothing while it walks. Every ring of it comes off: the segments run red, cyan, plate, red, cyan, plate, and the head and the tail are plates too — a colour wants the matching cannon under it, a plate wants the shield. Each ring wears a crosshair, and the ones the dome is owed wear its mark above them. Every ring taken off snaps the body together behind it. Take the last one and the ship sweeps the lane clean; let it reach the far wall and it eats its way in.",
    reach: "spawn",
    // A wave names this kind and never a colour, the way it does for a gyre:
    // what carries one is each segment, and each follows from its place along
    // the body (`segmentColor`) rather than from anything an author writes.
    waveNames: true,
  },
  choir: {
    what: "Two grey balls standing apart in one lane, carrying no colour at all. Nothing reaches them: a bolt in either colour is spent on nothing. What opens them is a gesture neither panel has, and it is two moves inside two beats — the pilot shakes the phone and shakes it again, or, where a phone cannot report being shaken, carries the two arrows standing against the walls of the field outward, one and then the other. The first move sets them glowing; the second closes them over a beat, the colour bleeding in as they go, and only when they are one is there a body the navigator can shoot. Miss the window, or carry an arrow inward, and it sings: the hull pays for the chord and the gesture starts again.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp: the silhouette is the membrane's and the colour is the body it
    // draws together into, so neither can be worked out from the other — and
    // here the colour is the one thing that is not on the field yet at all.
    waveNames: true,
  },
  fence: {
    what: "A live wire across the whole field with gaps burnt through it, coming down twice as fast as anything else. The trigger does nothing — the shield does not stop it, it goes through it. The ship lives if the dome is standing in a gap when the wire arrives, and only the pilot can see where the wave's own gaps are. A wall may also carry cracks — a column and an ammunition colour each, drawn on the pilot's screen — and a bolt arriving on one in that colour opens the wire there for good. That is the only place any shot goes through, so a wire with no gaps at all is answered by the pilot saying a column and a colour and the navigator loading it and firing.",
    reach: "spawn",
    // A wave names this kind and never a colour: a wall carries none at all,
    // the way a wisp does. What a wave authors instead is where the gaps are
    // and where the cracks are (`WaveEntry.gaps`, `WaveEntry.cracksRed`),
    // which is the one thing about this creature an author composes anything
    // else against. The colours on the entry are the *cracks*, not the wall.
    waveNames: true,
  },
  magnet: {
    what: "A horseshoe standing on two poles, one red and one cyan, with an armoured plate slung under it. A shot climbing its own column hits the plate and is reflected back down. The only bolt that reaches it is one arriving sideways, which means the cannon has to be in some other column and the pilot's thumb has to be on the body: a locked shot climbs, turns level with it and runs across (THE LOCK). Whichever side it comes in on is the pole it meets, and that pole's colour is the only one that kills it.",
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
  // The five that are not a thing the field sends — a wave's own opening, the
  // wind-up, and the three things a held thumb does — are `mechanics-run.ts`
  // next door, cut out when THE CRAWLER took this file past its limit along
  // the seam `reach` already names.
  ...RUN_MECHANICS,
  // And the two a wave turns on without sending anything at all, next door in
  // `mechanics-wave.ts` — the third cut, along that same seam.
  ...WAVE_MECHANICS,
} as const satisfies Record<MechanicId, Mechanic>;
