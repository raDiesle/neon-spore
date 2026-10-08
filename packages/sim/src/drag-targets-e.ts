/**
 * **Every thing on this field a hand may take hold of, the fifth page** — the
 * names from THE TRIVET's feet on.
 *
 * Cut when THE PLUMB's pair would have put `drag-targets-d.ts` over its
 * 250-line limit, exactly as every page before it was cut, and along the same
 * seam: build order, with the *last* boss on the full page handed across
 * whole, so the set being written keeps the comment that explains it and the
 * one being moved keeps its own. THE TRIVET's pads came over with this file;
 * THE PLUMB's levels were written on it, and THE SLING's draws after them,
 * THE HALTER's grips, THE CAPSTAN's steer and rub, THE GALL's tap and pull, and THE TRAPEZE's tap and draw. `drag-targets.ts` unions the pages
 * together, so `DragTarget` is one name.
 */
export type DragTargetE =
  | "trivetPadFront"
  | "trivetPadRear"
  | "plumbLevelLeft"
  | "plumbLevelRight"
  | "slingDrawLeft"
  | "slingDrawRight"
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
  | "lampreyTooth"
  | "latchGripLeft"
  | "latchGripRight";

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
 * `cystFreezeLeft`, `cystFreezeRight`, `cystFlankLeft` and `cystFlankRight`
 * stood here as the eighty-ninth to the ninety-second, THE CYST's two freeze
 * marks and its two flanks, until the owner took THE CYST out of the game on
 * 8 October 2026.
 */

/**
 * `davitSteerLeft`, `davitSteerRight`, `davitLooseLeft` and `davitLooseRight`
 * stood here as the ninety-third to the ninety-sixth, THE DAVIT's two steers
 * and two draws, until the owner took the boss out of the game on 8 October
 * 2026.
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
 * `gallPress` is the hundred-and-first: THE GALL's hand on the alien, on
 * whichever point it goes down on, heard from the seat nearer that point.
 *
 * `on` the finger down; **the lift is the gesture**, carrying how far it went
 * — `fromMilli` across and `fromYMilli` down, thousandths of a tile. A lift
 * that hardly moved is a tap, one dragged up is a pull (`gall-hand.ts`). It
 * was a held press until the owner's rework of 8 October 2026, and
 * `viseLobeLeft`'s two-finger `SqueezeGap` before 7 October. `id` is the
 * point, nought at the left end.
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

/**
 * `latchGripLeft` and `latchGripRight` are the hundred-and-thirteenth and
 * fourteenth: THE LATCH's two grips on its one tendril, the pilot's on the
 * left and the navigator's on the right — crossed in a `cross` level.
 *
 * No new reading. Each is THE MANTLE's handle, `fromYMilli` the depth pulled
 * down; what is new is that the two hands take turns on the same rope, and a
 * lift is judged against whether the other grip is held (`latch-hand.ts`).
 * `id` is unused.
 */
