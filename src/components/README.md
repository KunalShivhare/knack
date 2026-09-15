# Components

Organised by atomic design. The layer a component belongs to is decided by what
it is allowed to know about, not by how big it is.

| Layer | May import | Must not | Examples |
| --- | --- | --- | --- |
| `atoms/` | theme tokens only | other components, app state, navigation | `Text`, `Button`, `Chip`, `ProgressBar` |
| `molecules/` | atoms, theme | app state, navigation, data fetching | `FormField`, `TechniqueCard`, `OptionTile` |
| `organisms/` | molecules, atoms, theme | navigation | `TechniqueList`, `OnboardingStep`, `PlanHeader` |

Two rules keep the layering honest:

1. **Imports point downward only.** An atom importing a molecule is a defect, not
   a shortcut — it means the atom is really a molecule.
2. **No component below `organisms/` reads global state or navigates.** Data and
   callbacks arrive as props, which is what makes these testable in isolation.

Screen composition and routing live in `src/app/`, not here.
