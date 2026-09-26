# What the owner has said he likes, and does not

The record `.claude/skills/new-boss` §7 names — its own page because it is the
one part of the skill that grows with every boss he tests, and the skill is
held to 250 lines (`packages/sim/test/limits.test.ts`).

On record, with where. **This list is his to grow — add a line every time
feedback on a boss says one, with the date, in his words where he gave them.**

**A line marked *generic* is his rule for every boss and every mechanic,
not the one he said it about** (24 September 2026: *all what i say generic
should go into some instruction … that later on we can apply our best
practices to existing bosses or create new*). A new boss is built to it from
the start; a boss that already ships and breaks one is a `docs/queue.md`
item naming the rule, never a fix made in passing.

- **Dislikes, in his words:** THE TELL, built and removed on 11 September
  2026 — *"I do not like it and its hard to understand for players. too far
  away from the actual game setup and how it should feel."* A rule table
  drawn on the boss is still a rule table; a boss the pair has to be taught
  three symbols for before the first beat means anything is not a boss of
  this game (`bosses.md` §11.9). **Every new boss is read against this.**
- **Likes** the field to look like the field: the ship, the band and the
  background stay in a round, the controls are drawn in the default set's
  style — THE PULSE was rebuilt to this, PINBALL made the cannon the
  mechanism (`interludes.md`, §11.7–11.8).
- **Likes** the beat list that will not advance until the beat is performed,
  and the two players given different jobs in the same beat — A Way Out's
  co-op minus its camera (`bosses-choreographed.md`); and asked for the third
  kind above by name on 17 September 2026 — pulling a hand off, pushing a
  weapon back, opening a vault — *with very nice animations and graphics*.
- **Likes** one meter that is *ours* over two that are mine and theirs, and
  what fails to fall through the picture — *let the arrows who were incorrect
  fall inside the ship like meteors do* — over a number going down (§11.8).
- **Likes** the boss to announce itself — *indicated when he will look next
  with some nice animation* (THE STARE, §11.16); a handle that reads as
  something to pull (THE WARDEN, §11.4); a thing bursting like what it is —
  a ring under pressure bursts like a sac (`effects-spark.ts`).
- **Likes** the two seats coupled in the verbs alone when the picture is
  better shared: PINBALL's table is on both screens, against advice (§11.7).
  A split is the encounter, not a decoration.
- **Likes** a colour spent when the picture needs one, over a rule kept — the
  clown's nose (`palette.ts`); and slow motion on the dramatic action, if
  both screens start and end it together (`decisions.md` #33).
- **Said twice more, 19 September 2026:** *in general, when I build mechanics
  or bosses, I expect they are easy to understand and follow by players. No
  complex logic which players cannot understand. Also players may be in
  another language, so easy and short words are crucial*; and *better to skip
  hard to understand mechanics of bosses*. That is THE TELL's verdict made
  general, and it is now a rule in §2 rather than a preference here: when a
  design and its simplicity disagree, the design loses.
- **Rules he set:** every hull damage fails the whole wave (12 September
  2026, `wave-fail.ts`); a round is never repeated; no health bar; nothing
  written for the pair to read aloud; a look is never changed under him
  unasked (`docs/looks.md`); a picture is sent, never described; nobody asks
  him whether to push.
- **A choreographed window is long and its need is not small** (22 September
  2026, generic, in his words *"double the time what players have time to do
  the action, and let it require some more clicks"*). A scene's window is
  what the pair talk in, and most of it goes on finding out whose mark is
  whose; a window they never reach the end of taught them nothing. So a step
  is authored with a window around twenty beats rather than ten — and the
  need raised with it, because a long window with a small need is a step that
  lands itself and the drama goes out of it. Both halves, never one.
  THE INSTAR's own script is the worked example (`content/instar-script.ts`).
  Every other boss's figure, doubled or left alone and why:
  `docs/spec/choreographed-windows.md`.
- **A step's window is exactly THE SLOW** (22 September 2026, generic, in
  his words *"slow effect must take place in the moment any action on the
  game screen is required and when succeeded or failed the action step, it
  immediately stops the slow effect"*). So a scene calls `openSlow(world,
  step.windowBeats)` on the tick the marks come up and `closeSlow(world)` on
  the tick the step is answered or missed — never on the landing, which is a
  beat already won. The slow is *time to talk in*, and the only moment the
  pair need it is while they are working out whose mark is whose. A death or
  a fall, which asks for nothing, keeps its own plain window
  (`decisions.md` #33, `sim/slow.ts`). **No bar under the boss** — the
  owner took it out on 24 September 2026 (*it was a stupid idea*) — but on
  the 25th he asked for *some progress indicator* back, *remaining time left
  to take damage when not succeeding*: a **fuse along the top of the screen**
  burns in to the middle, orange from half the window and red for the last
  two beats (`render/slow-fuse.ts`); he kept it over three VERSUS answers the
  same day, and asked for it bigger and clear of the top edge. **The slow's light runs from the top of the screen**,
  never from an edge the player cannot see (24 September).
- **No `CARRY` on the glass**, generic, 24 September 2026: *why we need the
  keyword of "Carry"? … "Pull up" its clear he has to take action.* A verb
  that is a motion — `PULL UP`, `SWIPE`, `MOVE` — draws alone; the kind line
  stays only where it adds something (`PRESS`, `HOLD`, `STILL`). One rule,
  `saysKind` in `render/src/boss-cue-shape.ts`, and both hands call it.
- **A landed sequence shows the blow**, generic, 24 September 2026: *when
  player succeeded a sequence, it should have some visual that enemy took
  damage e.g. its shaking for a moment and body glows red for a moment.* A
  boss's fx holds one `BossHurt` (`render/src/boss-hurt.ts`), hits it on the
  event that means a sequence landed — never on one mark alone — shifts the
  body by `shakeX` and lays `drawHurt` over its plates. Half a second.
- **The order is said by the marks, never by a line**, generic, 24
  September 2026 — he took *either order* off the glass over the cannon.
  Two marks up at once are the pose saying *either order*; an order that
  matters shows one seat's mark first and the other's after it is answered.
  No sentence for the step as a whole (`render/test/pair-order.test.ts`).
- **Every control answers wider than it is drawn**, generic, 24 September
  2026: *the area should be bigger than visible so players can touch it*.
  Half again the radius drawn, never under a 48px target; one number for the
  game, `HIT_REACH` in `render/src/hit.ts`, and every ring, lobe, handle and
  mark is found through `hitCircle`. Where two reaches overlap, the nearest
  centre wins.
- **Dislikes, in his words:** THE BELLOWS, played and removed on 24
  September 2026 — *"it's not clear to me how to play … what does 'push'
  means? … it's not clear what is goal … why on a curtain a jam is going out,
  no logical understandable where the connection is."* A spark the shield
  could not answer, from a lung nobody could say why it was pulled, is a
  cause and effect with no connection a player could see; THE INSTAR is his
  counter-example, *we have to open mouth so we can pull tongue — clear
  understandable*. **Every gesture needs a reason the picture gives**
  (`bosses.md` §11.35).
- **Feedback on every touch, generic, 24 September 2026**, in his words
  *"there should be always in general some visual if player did correct or
  not, immediately, e.g. green or red colour of the circle he touched with
  animation."* Four parts, for every boss and every mechanic with a mark:
  1. **The action wanted right now is the brightest thing on the screen**
     — more glow, more highlighting, on the mark itself.
  2. **The other seat's turn shows too, and where**: this seat can see that
     the partner is the one being waited on, and at which mark. **The
     partner's mark never shows the gesture** (the same day, a second
     time: *not clear enough that other player has not to touch it*): a
     gesture on a mark reads as *your next move*, so the partner's wears a
     waiting clock whose hand goes round, and its box names whose it is —
     `drawInstarWait` in `render/src/instar-mark-feedback.ts`.
  3. **A touch is judged on the mark it touched, at once**: green for right,
     red for wrong, animated, and never a sound or a burst somewhere else.
  4. **A gesture started the right way says so while it is still going** —
     a drag begun in the right direction shows it is on its way to done,
     before it lands. A swipe fills its ring continuously as the thumb
     travels toward the length that counts (the same day, a second time:
     *direct feedback while swiping down correctly*), and the fill is the
     simulation's word (`instarSwipeAlong`), never the drawer's guess.
     **A swipe is drawn as a track, not a ring** (the same message): the bar
     path of a slider without its knob, from where the thumb goes to the
     length the lift counts at, so the end of the bar is the end of the swipe
     (`render/src/instar-track.ts`).
     **A handle you pull is drawn as the path it can be pulled**, generic,
     25 September 2026 — *change the circle to look like the path it can be
     pulled*, THE MAZE's and THE WARDEN's alike, and green: a channel the
     whole of the travel that fills green behind the hand, never a ring
     with a dial round it (`render/src/pull-track.ts`). A pull that turns
     something follows the thing it turns — THE MAZE's runs round the
     drum's rim, from a lever clamped to it, so the wheel turning is the
     plain consequence of the hand.
     **Refined the same morning, generic** — *make the pull direction helper
     more decent, smaller, but the circle to start must stay bigger, so it is
     clear to start there*, and *the area of starting the pull must be much
     bigger than the visual … as it's also moving*. So every pull handle is
     three things, and all three are shared, never redrawn per boss:
     1. **a thin, quiet channel** — `drawPullTrack`, half-width
        `PULL_TRACK_W` of the knob's radius (`render/src/pull-track.ts`);
     2. **a big, loud circle to start** at the handle's full radius,
        breathing until taken, lit while held — `drawPullKnob`
        (`render/src/pull-knob.ts`), drawn last, over channel and rope;
     3. **a press answered far outside it** — the knob's radius times
        `PULL_GRAB`, then `hitCircle`'s own half again: about three times the
        circle drawn. A handle that moves gets this, never the bare
        `HIT_REACH`.
     **A turn with no end has a channel with no end**: THE MAZE's wheel turns
     a full circle and more, so its channel is the whole ring round the drum
     (`closed: true`), hard against the rim with no gap, and the green wraps
     lap after lap. Never an arc of it.
     **A gesture's direction is the picture's**: what the thumb does, the
     part does — a swipe down takes an egg off THE INSTAR's clutch and it
     falls straight down to the hull (`render/src/instar-eggs.ts`), one egg
     per swipe the mark needs.
  THE INSTAR is the worked example he asked for before the rest
  (`render/grip-verdict.ts`); the roll-out is `docs/queue.md`'s.
- **The gesture is the defence against what the picture is about to do**,
  25 September 2026, on THE INSTAR: *its not logical to me why we need to
  open mouth to succeed. more sense makes that the enemy already has open
  mouth to spit out fire like a dragon … and we have to close the mouth, so
  he cant spit out the fire.* So a step shows the threat already coming — a
  fireball growing in the jaws, eggs rumbling on the back, a tail swinging
  in — and the gesture stops it, and **a missed window is drawn as the threat
  carried out**: the fire over the whole field, the brood hatching and eating
  the ship, the tail hitting the hull. He asked for the entrance to *create
  some excitement* — slow, small in the background, flying at the screen —
  and for the body to leave and come back between steps, so a turn of
  perspective is something it flies into rather than a cut.
- **A turn the pair takes in order shows whose it is, on both screens**,
  25 September 2026, on THE FILAMENT: *not clear when following is correct or
  not … glow red before … player 2 should more clearly see what player 1 is
  doing … some timer when it is too late to follow.* So both thumbs are on
  both screens, the own ring green when its move is open and red with *WAIT*
  when not, arrows march the way the thumb goes, the window between them is
  drawn, the partner the line waits on wears the waiting clock, and a line
  standing still has a clock of its own that strikes the hull — any fault
  loses the wave. A landed round is *PULLED* in green with how many are left
  (`render/filament-turn-draw.ts`, `sim/filament-turn.ts`).
- ***Generic*: a timeout hit is the boss's own blow**, 26 September 2026:
  *whenever a boss damages the ship because time is over, there should be a
  graphics animation related to boss damaging it, not just a dumb meteor
  falling down.* A boss that runs a window out calls `bossStrikesHull` and
  draws the blow as the threat carried out; a rock that was never in the
  picture is never the hit (`bosses.md`, *A timeout hit is the boss's own
  blow*).
- **Open, for his feedback:** which of the three kinds the next one should be;
  how many gestures a scene may ask for in a row; whether a scene's gesture
  may be a swipe or a turn the default set does not have yet; and every boss
  he tests — one line here per verdict.
