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
    what: "A row of mouths two tiles over the plating, and a straw out of each one running the whole height of the field, tangled through all the others, with a number at its far end. Feed them in order — the cannon under a mouth and the maw open — and the number takes two beats to come down the straw before the ship finds out whether it was the one wanted. Only one of you is shown the tangle and the numbers; only the other one can reach a mouth. A wrong number, or a round's beats running out, costs the hull.",
    reach: "spawn",
  },
  diastole: {
    what: "Two chambers side by side above the top of the field, one column apart, with a bridge of vessels between them. Each beats on its own count — the left every three beats, the right every five — and each of you is shown only your own chamber's pulse true; the other one is a still grey mass on your screen. A chamber can only be hurt on one of its own contractions. While the left is beating alone an ordinary shot of its colour, up its column, on one of its contractions takes it. Once the right wakes, nothing single lands at all: the only answer is the lance beam standing in the *bridge* column on a beat both of them are contracting on, which is every fifteen. Then the left collapses, the right goes to seven, and there is no second rhythm left to count it against — and its beat has to be held: the one of you who sees it says now, the other clamps the grey chamber with a thumb, and the beam lands under the clamp. A clamp on any other beat throws the chamber into a spasm in which nothing lands.",
    reach: "spawn",
  },
  throat: {
    what: "A gullet hanging from the top of the field, five ring muscles stacked and narrowing, ending in a lipped mouth one column wide that slides along its own row. No shot touches it. Every few beats it inhales its own column: whatever is standing in its mouth is swallowed, and everything else in that column is hauled a row closer. A creature it swallows re-tightens one of its slack rings, so clearing the field feeds it and letting the field run feeds it faster. The only thing that hurts it is a gum flung level along the mouth's row into the mouth, which chokes a ring for good. Only one of you is shown the mouth's column and the beats to the next inhale; only the other one can fling. At five slack rings it pulls itself through its own mouth.",
    reach: "spawn",
  },
  stare: {
    what: "An eye over the field that looks at one of you at a time. It turns towards a seat for four beats — only the other seat is shown which — and then it watches. While it is watching that player may not press anything at all: not the strip, not the trigger, not the plate. A button touched under it breaks the hull and the wave starts again. The other player keeps playing, alone, and the looks get longer as the wave goes on.",
    reach: "spawn",
  },
  baton: {
    what: "A segmented arm hanging from the top of the middle lane, eleven sockets long, with one bright bead standing in the topmost. The bead is safe in a socket and can only be hurt while it is moving between two — and it only moves when the pilot pulls the trigger. The seat that acts is locked out of its own phone for the next beat, so the bead is passed down the arm by strict alternation: he launches it, she shoots it in the air, he launches it again. A launched bead nobody hits lands back where it was; a bead nobody launches in time settles, and a settled bead goes back to the top. Each socket it leaves goes dark for good, the dark ones start dropping off the arm as rocks, the arm starts swinging, and out of the last socket the bead falls as a pod for the maw.",
    reach: "spawn",
  },
  orrery: {
    what: "Three rings of organs turning about a core in the middle of the field, each ring with one gap in it. A shot up the middle column reaches the core only on a beat every ring still standing has its gap at the bottom of its orbit — and the outer ring is drawn true on both screens, the middle on the pilot's alone and the inner on the navigator's alone, so neither of you can work that beat out by yourself. The rings come round every eight, six and four beats and first meet twelve beats in. A shot that lands in the colour the core is showing takes the outermost ring still standing; the colour changes every time one comes off, three organs come loose and fall as rocks, and the core starts firing a rock of its own down a column every four beats. With every ring gone the core takes nothing but the beam, which means she holds a colour while he keeps the cannon still in a column being shot at.",
    reach: "spawn",
  },
  candle: {
    what: "The one boss you fight in the dark. The field goes black over four beats and the only steady light left is the boss's own glow, high over one column — and that glow is its health: five steps, one lost to every shot up its column, either colour, and the fight is over when the last goes out. It drifts a column every few beats, so the column to fire up has to be found again. It faces a column, which only the pilot sees, and once it is down to two steps it eats a flash fired from that column: no bolt leaves the muzzle, nothing is lit, and the swallowed light puts a step back on its glow. The beam is never eaten. At the last step it stops moving and stops eating, and the last shot is the pair's to take. The dark itself, the flashes and the after-images are the picture's and not the rule's.",
    reach: "spawn",
  },
  gorge: {
    what: "The one boss you hurt by not shooting. A sack hangs across the top of the field, seven columns wide, with an intake under each, and every shot that reaches the top of the field without meeting a body is swallowed and hangs inside it as a bead. An intake fills on four beads of one colour and goes clear; one more shot then pierces it for good, but a full intake nobody pierces vents a torch down its column after four beats and is empty again. A wrong colour takes a bead back out. After two ruptures the sack spits beads back as bodies of their colour, from the emptiest intake that holds one, every three beats; after four, the intake nearest the centre becomes the mouth and fills itself, and the beam in its colour standing in its column while it is full ends the fight, every bead leaving at once. The sack sinking under what it holds is the picture's and not the rule's.",
    reach: "spawn",
  },
  curtain: {
    what: "The one boss that is in the way. A membrane seven columns wide hangs a row below the top of the field with weighted lobes along its hem, and behind it a core hides in one column and fires torches down it. No shot reaches the core through the fabric; the membrane is shoved aside instead, one column per hand carried across it, the two of you pulling opposite ways holding it still, and left alone four beats it rolls back over the core. The hem is its health: every six beats two lobes go soft, only the pilot sees which, and a shot into a soft one takes it off — four gone and it slides two columns a shove. The core's column and colour are the navigator's alone while it is covered. Bared, it takes a shot in its own colour, drops its nearest lobe and drifts to a new column and colour; the wrong colour fires a torch at once. Three hits end it. A hem with no lobes left tears off the rail at the next shove, and the naked core fires every second beat until it is put out.",
    reach: "spawn",
  },
  taster: {
    what: "The one boss that watches what you spend. A crest hangs across the top of the field and grows eleven blades out of itself, middle outward, and the blades are its health. Every blade takes its edge from whichever colour the pair has fired more of over the last thirty beats — and a blade is only struck off by the colour it is not. Its own colour thickens it instead, so the answer to a red edge is cyan, and the harder you lean on one colour the more of the fan you cannot touch. The column of a sheared blade is left soft and swallows a shot for nothing. The majority flipping re-edges every standing blade at once, until the crest itself is cut through four times — after which it can never taste again. With two blades left they fold over the body and refuse every single bolt: only the beam, held in the colour the fan is not, opens them.",
    reach: "spawn",
  },
  ledger: {
    what: "The one boss whose damage travels the other way. A body three columns wide hangs over the middle of the field on a thick violet cord rooted in a socket in the pair's own hull, and the seam down its middle is its health: five hits part it. A bolt in the colour the seam is showing, up the seam's own column, widens it — and sends the same damage back down the cord, landing in the socket four beats later, one beat sooner per hit and never under two. The plate in the socket's column with the trigger on that beat wards it exactly the way it wards a rock; nobody there and the hull takes it, which loses the wave. Every return that lands walks the root a column further along the ship, so the column to be warded is a new one each time. From the second hit the cord bills every shot the cannon takes, whatever it was aimed at, and a warded return is thrown back up the cord and widens the seam for nothing — so the last three hits can be made without firing at the body at all. The fifth return is the one to let through: unwarded it tears the cord out of the ship and the halves part.",
    reach: "spawn",
  },
  sinew: {
    what: "The one boss that asks how hard rather than when. A mass hangs over the middle column on a rope of six fibres, with a handle either side of it, and each of you pulls one handle down; the two pulls add into one sum, and the fibre being held parts when that sum sits inside a band for four beats. Only the pilot sees the band, and it narrows with every fibre gone; only the navigator sees the sum. A sum over the band snaps the fibre off the pair's hands and throws a rock out of the mass; a sum out of the band restarts the four beats. From the fourth fibre the rope creeps slack under a held hand, so the same pull reads less every beat until both hands come off and grip again. Each fibre parted sinks the mass a row and opens THE SLOW. The last fibre's band is one step under the rope's limit and its snap throws three rocks; when it parts the mass falls over four beats, and both handles swayed the same way walk it a column a beat — three columns clear of the middle and it lands beside the hull, fewer and it lands on it.",
    reach: "spawn",
  },
  surge: {
    what: "The one boss beaten by letting go. A bulb hangs over the middle column with its seam shut, and a thumb from either seat on it charges it a step a beat, two thumbs two steps, none at all and it leaks. Its seam has five notches, and a notch opens only when both thumbs come off inside a band round the notch's pressure, the second lift within a beat of the first; the pilot alone sees the seam and where the band sits, the navigator alone sees the pressure, and the field slows as the pressure comes into the band. A second lift a beat late, or one thumb alone, loses the charge. A lift over the band, or the pressure reaching the top of the gauge on the beat, bursts it: both thumbs thrown off, three gums thrown down its columns, two beats in which nothing takes hold, and from the third notch a notch closed again. Every notch open sinks the bulb a row, sets the next notch higher and its band no wider; from the second it holds its charge with no thumb on it and eats whatever falls into its columns, and from the third a thumb charges it at double. The last notch's band ends one under the burst; vented, the bulb turns inside out and the wave ends.",
    reach: "spawn",
  },
  lead: {
    what: "The one boss shot where it will be, not where it is. A body paces along the top of the field on a stalk of five segments, a column a beat, turning at the walls, and the stalk is its health. A bolt out of the top of the field is not judged where it leaves but a beat later, against the column the body is in then — so the column to fire from is the column it will be in, which is the sum the pair is doing out loud. A hit takes a segment, one a beat at most however many arrive; a beat on which every shot in the air missed turns it round, so a wrong sum costs the next one too. The pilot alone sees the stalk lean where it goes next; the navigator alone sees the column it stands in. From the fourth segment it runs two columns a beat and litters the field — a torch in the column it left, a rock in the column a shot has to go to. From the second the lean says the turn a beat early. Every judged beat opens THE SLOW. On the last segment it stops dead and nothing reaches it; on the still's last beat the stalk leans the way it will go, then it crosses to the farther wall three columns a beat, and a wall is another still and a pass back. Only the beam standing in a column the pass goes through takes the last segment, and the wave ends.",
    reach: "spawn",
  },
  scuttle: {
    what: "The one that throws itself at you, a part at a time. A frame of twenty-one parts hangs over the middle of the field — rock, bodies of both colours, and two pods, sown by the seed — and the parts are its health and its ammunition both. Every three beats a part comes loose and hangs in its socket, then is thrown down its own column as what it is: a meteor, a slick, a bulb, or a pod. A bolt out of the top of the field in that column and that colour while it hangs takes it off the frame with no throw, and the next part comes loose the beat after; the wrong colour is a rebuff. Only the pilot sees which hanging part is live and its colour; only the navigator sees the count under it. A pod thrown is a real pod, and taken it slackens the next window a beat. Under twelve parts it lets two go at once, one of them live; under eight it throws every two beats and from the far side of the frame. The last part winds up for the beam's priming and a beat, under THE SLOW, and only the beam standing in its column takes it — thrown, it hits the hull and the wave is lost.",
    reach: "spawn",
  },
  antiphon: {
    what: "The one boss that is a question about describing a thing with no name. A smooth body over the top of the field grows one organ at a time — a contour nobody has a word for — and only the pilot sees it. Only the navigator sees a rail of three candidates, each with a column and a colour, and the organ is one of them. The pilot describes; the navigator names a column and a colour; a bolt out of the top of the field in that column and that colour takes the organ to a pit, the wrong colour there is nothing, and the wrong candidate hardens the organ and puts one more on every rail after. An organ stands fourteen beats, then sinks back healed. Six pits. From two the rail is the organ's own family and the window is eight; from three every candidate rejected falls as a body in its colour; from four two grow at once and an organ left standing fires a body down its column; from five a pit grows again. With every pit taken the surface goes still, and the last organ is their own ship on a rail of ships — the right one erupts every pit, the wrong one hardens.",
    reach: "spawn",
  },
  hive: {
    what: "The one you seal, and every breach you have not sealed yet is spilling. Nine sites lie sown across the underside of a mass over the field, each with a colour the seed rolled. Four beats to look, then one opens, then one more every eight beats — and from the fifth opening, two at once. Nothing slows that clock. Every open breach spills a rock down its own column every three beats, and the rocks are the wave: warded, never shot. A bolt out of the top of the field in an open breach's column and its colour seals it for good; the wrong colour provokes every open breach to spill two beats sooner; the skin between them swallows a shot. Only the pilot sees a breach's colour, and he cannot fire; only the navigator sees the swell where the next one opens, three beats before it does, and she cannot move the cannon. So the pair race the clock: the breaches open on schedule whatever they do, and what their speed buys is how many are spilling at once. The ninth sealed under THE SLOW, the mass closes and the wave ends.",
    reach: "spawn",
  },
  undertow: {
    what: "The one boss that comes up through the floor. A plate of the hull bows for four beats — only the pilot sees which, on his own screen — and then a lobe stands up through it into the field. A standing lobe is taken by the maw opened under it, from the cannon's own column; a lobe too tall for the maw is taken by the beam alone. One that stands its four beats untaken withdraws and leaves the breach as a scar, and while it stands the breach widens each beat the plate is not standing on it, until a second lobe comes through next door — the first time in the game the shield faces down. Two come up four columns apart, so the maw can reach one and the pair have to agree which. Then the floor bows under the cannon itself, and the pilot has two beats to slide off or his seat is swallowed. Last, the whole edge lights and one lobe rises in the middle column: the maw held open under it for six beats takes the body down through the breach; ten beats standing and it comes through the other way.",
    reach: "spawn",
  },
  instar: {
    what: "The one boss with no control set: the panel is its body. It hangs over an empty field and morphs, pose by pose, and in each pose red marks come up on the parts of it that are about to hurt the ship — a jaw, a hand with a weapon in it, a clutch of eggs, a tongue, a tail, the head — and where a mark sits says whose thumb it wants. One seat acts while the other watches and says so; or both act at once in two places and the last of the two must land inside two beats of the other, or the first slips back to nought; or both thumbs hold the one mark. A pull is held at its depth, a slap is counted, an egg is swiped off, a tongue is wound in, a head is held. Every mark done together lands the beat, the body settles and morphs to the next pose; a window that closes with a mark undone is the part striking the hull, which is the wave. Nothing is written for the pair to read: the mark is the instruction. Five poses, and the last lands under THE SLOW.",
    reach: "spawn",
  },
  filament: {
    what: "The one boss whose question is whether you can follow a line the other of you is still drawing. A body over the top of the field hangs seven loose filaments, and they are its health: each traced end to end is pulled out and the body narrows, the last the width of it. One at a time a filament lights at its free end. The pilot draws it — his thumb carried up the line, one tile a beat, lighting the tiles it has passed and no others; faster snaps it. The navigator follows on the lit part behind him, never more than three tiles back and never on his tile: her thumb reaching his is the two colliding and the filament recoils; the gap opening past three is the filament going dark. Any of the three is the filament back to its free end. Only he sees how far ahead he is; only she sees how far behind. Her thumb on the root, the last tile, is the filament pulled, under THE SLOW. Nothing strikes the hull.",
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
