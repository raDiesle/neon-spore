import type { UseLook } from "./field-looks.js";

/**
 * FIND IT and WHILE YOU MOVE for every card but GRAB AND DRAG's
 * (`field-looks-drag.ts`), keyed by one row of the card and read off its
 * own WHERE, SEAT and DOES. Split from `field-looks.ts` for length.
 */
export const OTHER_LOOKS: Readonly<Record<string, UseLook>> = {
  // HOLD
  "THE SURGE'S BULB": {
    find: "The ribbed bulb over the middle of the field, on both screens; each seat's grip mark on its flank is haloed while that seat is asked.",
    move: "The grip mark fills while the thumb is down and the pressure climbs; letting go together in the band opens a notch, green — apart, short or over, red.",
  },
  "THE ANTIPHON'S ORGAN": {
    find: "The organ under the rail on the explainer's screen; its grip mark is haloed while no thumb rests on it.",
    move: "The organ turns slowly in place while the thumb stays and stops the moment it lifts.",
  },
  "THE GAUGE'S BAND": {
    find: "A ring in the middle of the band at the rim, on the navigator's screen only, while it is wound tight; haloed until her thumb is down.",
    move: "Green as the thumb lands; the band opens to its full width and stops walking while she holds.",
  },
  "THE LEAD'S STALK": {
    find: "A ring on the organ at the stalk's tip, over the body's column on the navigator's screen, through the still.",
    move: "Green as the thumb lands; a dial runs down the time before the stalk tears out of her hand.",
  },
  "THE WELL'S SEAM": {
    find: "The empty sector of the clock face where the two walls meet — the brightest line on the picture — on the pilot's screen while the face slips.",
    move: "The face stops slipping under the thumb and the hours stay on their columns while he holds.",
  },
  "THE VANE'S ARM": {
    find: "A ring on the tip of the sweeping arm, travelling with it, haloed on the pilot's screen from VEER on.",
    move: "The arm stops in its column under the thumb and the housing splits over that column; green as it lands, torn free after its count.",
  },
  "THE LEDGER'S PLUG": {
    find: "A ring above the grommet once the cord is in, on the navigator's screen, with a breathing halo until her thumb is in.",
    move: "The plug goes in green; the ring's dial drains the fight's ration of plugging while the thumb stays.",
  },
  "THE FLEET'S PLUME": {
    find: "A ring on the holed square on the navigator's screen while the water stands out of the hole; haloed until her thumb is down.",
    move: "Green as it lands; the hole stays open while she holds and closes the moment she lets go.",
  },
  "THE LAMPREY'S TAIL": {
    find: "The knob at the tip of the tail, laid away from the tile the eel leaps to next, while a bite is on.",
    move: "The tail is held while the thumb is down; in an apart it is pulled along the body away from the head.",
  },
  "THE BATON'S DRAW": {
    find: "A ring on each of the two resting beads, one per screen, each haloed until that seat's thumb is down. Nothing says whether the other is down.",
    move: "A dial runs the window out; with both thumbs down the two beads draw together into one, green.",
  },
  "THE PULSE'S ARREST": {
    find: "The same box on the meter, gone red. One thumb on it and the word under the bar reads BOTH; two and it reads HELD.",
    move: "The partner's end is ringed with a clock until the second thumb lands; then both ends wash green and the meter climbs a beat at a time.",
  },
  "THE OCULUS'S LEFT LEAF": {
    find: "Each half of the lens — left the pilot's, right the navigator's — haloed while a pair is lit and that thumb is not down.",
    move: "With both halves held the lit pair slides shut across the face; a lift slips it, red.",
  },
  "THE HIVE'S WRING": {
    find: "A ring on each swelling lobe, on the navigator's screen only; every swelling lobe but the one under her thumb wears the halo.",
    move: "The lobe is held while the thumb stays and opens colourless; a lobe wrung washes green.",
  },
  // PRESS — TAP ON THE MARK, IN TIME
  "THE VALVE'S PIN": {
    find: "The socket beside the wheel, and the long lit pin under the drum while the wheel is frozen; haloed on the screen it asks.",
    move: "Each step answered washes it green, each window run out red.",
  },
  "THE CYST'S LEFT FREEZE MARK": {
    find: "A mark standing off each flank of the sac, haloed on the screen of the seat that taps it.",
    move: "A tap in time stills the shuddering flank, green; a flank left shuddering, red.",
  },
  "THE GOVERNOR'S NEEDLE": {
    find: "Anywhere on the dial's face, while a mark of this seat's is lit; each seat has its own, numbered when there is an order.",
    move: "A tap with the needle on the seat's open mark lands; anywhere else, or out of turn, it skids and the needle goes round again.",
  },
  "THE TASTER'S PIN": {
    find: "A ring on the root of a growing blade, leaving its lit edge bare, haloed on the pilot's screen while the fan is fanning.",
    move: "The blade is pinned on the press; its dial fills towards the beat it decides anyway.",
  },
  "THE LAMPREY'S TEETH": {
    find: "The one lit tooth of the ring.",
    move: "A tap with the tail held cracks it and the light jumps two teeth round; a wrong tap snaps the last cracked tooth back.",
  },
  "THE UNDERTOW'S TAP": {
    find: "A tall lobe itself, on both screens — the one lobe taller than the rest.",
    move: "The lobe shrinks back to standing on the tap.",
  },
  // PRESS
  "THE PULSE'S BRACE": {
    find: "A dashed box round the meter across the top of both screens, once it drops low; each seat's end of the bar haloed on its own screen.",
    move: "The end nearest the seat lights and washes green when its thumb lands.",
  },
  "THE MANTLE'S CORE": {
    find: "A ring round the bared core once the shell has split; the half that beats says whose tap is next.",
    move: "Every tap from the right seat dims the core a step and greens the ring; the last puts it out.",
  },
  "THE KEEL'S JOINT": {
    find: "A white ring round the lit segment of the spine along the top of the field, haloed on its seat's screen.",
    move: "A tap locks the segment with a white seam and the arch tautens, green; a window run out is red.",
  },
  "THE RATCHET'S PAWL": {
    find: "A pad at the pawl's pivot beside the rack, on the pilot's screen only, haloed while a tooth waits.",
    move: "Each press spends a tooth: clean and the rack climbs, green; not held and it burns, red.",
  },
  "THE BATON'S STRIP": {
    find: "A ring on the swelling socket, on the screen of the seat locked out this beat — the one whose panel is grey.",
    move: "Each press strips the shell, a dial runs the window out, and a clean strip washes it green.",
  },
  "THE GORGE'S TAP": {
    find: "A ring on the bottom bubble of a ring level, on the pilot's screen only, haloed while that bubble is due.",
    move: "A dial round the ring counts the taps down until the bubble opens.",
  },
  "THE LIGHT": {
    find: "Anywhere on the black field while THE DARK is down.",
    move: "The square under the finger lights, and every square a drag crosses; the bodies there show again for a while.",
  },
  "THE TRAPEZE'S ALIEN": {
    find: "The alien on the swing, wherever it swings, haloed on the pilot's screen in the lock level.",
    move: "A tap draws a red sight round it and locks the cannon on it, green; the navigator's next shot hits it from the side.",
  },
  // CHORD
  "THE TRIVET'S FRONT FOOT": {
    find: "Each seat's half of the stand down to under its feet — front the pilot's, rear the navigator's. The lit sockets say how many fingers.",
    move: "Each finger lands as a pad; held together through the count, the foot plants green. A pad lifting slips the chord.",
  },
  "THE HALTER'S LEFT GRIP": {
    find: "Two grips near the ends of the lit segment's seam, haloed on the gripper's screen.",
    move: "Both grips held while the resting seat sends nothing and the segment cracks, green; a stir or a slip, red.",
  },
  "THE GRINDSTONE'S LEFT JAW": {
    find: "Two pads on each jaw of the caliper — left the pilot's, right the navigator's — haloed while a clamp is lit.",
    move: "Both jaws held shut together count the clamp home, green; a pad lifted, red.",
  },
  // PINCH
  "THE VISE'S LEFT LOBE": {
    find: "Each seat's half of the seed-case — left the pilot's, right the navigator's — haloed while a pinch on that lobe is lit.",
    move: "Two fingers closing shut the lobe; held shut through the count a seam cracks, green.",
  },
  "THE GALL'S TAPS AND PULL": {
    find: "The alien on its point of the seam, haloed on the screen of the seat whose half it sits on.",
    move: "Taps wind it up; a pull up toward the top throws it to the other half, green.",
  },
  "THE CYST'S LEFT FLANK": {
    find: "Each seat's half of the sac — left the pilot's, right the navigator's — haloed once the flank is stilled.",
    move: "Held shut through the count the flank cracks, green; a slip or a spring, red.",
  },
  // SHAKE
  "THE CHOIR'S LEFT ARROW": {
    find: "Two big arrows against the walls of the field, each marked SWIPE, on the pilot's screen while a membrane is up.",
    move: "One outward swipe opens a window and the whole screen starts shaking; the second, at the other wall, draws the two voices together.",
  },
  // STEP BY STEP
  "THE INSTAR'S MARKS": {
    find: "A red ring on the part of the body the script wants, with the gesture drawn inside it and its word in a box over it; a second ring closing in is the window.",
    move: "The part moves the way the word says; every mark of the step done together lands it.",
  },
  "THE MIRROR'S LOBES": {
    find: "A ring round each lobe of the mirror's ship this seat answers, haloed when asked.",
    move: "A count runs round both once both thumbs are down; green or red round the lobe a touch was judged on.",
  },
  "THE QUEEN'S MARKS": {
    find: "A faint ring round each of her two marks on the pilot's screen, with a halo; the navigator sees the real one bare.",
    move: "The real mark opens and the other flinches shut; held, a dial counts down how long it stays open.",
  },
};
