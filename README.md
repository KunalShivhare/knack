# Knack

Focused learning plans for any hobby.

## Stack

- Expo (React Native) with Expo Router — runs on Android, iOS and web from one codebase
- Expo Router API routes for the backend, in the same repo and language as the app
- Gemini (free tier) writes plans, streamed, falling through several free models; Groq is an optional fallback
- zod contracts shared by the API, the model's JSON schema and the app's types
- TypeScript, strict mode

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in the keys
pnpm start
```

Then press `a` for Android, `i` for iOS, or `w` for web. The dev server serves the
API routes too, so nothing else needs running. Without keys the app still runs;
plan generation reports that it could not reach the AI.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm start` | Start the Expo dev server |
| `pnpm android` | Run on an Android device or emulator |
| `pnpm ios` | Run on an iOS simulator |
| `pnpm web` | Run in the browser |
| `pnpm build:web` | Export the web app and API routes to `dist/` |
| `pnpm lint` | Lint the project |
| `pnpm typecheck` | Type-check without emitting |
| `pnpm test` | Run the unit tests |

## Project structure

```
src/
  app/            # Expo Router routes only — thin files, no logic
    api/          # API routes: plans (streamed) and swap
  modules/        # one folder per feature, owning its state and components
    onboarding/
    journey/      # the plan, its progress, and the screens' building blocks
  server/         # server-only: prompts, model providers, output repair
  shared/         # reusable across modules
    components/   # atoms and molecules
    contracts/    # the plan contract: zod schemas, ids, types
    lib/          # http (axios), storage, stream reading, haptics
  theme/          # design tokens — the single source of design truth
```

Three import rules hold the boundaries:

1. `app/` imports a module through its `index.ts` and never deeper.
2. A module may import `shared/` and `theme/`.
3. `shared/` never imports a module.
4. Only `app/api/` imports `server/`, and app code never imports the zod schemas.
   Both are lint errors: the first keeps API keys and prompts out of the app
   bundle, the second keeps zod out of it.

Components are layered by what they are allowed to know about, not by size —
see [`src/shared/components/README.md`](src/shared/components/README.md).

## Onboarding

The welcome screen is a wordmark and a promise pinned at the top, a scattered
field of hobby icons drifting right to left behind them, and the call to action
floating free at the bottom. The drift loops rather than paging: there is no
sequence to get through and nothing to swipe, so the only thing to do on the
screen is start.

Positions, sizes and angles are authored rather than aligned — evenly spaced
rows read as a grid, and a grid reads as a component. Authored also means fixed:
nothing is randomised at runtime, because a field that reshuffles on every
launch feels unstable and makes screenshot diffs worthless. The strip holds two
copies of the field and travels exactly one copy's width before restarting, so
the loop closes with no visible seam.

Each hobby sits on its own small paper tile, so the field reads as a scatter of
things rather than loose glyphs. The screen itself is not boxed: the field
dissolves into the background through a gradient rather than stopping at the
edge of a panel, because a panel with a border draws a line across the design
and turns a splash into a form. The background is a wash from paper into the
warmer panel tone, and under the button three short facts say what starting
gets you: 5–8 techniques, built for your goal, no account.

Then four screens collect what a plan is generated from —
name, hobby, current level and target outcome, and motivation with a weekly time
budget. Every field feeds the plan prompt; nothing is collected that the plan
does not consume.

Answers are written to storage on every change, and the launch gate resumes on
the first unanswered step, so closing the app mid-flow costs nothing.

## The plan

**Generation.** Finishing onboarding streams a plan from `POST /api/plans`. The
server asks Gemini for JSON matching the plan schema and scans the stream for
each technique the moment its object closes, validates it on its own, and sends
it on as one line of NDJSON — so techniques land one by one instead of after a
fifteen-second blank. If Gemini fails before anything has been shown, Groq
answers in one piece and the app staggers the reveal anyway. Once a technique is
on screen there is no fallback: a second model would start a different plan
underneath the one being watched.

**The prompt** (`src/server/prompts`) makes three decisions explicit rather than
leaving them to the model:

- *How many techniques* comes from the weekly time budget (5 to 8), decided in
  code. The budget is the lever against overload, and a model asked for "5 to 8"
  drifts to 8.
- *What to include* is aimed at the learner's own target outcome, skips what
  their level implies they know, and is ordered so each technique builds on the
  last.
- *How each is learned* — see, read or practise — is chosen per technique from
  what the skill is: form, order and structure are laid out as an infographic,
  concepts and decision rules are read, and fast-to-grasp skills built by
  repetition are practised. The prompt names the wrong choices too (quizzes for
  chess tactics, a page of reading for a strumming pattern), because those are
  the failure the brief describes.

Every technique carries a drill sized to the budget's session length and a
mastery check phrased as something observable, so "mastered" means something.
The learner's name never leaves the device, and their answers sit inside tagged
blocks the model is told to treat as data.

**Infographics.** There are no videos or links, because a model asked for URLs
invents plausible ones that do not exist. Instead each technique can carry an
infographic the model describes as data — ordered *steps*, a two-column
*compare*, or key *numbers* — and the app draws it with its own components. The
model picks the shape; the app owns how it looks, so a visual written on the fly
for any hobby still looks designed, renders on every platform, and is validated
like the rest of the plan.

**Pictures.** A posture, a grip or a chord shape needs a picture a learner can
copy, and the free tier cannot generate images, so pictures are found on
Wikimedia Commons — and only where they are needed. The plan gives a technique
a Commons search phrase only when the learner has to copy a physical position,
grip, shape, pose or movement; concepts, strategy and habits get none, and never
load one.

`GET /api/image` searches with the phrase, with the phrase as a diagram, and with
each word left out (Commons requires every word to match, so "guitar sitting
posture" finds concert photos where "guitar posture" finds the instructional
ones). Up to six thumbnails are shown to Gemini, which judges each one — safe for
all ages, demonstrates this exact step clearly enough to copy, or just generic
(a class, an event, a portrait, equipment) — and picks one or none. The server
refuses any pick the model's own verdict disqualifies, so a generic or
unsuitable picture cannot slip through on a careless pick. Judging pictures
runs on its own models (`GEMINI_IMAGE_MODELS`): the lite models misjudged them in
testing, and free-tier quotas are per model per day, so finding pictures never
spends the quota the next plan needs.

Loading is kept out of the learner's way. As soon as a plan is on screen its
pictures are looked up in the background, one at a time in path order, and each
one found is downloaded, so a lesson usually opens with its picture already
there; opening a lesson mid-lookup shares the request rather than starting
another. The answer is saved on the technique and the route is cached at the
CDN for a week. Browsers load pictures straight from Wikimedia; native apps load
them through `/api/image-file`, which fetches only Commons file URLs, because
Wikimedia refuses Android's image loader and its user agent cannot be
overridden. The sheet shows each picture with its author, licence and a link to
its Commons page, as the licences require.

**Model output is repaired before it is rejected.** Gemini turns the JSON schema
into a decoding grammar and refuses schemas whose nested array bounds make that
grammar too large, so bounds are stated in the prompt and enforced on the way
back instead. Slips that say nothing about quality — an id with an underscore, a
drill of 75 minutes, nine steps where the layout holds six — are fixed rather
than costing the learner a whole technique. Anything that affects what the
learner reads still fails validation, and every drop is logged with its reason.

**Free-tier availability.** Free Flash models go through spells of "high demand"
refusals independently, so a busy or unresponsive model falls through to the
next one in `GEMINI_MODELS` before the request fails.

**Swapping.** A struck technique stays on the path and can be restored. "Swap"
asks for one replacement told why the original was struck: *too hard* gets an
easier stepping stone to the same place, *not for me* gets a different route
there. The replacement is inserted right after the one it replaces.

**Progress** counts only what the learner did: techniques mastered (struck ones
leave the denominator, so striking one never lowers progress), practice minutes
logged against the weekly budget from onboarding, and a seven-week grid of
practice days.

## Platform notes

Eight things differ from the Expo template, each for a reason worth stating:

- **React Compiler is off** (`expo.experiments.reactCompiler`). With it enabled,
  the Android build dies during React Native's own environment setup with
  `TypeError: property is not writable` before `AppRegistry` runs — a black
  screen on device, while web is unaffected. Verified by bisect: a bare
  `_layout.tsx` fails identically, so it is not app code. It is an optimisation,
  so turning it off costs nothing functionally.
- **Keyboard avoidance is handled in JS on both platforms.** The manifest sets
  `adjustResize`, but the app is edge-to-edge, which stops Android from
  resizing — so without this the CTA sits behind the keyboard. `OnboardingShell`
  owns the fix, which is why all four question screens get it at once.
- **Text fields are native multiline on Android.** A single-line `EditText`
  scrolls sideways, and while it is empty React Native scrolls just far enough
  to reveal the caret — so a centred field's caret sits against the right edge.
  A multiline one does not scroll and centres correctly; `submitBehavior` keeps
  Enter submitting rather than breaking the line. Contained in the `Input` atom.
- **Web uses expo-router's modal stack** (`EXPO_UNSTABLE_WEB_MODAL=1`, set in the
  `start`, `web` and `build:web` scripts). A technique is a `formSheet` route;
  with the flag, web renders it as a bottom sheet at phone width and a centred
  modal on a desktop — the pattern the brief asks for — instead of a full-page
  push. The flag is read when the bundle is built, so every script that builds
  web sets it.
- **The technique sheet's scroll view opts into nested scrolling.** Android's
  bottom sheet only hands a downward drag to content that declares it can
  scroll; without `nestedScrollEnabled`, dragging the lesson back up closes the
  sheet instead.
- **The web sheet opens at full height.** On web the sheet library draws a
  fractional detent by sliding a full-height sheet down, so at `0.92` the bottom
  8% of the sheet — where the lesson's pinned action bar lives — sat below the
  screen. Native keeps `0.92`; web uses `1`.
- **A lesson opened from a link rebuilds the path under it.** A refresh or a
  shared URL leaves the sheet as the only screen, so the close button, a drag,
  Escape and the back button all had nowhere to go. The sheet resets the stack
  to the tabs with itself on top. expo-router's anchor setting would do this
  too, but it anchors every root route, onboarding included.
- **Server-rendered layout avoids the window size.** Web pages render on the
  server, where the window has no width, and the browser keeps that markup's
  styles when it takes over. The welcome screen's drifting tiles are therefore
  placed in percentages; only the drift's speed reads the real width.

## Configuration

Server-side only — none of these reach the app bundle.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Primary model. Free key from Google AI Studio. |
| `GEMINI_MODELS` | Optional, comma-separated, tried in order when one is overloaded. Defaults to `gemini-2.5-flash,gemini-3.5-flash,gemini-3.5-flash-lite`. |
| `GEMINI_IMAGE_MODELS` | Optional, comma-separated models for judging pictures. Defaults to `gemini-3.6-flash,gemini-3-flash-preview,gemini-3.7-flash,gemini-3.8-flash`. |
| `GROQ_API_KEY` | Optional fallback model. |
| `GROQ_MODEL` | Optional. Defaults to `openai/gpt-oss-120b`. |

The app has no API URL setting. Web calls its own origin; native builds use the
`origin` set on the `expo-router` plugin in `app.json`, which is what a release
build must point at the deployed API.

## Look and feel

"Sketchbook": warm paper, brown-black ink, and one brand colour, marigold.

- **Paper and ink.** The ground is a warm off-white (`#FFFAF0`) and text is
  brown-black rather than pure black, so the app reads like a notebook rather
  than a settings screen. Cards separate from the ground by a white fill and a
  soft warm shadow, not by grey outlines.
- **Marigold marks the next thing to do** — the primary button, the selected
  chip, the centre of the current step. It is a fill and nothing else: at 1.7:1
  on paper it cannot carry text or a thin line, so rings use a darker marigold
  and links a darker one still.
- **Each medium has its own colour** — sky for See, lilac for Read, mint for
  Practice — always a light fill with a dark ink of the same hue, so a plan's
  mix is visible before any title is read. Mastered is green; struck out is
  rust, not red, because striking a technique is a choice rather than a failure.

Every text colour is held to WCAG AA against the ground it sits on, and every
ring and input border to 3:1; [`src/theme/__tests__/contrast.test.ts`](src/theme/__tests__/contrast.test.ts)
fails the build if a retuned token breaks that.

Type is two families. Bricolage Grotesque sets titles and figures; Figtree sets
everything read at length. Each weight is registered as its own family, because
Android ignores `fontWeight` on a custom font. Icons are Feather, drawn in the
current text colour; emoji stay only where they are content, as the mark of a
hobby.

Primary buttons stand on a darker edge and sink onto it when pressed, and a
disabled button sits already sunk. Touch feedback goes through three named
haptics — a selection, a small record such as logged minutes, and success —
and success is kept for mastering a technique and a plan being ready. Mastering
springs a tick in place on the lesson sheet rather than taking over the screen,
and the spring is skipped when the system asks for reduced motion.

Tokens live in [`src/theme`](src/theme). Nothing outside that folder imports raw
values; components read semantic names like `colors.text.secondary`.
