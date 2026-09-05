/**
 * Rule 4 of `CLAUDE.md`'s "called, not re-derived": a rule the simulation owns,
 * written out by hand somewhere else, is a second copy that will drift. Each
 * row below is a rule that has already been copied once, and the test fails on
 * the next file that copies it.
 */

export interface Copy {
  /** What to call instead. */
  call: string;
  /** The one file allowed to contain the arithmetic — it is the definition. */
  owner: string;
  /** The shape of the rule written out by hand. */
  pattern: RegExp;
  /** Whether to strip comments and strings before testing. Defaults to true. */
  strip?: boolean;
  /**
   * Other files the pattern is allowed in, because they own a neighbouring
   * rule written out of the same pieces. One entry, today: the pose clock and
   * the contour clock are both spread by `bodyPhase`, and the file that owns
   * the second one cannot be written without naming the first.
   *
   * Never a way to quiet a row. A file here is a file that *defines*
   * something, and the reviewer's question about a new entry is which rule it
   * owns — if the answer is "none", the row is right and the file is wrong.
   */
  also?: string[];
}

/**
 * Each row is a rule the simulation owns. The row exists because someone has
 * already re-derived that rule rather than importing it. Adding a row is how a
 * defect that got through review once is stopped from getting through twice.
 */
export const COPIES: Copy[] = [
  {
    // The mouth's offset was a constant, and `cannon-maw.ts` copied the number
    // under a comment saying it was `drawMuzzle`'s — true when written, false
    // the moment the swallow was reshaped and the offset began easing to zero.
    // Two things draw into this opening now; a wind-up gathering its bolt
    // where the mouth used to be is what a second copy buys.
    //
    // Two spellings, because the offset moved from a module constant onto
    // `MOUTH_LOOK` and either name is a copy worth catching. `MUZZLE_DROP` no
    // longer exists, so nothing can match it by accident — but a file that
    // declares its own and multiplies it out is the same defect under the old
    // name, and dropping the alternative would have narrowed this rule by
    // exactly that case for no gain.
    call: "muzzleCenterY",
    owner: "packages/render/src/muzzle.ts",
    pattern: /(MUZZLE_DROP|MOUTH_LOOK\.drop)\s*\*\s*\(\s*1\s*-\s*intake\s*\)/,
    strip: false,
  },
  {
    // Which panel a wave is played on. The rule is that a wave naming nothing
    // is played on the default set, and it is one `??` — which is exactly the
    // size of thing a second reader writes out again rather than importing.
    // Two copies of it is how a director page and the band come to disagree
    // about which buttons a wave has.
    call: "controlSetForWave",
    owner: "packages/content/src/control-sets.ts",
    pattern: /\bcontrols\s*\?\?/,
    strip: false,
  },
  {
    call: "mapCol",
    owner: "packages/content/src/queue.ts",
    pattern: /\bAUTHORED_COLS\s*-\s*1\b/,
  },
  {
    // Turning a wave's authored `color` back into the kind it spawns is
    // `queueFromWave`'s job, and asking a *wave* what it contains is the
    // question `mechanics.ts` had to answer without becoming a second copy of
    // it. The ternary is the whole of the translation, so it is the shape to
    // watch: written out again, it is a place where a wave and the field it
    // produces can start disagreeing about what is in it.
    call: "queueFromWave",
    owner: "packages/content/src/queue.ts",
    pattern: /\bcolor\s*\?\s*kindForColor\s*\(/,
    strip: false,
  },
  {
    call: "livingKindForColor",
    owner: "packages/sim/src/kinds.ts",
    pattern: /"red"[\s\S]{0,30}"slick"|"slick"[\s\S]{0,30}"red"/,
    strip: false,
  },
  {
    call: "isMeteorKind",
    owner: "packages/sim/src/kinds.ts",
    pattern: /\bkind\s*===\s*"meteor"/,
    strip: false,
  },
  {
    call: "radarOwner",
    owner: "packages/content/src/creatures.ts",
    pattern: /controls\s*\.\s*includes\s*\(\s*"guard"\s*\)\s*\?\s*"p1"\s*:\s*"p2"/,
    strip: false,
  },
  {
    call: "categoryOf",
    owner: "packages/content/src/creatures.ts",
    pattern: /kind\s*===\s*"queen"\s*\?\s*"mixed"/,
    strip: false,
  },
  {
    call: "mirrorListenBeats",
    owner: "packages/sim/src/simon.ts",
    pattern: /MIRROR_LISTEN_PER_STEP\s*\+\s*MIRROR_LISTEN_SLACK/,
    strip: false,
  },
  {
    call: "mirrorHoldsControls",
    owner: "packages/sim/src/mirror.ts",
    pattern: /phase\s*===\s*"lead"\s*\|\|[\s\S]{0,20}phase\s*===\s*"show"/,
    strip: false,
  },
  {
    call: "occupiesCol",
    owner: "packages/sim/src/span.ts",
    pattern: /c\s*\.\s*col\s*===\s*col\b/,
    strip: false,
  },
  {
    // The disguise, and the one rule in this table whose second copy is not a
    // drift but a *tell*. A lure is a full-size slick or bulb in every pixel
    // player 1 owns; every appearance derived from a kind — contour,
    // own-motion, the bulb's interior — has to be derived from `wornKind`
    // instead. One site left asking `c.kind` and player 1 can pick the lure
    // out before it goes, which is the whole wave.
    call: "wornKind",
    owner: "packages/sim/src/creature-rules.ts",
    pattern: /kind\s*===\s*"lure"\s*\?/,
    strip: false,
  },
  {
    // The pairing of a kind to its body, which moved out of `silhouettes.ts`
    // when it stopped being a ternary and became a row per kind — one table
    // carrying the contour *and* the own-motion, so the two can no longer
    // answer about different creatures.
    //
    // The pattern names both shapes on purpose. The first two branches are the
    // re-derivation this row has always forbidden — the bulb-or-slick ternary,
    // which now belongs nowhere at all, `living-look.ts` included. The third is
    // what the table itself reads like, so the owner keeps containing its own
    // pattern and this row cannot rot into a guard that matches nothing.
    call: "livingSilhouette",
    owner: "packages/content/src/living-look.ts",
    pattern: /\?\s*BULB\s*:\s*SLICK|\?\s*SLICK\s*:\s*BULB|bulb:\s*\{\s*shape:\s*BULB/,
    strip: false,
  },
  {
    // The sway's own frequencies. They read as odd numbers because they are
    // the seconds-era 1.9 and 1.35 divided by 1.6: the pose clock moved off
    // `performance.now()` and onto `world.beat`, so that two phones stop
    // drawing the same creature at different points in its cycle.
    call: "livingMotion",
    owner: "packages/content/src/motions.ts",
    pattern: /\bt\s*\*\s*1\.1875\b|\bt\s*\*\s*0\.84375\b/,
    strip: false,
  },
  {
    // Where a body sits in the cycle is `poseClock(id, beat)`, and the reason
    // it is a rule rather than two lines at the draw site is that it used to
    // be two lines at the draw site: `(id % 7) * 0.9`, seven phases on an
    // eleven-column field. A second copy is how one screen's wave ends up in
    // step while the other's is not.
    call: "poseClock",
    owner: "packages/content/src/own-motion.ts",
    pattern: /\bbodyPhase\s*\([^)]*\)\s*\*/,
    strip: false,
    also: ["packages/render/src/creature-place.ts"],
  },
  {
    // The contour clock, which is `poseClock`'s twin and was three copies of
    // itself when this row was written: `time + bodyPhase(id) * 5.4` stood in
    // `creatures.ts` and in `shell-draw.ts`, and was about to stand in
    // `dart-path.ts` — where the outline of the tile a dart is about to land
    // in has to wobble at exactly the moment the body does, or the body
    // visibly does not fit the hole drawn for it.
    //
    // The pattern is the *call*, not the arithmetic, which is what the row
    // above could not be: a hand-rolled clock evades `bodyPhase(...) *` by
    // putting the spread in a local first, and that is exactly how two of the
    // three copies were written.
    call: "contourClock",
    owner: "packages/render/src/creature-place.ts",
    pattern: /\bbodyPhase\s*\(/,
    strip: false,
    also: ["packages/content/src/own-motion.ts"],
  },
  {
    call: "touchDown",
    owner: "packages/render/src/touch.ts",
    pattern: /cannonStrip\s*\.\s*height\s*\*\s*0\.75/,
    strip: false,
  },
  {
    call: "gripsCreature",
    owner: "packages/sim/src/grip.ts",
    pattern: /world\s*\.\s*gripP[12]\s*===/,
    strip: false,
  },
  {
    // The torch was the only two-wide kind when this row was written, so the
    // pattern was the whole ternary. THE CAROM is the second and the owner now
    // reads `kind === "torch" || kind === "carom" ? 2 : 1`, so the middle is
    // left open: what is being watched for is a *kind tested against a width*
    // written out anywhere but here, and either spelling of it is the same
    // defect — a hit test that knows how wide a torch is and not how wide a
    // carom is.
    call: "colSpan",
    owner: "packages/sim/src/span.ts",
    pattern: /kind\s*===\s*"torch"[^;]*\?\s*2\s*:\s*1/,
    strip: false,
  },
  {
    // How wide a body actually is. `colSpan` answers for a *kind*, and since a
    // rock's width became an authored number (`RockSize`) that is no longer
    // the same question — a hit test, a shield match or a hull impact written
    // against the kind lets a two-wide meteor's second column go unanswered
    // while every type check passes. `spanOf` is the one fallback.
    call: "spanOf",
    owner: "packages/sim/src/span.ts",
    pattern: /\.span\s*\?\?\s*colSpan\s*\(/,
    strip: false,
  },
  {
    call: "isGrippable",
    owner: "packages/sim/src/kinds.ts",
    pattern: /kind\s*===\s*"queen"\s*\|\|[\s\S]{0,30}"warden"/,
    strip: false,
  },
  {
    // Which piece of THE SHELL a shot in a column meets. It is one
    // subtraction, which is exactly the size of thing a second reader writes
    // out again — and the second reader here is render/, drawing the gap where
    // a piece used to be. A shot that breaks piece 0 and a picture that opens
    // the contour at piece 1 is a creature the pair cannot talk about at all.
    call: "shellPieceAt",
    owner: "packages/sim/src/shell.ts",
    pattern: /\bcol\s*-\s*c\s*\.\s*col\b/,
    strip: false,
  },
  {
    // Whether the core is exposed. The rule is that *every* piece has to be
    // gone, and a hand-written `shell === 0` beside a mask that grew a third
    // bit is how "one piece off is enough" arrives without anyone deciding it.
    call: "shellIsBare",
    owner: "packages/sim/src/shell.ts",
    pattern: /\bshell\s*===\s*0\b/,
    strip: false,
  },
  {
    // Where a way into THE MAZE's wheel stands, across the field. Both screens
    // draw the lit mouth and the simulation decides which column the shot goes
    // up, so a second copy of this is a picture lighting a column the shot does
    // not take — and neither picture would show it, which is exactly the class
    // of defect this table exists for. It replaced `mazeWayOut` and
    // `mazeMouthCol` when the lattice became a wheel; both are gone.
    call: "mazeEntranceX",
    owner: "packages/sim/src/maze.ts",
    pattern: /mazeRadiusMilli\s*\(\s*cfg\s*\)\s*\*\s*mazeSinMilli/,
    strip: false,
  },
  {
    // How wide the wheel stands. It is derived from the width of the field, so
    // a hand-written copy would be right on an eleven-column field and quietly
    // wrong on any other — including the seven the waves are authored against.
    call: "mazeRadiusMilli",
    owner: "packages/sim/src/maze.ts",
    pattern: /cfg\s*\.\s*cols\s*\*\s*cfg\s*\.\s*mazeSpanMilli/,
    strip: false,
  },
  {
    // When the body inside a cloud turns over. The rule is one modulo, which
    // is exactly the size of thing a second reader writes out again — and the
    // second reader here is `render/veil-marks.ts`, drawing the ring that
    // counts *down* to the same instant. A ring that emptied on a different
    // beat from the one the body changed on would be a pilot saying "two more"
    // about a body that had already changed, which is the whole creature
    // failing quietly rather than loudly.
    call: "veilMorphs",
    owner: "packages/sim/src/veil.ts",
    pattern: /%\s*[\w.]*\bveilMorphBeats\b/,
  },
  {
    // "An unnamed pod is a mend". `mechanics.ts` carried its own copy, so a
    // changed default would have had the wave guide naming a mechanic the
    // field never produces — and `waves.test.ts` would have gone green about
    // the wrong wave. The director had a third copy for its brushes.
    call: "podKindOf",
    owner: "packages/sim/src/pods.ts",
    pattern: /\?\?\s*"mend"/,
    strip: false,
  },
  {
    // The middle column. It is the cannon's home, the shield's, where THE FLEET
    // breaches the hull, where THE GAUGE, SNAKE and PINBALL cost it, the gyre's
    // rest column and the vane's pivot — nine places, and only two of them had
    // a name. An even `cols` is what the copies are waiting for: some of them
    // would move left and some right, and the pair would be told a column the
    // ship is not in.
    //
    // The pattern names the division and not `cfg.` before it: `keys.ts` was
    // the tenth copy and the row walked straight past it, because the desk rig
    // took its count from `layout().cols` and had no config in reach. A column
    // count halved is the rule whatever the variable is called.
    call: "midCol",
    owner: "packages/sim/src/config-derived.ts",
    pattern: /\bcols\s*\/\s*2\b/i,
  },
  {
    // Milliseconds into ticks, the conversion under every window in the game.
    // This row used to name one spelling of it — `veilArmourMs / 1000` — and
    // the other eight walked past: the guard's window, the maw's, the ready
    // hold, the gyre's suck and the button glow each divided by 1000 in their
    // own file. Which is how a picture comes to stop being angry a few frames
    // before the body stops being armoured.
    //
    // `config-derived.ts` owns the row by naming the spelling it rejects: it
    // divides last, and its comment says why. Matched with comments left in,
    // so that sentence counts — a file that explains this conversion is a file
    // that is about to write it out.
    call: "msToTicks",
    owner: "packages/sim/src/config-derived.ts",
    pattern: /\bms\s*\/\s*1000\s*\)\s*\*\s*[\w.]*tickHz/i,
    strip: false,
  },
  {
    // When THE VEER changes lane. It is a row against a spacing and a count —
    // three lines of arithmetic — and three separate readers want the answer:
    // the step itself, the arrow render draws over the rider, and the crouch
    // it draws on both screens. Exactly the size and shape of rule a second
    // reader writes out again rather than importing, and the cost of the copy
    // is a mark that says "it moves now" on a beat it does not.
    call: "veerRowIsChange",
    owner: "packages/sim/src/veer.ts",
    pattern: /%\s*[\w.]*veerRowsApart/,
  },
  {
    call: "fallTilesPerBeat",
    owner: "packages/sim/src/kinds.ts",
    pattern: /kind\s*===\s*"torch"\s*\)\s*return\s*fallTilesPerBeat\s*\(\s*"meteorFastest"\s*\)/,
    strip: false,
  },
  {
    // The contour itself. `hullRadiusMul` was a byte-identical copy of this for
    // as long as both existed, so the game stroked one and the shape sheet
    // measured the other — every judgement made on the sheet was a judgement
    // about a copy of the thing that ships. They agreed because nobody had
    // edited one yet, which is not a property, it is a coincidence with a
    // clock on it.
    call: "blobRadiusMul",
    owner: "packages/content/src/shapes.ts",
    pattern: /wobble\s*\*\s*0\.6\s*\*\s*Math\s*\.\s*sin/,
    strip: false,
  },
  {
    // Whether the shield answers a rock. The sim decides it in `resolveHull`,
    // and the button glow, the shield's afterglow and the mixer each wrote the
    // window out again — with `<` where the sim has `<=`, and without the ward
    // term. So the glow went dark a tick before the shield stopped turning
    // rocks, and a ward armed the shield in the sim while render drew it cold.
    call: "guardArmed",
    owner: "packages/sim/src/hull-guard.ts",
    pattern: /tick\s*-\s*world\s*\.\s*guardTick/,
    strip: false,
  },
  {
    // The same defect on player 1's other window. `gyre.ts` is allowed it
    // because it owns a neighbouring rule made of the same pieces: the wheel's
    // suck window opens on the very same trigger and closes on its own
    // `gyreSuckMs`, so `gyreSucked` cannot be written without naming the tick
    // the maw opened on.
    call: "mawOpen",
    owner: "packages/sim/src/pods.ts",
    pattern: /tick\s*-\s*world\s*\.\s*intakeTick/,
    strip: false,
    also: ["packages/sim/src/gyre.ts"],
  },
  {
    // What a living body's contour *is*. It was one shape family and one call
    // — `blobPath` with a silhouette's own five numbers — written out at each
    // of the seven places that draw a creature, and the repetition cost
    // nothing while every body was a blob. THE THROB's clubbed rim ended that:
    // seven copies of "a body is a blob" is six small pictures drawing a throb
    // as a plain ball, and those pictures — the control glyph, the dart's
    // preview, a rind shedding, a veil tearing — are exactly where a player
    // checks a body's name.
    //
    // Three files keep the arithmetic, and each is an `also` rather than an
    // exemption: each owns a rule made of the same pieces. `wisp-body.ts`'s
    // bell is a *reshaped* contour — 1.06 wide, 0.76 tall and lifted off its
    // hem — and that proportion is a fact about a body with a hem, which
    // `livingPath` has nowhere to put and must not learn. `strand-bead.ts`
    // squashes the same way about the axis a bead rolls on and draws it at a
    // point on a thread rather than at the origin, which is the same case
    // twice over. And the VERSUS candidate is a *frozen* copy of a shipped
    // look, kept whole on purpose (`docs/versus.md`): a candidate refactored
    // to call the thing it is being judged against is no longer an
    // alternative to it.
    call: "livingPath",
    owner: "packages/content/src/body-path.ts",
    pattern: /shape\.lobes,\s*shape\.depth/,
    strip: true,
    also: [
      "packages/render/src/wisp-body.ts",
      "packages/render/src/strand-bead.ts",
      "tools/versus/candidates/creature-strand/mute/paint.ts",
    ],
  },
  {
    // How far round a Throb has turned — which is the same question as whether
    // a shot lands on it, since the half pointing at the cannon is the half
    // that answers. The swell this replaced had already been copied out of
    // render/ into the shape sheet once. A picture drawing the seam a
    // thousandth ahead of where the rule finds it promises the pair a shot the
    // simulation refuses, and there is no frame in which that reads as
    // anything but a broken trigger.
    call: "throbTurnMilli",
    owner: "packages/sim/src/throb.ts",
    pattern: /%\s*[\w.]*\bthrobSpinBeats\b|\bthrobFaceMilli\b\s*\/\s*2/,
    strip: true,
  },
  {
    // The one repeatable 0..1 in render/. Seven files carried this arithmetic
    // privately, under seven doc comments each re-arguing why it is not `Rng`
    // and not `Math.random`. Two magic numbers written out again is a marking
    // drawing off a different stream from the one beside it, which is the kind
    // of thing nobody sees and nobody can unsee afterwards.
    call: "sinHash",
    owner: "packages/render/src/hash.ts",
    pattern: /12\.9898|43758\.5453/,
    strip: false,
  },
  {
    // The one easing curve. Five copies, three of them trusting the caller to
    // have clamped and two clamping themselves — the difference between them
    // being invisible until a value arrives out of range.
    call: "smoothstep",
    owner: "packages/render/src/ease.ts",
    pattern: /\*\s*\(\s*3\s*-\s*2\s*\*/,
    strip: false,
  },
];
