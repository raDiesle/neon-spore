/**
 * The sounds wired up with nothing to draw, the third page — from THE GAUGE
 * on.
 *
 * Cut off `sound-link-none-b.ts` on 19 September 2026, when THE SCUTTLE's
 * swing would have put that page over its 250-line limit, exactly as that
 * page was cut off the first and along the same seam: the *last* boss on the
 * full page goes across, never the boss being worked on, whose rows stay
 * under the comment that explains them. `sound-link-none.ts` spreads all
 * three into `NO_SUBJECT`, so `test/sound-link.test.ts` reads one table and
 * nothing that asks it knows there are three pages.
 *
 * THE THROAT's seven joined them on 21 September 2026, off the same page by
 * the same rule, when THE HIVE's clench and its wrung lobe filled it. They
 * keep their own answer, which is the tube's: a fixture hanging from the top
 * of the field with nothing of it among the creatures.
 *
 * THE GAUGE's four came over whole. They share one answer with the interlude
 * rows on page one: the subject is a dial and a band on a plate, and the
 * round has thrown the field away altogether — the sheet's cards are
 * silhouettes of bodies on a grid, and there is no grid here to stand on.
 */
export const NO_SUBJECT_C: Record<string, string> = {
  // THE GAUGE's four, the round's first sounds at all. The subject is a dial
  // and a band on a plate, and the round has thrown the field away like the
  // others (`sim/events-gauge.ts`, `docs/spec/interludes.md`).
  "boss.gaugeMark":
    "a call landing between the two marks. The needle's, and the sheet has no card for a dial.",
  "boss.gaugeMiss":
    "a call that missed — free the first time, and the valve sticks beside it. Same argument.",
  "boss.gaugeJam":
    "the miss beside this one sticking the valve: the needle answers his hand until the next call lands. Same argument.",
  "boss.gaugeBind":
    "the mark beside this one winding the band tight: she cannot call while her thumb is not holding it open. Same argument.",
  // THE WELL's four, the projection's first sounds at all. The subject in
  // every one of them is the *grid itself*, rolled into a clock face — which
  // is the one thing the sheet's cards cannot be, being silhouettes of bodies
  // that stand on a grid (`sim/events-well.ts`, `render/well.ts`).
  "boss.wellRoll":
    "the face beginning to slip, hours and all. The subject is the field rolled into a circle, and the sheet draws bodies on a field rather than the field.",
  "boss.wellHeld":
    "a thumb on the seam holding that slip still for a beat. Same argument: what is held is the whole picture, not a body in it.",
  "boss.wellWound":
    "the face stopped three sectors from the top. Same argument, and there is nothing new on the field to draw — only the old one turned.",
  "boss.wellHome": "the seam back at twelve and every hour on its own column again. Same argument.",
  // THE THROAT's two hands on the gullet, and the gullet's own clock beside
  // them. The subject is the tube itself — a fixture hanging from the top of
  // the field with nothing of it among the creatures — so there is no body a
  // sheet could card (`sim/throat.ts`).
  "boss.throatCinch":
    "player 2's thumb landing on a ring the pair has already choked: the gullet stops breathing while she holds it. What it is on is THE THROAT's tube, a fixture that is not a creature and stands on no card.",
  "boss.throatSlip":
    "that hold lost — lifted, or torn out of her thumb when its beats ran out — and the gullet breathing again. Same argument.",
  "boss.throatHaul":
    "player 1 dragging the whole tube a column sideways, which is the only way in this fight to take a body back out of the mouth. Same argument.",
  "boss.throatInhale":
    "the gullet drawing breath — the beat player 2 has been counting down to out loud. It is the tube's own clock and not a thing either thumb did, so it stands on the same fixture and on no card.",
  "boss.throatChoke":
    "a flung gum arriving in the mouth and a ring going slack under it. The gum has a card of its own, but what this sound says happened is the tube's, so it stands with the rest of the fixture.",
  "boss.throatSwallow":
    "the mouth taking what stood in it, and a slack ring drawing tight again. Same argument — the body that was eaten is gone by the time it is heard.",
  "boss.throatEvert":
    "the last ring gone slack and the tube turning through its own mouth. Same argument, and there is no contour for it: the eversion is the fixture unmaking itself.",
  // THE GIMBAL's ten, added here on 22 September 2026 rather than to page one
  // by that page's own rule read forward: pages one and two are both within
  // three lines of the 250-line limit and this one has room, so nothing had
  // to be handed across to take them. The subject in every one is the drum
  // and its two rings — a sealed body hung in a cradle above the field, with
  // nothing of it among the creatures — so there is no card a sheet could
  // draw (`sim/gimbal.ts`, `sim/events-gimbal.ts`).
  "boss.gimbalEnter":
    "the drum dropping into frame between two dark, still rings. It is a fixture hanging above the field, and the sheet's cards are silhouettes of bodies that stand on a grid.",
  "boss.gimbalMarks":
    "each seat's own mark lighting on its own ring. What it is on is the rim of that ring, which is the fixture. Same argument.",
  "boss.gimbalTrue":
    "both rings sitting on their marks at once and the hold beginning. Same argument — and what it marks is an agreement between two bearings, which stands nowhere at all.",
  "boss.gimbalSlip":
    "a ring leaving its mark before the hold was up. Same argument, and this one is an absence.",
  "boss.gimbalShear":
    "a latch-tooth shearing off each ring. The tooth is a notch in the rim rather than a body, so it goes with the fixture it is a notch in.",
  "boss.gimbalLeak":
    "the drum swinging loose in its cradle and a spark starting from the seam. A spark is not a body and the seam is the fixture's.",
  "boss.gimbalSeamOut": "that spark shot out, in either colour. Same argument.",
  "boss.gimbalSeamHit":
    "nobody shot it and it reached the hull. What is hit is the ship, which the hull's own sounds already have; what made it is the seam. Same argument.",
  "boss.gimbalHatch":
    "the last tooth pair gone, both rings spinning free and the drum splitting open. Same argument — the fixture unmaking itself, as THE THROAT's eversion is.",
  "boss.gimbalOut": "the opened hatch hanging and the wave ending. Same argument, and an absence.",
  // THE SPOOL's eleven, on this page because it has room: the subject in
  // every one is a thread-spool slung across the top of the field with its
  // line run down to the hull, which is a fixture and not a body, so there
  // is no card a sheet could draw. The rock is the one exception, and it is
  // excused for the opposite reason: what it throws is an ordinary meteor,
  // whose card the sheet already has (`sim/spool.ts`,
  // `sim/events-spool.ts`).
  "boss.spoolEnter":
    "the spool swinging in across the top of the field, all four ribs whole and the line already taut to the hull. It is a fixture hanging above the field, and the sheet's cards are silhouettes of bodies that stand on a grid.",
  "boss.spoolZone":
    "a movement opening and its zone with it. A zone is a reading one seat is shown rather than a thing on the field. Same argument.",
  "boss.spoolLeg":
    "the target rate rolled again part way through a movement. Same argument, and it is a number rather than anything with a contour.",
  "boss.spoolGrip":
    "the pilot's thumb taking the brake. The brake is part of the fixture and the hand is nobody's contour. Same argument.",
  "boss.spoolLet":
    "that thumb coming off, and the line running at its fastest again. Same argument, and an absence.",
  "boss.spoolSlip":
    "the paid-out line leaving its zone and the movement going back to its head. Same argument, and a refusal: what it undoes is a count.",
  "boss.spoolRock":
    "the slack a slip threw flinging a rock down the pilot's own column. What arrives is an ordinary body with a card of its own; this sound is the fixture throwing it, which has none.",
  "boss.spoolRib":
    "a wooden rib easing open on the casing. A rib is part of the fixture's own outline rather than a body. Same argument.",
  "boss.spoolSlack":
    "the fourth rib open and the tension going out of the casing altogether. Same argument — the fixture unmaking itself, as THE GIMBAL's hatch is.",
  "boss.spoolDrift": "the slack spool drifting free off the top of the field. Same argument.",
  "boss.spoolOut": "the drifted spool gone and the wave ending. Same argument, and an absence.",
  // THE BALLOON's own two, bound since before this page existed —
  // `bind-balloon.ts` reused a sound written for a different creature and the
  // catalogue's `status` had not caught up (`docs/queue.md`, 20 September
  // 2026). Unlike the lure and the veil on page one, THE BALLOON has a shape
  // of its own (`content/src/balloon-shape.ts`); it is only not on the shape
  // sheet's card catalogue yet.
  "creature.colonySpread":
    "THE BALLOON splitting, and topping out into a torch. It has a shape of its own, and the shape sheet has no card for it yet.",
  "impact.overkill":
    "THE BALLOON popping under two shots landed the same beat. Same body, same gap in the sheet.",
  // THE HASP's fourteen. A door of three iron clasps with a wheel across it,
  // hung over the middle of the field: a fixture, THE SPOOL's answer above
  // said about hardware instead of thread. Two of these are the same instant
  // heard from two seats — the burn is his and the seize is hers — and
  // neither is a thing standing anywhere (`sim/events-hasp.ts`).
  "boss.haspEnter":
    "the door swinging into the top of the field. It is a fixture hung over the middle rather than a body among the creatures, and the sheet's cards are bodies on a grid.",
  "boss.haspLit": "a clasp lighting, ready to be worked. A mark on the fixture. Same argument.",
  "boss.haspGrip": "his latch carried past its grip. A hand on a handle, which is no body.",
  "boss.haspLet": "his latch let go, on purpose or by accident. Same argument, and an absence.",
  "boss.haspBurn":
    "his hand burnt off the latch after holding too long. The subject is a hand and a clock only one seat is shown; neither is a contour.",
  "boss.haspCool": "the hand off the bar long enough to take it again. Same argument.",
  "boss.haspSeize":
    "her wheel turned against a latch that is up, and moving nothing. The same instant as the burn from the other seat, and what it marks is turning that did not happen.",
  "boss.haspFree": "the wheel answering her hand again. Same argument, and a mark on the fixture.",
  "boss.haspOpen":
    "a clasp wound off and swinging away. What goes is part of the fixture, like THE GIMBAL's hatch, and there is no card for it.",
  "boss.haspBolt":
    "a bolt working its way loose out of the middle column. A bolt is hardware off the door rather than a body; when it is shot it is heard as a shot.",
  "boss.haspBoltOut": "that bolt shot out, in either colour. Same argument.",
  "boss.haspBoltHit":
    "nobody shot it and it reached the hull. What is hit is the ship, which the hull's own sounds already have; what threw it is the door.",
  "boss.haspClear":
    "the last clasp gone and the door standing open. Same argument, and it is an opening rather than a thing.",
  "boss.haspOut": "the door falling away and the wave ending. Same argument, and an absence.",
  // THE RATCHET's twelve. A rack of seven teeth hung over the middle of the
  // field: a fixture, THE HASP's answer above said about a rack instead of a
  // door, and every sound is a part of it moving or a hand on it
  // (`sim/events-ratchet.ts`).
  "boss.ratchetEnter":
    "the rack swinging into the top of the field. A fixture hung over the middle, and the sheet's cards are bodies on a grid.",
  "boss.ratchetLit": "a pawl lighting, its window open. A mark on the fixture. Same argument.",
  "boss.ratchetSet": "her catch carried past its grip. A hand on a handle, which is no body.",
  "boss.ratchetLet": "her catch let go. Same argument, and an absence.",
  "boss.ratchetClick":
    "a tooth climbing clean under the pawl. What moves is part of the fixture, and there is no card for it.",
  "boss.ratchetBurn":
    "a tooth spent with no catch under it. Same argument, and a loss rather than a thing.",
  "boss.ratchetBolt":
    "a bolt working loose out of the middle column. Hardware off the rack rather than a body; shot, it is heard as a shot.",
  "boss.ratchetBoltOut": "that bolt shot out, in either colour. Same argument.",
  "boss.ratchetBoltHit":
    "nobody shot it and it reached the hull. What is hit is the ship, which the hull's own sounds already have.",
  "boss.ratchetOpen":
    "the fifth clean tooth and the rack standing open. An opening rather than a thing.",
  "boss.ratchetJam":
    "the third tooth burnt and the rack jammed into the hull. The fixture failing, and the hull's own sounds carry the hit.",
  "boss.ratchetOut": "the rack falling away and the wave ending. Same argument, and an absence.",
  // THE TASTER's first beam of two, after its page had filled. The fan is
  // eleven columns of one edge, and the sheet has no card for it
  // (`sound-link-none.ts`, boss.tasterRise).
  "boss.tasterPryFill":
    "a right beam into the pried interlock short of the last, one still owed. The fan's, and a fan of blades is not a card.",
  // THE MANTLE's ten. A hinged carapace shell hung over the middle of the
  // field: a fixture, THE GIMBAL's own answer said about a shell instead of a
  // drum. Only the simulation lane has landed, so nothing about it is drawn
  // yet at all (`sim/events-mantle.ts`).
  "boss.mantleEnter":
    "the shell dropping into frame, closed, both handles dark. It is a fixture hung over the middle rather than a body among the creatures, and the sheet's cards are bodies on a grid.",
  "boss.mantleLight": "the next movement's handles lighting. A mark on the fixture. Same argument.",
  "boss.mantleShear":
    "a plate-pair shearing off each valve. The plate is part of the fixture's own casing rather than a body. Same argument.",
  "boss.mantleSplit":
    "the last pair gone and the shell splitting open. Same argument — the fixture unmaking itself, as THE GIMBAL's hatch is.",
  "boss.mantleLeak":
    "the bared core's spark starting from the open seam. A spark is not a body and the seam is the fixture's.",
  "boss.mantleSparkOut": "that spark shot out, in either colour. Same argument.",
  "boss.mantleSparkHit":
    "nobody shot it and it reached the hull. What is hit is the ship, which the hull's own sounds already have; what made it is the shell.",
  "boss.mantleBeat":
    "an alternating tap landing on the bared core. The core is part of the fixture and a tap is nobody's contour. Same argument.",
  "boss.mantleDark": "the last tap landed and the core going dark. Same argument, and an absence.",
  "boss.mantleOut":
    "the dark hatch falling away and the wave ending. Same argument, and an absence.",
  // THE KEEL's sixteen. A spine arched over the field: a fixture, THE
  // MANTLE's argument, and nothing about it is drawn yet (`sim/events-keel.ts`).
  "boss.keelEnter": "the spine settling over the field. A fixture, not a body on a grid.",
  "boss.keelLight": "a joint lighting. A mark on the fixture. Same argument.",
  "boss.keelLock": "a joint seating. Same argument.",
  "boss.keelMiss": "a joint going dull untapped. Same argument, and an absence.",
  "boss.keelSlip": "a segment working loose again. Same argument.",
  "boss.keelSplit": "the middle of the spine opening. Same argument.",
  "boss.keelSocket": "the open middle flashing a colour. Same argument.",
  "boss.keelShut": "the socket shot in its colour. Same argument.",
  "boss.keelSocketHit": "the socket's lash on the hull, which the hull's own sounds have.",
  "boss.keelDim": "the whole spine going quiet. Same argument, and an absence.",
  "boss.keelRigid": "the spine held stiff. Same argument.",
  "boss.keelThrow": "the tail throwing a rock. A rock is not a creature. Same argument.",
  "boss.keelRockOut": "that rock shot out, in either colour. Same argument.",
  "boss.keelRockHit": "the rock on the hull, which the hull's own sounds have.",
  "boss.keelStraight": "the spine easing flat. Same argument.",
  "boss.keelOut": "the spine gone and the wave ending. Same argument, and an absence.",
  // THE VALVE's thirteen. A drum over the field: a fixture, the same
  // argument, and nothing about it is drawn yet (`sim/events-valve.ts`).
  "boss.valveEnter": "the drum settling over the field. A fixture, not a body on a grid.",
  "boss.valveLight": "a mark lighting on the rim. Same argument.",
  "boss.valveHold": "the wheel seating on its mark. Same argument.",
  "boss.valveSlip": "the wheel turned past its mark. Same argument.",
  "boss.valveLapse": "the wheel kicked off its mark untapped. Same argument.",
  "boss.valveFreeze": "the wheel stopped dead. Same argument.",
  "boss.valveThaw": "the wheel let go with the pin still in. Same argument.",
  "boss.valvePull": "a pin drawn out. Same argument.",
  "boss.valveSpark": "a spark leaking. A spark is not a creature. Same argument.",
  "boss.valveSparkOut": "that spark shot out, in either colour. Same argument.",
  "boss.valveSparkHit": "the spark on the hull, which the hull's own sounds have.",
  "boss.valveOpen": "the drum's face falling open. Same argument.",
  "boss.valveOut": "the drum gone and the wave ending. Same argument, and an absence.",
};
