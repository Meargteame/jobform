# BetterForm — Design System (paste this to your AI assistant)

You are building UI, marketing, and brand assets for **BetterForm**, a SaaS product for creating job application forms and managing candidates. Tagline: **"Create better job applications."** Follow this system exactly. Do not add gradients, glows, glassmorphism, 3D effects, stock icons, or decorative shapes. When something is not specified here, choose the quieter, more structured option (Swiss / editorial restraint).

## 1. Brand idea
The mark says: *a form gains structure, and the candidate rises out of it.*
Three left-aligned field rows grow longer (progression); a single green dot (the applicant) sits where the next step would be, inside a curved corner (a page fold). The meaning is discovered, never literal. No checkmarks, documents, clipboards, user silhouettes, briefcases, network nodes, or B+F monograms anywhere in the brand.
Personality: confident, intelligent, approachable, professional, modern.

## 2. Logo
Files: betterform-symbol.svg, -symbol-reversed.svg, -symbol-mono-black.svg, -symbol-mono-white.svg, -logo-horizontal.svg, -logo-horizontal-reversed.svg.

**Symbol geometry (96 × 96 grid, single compound path, even-odd fill):**
- Body: square 96, corner radii TL 12, TR **48**, BR 12, BL 12.
- Field rows (cut out as negative space, 12 high, left edge x=20): y=22 width 24; y=42 width 40; y=62 width 56.
- Candidate dot: circle r=7 at (74, 30), cut out of the body; in colour versions a green circle fills it.
SVG path: `M12 0H48A48 48 0 0 1 96 48V84A12 12 0 0 1 84 96H12A12 12 0 0 1 0 84V12A12 12 0 0 1 12 0ZM20 22h24v12H20ZM20 42h40v12H20ZM20 62h56v12H20ZM67 30a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z`

**Versions:** primary (near-black body, green dot, on light) · reversed (off-white body, green dot, on black) · mono black / mono white (dot is plain negative space, one ink) · app icon (symbol at 60% of a black tile, tile radius 22.5% of its size; alt: green tile with black symbol).
**Wordmark:** "Better" Hanken Grotesk 500 + "Form" Hanken Grotesk 700, one word, no space, letter-spacing −4.5% (−0.045em). Never recolor halves, never all caps. Horizontal lockup: symbol height ≈ 1.1–1.2× the wordmark cap-to-descender height, gap ≈ 0.3× symbol width.
**Clear space:** at least 0.25 × symbol width on all sides. **Minimum size:** symbol 16 px (favicon 32 px preferred; test at 20 px), horizontal logo 96 px wide. Below 24 px use the symbol alone.
**Never:** rotate, stretch, outline, add shadows, change the dot color, place on busy photos, recolor the body green, or redraw the curve.

## 3. Color
| Token | Hex | Use |
|---|---|---|
| ink | #0B0B0C | text, symbol body, dark surfaces |
| paper | #F2F1EC | default light background, symbol on dark |
| paper-2 | #E7E6DF | secondary light surface |
| white | #FFFFFF | cards on paper, mono-on-white |
| green (signal) | #13E884 | the single accent: the dot, primary CTA on dark, selected / qualified states, focus rings |
| muted | #6B6A63 | secondary text on light (≈5:1 on paper) |
| muted-dark | #8E8D85 | secondary text on ink |
| line | #0B0B0C at 13% | hairlines, borders |

Rules: one accent only. Green is a signal, not a theme: use it sparingly (at most one or two green elements per screen). **Green text on light backgrounds fails contrast (~1.7:1): never use it; use ink text on a green fill.** Green on ink is ~11:1 and is fine. Required text contrast 4.5:1 (3:1 for 24px+). Status colors (error/warning) should be muted red/amber, used only for system states, never in brand surfaces.

## 4. Typography
- Primary: **Hanken Grotesk** (Google Fonts), weights 500, 600, 700. Fallback: "Helvetica Neue", Arial, sans-serif.
- Labels / metadata: **DM Mono** 400, 12px, uppercase, letter-spacing 0.12em.
- Never use Inter, Roboto, rounded or futuristic fonts.
- Scale (px / line-height / tracking): Display 104–46 / 1.0–1.05 / −0.04em, 700 · H1 40 / 1.1 / −0.03em, 700 · H2 28 / 1.2 / −0.02em, 700 · H3 22 / 1.25 / −0.02em, 700 · Body 17 / 1.5 / 0, 500 · Small 14 / 1.45 / 0, 500 · Label 12 mono.
- Headlines are tight and left-aligned; body measure ≤ 65 characters. Sentence case everywhere except mono labels.

## 5. Layout, shape, components (extension of the brand; use these for product UI)
- Spacing base 4px; steps 4, 8, 12, 16, 24, 32, 48, 64. Marketing page max width 1200–1440, generous whitespace, strong left alignment, hairline dividers instead of boxes.
- Radii: 8 inputs/buttons, 12 cards, 22.5% on app-icon tiles. Echo the logo: occasional single large-radius corner (48) on hero shapes is allowed; do not apply it to everything.
- Borders: 1px line color. No shadows; if elevation is essential, a single 1px border plus a 0 1px 0 offset.
- Buttons: primary = ink fill / paper text on light; on dark = green fill / ink text. Secondary = 1px ink border, no fill. Height 44, padding 0 20, weight 600.
- Form fields (the product's core): label above in 14px 600, input 44px high, 1px line border, 8 radius, focus = 2px green ring offset by 2px (on light add a 1px ink inner border so focus is visible). Rows left-aligned and stacked: the field-row motif from the logo is the product's visual signature; progress between steps may use bars of increasing length.
- Candidate states: "new" = ink dot, "qualified / selected" = green dot, "rejected" = hollow ring. The dot is the brand's unit of meaning; reuse it as a bullet and status marker.
- Icons: 1.5px stroke, square caps, geometric, no filled icon sets, no emoji.
- Motion: minimal; 150–200ms ease-out; the dot may move one step along the rows to show progress. No bouncing, no parallax.

## 6. Voice
Direct, plain, specific. Short sentences. Say what the product does for hiring teams and applicants (clear forms, fewer drop-offs, easier candidate review). No hype words, no exclamation marks, no "revolutionize / supercharge / AI-powered" filler.

## 7. Checklist before shipping any asset
Dark/light correct? One green accent only? Logo clear space and min size respected? Wordmark in Hanken Grotesk 500/700 with −4.5% tracking? Text contrast passes? No gradients, glows, shadows or stock icons?
