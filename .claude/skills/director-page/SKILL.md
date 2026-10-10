---
name: director-page
description: Add a page to the director (tools/director) in Neon Spore — a new full-screen sheet behind a topbar door, a new room (inner tab) in an existing sheet, or a tab bar inside a room — so that it is drawn lazily, survives a reload at its own URL, and is restored in the right order. Use when asked to add, move or split a page, sheet, room, tab or sub-tab in the director, or when a director page forgets where it was on reload.
---

# A page in the director

The director has three levels of page, and **every level is a place in the
URL**: reloading `?wave=2&sheet=states&inner=controlsets&sub=field` must open
DOCUMENTATION → CONTROLS → ON THE FIELD on wave 2. The owner noticed when it
did not (10 October 2026). A page that forgets itself on reload is a bug, not
a nicety.

| Level | Example | URL | Wired by |
|---|---|---|---|
| sheet | DOCUMENTATION, NOT BUILT YET, SOUND, TUNING | `sheet=` | `mountSheet` (`src/session.ts`) |
| room (inner tab) | DOCUMENTATION → CONTROLS | `inner=` | `mountSheet`'s `innerBar` |
| sub tab | CONTROLS → ON THE FIELD | `sub=` | `mountSheet`'s `subBars` |
| section | STYLE → COLOUR | `#colour` | the page's contents menu (`section-link.ts`) |

Only navigation goes in the URL — what is looked at, never a dial, a skin or
an edit (`session.ts`'s header says why). A fourth level would be a new field
in `Place` (`src/place.ts`) and its tests, not a parameter read somewhere else.

## Before building: which level?

- **A room in an existing sheet** is the default. DOCUMENTATION is reference,
  NOT BUILT YET is unbuilt work, SOUND is sound, TUNING changes the run.
- **A new sheet** only when it fits none of those — it costs a topbar door,
  and on a phone a line in the menu.
- **A sub tab** when one room has grown two or more readings of one subject.

## A room in an existing sheet

1. **Markup** (`tools/director/index.html`): a `<button type="button"
   data-tab="<name>">` in the sheet's bar (`#statesTabs`, `#backlogTabs`,
   `#soundTabs`), and a page `<div class="sheetpage" id="<prefix><name>">` —
   the prefix is the one the sheet's `bindTabs` call names (`mech-` for
   DOCUMENTATION, `sheet-` for NOT BUILT YET). A `<p class="pagewhat">` first,
   saying in a sentence what the page is.
2. **A file of its own**, `src/<name>-page.ts`, under ~250 lines: a
   `render<Name>()` guarded by a `drawn` flag, and a `bind<Name>Tab()` that
   adds it as a click listener on its own tab button. `style-page.ts` is the
   shortest whole example.
3. **Bind it before the sheet is mounted.** `mountSheet` replays the URL as
   real clicks, and a room bound after it restores to a blank page. For
   DOCUMENTATION that is one line in `documentation-rooms.ts`; for the others,
   before the `mountSheet` call in `backlog-page.ts` / `sound-page.ts`.
4. **CSS**: in the `director-*.css` file whose rules already sit nearest, or
   a new file `@import`ed in `src/director.css` — `director-phone.css` stays
   last (`test/stylesheet-order.test.ts`).

## A new sheet

The room steps above, plus:

1. A door in the header: `<button type="button" id="<name>Open"
   class="menu-item">` beside `statesOpen` — `menu-item` is what puts it in the
   phone's menu.
2. The sheet itself, modelled on `#states`: a header with a title, a
   `<span class="sub">`, a `<button id="<name>Close">`, the tab bar, the body.
3. `bind<Name>()` that runs `bindTabs("#<name>Tabs", "sheetpage", "<prefix>")`
   and then `mountSheet({ name, sheet, open, close, innerBar, onOpen })`;
   `onOpen` draws the room the sheet opens on, since nothing clicks a default.
   Called from the list at the bottom of `src/main.ts`.
4. `name` is the URL's `sheet=` value forever after — a saved link outlives
   the code, so pick it once.

## A sub tab inside a room

CONTROLS is the example. The room's file wires the bar with a page class and
prefix of its own — `bindTabs("#controlsInnerTabs", "ctlpage", "ctl-")` in
`controlsets-page.ts`, never `sheetpage`, because `bindTabs` switches every
page of its class and would close the room behind it — and the sheet's
`mountSheet` names the bar against its room:

```ts
mountSheet({ name: "states", …, innerBar: "#statesTabs",
  subBars: { controlsets: "#controlsInnerTabs" } });
```

The sub bar's `bindTabs` must run before `mountSheet`, like the room's own
binding — `session.ts` reads the bar's `.on`, which `bindTabs` sets.
`sub=` is then written on a click, re-read when the room is entered again,
dropped when it is left, and restored on load after the room.

## Sections a link can point at

A page with a `<nav class="contents" data-contents="<body id>">` gets a
contents menu of its own headings, each row with a 🔗 that copies
`?sheet=…&inner=…#<slug>`; opening one scrolls there once the page has drawn
(`tabs.ts`, `section-link.ts`, `section-follow.ts`). A long page wants one —
it is a line of markup, not a module.

## Tests

- A sub bar or a new `Place` field: `test/session.test.ts` mounts fake bars
  and asserts the URL and the `.on` after a seeded load
  (`test/fake-dom.ts` has `makeBar` and `installDom`).
- A tab whose page id is derived by string: `test/sheet.test.ts` is the model
  of a test that reads `index.html` and fails on a tab with no page.
- Anything the director draws from the game uses the shipping renderer
  (`frameWorld` in `pose-art.ts`) against a real `World`, never a
  description of one.

## Seeing it

`bun run here`, then the `director-here` launch entry (a bare `director` entry
starts the *main* checkout). Load the page at its own URL, click to a
different tab, reload, and confirm it comes back where it was;
`read_console_messages` for errors. `bun run shot <#sel> <out.png>` takes one
element as a PNG for the owner.

Then the README's section for that sheet (`tools/director/README.md`) gets a
paragraph, and `bun run index` if a file was added.
