# Design Rules for This Project

## Project Design Pattern: ---

## Visual Style

### Color Palette:
- Background: #F9FAFB (very light gray, main background)
- Primary Text: #111827 (almost black, used for headings)
- Secondary Text: #6B7280 (medium gray, for subtext and descriptions)
- Sidebar & Card Background: #FFFFFF (pure white, for cards and sidebar)
- Accent Blue: #2563EB (used for active tab underline and interactive states)
- Status Green: #34D399 (used for "Published" status labels)
- Status Gray: #D1D5DB (used for "Archived" status labels, dividers)
- Icon Gray: #9CA3AF (used for icons and secondary UI elements)

### Typography & Layout:
- Font Family: Sans-serif (likely Inter, with clean, geometric shapes)
- Font Weights: Bold (headings), Medium (navigation and labels), Regular (body text)
- Hierarchy: Large, bold page titles; medium-weight navigation; smaller, lighter detail text
- Spacing: Generous padding and margin between elements (24–32px gutters), airy, uncluttered
- Alignment: Left-aligned text and components; consistent vertical spacing between sections
- Typography Treatments: Clear distinction between headings (larger, bold) and descriptions (smaller, lighter)

### Key Design Elements
#### Card Design:
- Style: Flat, white cards with very subtle rounded corners (8px)
- Shadows: Extremely soft, almost imperceptible drop shadow for depth
- Borders: No visible borders; separation via shadow and spacing
- Hover States: Slight elevation or shadow increase on hover
- Visual Hierarchy: Title bold and prominent, status chips above, description below

#### Navigation:
- Pattern: Vertical sidebar with icons and text labels, profile section at top
- Sidebar: White, separated by subtle shadow from main content
- Active State: Active menu highlighted with a pill-shaped background (#F3F4F6), bold text
- Collapsible: No evidence of collapsibility; always visible navigation

#### Data Visualization:
- Chart Styles: Not present in the image; layout suggests placeholders for data visualization with soft gray backgrounds (#F3F4F6)
- Visual Treatments: Placeholder icons or thumbnail previews use soft muted grays

#### Interactive Elements:
- Buttons: Not explicitly shown; expect rounded, filled or outlined styles in accent blue (#2563EB)
- Tabs: Underlined active tab in accent blue, inactive tabs in gray
- Chips/Status Labels: Rounded pill shapes, filled with status color (green for published, gray for archived)
- Form Elements: Not shown, but likely minimalist with outlined/ghost styles and clear focus states
- Hover Effects: Subtle shadow or background change, cursor pointer on interactive elements
- Micro-interactions: Clean, unobtrusive, focused on clarity

### Design Philosophy
This interface embodies:
- A modern, ultra-minimalist B2B SaaS aesthetic focused on clarity and usability
- Design principles of simplicity, whitespace, and functional hierarchy—no visual clutter or unnecessary decoration
- A serious yet approachable tone, prioritizing professional trust and effortless navigation
- Visual strategy aims for rapid scannability, ease of onboarding, and low cognitive load, ideal for technical and industrial user personas

---

This project follows the "---

## Visual Style

### Color Palette:
- Background: #F9FAFB (very light gray, main background)
- Primary Text: #111827 (almost black, used for headings)
- Secondary Text: #6B7280 (medium gray, for subtext and descriptions)
- Sidebar & Card Background: #FFFFFF (pure white, for cards and sidebar)
- Accent Blue: #2563EB (used for active tab underline and interactive states)
- Status Green: #34D399 (used for "Published" status labels)
- Status Gray: #D1D5DB (used for "Archived" status labels, dividers)
- Icon Gray: #9CA3AF (used for icons and secondary UI elements)

### Typography & Layout:
- Font Family: Sans-serif (likely Inter, with clean, geometric shapes)
- Font Weights: Bold (headings), Medium (navigation and labels), Regular (body text)
- Hierarchy: Large, bold page titles; medium-weight navigation; smaller, lighter detail text
- Spacing: Generous padding and margin between elements (24–32px gutters), airy, uncluttered
- Alignment: Left-aligned text and components; consistent vertical spacing between sections
- Typography Treatments: Clear distinction between headings (larger, bold) and descriptions (smaller, lighter)

### Key Design Elements
#### Card Design:
- Style: Flat, white cards with very subtle rounded corners (8px)
- Shadows: Extremely soft, almost imperceptible drop shadow for depth
- Borders: No visible borders; separation via shadow and spacing
- Hover States: Slight elevation or shadow increase on hover
- Visual Hierarchy: Title bold and prominent, status chips above, description below

#### Navigation:
- Pattern: Vertical sidebar with icons and text labels, profile section at top
- Sidebar: White, separated by subtle shadow from main content
- Active State: Active menu highlighted with a pill-shaped background (#F3F4F6), bold text
- Collapsible: No evidence of collapsibility; always visible navigation

#### Data Visualization:
- Chart Styles: Not present in the image; layout suggests placeholders for data visualization with soft gray backgrounds (#F3F4F6)
- Visual Treatments: Placeholder icons or thumbnail previews use soft muted grays

#### Interactive Elements:
- Buttons: Not explicitly shown; expect rounded, filled or outlined styles in accent blue (#2563EB)
- Tabs: Underlined active tab in accent blue, inactive tabs in gray
- Chips/Status Labels: Rounded pill shapes, filled with status color (green for published, gray for archived)
- Form Elements: Not shown, but likely minimalist with outlined/ghost styles and clear focus states
- Hover Effects: Subtle shadow or background change, cursor pointer on interactive elements
- Micro-interactions: Clean, unobtrusive, focused on clarity

### Design Philosophy
This interface embodies:
- A modern, ultra-minimalist B2B SaaS aesthetic focused on clarity and usability
- Design principles of simplicity, whitespace, and functional hierarchy—no visual clutter or unnecessary decoration
- A serious yet approachable tone, prioritizing professional trust and effortless navigation
- Visual strategy aims for rapid scannability, ease of onboarding, and low cognitive load, ideal for technical and industrial user personas

---" design pattern.
All design decisions should align with this pattern's best practices.

## SaaS App Pattern

### Authentication & Onboarding
**Clear user flows:**
- Implement clear authentication flows
- Social login options (Google, GitHub)
- Email verification process
- Password reset functionality
- Create intuitive onboarding experience
- Progressive onboarding (don't overwhelm)
- Interactive tutorials or product tours
- Welcome screens with clear next steps

### Settings & Configuration
**User control:**
- Design settings pages with clear sections
- Use tabs or sidebar navigation for settings categories
- Provide helpful descriptions for each setting
- Include reset to defaults option
- Show save indicators and success feedback
- Implement unsaved changes warnings

### Feature Management
**Progressive disclosure:**
- Use progressive disclosure for complex features
- Add helpful tooltips and documentation links
- Provide contextual help throughout the app
- Include empty states with guidance
- Feature discovery through onboarding

### Billing & Subscriptions
**Clear pricing:**
- Implement billing/subscription management UI
- Clear pricing tiers and feature comparison
- Usage metrics and limits display
- Upgrade/downgrade flows
- Invoice history and download options

---

---

## General Design Principles

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Dark mode with elevated surfaces

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)
- Test colors in both light and dark modes

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)
- Adjust shadow intensity based on theme (lighter in dark mode)

---

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast (both themes)
- Respect reduced motion preferences

---

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions
9. **Be Themeable** - Support both dark and light modes seamlessly

---

