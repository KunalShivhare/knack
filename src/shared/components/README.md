# Components

Shared components: the ones more than one module uses. A component used by a
single feature lives in that module's own `components/` folder instead, under
the same layering.

The layer a component belongs to is decided by what it is allowed to know about,
not by how big it is.

| Layer | May import | Must not | Examples |
| --- | --- | --- | --- |
| `atoms/` | theme tokens only | other components, app state, navigation | `Text`, `Button`, `Chip`, `ProgressBar` |
| `molecules/` | atoms, theme | app state, navigation, data fetching | `FormField`, `ChipGroup`, `OptionTile` |
| `organisms/` | molecules, atoms, theme | navigation | `OnboardingShell` |

Two rules keep the layering honest:

1. **Imports point downward only.** An atom importing a molecule is a defect, not
   a shortcut — it means the atom is really a molecule.
2. **No component below a route reads global state or navigates.** Data and
   callbacks arrive as props, which is what makes these testable without a
   navigator. `OnboardingShell` takes `onNext` and `onBack`; it does not know
   `router` exists.

Routing lives in `src/app/`, and feature state lives in `src/modules/<name>/`.
