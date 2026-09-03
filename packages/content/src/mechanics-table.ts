import type { Mechanic, MechanicId } from "./mechanics.js";

/**
 * The rows themselves, lifted out of `mechanics.ts` when that file crossed the
 * 250-line limit. What stayed there is the shape of a mechanic and the four
 * questions asked of the set; this is the data. The split is along the same
 * seam `wave-types.ts` and `waves/act-*.ts` already use — the list is the half
 * that grows, and it is the half nobody reads top to bottom.
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
  lure: {
    what: "A slick or a bulb, full size and in its real colour — and only the navigator can see that it is neither. A shot that lands on it is the mistake and costs the hull. Left alone it goes on its own, two rows short of the ship.",
    reach: "spawn",
    waveNames: true,
  },
  throb: {
    what: "Swells and shrinks on the beat, and carries no colour either. Only a shot on the beat it is open lands at all.",
    reach: "spawn",
    waveNames: true,
  },
  shell: {
    what: "Plating a size too big for the slick or the bulb inside it, split down the middle: one piece in front of each of its two columns, and the body's own colour shining out through the cracks the whole way down. Any colour chips a piece off. A shot up a column already bared does nothing — and only once both pieces are gone does that colour finish it.",
    reach: "spawn",
    waveNames: true,
  },
  dart: {
    what: "It never falls straight. Every other beat it takes a diagonal two rows down and two columns to one side, and in between it hangs for one beat. Where it is going, and where it goes after that, is on one of your screens and not the other: an arrow, a dotted path and a hole on the tile it is about to stand in.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // clasp: the silhouette is the dart's and the colour is which cannon
    // answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  veil: {
    what: "A thundercloud with a slick or a bulb inside it. Only the pilot can see which, and it turns over from one to the other every few beats — so what has to be said out loud is a colour and how long it is good for. A shot in the wrong one shuts the cloud for two seconds.",
    reach: "spawn",
    // A wave names this kind and never its colour: what is inside a veil is
    // rolled at the moment it enters the field, which is the one thing about
    // this creature nobody may compose against (`veilOnSpawn`).
    waveNames: true,
  },
  wisp: {
    what: "Only one of you can see it, and it is never in the same tile twice: every two beats it stands somewhere else on the field. It does not fall and it does not leave — the wave stays open until it is shot, and either colour will do it. While one is out, both screens carry the lettered grid.",
    reach: "spawn",
    // A wave names this kind and never a colour: a wisp carries none at all,
    // the way a throb does, so there is nothing on the arrival to author.
    waveNames: true,
  },
  ghost: {
    what: "A body one of you cannot see at all. The pilot gets a band across the row it is standing in — how long there is, and nothing about which column — and the pilot is the one holding the cannon, so the column has to be said out loud as a number. Shot, it lets go and climbs out of the top of the field, and both of you watch it go.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // dart: the silhouette is the ghost's and the colour is which trigger
    // answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  echo: {
    what: "A small slick or bulb that comes down half as fast as anything else, and divides while it falls: three beats, then six, then nine. Every division turns a corner — sideways, then up and down, then both at once — and the seam across it says which way and how soon. The matching cannon kills any of them, and a shot that catches one early is paid for every body it would have become.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for a
    // dart: the silhouette is a slick's or a bulb's and the colour is which
    // trigger answers it, so neither can be worked out from the other.
    waveNames: true,
  },
  rind: {
    what: "A slick or a bulb three times the size of one. The matching colour takes a layer off rather than killing it, twice — the body is a size smaller each time — and only the third shot finishes it. Its size is how much is left.",
    reach: "spawn",
    // A wave names this kind and gives it a colour, the way it does for an
    // echo: the silhouette is a slick's or a bulb's and the colour is which
    // trigger answers it, so neither can be worked out from the other.
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
  meteor: {
    what: "Dead rock. It cannot be shot, and it stops a shot of yours going up its column.",
    reach: "spawn",
    waveNames: true,
  },
  meteorMedium: {
    what: "The same rock, falling two rows a beat instead of one.",
    reach: "spawn",
    waveNames: true,
  },
  meteorFast: { what: "The same rock again, three rows a beat.", reach: "spawn", waveNames: true },
  meteorFaster: {
    what: "Four rows a beat. It crosses the field in the time a bulb takes to fall a quarter of it.",
    reach: "spawn",
    waveNames: true,
  },
  meteorFastest: {
    what: "Five rows a beat, and nothing in the field is quicker except a torch.",
    reach: "spawn",
    waveNames: true,
  },
  torch: {
    what: "Rock again, twice as wide, and the fastest thing in the field. It cannot be shot either.",
    reach: "spawn",
    carriedBy: "queen",
    waveNames: true,
  },
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
  mirror: {
    what: "The boss is your own ship. It performs a sequence of your own moves, then asks for the whole of it back.",
    reach: "spawn",
  },
  maze: {
    what: "A wheel of rings turns above the ship. Ways in are cut round its rim and only one of them reaches the middle — neither of you is told which.",
    reach: "spawn",
  },
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
  clasp: {
    what: "Shots bounce off it. The shield in its column, triggered, takes the shield off — and what is left is an ordinary slick or bulb that still has to be shot.",
    reach: "spawn",
    // A wave names this kind explicitly and gives it a colour, the way it
    // does for a lure: the colour is the body *inside*, and it decides what
    // the clasp becomes (`livingKindForColor`), so an entry without one would
    // be authoring a body with no answer.
    waveNames: true,
  },
  gauge: {
    what: "One needle and two marks, and the field does not come back until the needle has been held between them five times.",
    reach: "spawn",
  },
  fleet: {
    what: "A chart of squares with ships hidden in it. Only one of you is shown where they are, and only the other one can move the sights.",
    reach: "spawn",
  },
  snake: {
    what: "The ship shrinks into a snake that never stops. One of you turns it a quarter turn at a time and is shown only the body and the meteors; the other has a shot and a mouth and is shown everything else.",
    reach: "spawn",
  },
  pinball: {
    what: "The ship folds into a bucket that is both the gun and the glove. One of you slides it and stops the aiming needle, the other opens the sweep and picks the strength — and then the same bucket has to be under the ball when it comes back down.",
    reach: "spawn",
  },
  briefing: {
    what: "A wave opens on its number, its name and its sentence, then on a split guide if it carries one — and that guide ends on two circles the pair hold until both say READY.",
    reach: "run",
    switch: { field: "briefings", off: false },
  },
  windup: {
    what: "A press does not fire; the shot leaves on the next point of a grid measured in beats, where player 1 can watch it happen.",
    reach: "run",
    switch: { field: "shotChargeBeats", off: 0 },
  },
  lance: {
    what: "Player 1 holds the cannon still until the lobe fills, and player 2's next shot leaves slower and passes through bodies of its own colour.",
    reach: "run",
  },
  grip: {
    what: "A finger held on something falling drags at it, and it falls slower for as long as the finger stays.",
    reach: "run",
  },
} as const satisfies Record<MechanicId, Mechanic>;
