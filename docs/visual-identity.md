# Lastro — Visual Identity Guide

> **More control. A more solid future.**  
> Lastro is a personal finance manager that turns financial data into clarity, confidence, and peace of mind.

## 1. Brand essence

### Positioning
A modern, premium personal finance experience with a clean interface, clear tools, and a welcoming tone. The brand should convey solidity without feeling rigid, and technology without relying on glow, neon, or excessive effects.

### Pillars
- **Security:** information organized and presented clearly.
- **Control:** an understandable view of income, expenses, and budget.
- **Planning:** realistic financial goals and progress tracking.
- **Lightness:** less visual noise, more focus on what matters.

### Personality
- Modern, serene, and trustworthy.
- Sophisticated, yet approachable.
- Minimalist, without feeling cold.
- Technological, without an exaggerated futuristic aesthetic.

### Tone of voice
Use direct, human, and calm sentences. Avoid alarmism, judgment, and promises of getting rich.

**Examples**
- "Your financial overview, all in one place."
- "Plan today, achieve tomorrow."
- "Small steps also build stability."
- "See where your money is going."

## 2. Visual direction

The visual language combines the simplicity of contemporary minimalism with the polish of a premium fintech. The palette keeps the family of greens, graphites, and warm tones, but lowers saturation and contrast for a comfortable, pastel look.

### Principles
1. **Clear hierarchy:** the balance and priority information should be easy to find.
2. **Room to breathe:** use generous margins and avoid crowded screens.
3. **Functional contrast:** pastel must not mean faded text; ensure legibility.
4. **Color with purpose:** reserve greens for positive actions and primary states.
5. **Subtle effects:** prefer solid surfaces, soft borders, and almost imperceptible gradients.

## 3. Color palette

### Core colors

| Token | Hex | Usage |
|---|---|---|
| `forest-900` | `#19352F` | Main dark background and deep surfaces |
| `forest-700` | `#315A50` | Headers, active navigation, and brand elements |
| `sage-500` | `#8DB8A5` | Main accent color in dark mode |
| `mint-200` | `#C7E3D5` | Soft highlights, charts, and positive states |
| `graphite-900` | `#252C2A` | Main text on light surfaces |
| `graphite-700` | `#48534F` | Secondary text and icons |
| `stone-200` | `#D9E0DA` | Borders and dividers |
| `cream-100` | `#F5F3EC` | Main background in light mode |
| `cream-50` | `#FBFAF6` | Cards and elevated light surfaces |

### Semantic colors

| Token | Hex | Usage |
|---|---|---|
| `success` | `#8DB8A5` | Positive indicators and goals in progress |
| `success-soft` | `#DDECE3` | Soft background for positive messages |
| `expense` | `#C9827A` | Expenses and moderate financial alerts |
| `expense-soft` | `#F2E0DC` | Soft background for expense alerts |
| `warning` | `#D5B978` | Attention and budget close to the limit |
| `warning-soft` | `#F3EBD5` | Background for warnings |
| `info` | `#91B8C4` | Neutral information and analytical elements |
| `info-soft` | `#E0EDF0` | Background for information |

### How to apply
- **Dark mode:** background `#101815`, cards `#19231F`, borders `#2D3A34`, main text `#F5F3EC`, and accent `#A7CDB8`.
- **Light mode:** background `#F5F3EC`, cards `#FBFAF6`, main text `#252C2A`, secondary text `#59645F`, and accent `#527E6B`.
- Avoid using `sage-500` as small text on light backgrounds. For text, prefer `forest-700` or a darker color.
- Don't use green to communicate every state: expenses, warnings, and information should have their own signals, accompanied by text or icons.

## 4. Logo and symbol

### Concept
A simple geometric symbol that combines the letter **L** with the idea of a base, balance, or trajectory. Shapes should be rounded and compact, and read clearly at small sizes.

### Usage rules
- Prefer the symbol in sage green on a dark green or cream background.
- Use the monochrome version in compact contexts, such as favicons and avatars.
- Keep a clear space around it equal to at least half the width of the symbol.
- Don't distort, skew, outline, or apply a neon glow to the logo.
- Avoid strong gradients; if a gradient is used, apply only a subtle transition between two soft greens.

### Signature
**Lastro**  
*Financial planning*

## 5. Typography

### Recommended typefaces
**Sora** for headings and brand elements, paired with **Inter** for body text, forms, and interface data.

| Element | Recommendation |
|---|---|
| Main heading | Sora Semibold, 28–36 px |
| Section heading | Sora Medium, 20–24 px |
| Featured balance | Inter Medium, 30–40 px |
| Interface text | Inter Regular, 14–16 px |
| Labels and metadata | Inter Medium, 12–14 px |
| Buttons | Inter Semibold, 14–16 px |

Use tabular numbers for monetary values and tables whenever available. Avoid mixing too many font weights or using long all-caps text.

## 6. Interface components

### Cards
- Moderately rounded corners: 16–20 px.
- Solid background or a subtle tonal difference from the page.
- Thin, discreet borders; light shadows only when necessary.
- Consistent padding, preferably 16–24 px.

### Buttons
- **Primary:** deep green in light mode; sage green with dark text in dark mode.
- **Secondary:** transparent or tonal surface with a discreet border.
- **Danger:** expense color, with explicit text describing the action.
- Focus, pressed, disabled, and loading states must be distinct and accessible.

### Fields and filters
- Labels always visible.
- Fields with comfortable height, soft borders, and a clear focus state.
- Use pill-shaped filters sparingly.
- Don't rely on color alone to indicate selection or error.

### Charts
- Use smooth lines and few simultaneous elements.
- Highlight one main series; keep the others in complementary pastel tones.
- Show the legend, period, and relevant values.
- Pair colors with labels or patterns when needed for accessibility.

### Icons
- Linear, simple, and consistent style.
- Stroke width of approximately 1.75–2 px.
- Common size of 20–24 px for navigation and actions.
- Avoid mixing filled, 3D, and outline icons of different styles.

## 7. Suggested product structure

### Main navigation
- Home
- Transactions
- Budgets
- Goals
- Reports
- Profile and settings

### Dashboard
1. Brief greeting and period selector.
2. Total balance card and change over the period.
3. Income and expense summary.
4. Spending-by-category chart.
5. Recent transactions.
6. Financial goal progress.

The balance should be the most prominent element, but should not fill the entire screen. The interface needs to help answer quickly: **how much do I have, how much have I spent, and what deserves my attention?**

### Transactions
- Clear list with description, category, date, and amount.
- Income and expenses distinguished by color, sign, and text.
- Accessible search and filters.
- An easy-to-find action for adding a transaction.

### Goals
- Name, target amount, amount saved, and deadline.
- Pastel progress indicator.
- Suggested next action, without language of pressure or guilt.

### Reports
- Toggle between monthly and yearly periods.
- Comparison with the previous period.
- Categories and trends with clear legends.
- Export and detail views without excess decorative elements.

## 8. Spacing, shape, and motion

- Spacing base: multiples of 4 px.
- Distance between sections: 24–32 px.
- Distance between related elements: 8–16 px.
- Field corners: 10–12 px.
- Card corners: 16–20 px.
- Short, discreet transitions, approximately 150–220 ms.
- Animations should explain state changes, not merely decorate.

## 9. Accessibility and legibility

- Aim for WCAG AA compliance for text contrast.
- Normal text: minimum contrast of 4.5:1; large text: 3:1.
- Check the contrast of each actual text and background combination — don't assume all pastel colors are accessible.
- Don't communicate income, expense, error, or success through color alone.
- Provide visible keyboard focus, field labels, and helpful error messages.
- Respect the system's reduced-motion preferences.

## 10. Consistency principles

**Do**
- Keep a few dominant tones and reserve accent colors for important actions.
- Use the same spacing, typography, and radius system on all screens.
- Prioritize clarity, readability, and predictability.
- Test light and dark modes separately.

**Avoid**
- Neon, excessive glow, and saturated gradients.
- Heavy shadows, exaggerated glassmorphism, and too many cards.
- Too many charts competing for attention.
- Intense red or alarmist language for ordinary expenses.
- Metrics without context, ambiguous labels, and numbers that are too small.

## 11. Identity summary

Lastro is a **serene, solid, and contemporary** personal finance brand. Its aesthetic merges the cleanness of minimalist design with the trustworthiness of a premium fintech, using natural greens, graphites, and cream tones in a pastel palette. The experience should feel technological, yet human; sophisticated, yet easy to use.

> **Lastro — Plan today, achieve tomorrow.**
