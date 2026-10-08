import type { Mechanic, MechanicId } from "./mechanics.js";

/** The keys of the table below, checked against the roster for `mechanics-bosses.ts`' reason. */
type BossIdB = Extract<
  MechanicId,
  | "nettle"
  | "filament"
  | "gimbal"
  | "spool"
  | "hasp"
  | "ratchet"
  | "mantle"
  | "keel"
  | "valve"
  | "seam"
  | "oculus"
  | "vise"
  | "rime"
  | "trivet"
  | "plumb"
  | "sling"
  | "grindstone"
  | "cyst"
  | "davit"
  | "halter"
  | "lamprey"
  | "mimic"
  | "latch"
  | "capstan"
  | "gall"
  | "trapeze"
  | "flue"
  | "governor"
  | "vane"
>;

/**
 * **The bosses `mechanics-bosses.ts` had no room for**, started on 26
 * September 2026 when THE DAVIT's row would have taken that page past 250
 * lines. The same shape and the same `satisfies`: a kind added to the
 * simulation and not to a table is a build error on one page or the other.
 *
 * THE VANE's row came here the same day, out of `mechanics-table.ts`, when
 * THE DAVIT's line took that page past 250 as well. Since THE GALL the table
 * spreads this page whole where its rows stood, so the rows here are in the
 * table's own order and key order is untouched.
 *
 * THE NETTLE through THE CYST came here on 30 September 2026, when the next
 * boss's sentence would have taken the first page past 250 again. They were
 * already the last run the table named one by one, right above this spread,
 * so moving them in front of THE DAVIT kept every id where it stood.
 */
export const BOSS_MECHANICS_B = {
  nettle: {
    what: "A jellyfish over the ship. Marks on its body say what to do: a thumb, or SHOOT, SHIELD or SUCK under the mark. Answer each before it shuts.",
    reach: "spawn",
  },
  filament: {
    what: "Player 1 draws a line with a thumb, one tile a beat. Player 2 follows behind. Stay close but never touch.",
    reach: "spawn",
  },
  gimbal: {
    what: "A drum hangs in two rings, one each. You see the other's mark, not yours: talk them onto it. The outer ring turns the inner. Both on? Let go together.",
    reach: "spawn",
  },
  spool: {
    what: "A spool pays a line to the hull. One of you holds the brake. The other sees how fast it should run. Hold it right and a rib eases.",
    reach: "spawn",
  },
  hasp: {
    what: "He holds the latch down. She turns the wheel, and it only moves while he holds. His hand burns if he holds too long. Three hasps.",
    reach: "spawn",
  },
  ratchet: {
    what: "One holds the catch, the other presses the pawl. Every press climbs one tooth for good, and is clean only while the catch is held. Five clean of seven.",
    reach: "spawn",
  },
  mantle: {
    what: "Two handles, one each. Pull both down together, hard enough, to open one of its four joints. Letting go costs the whole pull. Then tap the bare core, turn about.",
    reach: "spawn",
  },
  keel: {
    what: "Six joints. When one lights, the one whose half it is on taps it. The middle opens: shoot it in its colour. Then fast joints, and one rock.",
    reach: "spawn",
  },
  valve: {
    what: "One turns the wheel onto its mark. The other taps the pin to freeze it. Then either pulls it. Three pins, and the last wants a full turn.",
    reach: "spawn",
  },
  seam: {
    what: "A point on the crack lights in a colour. Shoot it in that colour. Shield the grit it throws. Seal three points and the ridge splits.",
    reach: "spawn",
  },
  oculus: {
    what: "Both hold your leaf together until the pair shuts. Six shut, the eye cracks. Shoot it in its colour, and hold again when leaves open.",
    reach: "spawn",
  },
  vise: {
    what: "Each pinches a lobe shut until a seam cracks. Two seams each, the kernel bares. Shoot it in its colour, and pinch both when both light.",
    reach: "spawn",
  },
  rime: {
    what: "Each rubs a half of the lens clear, back and forth. Two wipes each, the core bares. Shoot it in its colour, and shield the surge under it.",
    reach: "spawn",
  },
  trivet: {
    what: "Hold your foot's lit pads down together until it plants. Both feet home light the hub. Shoot it in its colour. When both light, hold together.",
    reach: "spawn",
  },
  plumb: {
    what: "Each drags a stone. Pull away from the low side, together, until the bob hangs true. Both weights true light the core. Shoot it in its colour.",
    reach: "spawn",
  },
  sling: {
    what: "Hold until your arm is drawn home, then swipe toward the lit side. Both arms drawn light the yoke: shoot it in its colour. When both light, draw together.",
    reach: "spawn",
  },
  grindstone: {
    what: "Rub your flat back and forth until clean, twice. Both flats clean lock the caliper: shoot the axle in its colour. When the jaws light, both hold every pad.",
    reach: "spawn",
  },
  cyst: {
    what: "When a flank shakes, your partner taps it still: pinch it shut to crack it. Both cracked: shoot the core in its colour. Then crack each flank once more.",
    reach: "spawn",
  },
  davit: {
    what: "Your partner drags the boom onto the lit side: hold a draw, then swipe that way. Two each way light the pivot. Shoot it in its colour. Then reland it.",
    reach: "spawn",
  },
  halter: {
    what: "One of you touches nothing while the other holds both grips. Hold it together and the seam opens. Then shoot the bared centre.",
    reach: "spawn",
  },
  capstan: {
    what: "One of you drags the drum to turn a band toward the other, who rubs it bright. Both bands bright bare the core. Shoot it in its colour.",
    reach: "spawn",
  },
  gall: {
    what: "Press and hold the gall where it sits, on your half. It jumps: call its number and press it there. Three closes bare the root. Shoot it in its colour.",
    reach: "spawn",
  },
  trapeze: {
    what: "Swing the alien up to the gong. Swipe toward the middle as the swing comes back. Later, shoot it from below and from the side.",
    reach: "spawn",
  },
  flue: {
    what: "One of you sees the ember run along the flue. The other fires. Shoot it over the cannon, in the shot and colour the level shows. Three shots a level.",
    reach: "spawn",
  },
  governor: {
    what: "A needle turns on a dial. Each of you taps as it crosses your own mark. Then shoot its lit tip as it passes the gap, in its colour.",
    reach: "spawn",
  },
  lamprey: {
    what: "The eel jumps to a tile and bites in. One of you holds the tail. The other frees the head before time runs out. Then shoot the gullet.",
    reach: "spawn",
  },
  mimic: {
    what: "One of you sees a picture of tiles and says it. The other taps it into the frame. Too slow and an arm reaches down. Then tap the core.",
    reach: "spawn",
  },
  latch: {
    what: "A slime hooks the hull with a rope. You each have one grip. Pull it down in turns, and never both let go. Hold on when it yanks.",
    reach: "spawn",
  },
  vane: {
    what: "An arm sweeps the top of the field. It mirrors everything under it across the column it stands in.",
    reach: "spawn",
  },
} as const satisfies Record<BossIdB, Mechanic>;
