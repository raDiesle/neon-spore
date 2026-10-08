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
 * GRINDSTONE's flats and jaws after them, THE CYST's marks and flanks, THE DAVIT's leans and draws, THE HALTER's grips, THE CAPSTAN's steer and rub, THE GALL's pinch, and THE TRAPEZE's tap and draw. `drag-targets.ts` unions the pages
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
  | "gallPress"
  | "trapezePushLeft"
  | "trapezePushRight"
  | "trapezeLock"
  | "governorTap"
  | "gaugeTooth"
  | "gaugeTongue"
  | "lampreyTail"
  | "lampreyHead"
  | "lampreyTooth";

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
 * eighty-second: THE PLUMB's left stone under the pilot's finger, and its
 * right under the navigator's.
 *
 * Each is a long drag, left or right: `fromMilli` is how far across the
 * thumb has carried, thousandths of a tile, signed, and `on` is false on the
 * lift that lets the stone go. They were the phone's own lean, a
 * `deviceorientation` reading, until the owner ruled on 27 September 2026
 * that no wave may need a tilt sensor (`plumb.ts`); the names stayed.
 * Geometry says whose is whose, `viseLobeLeft`'s reason, and the wrong
 * seat's pull does nothing (`plumb-hand.ts`). `id` is unused.
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
 * are the ninety-third to the ninety-sixth: THE DAVIT's two steers and two
 * draws, one of each for each seat — the pilot's are the `Left` pair, the
 * navigator's the `Right`. Which of a seat's two is live is the lit step's.
 *
 * No new reading. A steer is `capstanSteer`'s: a handle's carry, `fromMilli`
 * how far the thumb has come across the boom since it took it, thousandths of
 * a tile, and a lift the thumb up. It was the phone's lean, on the same slots,
 * until 30 September 2026. A draw is
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
 * `gallPress` is the hundred-and-first: THE GALL's one press, on whichever
 * point of the seam it goes down on, heard from the seat nearer that point.
 *
 * `on` the finger down and the gall shut, a lift the gall open again;
 * `fromMilli` is not read. It was `viseLobeLeft`'s two-finger `SqueezeGap`
 * until 7 October 2026. `id` is the point, nought at the left end, and a
 * press counts only on the point the gall is on (`gall-hand.ts`).
 */

/**
 * `trapezePushLeft`, `trapezePushRight` and `trapezeLock` are THE TRAPEZE's,
 * in the places its old flag's `trapezeFreeze` and `trapezeDraw` stood until
 * the owner's rework of 7 October 2026 made it a swing.
 *
 * The pushes are a swipe on either half of the field, by where the finger
 * went down: `on` the finger down, the lift carrying how far it went across
 * on `fromMilli`, THE SLING's draw without its count. Which seat's swipe on a
 * side pushes is the level's (`trapezeCaller`). `trapezeLock` is a press on
 * the alien, an edge with nothing on `fromMilli` (`trapeze-hand.ts`).
 */

/**
 * `flueTap` stood here as the hundred-and-fourth, THE FLUE's ember tapped
 * where it had stopped, until the owner's rework of 5 October 2026 made the
 * ember a thing the cannon shoots and took the tap away.
 */

/**
 * `governorTap` is the hundred-and-seventh: THE GOVERNOR's marks, on both
 * screens, `valvePin`'s edge. `governorChordLeft` and `governorChordRight`
 * stood before it as the hundred-and-fifth and sixth, the two seats' brake,
 * until the owner's rework of 6 October 2026 gave each seat a mark of its own
 * to tap and left no thumb for a pad (`governor.ts`).
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

/**
 * `lampreyTail`, `lampreyHead` and `lampreyTooth` are the hundred-and-tenth
 * to twelfth: THE LAMPREY's tail, under the holder's thumb, and its head and
 * ring of teeth, under the other's.
 *
 * No new reading. The tail is a level — `on` the thumb down — carried along
 * the body in an `apart`; the head is THE CURTAIN's hem, `-fromYMilli` the
 * pull up; and the teeth are `valvePin`'s edge with `id` the tooth
 * (`lamprey-hand.ts`).
 */
