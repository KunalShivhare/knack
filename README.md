# Knack

Focused learning plans for any hobby.

## Stack

- Expo (React Native) with Expo Router — runs on Android, iOS and web from one codebase
- TypeScript, strict mode

## Getting started

```bash
npm install
npm start
```

Then press `a` for Android, `i` for iOS, or `w` for web.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` | Run on an Android device or emulator |
| `npm run ios` | Run on an iOS simulator |
| `npm run web` | Run in the browser |
| `npm run lint` | Lint the project |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run the unit tests |

## Project structure

```
src/
  app/            # Expo Router routes only — thin files, no logic
  modules/        # one folder per feature, owning its state and components
    onboarding/
  shared/         # reusable across modules
    components/   # atoms and molecules
    lib/          # http (axios), storage
  theme/          # design tokens — the single source of design truth
```

Three import rules hold the boundaries:

1. `app/` imports a module through its `index.ts` and never deeper.
2. A module may import `shared/` and `theme/`.
3. `shared/` never imports a module.

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

## Platform notes

Three things differ from the Expo template, each for a reason worth stating:

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

## Configuration

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Base URL for API calls. Leave unset on web, where the API shares the app's origin. |

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
