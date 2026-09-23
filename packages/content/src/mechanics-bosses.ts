import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The keys of the table below, checked against the roster — `mechanics-split.ts`'
 * `SplitId` for the same reason: a name that is not a `MechanicId` collapses to
 * `never` and the key becomes a build error, so this list cannot fall behind a
 * rename.
 */
type BossId = Extract<
  MechanicId,
  | "queen"
  | "warden"
  | "tether"
  | "cairn"
  | "mirror"
  | "maze"
  | "splice"
  | "reprise"
  | "stare"
  | "diastole"
  | "baton"
  | "throat"
  | "undertow"
  | "orrery"
  | "candle"
  | "gorge"
  | "curtain"
  | "taster"
  | "sinew"
  | "ledger"
  | "surge"
  | "lead"
  | "scuttle"
  | "antiphon"
  | "hive"
  | "instar"
  | "filament"
  | "gimbal"
  | "bellows"
  | "spool"
  | "hasp"
  | "ratchet"
>;

/**
 * **The bosses**, and the one thing a boss throws that is a mechanic of its own.
 *
 * A boss is not a creature that falls harder. It arrives on its own and stays,
 * it is the whole of the wave it is in, and every one of these five sentences
 * describes a *rule change* rather than a body: the warden takes a control
 * away, the mirror makes the ship the enemy, the maze puts a corridor between
 * a shot and what it is aimed at. That is what makes the group a fact about
 * the game rather than a convenient cut, and `mechanics-rounds.ts` next door
 * is the same argument about a round.
 *
 * `tether` comes with them because it is `carriedBy: "warden"` — it is a boss's
 * limb, and there is nowhere else it could sit that would not separate it from
 * the thing that throws it.
 *
 * THE CAIRN is the sixth and it is the group's own argument at its plainest:
 * what changes is not a body but a rule, and the rule is that **this boss has
 * no answer either control can give**. A pile is taken apart by hand and comes
 * apart into the game the pair already knows.
 *
 * Lifted out of `mechanics-table.ts` when that file came back to its 250-line
 * limit for the second time, along the seam that file's own comments had
 * already drawn. `MECHANICS` names each of these one by one rather than
 * spreading the object, because `MECHANIC_IDS` is read off its key order and
 * the bestiary walks it — a group spread in one place would have moved the
 * queen to sit beside the maze.
 */
export const BOSS_MECHANICS = {
  queen: {
    what: "Huge and armoured. Two marks under her middle, one real and one not. She opens for two beats, and every eight a torch drops out of one of her wings.",
    reach: "spawn",
  },
  warden: {
    what: "A ring five columns wide with a hole you can see the field through. It never moves, and it takes one of your two sliding controls at a time.",
    reach: "spawn",
  },
  tether: {
    what: "A line out of the rim onto one of your sliding controls. It cannot be shot and it cannot be warded.",
    reach: "spawn",
    carriedBy: "warden",
  },
  cairn: {
    what: "A pile of seven of the field's own rocks, five columns wide, standing still. Nothing fired reaches it and the shield has nothing to turn. You take it apart by hand: a thumb held on the pile and carried sideways drags one rock out of that side, and what comes away falls down that lane as an ordinary rock. Leave it alone too long and it lets one go itself, into a column only the pilot can see it choosing.",
    reach: "spawn",
  },
  mirror: {
    what: "The boss is your own ship. It performs a sequence of your own moves, then asks for the whole of it back.",
    reach: "spawn",
  },
  maze: {
    what: "A real maze of rings turns above the ship, with a heart in the middle. Turn a gap round onto the ship's own column, fire the colour the heart is beating in, and the shot crawls the corridors to it. Only one gap in a rim reaches the middle; a shot lost in one of the others brings the maze down and the stage begins again.",
    reach: "spawn",
  },
  reprise: {
    what: "The wave itself, sent twice. A stretch of it falls in plain sight, and then the whole of that stretch comes down again from the top — the same bodies in the same columns at the same spacing — with nothing drawn on either screen. It arrives all the same, and it is answered the same way; the only thing missing is the picture. Nothing new comes down while it is running.",
    reach: "spawn",
  },
  splice: {
    what: "Mouths with tangled straws, each ending in a number. Feed them in order with the cannon and the maw. One of you sees the numbers. The other feeds.",
    reach: "spawn",
  },
  diastole: {
    what: "Two chambers beat on their own counts. Each of you sees only your own. Shoot a chamber on its beat. Later only the beam lands, on a shared beat.",
    reach: "spawn",
  },
  throat: {
    what: "A mouth that swallows its own column. No shot touches it. Fling a gum level into the mouth. One of you sees the mouth. The other flings.",
    reach: "spawn",
  },
  stare: {
    what: "An eye over the field that looks at one of you at a time. It turns towards a seat for four beats — only the other seat is shown which — and then it watches. While it is watching that player may not press anything at all: not the strip, not the trigger, not the plate. A button touched under it breaks the hull and the wave starts again. The other player keeps playing, alone, and the looks get longer as the wave goes on.",
    reach: "spawn",
  },
  baton: {
    what: "A bead walks down an arm. Player 1 launches it. Player 2 shoots it in the air. Take turns down all eleven sockets.",
    reach: "spawn",
  },
  orrery: {
    what: "Three rings turn round a core, each with a gap. Shoot the core when all the gaps line up below. Each of you sees one ring the other cannot.",
    reach: "spawn",
  },
  candle: {
    what: "The field goes dark. Shoot up the column under its glow. Later it eats a shot fired from the column it faces. Only Player 1 sees which.",
    reach: "spawn",
  },
  gorge: {
    what: "A sack swallows every shot that hits nothing. Four of one colour fill an intake. One more shot pierces it. Leave it full and it drops a torch.",
    reach: "spawn",
  },
  curtain: {
    what: "A curtain hides a core that fires torches. Drag the curtain aside by hand. Player 1 sees which lobes to shoot. Player 2 sees the core's colour.",
    reach: "spawn",
  },
  taster: {
    what: "Its blades take the colour you have fired most. Only the other colour cuts a blade. Lean on one colour and the fan shuts you out.",
    reach: "spawn",
  },
  ledger: {
    what: "Shoot the seam in the colour it shows. Each hit comes back down a cord into your hull. Put the shield under it. Let the fifth through.",
    reach: "spawn",
  },
  sinew: {
    what: "A mass hangs on six fibres. You each pull a handle. Hold the sum in the band for four beats. Player 1 sees the band. Player 2 sees the sum.",
    reach: "spawn",
  },
  surge: {
    what: "A bulb charges while you hold it. Player 1 sees the band. Player 2 sees the pressure. Lift both thumbs together inside the band. Too high bursts it.",
    reach: "spawn",
  },
  lead: {
    what: "A body paces along the top, a column a beat. Fire where it will be, not where it is. Player 1 sees where it turns. Player 2 sees its column.",
    reach: "spawn",
  },
  scuttle: {
    what: "A frame throws a part down a column every three beats. Shoot the hanging part in its colour before it goes. Player 1 sees which one. Player 2 sees when.",
    reach: "spawn",
  },
  antiphon: {
    what: "The body grows a shape with no name. Only Player 1 sees it and describes it. Player 2 picks it from three and fires that column and colour.",
    reach: "spawn",
  },
  hive: {
    what: "Nine breaches open on a clock and spill rocks. Shoot each one in its colour to seal it. Player 1 sees the colours. Player 2 sees the next one.",
    reach: "spawn",
  },
  undertow: {
    what: "A lobe comes up through the hull. Only Player 1 sees where the floor bows. Move the cannon under it and open the maw. Tall ones need the beam.",
    reach: "spawn",
  },
  instar: {
    what: "No controls. The body is the panel. Red marks show where it will strike and whose thumb it wants. Answer every mark before its window shuts.",
    reach: "spawn",
  },
  filament: {
    what: "Player 1 draws a line with a thumb, one tile a beat. Player 2 follows behind. Stay close but never touch.",
    reach: "spawn",
  },
  gimbal: {
    what: "A drum hangs in two rings, one ring each. Turn your ring to your mark and hold it. The inner rim runs backwards. Six latch-teeth.",
    reach: "spawn",
  },
  bellows: {
    what: "A lung over the field. One of you pulls it open. Then the other shuts it. Never in the same beat. That parts a seam. Four seams.",
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
} as const satisfies Record<BossId, Mechanic>;
