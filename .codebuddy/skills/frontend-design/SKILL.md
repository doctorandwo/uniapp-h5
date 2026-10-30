---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail
- All animations powered by GSAP for smooth, performant motion

## Frontend Aesthetics Guidelines

Focus on:
- **Spacing & sizing units**: When using length units such as **`px`**, **`vw`**, **`vh`**, **`vmin`**, **`vmax`**, **`rem`**, **`em`**, etc., **do not use odd numeric values** (e.g. `11px`, `13px`, `15px`, `3.5vw`). Prefer **even** values (e.g. `12px`, `14px`, `16px`, `4vw`) so spacing and alignment stay visually consistent and snap cleanly on typical displays. Only deviate when matching an existing design token or third-party constraint.
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: ALL animations MUST be implemented using GSAP (GreenSock Animation Platform). Use GSAP timelines for complex sequences, ScrollTrigger for scroll-based animations, and GSAP's powerful easing functions for smooth, professional animations. Focus on high-impact moments: one well-orchestrated page load with staggered reveals using GSAP's stagger feature creates more delight than scattered micro-interactions. Use GSAP's ScrollTrigger plugin for scroll-triggered animations and GSAP's event listeners for hover states that surprise. Leverage GSAP's performance optimizations (transform and opacity properties) for GPU-accelerated animations. Always import GSAP: `import { gsap } from 'gsap'` and register plugins like `gsap.registerPlugin(ScrollTrigger)` when needed.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive GSAP animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Even subtle animations should use GSAP for consistency and performance. Elegance comes from executing the vision well with GSAP's powerful animation capabilities.

## GSAP Animation Guidelines

When implementing animations:
- **Always use GSAP**: Never use CSS animations or transitions. All motion must be GSAP-powered.
- **Timelines for sequences**: Use `gsap.timeline()` for complex animation sequences with precise timing control.
- **Stagger effects**: Use GSAP's stagger feature for animating multiple elements in sequence: `gsap.from(elements, { stagger: 0.1, ... })`
- **ScrollTrigger**: Use `ScrollTrigger` plugin for scroll-based animations: `gsap.registerPlugin(ScrollTrigger)`
- **Performance**: GSAP automatically uses transform and opacity for GPU acceleration. Avoid animating layout properties.
- **Easing**: Leverage GSAP's extensive easing functions: `power2.out`, `power3.out`, `back.out`, `elastic.out`, `expo.out`, etc.
- **Cleanup**: Always clean up GSAP animations and ScrollTriggers in component unmount lifecycle hooks.
- **Accessibility**: Respect `prefers-reduced-motion` by checking `window.matchMedia('(prefers-reduced-motion: reduce)')` and disabling GSAP animations when needed.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
