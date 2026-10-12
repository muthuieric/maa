---
version: 1.0.0
name: Mara Savanna Civic AI
description: Culturally respectful, accessible research UI for detecting harmful practice narratives in rural Kenya (Narok and Kajiado Counties).
colors:
  primary: "#23291B"
  primary-hover: "#3C452E"
  accent-earth: "#A55B2E"
  accent-earth-light: "#F9EEE5"
  background: "#F8FAFC"
  surface: "#FFFFFF"
  surface-muted: "#F1F5F9"
  text-primary: "#0F172A"
  text-secondary: "#475569"
  text-muted: "#94A3B8"
  border: "#E2E8F0"
  border-focus: "#23291B"
  status-success: "#15803D"
  status-warning: "#D97706"
  status-danger: "#B91C1C"
  status-info: "#0284C7"
typography:
  display-lg:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  heading-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  label-sm:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.01em
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: 12px
---

# Mara Savanna Civic AI Design Specification

## Overview
This interface serves researchers, field officers, and community-based organisations (CBOs such as Tareto Africa Trust) collecting and analysing sensitive community discourse on female genital mutilation (FGM) and child marriage in rural Narok and Kajiado Counties, Kenya.
The design prioritises:
1. **Dignity and Ethical Clarity:** Prominent consent gating, clear community data ownership notifications, and absence of sensationalism.
2. **Rural & Mobile Accessibility:** Clean contrast for outdoor field tablet view, large tap targets, offline-first sync status cues.
3. **Trilingual Fluency:** Seamless interface switching across English, Swahili, and Maa.

## Colors
- **Savanna Forest Primary (`#23291B`):** Deep organic green reflecting dignity, institutional grounding, and calm authority.
- **Earth Ochre Accent (`#A55B2E`):** Warm clay/ochre honoring regional earth tones without resorting to stereotypical or hyper-saturated palettes.
- **Calm Neutral Canvas (`#F8FAFC` & `#FFFFFF`):** High readability, distraction-free environment for sensitive narrative reading.
- **No Purple Palette:** Strictly follows the Anti-Purple protocol.

## Typography
- System Sans-serif stack (`Inter`, system-ui) optimized for legibility on low-cost Android tablets and desktop browsers alike.
- Clear typographic hierarchy separating administrative metadata from verbatim narrative text.

## Layout
- Mobile-first, single-column workflow on small screens with collapsible contextual guidance.
- Wide 1200px max-width container on desktop with sticky quick-actions and live analysis feedback panes.

## Elevation & Depth
- Flat-to-subtle elevations (`shadow-sm` to `shadow-md`), avoiding excessive drop shadows or noisy gradients.
- Border-defined card containers (`#E2E8F0`) maintaining structural clarity in high-glare environments.

## Shapes
- Softened 8px (`rounded-md`) to 12px (`rounded-lg`) borders offering warmth while maintaining clinical rigor.

## Components
- **Bilingual Entry Form:** Clear sectioned inputs with auto-expanding narrative textarea.
- **Mandatory Consent Gate:** High-visibility banner and modal preventing accidental submission without informed consent confirmation.
- **Sync Status Badge:** Real-time indicator for network state and offline queue status.
- **Prediction Breakdown Card:** Visual bar for classification confidence, highlighted dialect markers, and qualitative stance explanation.

## Do's and Don'ts
- **DO** display community dialect definitions inline so non-Maa-speaking researchers understand matched terms.
- **DO** make the consent checkbox unskippable and prominent.
- **DON'T** use purple or neon gradient buttons.
- **DON'T** hide offline sync errors or fail silently when network disconnects.

