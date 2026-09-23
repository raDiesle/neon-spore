# What the owner has said he likes, and does not

The record `.claude/skills/new-boss` §7 names — its own page because it is the
one part of the skill that grows with every boss he tests, and the skill is
held to 250 lines (`packages/sim/test/limits.test.ts`).

On record, with where. **This list is his to grow — add a line every time
feedback on a boss says one, with the date, in his words where he gave them.**

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
  (`decisions.md` #33, `sim/slow.ts`). The measure the pair read follows
  from it: the bar under the boss counts the window down, so it says *time
  left before this step fails* (`render/slow-intake-bar.ts`).
- **Open, for his feedback:** which of the three kinds the next one should be;
  how many gestures a scene may ask for in a row; whether a scene's gesture
  may be a swipe or a turn the default set does not have yet; and every boss
  he tests — one line here per verdict.
