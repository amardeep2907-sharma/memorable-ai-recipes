# Memorable — Visual identity

A warm, ink-on-paper cookbook feel — closer to a well-used recipe box
than a SaaS dashboard.

## Palette
| Token          | Hex       | Use                              |
|----------------|-----------|-----------------------------------|
| `paper`        | `#F6F1E7` | Background (warm parchment)       |
| `ink`          | `#241F1A` | Primary text                      |
| `plum`         | `#7A2E3B` | Primary accent (buttons, links)   |
| `plum-dark`    | `#571F28` | Hover state                       |
| `sage`         | `#4A5D45` | Secondary accent                  |
| `mustard`      | `#D9A441` | Tags / highlight badges           |
| `line`         | `#E3DAC9` | Hairline borders on paper         |

## Type
- **Display** — Fraunces (serif, used italic for headings/hero text)
- **Body / UI** — Inter
- **Data / mono** — JetBrains Mono, used specifically for nutrition
  facts and timing chips — the "recipe index card" motif

## Signature element
Nutrition facts, prep time, and like/save counts render as small
mono-font pill chips (`.data-chip` in `globals.css`) rather than plain
text — a nod to the numeric shorthand on the back of a recipe card.
The homepage hero also has a faint scattered-ingredient-name texture
behind the headline, tying the "what's in your kitchen" pitch to the
visual itself.

Keep new pages within this system: reuse `.card`, `.btn-primary`,
`.btn-secondary`, and `.data-chip` from `globals.css` rather than
introducing new one-off styles.
