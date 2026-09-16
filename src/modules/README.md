# Modules

One folder per feature. A module owns its own state, constants, types and the
components only it uses, so a feature can be read — or deleted — in one place.

```
modules/onboarding/
  components/
    molecules/    OptionTile, HobbyPicker
    organisms/    OnboardingShell
  state/          reducer, provider, persistence
  constants.ts    the option lists the screens offer
  types.ts        answers, steps, and what counts as a completed step
  index.ts        the module's public surface
```

Three import rules hold the boundaries:

1. `src/app/` imports from `@/modules/<name>` — the barrel — and never deeper.
   Internals can then move without touching the router.
2. A module may import `@/shared` and `@/theme`.
3. `shared/` never imports a module. If shared code needs something from a
   module, it belongs in the module.

A second feature is a sibling folder, not a refactor.
