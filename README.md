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
    lib/          # http (axios), storage, stream reading
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

Nothing on the screen is boxed. The field dissolves into the background through
a gradient rather than stopping at the edge of a panel, because a panel with a
border draws a line across the design and turns a splash into a form. The
background is a tonal wash — white held behind the wordmark so the type stays
crisp, then ramped into grey so the lower half carries real tone.

The hobby icons are emoji, so they are the one place colour enters the app. That
is deliberate: imagery carries the colour, the interface does not.

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

Four things differ from the Expo template, each for a reason worth stating:

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

## Configuration

Server-side only — none of these reach the app bundle.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Primary model. Free key from Google AI Studio. |
| `GEMINI_MODELS` | Optional, comma-separated, tried in order when one is overloaded. Defaults to `gemini-2.5-flash,gemini-3.5-flash,gemini-3.5-flash-lite`. |
| `GROQ_API_KEY` | Optional fallback model. |
| `GROQ_MODEL` | Optional. Defaults to `openai/gpt-oss-120b`. |

The app has no API URL setting. Web calls its own origin; native builds use the
`origin` set on the `expo-router` plugin in `app.json`, which is what a release
build must point at the deployed API.

## Colour

Monochrome: one neutral ramp from white to near-black, and nothing else. It is
split 60 / 30 / 10 —

- **60%** the white ground almost every pixel sits on. White rather than an
  off-white: on a palette with no hue, a grey ground drains the contrast out of
  everything standing on it and the screen reads as switched off
- **30%** the content layer: white cards, hairline borders, and the grey text
  ramp that carries the reading hierarchy
- **10%** near-black, reserved for the primary button, the selected state and
  the filled part of a progress bar

The ratio only holds while near-black stays scarce, so a second black button on
a screen is the signal that something has been promoted that should not be.
With hue gone, hierarchy comes from contrast and weight instead — including
status, where an error is the darkest step rather than a red one.

Type carries the weight colour cannot: screen questions are bold and large, and
each step is topped by its own icon so the four questions are distinct at a
glance. Progress is a single continuous bar rather than segments — segments chop
the top of every screen into pieces and read as chrome.

Tokens live in [`src/theme`](src/theme). Nothing outside that folder imports raw
values; components read semantic names like `colors.text.secondary`.
