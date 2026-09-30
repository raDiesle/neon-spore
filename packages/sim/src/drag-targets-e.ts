/**
 * **Every thing on this field a hand may take hold of, the fifth page** — the
 * names from THE TRIVET's feet on.
 *
 * Cut when THE PLUMB's pair would have put `drag-targets-d.ts` over its
 * 250-line limit, exactly as every page before it was cut, and along the same
 * seam: build order, with the *last* boss on the full page handed across
 * whole, so the set being written keeps the comment that explains it and the
 * one being moved keeps its own. THE TRIVET's pads came over with this file;
 * THE PLUMB's levels were written on it, and THE SLING's draws and THE
 * GRINDSTONE's flats and jaws after them, THE CYST's marks and flanks, THE DAVIT's leans and draws, THE HALTER's grips, THE CAPSTAN's steer and rub, THE GALL's pinch, and THE BURGEE's tap and draw. `drag-targets.ts` unions the pages
 * together, so `DragTarget` is one name.
 */
export type DragTargetE =
  | "trivetPadFront"
  | "trivetPadRear"
  | "plumbLevelLeft"
  | "plumbLevelRight"
  | "slingDrawLeft"
  | "slingDrawRight"
  | "grindFlatLeft"
  | "grindFlatRight"
  | "grindJawLeft"
  | "grindJawRight"
  | "cystFreezeLeft"
  | "cystFreezeRight"
  | "cystFlankLeft"
  | "cystFlankRight"
  | "davitSteerLeft"
  | "davitSteerRight"
  | "davitLooseLeft"
  | "davitLooseRight"
  | "halterChordLeft"
  | "halterChordRight"
  | "capstanSteer"
  | "capstanRub"
  | "gallPinch"
  | "burgeeFreeze"
  | "burgeeDraw"
  | "flueTap"
  | "governorChordLeft"
  | "governorChordRight"
  | "governorTap"
  | "gaugeTooth"
  | "gaugeTongue";

/**
 * `trivetPadFront` and `trivetPadRear` are the seventy-ninth and
 * eightieth: the row of sockets on THE TRIVET's front foot under the
 * pilot's thumbs, and on its rear foot under the navigator's.
 *
 * Read as a **level**, `oculusLeafLeft`'s shape, but **one drag a pad**: the
 * `id` names the socket, nought up to `TRIVET_PADS`, because a chord is two or
 * three of them down together and each lifts on its own — `ChordHold`, the
 * first target a seat holds more than one of at once. Geometry says whose is
 * whose, `viseLobeLeft`'s reason: the pilot's is always the front foot and the
 * navigator's the rear, so the wrong seat's message does nothing
 * (`trivet-hand.ts`). `fromMilli` is unused and sent as nought.
 */

/**
 * `plumbLevelLeft` and `plumbLevelRight` are the eighty-first and
 * eighty-second: THE PLUMB's left counterweight under the pilot's phone, and
 * its right under the navigator's.
 *
 * The first targets **no finger touches**. `fromMilli` is the phone's own
 * lean — the `deviceorientation` gamma, thousandths of a degree off level,
 * signed, which is why it rides `fromMilli` and not `id` — and `on` says
 * whether the phone is being read at all: `LevelTilt`, §31's primitive,
 * THE CHOIR's shake carried over from an instant to a held level. A drag is
 * still the right command, because what the simulation wants is a level held
 * over beats with a start and an end, which is what a drag already is.
 * Geometry says whose is whose, `viseLobeLeft`'s reason, and the wrong seat's
 * reading does nothing (`plumb-hand.ts`). `id` is unused.
 */

/**
 * `slingDrawLeft` and `slingDrawRight` are the eighty-third and
 * eighty-fourth: THE SLING's left draw-arm under the pilot's finger, and its
 * right under the navigator's.
 *
 * Read as **one drag a draw**, `DrawRelease`, §32's primitive: `on: true` is
 * the finger down anywhere on the seat's own panel, and the lift carries the
 * way the finger left on `fromMilli` — its sign alone, below nought left and
 * above it right, nought a lift with no swipe — because a draw is decided at
 * its release and the direction is the answer. Geometry says whose is whose,
 * `viseLobeLeft`'s reason, and the wrong seat's hold does nothing
 * (`sling-hand.ts`). `id` is unused.
 */

/**
 * `grindFlatLeft`, `grindFlatRight`, `grindJawLeft` and `grindJawRight` are
 * the eighty-fifth to the eighty-eighth: THE GRINDSTONE's two flats and the
 * two jaws of its caliper, the `…Left` pair under the pilot's thumb and the
 * `…Right` under the navigator's.
 *
 * No new reading. A flat is `rimeHalfLeft`'s: `RubCount`, the drag's `id` the
 * reversals since the thumb went down. A jaw is `trivetPadFront`'s:
 * `ChordHold`, one drag a pad, its `id` naming which of `GRINDSTONE_PADS`.
 * Geometry says whose is whose, and the wrong seat's touch does nothing
 * (`grindstone-hand.ts`).
 */

/**
 * `cystFreezeLeft`, `cystFreezeRight`, `cystFlankLeft` and `cystFlankRight`
 * are the eighty-ninth to the ninety-second: THE CYST's two freeze marks and
 * its two flanks. **Each side's two belong to different seats**: the pilot
 * pinches the left flank and taps the right mark, the navigator the other way
 * round, so the hand that stills a flank is always its pincher's partner.
 *
 * No new reading. A mark is `valvePin`'s tap: `FreezeTap`, an edge, `on`
 * down and up. A flank is `viseLobeLeft`'s: `SqueezeGap`, `fromMilli` the
 * gap between the two touches. The wrong seat's touch does nothing
 * (`cyst-hand.ts`). `id` is unused.
 */

/**
 * `davitSteerLeft`, `davitSteerRight`, `davitLooseLeft` and `davitLooseRight`
 * are the ninety-third to the ninety-sixth: THE DAVIT's two leans and two
 * draws, one of each for each seat — the pilot's are the `Left` pair, the
 * navigator's the `Right`. Which of a seat's two is live is the lit step's.
 *
 * No new reading. A lean is `plumbLevelLeft`'s: `LevelTilt`, `fromMilli` the
 * phone's lean and a lift a phone that stopped reporting. A draw is
 * `slingDrawLeft`'s: `DrawRelease`, `on` the finger down and the lift's
 * `fromMilli` the swipe's sign. The wrong seat's touch does nothing
 * (`davit-hand.ts`). `id` is unused.
 */

/**
 * `halterChordLeft` and `halterChordRight` are the ninety-seventh and
 * ninety-eighth: THE HALTER's two grips, both on each seat's screen, since
 * which seat chords is the lit step's.
 *
 * No new reading: `CHORD`, `trivetPadFront`'s — `on` the thumb down and a
 * lift the thumb up, the two kept as a mask a seat. Either seat's are heard
 * (`halter-hand.ts`). `id` and `fromMilli` are unused.
 */

/**
 * `capstanSteer` and `capstanRub` are the ninety-ninth and hundredth: THE
 * CAPSTAN's cradle and its bands, both heard from either seat, since which
 * seat steers and which rubs is the lit step's.
 *
 * No new reading. `capstanSteer` is a handle's carry — `fromMilli` how far
 * the thumb has come across from where it took the drum, thousandths of a
 * tile, and a lift the thumb up. It was the phone's lean, on the same slot,
 * until 27 September 2026.
 * `capstanRub` is `rimeHalfLeft`'s — `id` the reversals since the thumb went
 * down, a lift the thumb up (`capstan-hand.ts`).
 */

/**
 * `gallPinch` is the hundred-and-first: THE GALL's one pinch, on whichever
 * point of the seam it goes down on, heard from the seat nearer that point.
 *
 * No new reading: `viseLobeLeft`'s `SqueezeGap`, `fromMilli` the gap between
 * the two touches and a lift the gall open again. `id` is the point, nought
 * at the left end, and a pinch counts only on the point the gall is on
 * (`gall-hand.ts`).
 */

/**
 * `burgeeFreeze` and `burgeeDraw` are the hundred-and-second and third: THE
 * BURGEE's two handles, both on both screens and either seat's to press, the
 * lit step saying whose is live.
 *
 * No new reading. `burgeeFreeze` is `valvePin`'s tap, an edge with `on` and
 * nothing on `fromMilli`; `burgeeDraw` is `slingDrawLeft`'s draw, the finger
 * down and the lift carrying the swipe's sign on `fromMilli`
 * (`burgee-hand.ts`).
 */

/**
 * `flueTap` is the hundred-and-fourth: THE FLUE's ember, on both screens and
 * heard only from the seat the lit vent says taps.
 *
 * No new reading. It is `valvePin`'s tap, an edge with `on` and nothing on
 * `fromMilli`, with `id` the column the thumb came down on — `gallPinch`'s
 * way of naming the place — because the ember moves between taps and a tap
 * counts only on the column it sits over (`flue-hand.ts`).
 */

/**
 * `governorChordLeft` and `governorChordRight` are the hundred-and-fifth and
 * sixth: THE GOVERNOR's brake, two pads under the pilot's thumbs and two under
 * the navigator's; `governorTap` is the seventh, the needle, on both screens.
 *
 * No new reading. The chords are `trivetPadFront`'s and `halterChordLeft`'s —
 * one drag a pad, `id` the pad and `on` whether it is down — and the tap is
 * `valvePin`'s edge. What is new is only what the chord is worth: it never
 * decides whether the tap counts, only how fast the needle runs
 * (`governor-hand.ts`, `governor-turn.ts`).
 */

/**
 * `gaugeTooth` is the hundred-and-eighth: THE GAUGE's loose tooth, under the
 * navigator's hand between the first level and the second.
 *
 * No new reading. It is `gorgeLobe`'s carried handle — `id` the tooth, and
 * `fromMilli`/`fromYMilli` how far it has been dragged from where it was
 * grabbed — and a drag past `gaugeToothPullMilli` takes it out
 * (`gauge-tooth.ts`).
 */

/**
 * `gaugeTongue` is the hundred-and-ninth: THE GAUGE's tongue, under both
 * seats' hands between the second level and the third. `fromMilli` is how far
 * that thumb has dragged across, signed; `id` is unused. Two of them wrung
 * opposite ways past `gaugeTongueTwistMilli` twist it (`gauge-tongue.ts`).
 */
