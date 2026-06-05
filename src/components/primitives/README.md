# MoveCare primitives

The shared component layer for the app's design system. **Compose these primitives instead of writing new component CSS.** If you find yourself adding a `.btn-*`, `.form-input`, `.card`, `.modal-*` class to a page stylesheet, reach for a primitive instead.

See everything rendered live at the **`/styleguide`** route.

## Foundations

All design values are tokens in `src/styles/tokens.css` (`var(--accent)`, `var(--space-4)`, `var(--text-lg)`, `var(--radius-md)`, `var(--ease-standard)`, …). Never hardcode hex/rgba/px in component CSS — add or reuse a token.

## Primitives

| Import | Use for |
| --- | --- |
| `Button` | All buttons. `variant` (primary/secondary/ghost/danger) × `size` (sm/md/lg), `iconLeft/Right`, `loading`, `fullWidth`. |
| `IconButton` | Icon-only buttons. `variant` (subtle/outline/ghost), `shape` (square/circle), requires `label`. |
| `Card` | Surfaces. `padding`, `radius`, `interactive`, polymorphic `as`. |
| `Badge` | Non-interactive status pills. `tone` or a custom `color`. |
| `Chip` | Selectable pills. `selected`, `tone`, `size`. |
| `TextField` / `Textarea` / `Select` | Form controls. `error`, `leadingIcon` (TextField). |
| `FormField` | Label + control + hint/error wrapper. Owns `.has-error` (used by `scrollToFirstError`). `colSpan`. |
| `FormSection` | Card section with icon+title header and a `columns` field grid. |
| `Toggle` | iOS switch. Bare, or a labeled row via `label`/`description`. |
| `SearchInput` | Search box with leading icon. |
| `Tabs` | Segmented control. `variant` (slide/flat); encapsulates the sliding-indicator logic. |
| `Modal` / `Drawer` | Overlays (portal, Esc-to-close, scroll-lock). |

```tsx
import { Button, FormSection, FormField, TextField } from "../components/primitives";

<FormSection title="Dados" icon={<User size={16} />}>
  <FormField label="Nome" required error={errors.nome} htmlFor="nome">
    <TextField id="nome" value={nome} onChange={e => setNome(e.target.value)} error={!!errors.nome} />
  </FormField>
</FormSection>
<Button variant="primary" onClick={save}>Salvar</Button>
```

## Conventions

- Class names are prefixed `ds-` so they never collide with legacy page CSS during migration.
- Primitives opt out of the global `button` hover-lift via the `.ds-btn` guard in `index.css`.
- Legacy pages still using `.btn-*`/`.form-input`/etc. keep working; migrate them page-by-page to primitives.
