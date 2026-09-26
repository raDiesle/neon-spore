/**
 * **Every thing on this field a hand may take hold of, the fourth page** — the
 * names from THE HIVE's underside on.
 *
 * Cut when `drag-targets-c.ts` stood four lines and one comment from its
 * 250-line limit, exactly as that page was cut off the second and the second
 * off the first, and along the same seam every time: build order, with the
 * *last* boss on the full page handed across whole, so the set being written
 * keeps the comment that explains it and the one being moved keeps its own.
 * THE HIVE's underside came over with this file. `drag-targets.ts` unions the
 * pages together, so `DragTarget` is one name and nothing that reaches for it
 * knows there are four.
 */
// THE GIMBAL's two rings, argued below: the first pair of targets that are
// one object, read from its two opposite faces.
// THE HASP's latch and wheel, argued below: the first pair where one of them
// only moves at all while the other is being held.
// THE RATCHET's catch and pawl, argued below: a hold, and a press judged by it.
export type DragTargetD =
  | "hiveLobe"
  | "gimbalOuter"
  | "gimbalInner"
  | "spoolBrake"
  | "haspLatch"
  | "haspWheel"
  | "ratchetCatch"
  | "ratchetPawl"
  | "mantleLeft"
  | "mantleRight"
  | "mantleCore"
  | "keelJoint"
  | "valveWheel"
  | "valvePin"
  | "oculusLeafLeft"
  | "oculusLeafRight"
  | "viseLobeLeft"
  | "viseLobeRight";

/**
 * `hiveLobe` is the fifty-seventh, and the second handle read two ways by the
 * state of the thing it is on — `wellSeam`'s shape, on a body rather than on
 * a dial, and split between the two seats instead of given to one.
 *
 * It is the underside of THE HIVE, which is the one part of that boss inside
 * the field at all: the mass hangs over row 0 and everything else about the
 * fight is a column and a colour. A thumb on it takes no column off the
 * cannon and covers nothing with the shield, for the reason the seam does.
 *
 * **Clenched**, the handle is the whole underside and `fromYMilli` is the
 * pilot dragging it back within reach — down only, as `antiphonRail`'s is,
 * because a mass already at the top of the field has nowhere up to go.
 * **Swelling**, the handle is one lobe, `id` names which, and what the
 * navigator is doing is holding it rather than carrying it: the gesture is
 * counted in beats and the thumb never travels (`hive-hand.ts`).
 *
 * One name and not two because a pair who find the underside once have found
 * both halves, and because the two moments cannot overlap — a clenched mass
 * puts every lobe out of reach, which is exactly what the clench costs.
 * `id` is the site's index rather than its column, for `scuttlePart`'s
 * reason: the sites never re-order, and the index is what the wrung mark is
 * kept under.
 */

/**
 * `gimbalOuter` and `gimbalInner` are the fifty-eighth and fifty-ninth, and
 * the first pair that is **one thing gripped from opposite sides**.
 *
 * Both are bearings, `gaugeNeedle`'s and `crank`'s kind of `fromMilli`
 * (`bearing.ts`): a hand going round a ring says where it *is*, because a
 * finger four times round the same circle is back where it grabbed four
 * times over. What is new is not the gesture, it is what the two of them
 * are: the outer ring and the inner ring of one gimbal, set at right angles,
 * so the wheel has one true bearing per ring and each seat is shown theirs
 * turned the way their own face would honestly show it — the navigator's
 * clockwise is the wheel's counter-clockwise, and nothing on either screen
 * says so (`gimbal.ts`, `MirroredBearing`).
 *
 * Two names rather than one target and a side, for `choirLeft`'s reason and
 * one more: **geometry says which ring is whose** — the outer is always the
 * pilot's, the inner always the navigator's — so the seat is checked against
 * the name here rather than carried beside it (`gimbal-hand.ts`). No `id`:
 * there is one gimbal.
 */

/**
 * `spoolBrake` is the sixty-second, and the first target whose **value is the
 * whole of it**: every other depth drag in the set is read for an edge it
 * crossed or a beat it was held through, and this one is read for the number
 * it is resting at, every beat, for as long as the fight lasts.
 *
 * It is `sinewLeft`'s kind of depth — `fromYMilli`, how far down the pilot has
 * carried the mark from where he took hold, cut to `spoolReachMilli` — and the
 * pilot's alone, for THE GIMBAL's reason: there is one spool and one brake on
 * it, so the seat is checked against the name rather than carried beside it
 * (`spool-hand.ts`). No `id`.
 *
 * **Shallow pays line out fast and deep pays it slow**, which is the way a
 * brake works and not a rule the pair are told; a brake nobody is holding pays
 * fastest of all, so letting go is a choice and never a neutral. What the
 * depth is worth in line per beat is `spoolPayRateMilli`, and what the pilot
 * is shown for it is the mark's own grip and never a number — the figure the
 * navigator reads is on her screen, and saying the two to each other is the
 * fight (`spool.ts`).
 */

/**
 * `haspLatch` and `haspWheel` are the sixty-third and sixty-fourth, and the
 * first pair where **one of them does not move unless the other is held**.
 *
 * Neither gesture is new. The latch is a depth drag — `fromYMilli`, cut to
 * `haspReachMilli` — read as a **level** rather than an edge, which is the
 * one thing it does differently from a stroke, read on the edge it crosses: what the wheel
 * asks every tick is whether the hand is down *now*, so the gesture is
 * *keep holding* and there is nothing to cross. The wheel is a bearing, the
 * `crank` and `gimbalOuter` gesture exactly, and what a step on it is
 * worth is how far it travelled.
 *
 * What is new is the gate, and it is not in the engine: the wheel's own hand
 * asks whether the latch is held before it turns anything
 * (`hasp-hand.ts`). A rule joining two hands needs no primitive of its own,
 * only a read of the other hand on the same tick — which is the whole
 * finding §20 was written to make.
 *
 * Two names rather than one target and a side, for `sinewLeft`'s reason:
 * **the seat is the encounter here**, not a convenience — the pilot is shown
 * a latch and never a wheel, the navigator a wheel and never a latch — so
 * the seat is checked against the name and the wrong one's message does
 * nothing at all. No `id`: there is one row, and one hasp of it open at a
 * time.
 */

/**
 * `ratchetCatch` and `ratchetPawl` are the sixty-fifth and sixty-sixth: the
 * navigator's catch, a depth drag cut to `ratchetReachMilli` and read as a
 * **level**, `haspLatch`'s gesture exactly; and the pilot's pawl, read as a
 * **press** — the tick the thumb goes down, and nothing while it stays there.
 *
 * The pawl is never refused. Every press in a lit window spends a tooth, and
 * what her catch decides is only whether the tooth was clean
 * (`ratchet-hand.ts`). Two names for `haspLatch`'s reason: the seat is the
 * encounter, and the wrong one's message does nothing.
 */

/**
 * `mantleLeft` and `mantleRight` are the sixty-seventh and sixty-eighth, and
 * `mantleCore` the sixty-ninth.
 *
 * The two handles are depth drags, `sinewLeft`'s shape — `fromYMilli`, read
 * live and reset to nought the instant the thumb lifts, `haspLatch`'s
 * *keep holding* rather than a crossing — and geometry says whose is whose,
 * `gimbalOuter`'s reason: the pilot's is always `mantleLeft`, the navigator's
 * always `mantleRight`, so the seat is checked against the name and the wrong
 * one's message does nothing (`mantle-hand.ts`). No `id`: one shell, two
 * handles.
 *
 * `mantleCore` is a press, `ratchetPawl`'s shape, but answered by *either*
 * seat rather than one: once the shell is split it is whichever seat
 * `heartbeatNext` names, and it alternates with every landed tap. No target
 * before it has let both seats answer the same name — a pair discover which
 * of them the core wants by watching whose tap counts.
 */

/**
 * `keelJoint` is the seventieth, and the first whose seat is **read off where
 * it is rather than authored**.
 *
 * A press, `ratchetPawl`'s shape, with no `id`: one joint on one spine. It
 * walks the spine, and the seat that may press it is the one whose half of the
 * screen it sits over as it lights (`geometrySeat`); the other seat's message
 * does nothing, `gimbalOuter`'s reason, except that which seat is the wrong one
 * changes every time the joint moves (`keel-hand.ts`).
 */

/**
 * `valveWheel` and `valvePin` are the seventy-first and seventy-second.
 *
 * The wheel is `haspWheel`'s shape, a bearing in `fromMilli`, and only the
 * pilot's is heard. The pin is two gestures on one name: the navigator's
 * press is the freeze — an edge, the design's `FreezeTap` — and, once the
 * wheel is frozen, a draw from either seat to `valvePullMilli` in
 * `fromYMilli` pulls it (`valve-hand.ts`). A new `Hold["kind"]` for the tap
 * was not added: the press is already a message the wire carries, and what it
 * looks like is the look lane's.
 */

/**
 * `oculusLeafLeft` and `oculusLeafRight` are the seventy-third and
 * seventy-fourth: one leaf of THE OCULUS's lens under each seat's thumb.
 *
 * Holds, `mantleLeft`'s shape, and read as a **level** — down or up, nothing
 * about how far — and geometry says whose is whose, `gimbalOuter`'s reason:
 * the pilot's is always the left leaf and the navigator's the right, so the
 * wrong seat's message does nothing (`oculus-hand.ts`). What a hold is worth
 * is a number of beats both are down together, counted on the beat. No `id`:
 * one lens, two leaves.
 */

/**
 * `viseLobeLeft` and `viseLobeRight` are the seventy-fifth and seventy-sixth:
 * one lobe of THE VISE's seed-case under each seat's pinch.
 *
 * Read as a **gap** — `fromMilli` is the distance between the two touches on
 * the lobe, in thousandths of a tile, falling as they converge: `SqueezeGap`,
 * the first target whose number is two touches apart rather than one touch
 * moved. Geometry says whose is whose, `oculusLeafLeft`'s reason: the pilot's
 * is always the left lobe and the navigator's the right, so the wrong seat's
 * message does nothing (`vise-hand.ts`). Lifted, the lobe is back open. No
 * `id`: one case, two lobes.
 */
