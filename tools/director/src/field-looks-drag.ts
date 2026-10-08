import type { UseLook } from "./field-looks.js";

/**
 * FIND IT and WHILE YOU MOVE for every GRAB AND DRAG card, keyed by one row
 * of the card. Read off each row's own WHERE, SEAT and DOES
 * (`field-controls-*.ts`); split from `field-looks.ts` for length.
 */
export const DRAG_LOOKS: Readonly<Record<string, UseLook>> = {
  // PULL PAST A DISTANCE
  "THE GUM": {
    find: "The drop itself, falling down its lane on both screens. No ring: the body is the handle.",
    move: "A thumb that only rests does nothing. Past the distance the drop flies out level along its row and is gone at the wall.",
  },
  "THE WARDEN'S TETHER": {
    find: "A rope hanging from the rim with a resting circle at its end, on the pilot's screen.",
    move: "The line stretches taut after the thumb; held taut long enough, a hatch opens on the eye. Four looks of the rope are on its row.",
  },
  "THE ANTIPHON'S RAIL": {
    find: "A ring on each candidate on the rail a third of the way down, on the chooser's screen, haloed once the organ stands.",
    move: "The candidate follows the thumb down its vein towards the organ; let go short and it springs back to the rail. The verdict is drawn round the organ on both screens.",
  },
  "THE GAUGE'S TOOTH": {
    find: "A ring on every tooth in the rim, on the navigator's screen; which one is loose wobbles on the pilot's screen alone.",
    move: "The tooth comes out of the rim with the thumb. The tongue's two rings, one per seat, twist their halves opposite ways until it is wrung.",
  },
  "THE CURTAIN'S HEM": {
    find: "A ring on the bottom edge of the sheet while a hit has jammed the rail, under a bar that runs down with the jam. Haloed on the pilot's screen.",
    move: "The hem lifts with the thumb and the core is bare under it for as long as the thumb stays at the top. A lift to the top washes it green.",
  },
  "THE LAMPREY'S HEAD": {
    find: "The knob on the bitten tile, for the seat not holding the tail.",
    move: "Dragged up, the mouth comes off the tile — only while the tail is held, or it slips.",
  },
  "THE HIVE'S HAUL": {
    find: "A wide ring in the middle of the clenched underside, on the pilot's screen, with the halo under it.",
    move: "The heavy mass comes down after the deepest point the thumb has reached, not where it rests. A haul home washes the mass green.",
  },
  "THE VANE'S HOUSING": {
    find: "A ring hanging just under the bearing's hub under SEIZE, haloed on the navigator's screen.",
    move: "Pulled down far enough, the housing comes off the bearing and the split the pilot chose opens. A tap does nothing; the haul washes it green.",
  },
  "SNAKE'S JAWS": {
    find: "A ring on the neck one tile behind the head, sliding with the body, haloed on the pilot's screen.",
    move: "The ring rides the snake as it moves; a long enough pull prises the jaws open and washes it green.",
  },
  "THE SCOUT'S PRIME": {
    find: "A ring off the little ship's stern, behind the amber beads, haloed on the pilot's screen while no window runs.",
    move: "A carry up or down primes the thruster; the ring's dial is the window, draining as the burn runs.",
  },
  "PINBALL'S PLUNGER": {
    find: "A ring at the right end of the strength bar's band, only when the spring is slack after a hard launch.",
    move: "No dial: the answer is the strength bar starting to run again after the wind. Plunger green; the table's shove green, its tilt red.",
  },
  "THE TASTER'S WIPE": {
    find: "One ring in the air above each notch a blade was struck off, while the fan hurries. Haloed on the navigator's screen.",
    move: "A carry across the notch cuts the soft column; the ring's dial fills when this grab has spent its cut. The pry is a ring on the middle of the crest, pulled down.",
  },
  "THE LEDGER'S PULL": {
    find: "A ring riding the soonest bead down the cord, on the pilot's screen only, with a breathing halo under it.",
    move: "The bead jumps a beat down the cord, its count drops and it washes green. The haul's ring, lower on the taut cord, fills a dial that will not fill over a covered socket.",
  },
  "THE STARE'S LASHES": {
    find: "The fan of lashes over the eye at the top of the field, with PULL beside it, while the eye charges — on both screens.",
    move: "Each rise of the thumb pulls one lash up; down and up again pulls the next. All up and the charge vents out to the sides.",
  },
  "THE FLEET'S WRECK": {
    find: "The raked hull's wound on the navigator's screen, haloed for the beats it floats.",
    move: "Pulled down while the pilot's thumb is still on the hull, the wreck sinks and the wound goes green.",
  },
  "THE TRAPEZE'S LEFT ZONE": {
    find: "The left half of the field under the swing, badged P1 or P2, lit with chevrons while the swing comes back over it.",
    move: "A swipe toward the middle pushes the swing higher, green; too early brakes it, and a wrong seat or way says why, red.",
  },
  // LEVER — CARRY TO A DEPTH AND HOLD
  "THE LID'S CORD": {
    find: "A resting circle on a cord under every armoured eye on the field.",
    move: "The plates over the lens part as far as the cord is pulled, and shut the moment the thumb lets go.",
  },
  "THE BALLOON'S LEFT HANDLE": {
    find: "A handle hanging off each side of every balloon, on both screens — left the pilot's, right the navigator's.",
    move: "Pulled outward the skin goes taut and visibly gives. Both taut together and the body sits at full stretch with its glow coming up, then splits.",
  },
  "THE SINEW'S LEFT HANDLE": {
    find: "A handle off each side of the mass at the end of the tendon — left the pilot's, right the navigator's. Halo on your own, ring and clock on your partner's.",
    move: "The cord under each hand stretches to the pull; the strain band at the collar shows the sum and the pips round it fill while it stays in the zone.",
  },
  "THE SPOOL'S BRAKE": {
    find: "A knob on a rail down the near side of the spool, on the pilot's screen only, with a halo while the line runs and nobody holds it.",
    move: "The knob slides down its rail and the line pays out slower the deeper it sits. Letting go runs the line out fastest.",
  },
  "THE HASP'S LATCH": {
    find: "The bar of the latch off the door of clasps, on the pilot's screen only, haloed while a clasp asks.",
    move: "The latch stands at the depth the thumb has it and washes green on the grip; after its count it burns red and drops off the bar.",
  },
  "THE RATCHET'S CATCH": {
    find: "A bar on a rail beside the rack, on the navigator's screen only, haloed while not set.",
    move: "The bar stands at the depth the thumb has it; SET washes it green, a burnt tooth red.",
  },
  "THE MANTLE'S LEFT KNOB": {
    find: "A knob hung off each valve of the shell — left the pilot's, right the navigator's. Halo on your own, ring and clock on your partner's.",
    move: "Each knob slides down its groove after the thumb; both deep enough together and the pair shears, green. Letting go loses the whole pull.",
  },
  "THE PLUMB'S LEFT STONE": {
    find: "A stone under each end of the beam — left the pilot's, right the navigator's — haloed while a level is lit.",
    move: "A pull shrinks one stone and grows the other, and the bob tips the way the thumb goes; true and held, the lit weight settles green.",
  },
  "THE CAPSTAN'S PULL": {
    find: "The drum's middle or its cradle, haloed on the screen of the seat that steers this step.",
    move: "Carried sideways, the cradle rocks and bares that side's face; on a lift it drifts back level.",
  },
  "THE LATCH'S LEFT GRIP": {
    find: "A knob a column either side of the tendril — left the pilot's, right the navigator's, swapped in a cross. The one to pull wears the arrow down.",
    move: "The press holds the rope; the puller's knob carries it down after the thumb and a knot comes in past the grips. Both off at once and it slips back to the last knot.",
  },
  // CARRY TO A PLACE
  "THE SCUTTLE'S PART": {
    find: "A ring on every loose part hanging on its thread, on the pilot's screen only, sliding down the thread with the part.",
    move: "The part moves one column along the frame with the thumb and washes green in the column it went to.",
  },
  "THE LEDGER'S FOOT": {
    find: "A ring on the root of the cord above the plating, on the navigator's screen only, for the first two beats of the fight.",
    move: "The foot walks column by column under the thumb; its dial drains the time left to choose, and each column taken washes green.",
  },
  "THE MAZE'S STRING": {
    find: "The drum's resting circle while the wheel is being read, on the pilot's screen.",
    move: "The wheel turns by how far the hand has come from where it grabbed.",
  },
  "THE WELL'S WIND": {
    find: "The empty sector of the clock face where the two walls meet, once the slip has stopped at the far end.",
    move: "The face turns home, one tile of thumb for one sector of face. Nothing marks home but the picture.",
  },
  "THE THROAT'S MOUTH": {
    find: "The lip of the gullet, haloed on the navigator's screen until a thumb is on it.",
    move: "The mouth goes wherever the thumb takes it, inside its box, and the gullet bends to follow from its root on the hull.",
  },
  // RUB
  "THE CAPSTAN'S RUB": {
    find: "Either end of the drum where the cradle has rocked it, haloed on the screen of the seat that is not steering.",
    move: "Every turn back wears the bared face; a band worn to its mark cracks bright.",
  },
  "THE RIME'S LEFT HALF": {
    find: "Each half of the lens — left the pilot's, right the navigator's — haloed while a wipe is lit on it.",
    move: "Every turn back shaves frost off the half; rubbed clear it washes green, frosting back red.",
  },
  "THE GRINDSTONE'S LEFT FLAT": {
    find: "Each cut face of the wheel — left the pilot's, right the navigator's — haloed while its pass is lit.",
    move: "Every turn back shaves grit off the flat; ground clean it washes green.",
  },
  "THE MAZE'S HEART": {
    find: "A ring on the heart in the middle of the drum, with SHAKE and eight arrows until a thumb lands — on both screens.",
    move: "The heart moves with the thumb inside its room, and the ring fills green with the distance shaken.",
  },
  "THE THROAT'S PUMP": {
    find: "A ring on the hull two columns beside the gullet's root, haloed on the pilot's screen while the circle is small. It never moves.",
    move: "Strokes up and down widen the circle round the mouth that draws bodies in; it shrinks again when the strokes stop.",
  },
  // DRAW, THEN SWIPE
  "THE SLING'S LEFT CORD": {
    find: "Anywhere on the field; a ghost hand stands on the lit tine's handle. Left cord the pilot's, right the navigator's.",
    move: "The cord is drawn while the finger stays down; the lift's swipe towards the lit side looses it, green — too soon or the wrong way springs it slack, red.",
  },
  // TURN A WHEEL
  "THE GIMBAL'S OUTER RING": {
    find: "THE MAZE's knob on a lever bolted to each ring, in a channel round the rim, with PULL under it and a halo while no hand is on it.",
    move: "The ring follows the thumb round, and the channel fills green from where the knob rests. Both rings true and both rims glow.",
  },
  "THE HASP'S WHEEL": {
    find: "THE MAZE's knob on the wheel across the door, with a two-headed arrow and PULL, on the navigator's screen; the rim haloed while her hand is off.",
    move: "The channel fills green by the share of the wind turned. Turned while the latch is up, the rim seizes red.",
  },
  "THE VALVE'S WHEEL": {
    find: "The wheel in the drum's face over the middle column, haloed on the pilot's screen while a mark is lit.",
    move: "The wheel turns by how far round the thumb has gone; onto its mark it washes green, slipped off red.",
  },
  // TRACE ALONG A LINE
  "THE FILAMENT'S LINE": {
    find: "A ring on the armed filament with its word beside it — green when the move is open, red with WAIT when not; arrows march up the path.",
    move: "Each tile the thumb carries along lights; the partner's ring follows dim on the other screen.",
  },
  "THE FLEET'S RAKE": {
    find: "Anywhere along the holed hull, on the pilot's screen; his ring is haloed until his thumb is down.",
    move: "Every square the thumb rests on long enough is marked; a hull raked end to end goes to wreck.",
  },
  // PULL IN ANY DIRECTION WITH A ROPE
  "THE WARDEN'S THUMB": {
    find: "A ring on the shut eye where the pupil stands, haloed on the navigator's screen, while the pilot hauls the rope.",
    move: "The lids part behind the hatch and the pupil stops walking for as long as the thumb stays; green when it lands.",
  },
};
