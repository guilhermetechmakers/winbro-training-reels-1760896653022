# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

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

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

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
- Sufficient color contrast
- Respect reduced motion preferences

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


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Winbro Training Reels - Development Blueprint

Winbro Training Reels is a web-based B2B SaaS platform for capturing, organizing, and delivering ultra-short (20–30s) instructional video reels that document machine operation, tooling, maintenance, troubleshooting, and processing techniques. It provides customer-scoped libraries, powerful search across transcripts/metadata, a course builder with quizzes and certificates, admin moderation and subscription management, integrations for media processing, transcription, billing and analytics, and enterprise-grade security.

## 1. Pages (UI Screens)

- Landing Page (Public)
  - Purpose: Market product, capture leads, surface value props, pricing teaser and demo requests.
  - Key sections/components: Hero (headline, subheadline, CTA buttons Request Demo/Subscribe, hero video), Features Overview (cards), How It Works (3-step graphic), Customer Logos & Testimonials carousel, Pricing Teaser, Request Demo Form (name, company, email, machines owned), Footer (privacy, TOS, help, social).

- Login / Signup Page
  - Purpose: Authentication entrypoint supporting SSO/SSO-like flows and invite acceptance.
  - Key sections/components: Login Form (email, password, remember me), SSO Buttons (SAML/SSO, Google Workspace), Signup Form (company, name, email, password, TOS), Invite Flow accept link, Links (password reset, contact sales).

- User Profile
  - Purpose: Manage user identity, security and preferences.
  - Key sections/components: Profile Summary (avatar, name, role, company), Account Settings (email, display name, timezone, language), Password Management (change password, 2FA enroll/disable), Notification Preferences (email/in-app/webhook), Subscription & Seats summary, Activity Log (sessions, logout other sessions).

- Password Reset
  - Purpose: Secure password recovery.
  - Key sections/components: Request Reset Form (email), Reset Form (new password + confirm + token validation), Feedback messages, Password strength meter and rules.

- Email Verification
  - Purpose: Confirm email for new accounts; allow resends.
  - Key sections/components: Verification Landing (success/error), Resend Verification Button, Instructions.

- Dashboard
  - Purpose: Primary post-login landing that personalizes content and actions.
  - Key sections/components: Top Nav (global search, notifications, profile, help), Quick Search Bar (autocomplete, suggested tags), Recommended Reels carousel, Assigned Courses & Progress cards with progress bars, Recent Activity & Bookmarks list, Analytics Snapshot (managers), Create Button (upload reel / create course).

- Content Library / Browse
  - Purpose: Discover and manage reels and courses.
  - Key sections/components: Filter Sidebar (machine model, process, tool, skill level, tags, date range, author), Sort Controls (relevance/newest/most-viewed), Results Grid/List (thumbnail, title, duration, tags, customer badge), Advanced Search Bar (natural language + filters, transcript snippet preview), Bulk Actions (admin), Pagination / Infinite Scroll toggle.

- Video Reel Player
  - Purpose: Play reels with full metadata, transcript and actions.
  - Key sections/components: Video Player (HLS/DASH, poster, controls, captions toggle), Metadata Panel (title, duration, machine model, author, date, tags, customer scope), Transcript Panel (searchable, time-linked), Actions Bar (bookmark, add-to-course, report, share, download if allowed), Related Reels, Comments / Notes (timestamped), Quality/Access indicator.

- Course Builder
  - Purpose: Create structured courses from reels, quizzes and resources.
  - Key sections/components: Course Metadata Form, Drag-and-Drop Timeline (reels, text blocks, attachments), Quiz Builder (MCQ, T/F, short answer, thresholds), Preview Mode, Publish Controls (visibility, assign to users/groups, schedule), Versioning & Draft Save (autosave, history).

- Course Player
  - Purpose: Learner experience for consuming courses and assessments.
  - Key sections/components: Course Sidebar (module list, progress), Module Player (sequential reel playback), Inline Quiz Modals, Certificate Modal (downloadable signed PDF), Notes & Bookmarks, Completion Summary (score, time spent).

- Admin Dashboard
  - Purpose: Platform and customer administration, moderation, analytics.
  - Key sections/components: Overview Cards (customers, videos, courses, views), Links to User Management, Library Management (approval queue), Subscription Management, Analytics & Reports, System Settings Shortcut.

- User Management (Admin)
  - Purpose: Manage users, roles, invites and seat allocations.
  - Key sections/components: User Table (search/filters), User Detail Modal (profile, role change, sessions), Role Templates, Invite Flow (batch CSV).

- Upload / Create Reel
  - Purpose: Guided uploader for short reels with metadata and auto-processing.
  - Key sections/components: Upload Widget (drag/drop, progress, resumable), Capture Guidance checklist, Metadata Form (title, model, process, tooling, tags, skill), Auto-Transcribe Toggle, Auto-Tag suggestions, Preview & Submit (trim, poster), Submit/submit-for-review.

- Edit / Manage Reel
  - Purpose: Update metadata, access controls, and reprocessing.
  - Key sections/components: Metadata Editor, Access Controls (visibility/assignments), Reprocess Actions (re-transcribe, re-tag), Usage Insights, Delete/Archive.

- Content List (Admin)
  - Purpose: Admin listing of all reels with moderation actions.
  - Key sections/components: Table (thumbnail, title, duration, status, customer, uploaded by, actions), Bulk Controls (approve/assign/archive), Filters & Search.

- Checkout / Payment Page
  - Purpose: Purchase subscriptions, seats, and add-ons.
  - Key sections/components: Plan Summary, Payment Form (Stripe Elements), Invoice Preview, Confirmation CTA, Legal acknowledgement.

- Subscription & Billing History
  - Purpose: View invoices, payment methods, and subscription details.
  - Key sections/components: Invoice List (downloadable PDFs), Subscription Details, Payment Methods management, Billing support CTA.

- About / Help
  - Purpose: Documentation and support resources.
  - Key sections/components: Searchable Help Center, Video Best Practices, Contact Support Form & chat link, System Status & Release Notes.

- Privacy Policy, Terms of Service, Cookie Policy
  - Purpose: Legal and compliance pages; cookie consent management.
  - Key sections/components: Policy texts, contact info, consent toggles (Cookie Policy).

- 404 Not Found & 500 Server Error
  - Purpose: Friendly error experiences with recovery paths.
  - Key sections/components: Error message, search box or retry button, suggested links, contact support CTA.

- Loading / Success Pages
  - Purpose: Generic in-progress and success feedback.
  - Key sections/components: Loading skeletons, Success modals for uploads/publishes/payments.

## 2. Features

- User Authentication
  - Technical details: OAuth2 / OIDC support (SAML optional) with per-organization config, JWT access & refresh tokens (rotate & revoke), httpOnly secure cookies for web sessions or secure storage for SPAs, password hashing (bcrypt/argon2), email verification, rate-limited password reset, RBAC permission matrix, logging of auth events, brute-force protection (rate limits, CAPTCHA).
  - Implementation notes: Support SCIM provisioning for enterprise customers; provide admin UI to configure SSO; enforce MFA for admin roles.

- User Profile Management
  - Technical details: CRUD endpoints with validation, sessions listing/revoke API, preferences table (notifications, locale), GDPR export/delete endpoints, re-auth required for sensitive actions.
  - Implementation notes: Mask PII in logs; require confirmation for email changes.

- Search & Filter Functionality
  - Technical details: Use Elasticsearch/OpenSearch/Algolia; index transcripts, metadata, tags, titles; implement faceted filters; autocomplete suggestions; fuzzy matching and synonyms; timestamped snippet highlighting that links to video timecodes.
  - Implementation notes: Keep index updated via near-real-time sync jobs after DB writes; cache hot queries; expose API for advanced search with rate limiting.

- Video Upload, Processing & Storage
  - Technical details: Resumable chunked uploads (Tus or S3 multipart), client-side validations (duration, file size), worker-based pipeline using FFmpeg / MediaConvert to transcode to HLS/DASH, poster extraction and thumbnails, generate audio-only fallback, store assets in S3-compatible object store, CDN (CloudFront/Fastly) fronting with signed URLs for restricted content, lifecycle rules (archive/ttl).
  - Implementation notes: Provide upload progress UI and retry logic; webhooks to notify completion; expose reprocess endpoints; store canonical metadata in relational DB and sync to search index.

- Auto-Transcription & AI Tagging
  - Technical details: Integrate speech-to-text provider (Google/AWS/Whisper) to produce timestamped transcripts; NLP tagging via OpenAI/Azure to extract entities (machine models, tooling), suggested tags and summaries with confidence scores; store transcripts in DB and search index.
  - Implementation notes: Allow manual transcript edits and reprocessing; surface confidence and editing UI; rate-limit and batch transcribe jobs; webhook status updates.

- Course Builder & Assessment
  - Technical details: Data models for courses, modules, versions; quiz engine supporting MCQ/T-F/short answers, pass thresholds, retake rules; certificate generator producing signed PDF with unique ID; assignment engine for users/groups; progress tracking events persisted and exposed via APIs.
  - Implementation notes: Autosave drafts, version history, rollbacks; ability to clone courses for customer-specific customizations.

- Notifications & Communication
  - Technical details: Transactional email provider integration (SendGrid/Mailgun) with templating; in-app notifications using WebSockets or server-sent events; webhook subscriptions for customer events; retry and DLQ handling; user-level preferences.
  - Implementation notes: Template management UI for marketing vs transactional; real-time unread count in top nav.

- Subscription & Billing Management
  - Technical details: Integrate Stripe for subscriptions/invoices, implement seat/machine-based licensing with proration logic, invoice PDF generation, tax handling and VAT ID capture, webhooks for lifecycle events.
  - Implementation notes: Admin panel to change plans, apply credits/refunds; secure handling of payment info (Stripe Elements).

- Analytics & Reporting
  - Technical details: Event pipeline (Kafka/Log shipper → analytics DB/warehouse), pre-built dashboards (course completion rates, search terms, top reels), time-series metrics, exportable reports (CSV/PDF), scheduled report delivery.
  - Implementation notes: Per-customer data scoping; integrate Looker/Metabase for advanced BI; telemetry opt-out for customers.

- Admin Tools & Moderation
  - Technical details: Moderation workflow (pending/approved/rejected) with audit trail, bulk import/export endpoints, admin audit logs, role & permission management UI.
  - Implementation notes: Moderation notifications and SLA; soft-delete with retention and compliance.

- Performance & Scalability
  - Technical details: CDN for streaming and static assets, signed short-lived URLs for private assets, caching layers (edge + API caching), autoscaling for API and worker fleets, job queue (RabbitMQ/SQS/Kafka) for processing, monitoring (Prometheus/Grafana), error tracking (Sentry).
  - Implementation notes: Horizontal scale for transcoding workers; warm caches for popular reels.

- Security & Compliance
  - Technical details: TLS in transit, SSE-KMS for S3 at rest, per-customer scoping and encryption keys, SSO & SCIM support, audit logs, SOC2-ready controls, vulnerability scanning, secrets management (Vault), secure coding and regular pentests.
  - Implementation notes: Data retention policies and DSAR tooling; role-based data access for customer admins.

## 3. User Journeys

- Visitor → Request Demo (Marketing Lead)
  1. Land on Landing Page via marketing or search.
  2. Read hero and features; watch hero demo clip.
  3. Click Request Demo CTA → open Request Demo Form.
  4. Fill name, company, email, machines owned → submit.
  5. System creates lead, sends confirmation email, notifies sales via webhook/CRM.

- New Customer Signup → Admin Setup
  1. Signup page → submit company, admin name, email, password; accept TOS.
  2. Email verification link; admin verifies.
  3. Admin selects plan or enters trial code; enters billing (or invoicing request).
  4. Admin configures organization (machines purchased), invites users or connects SSO.
  5. Admin maps machines to purchased products; Winbro assigns initial content or schedules onboarding.

- Operator (Learner) Accessing Training
  1. Login (or via SSO) → redirected to Dashboard.
  2. See recommended reels & assigned courses; use Quick Search to find reel.
  3. Play reel in Video Player; use transcript to jump to step.
  4. Bookmark reel; add personal notes.
  5. Open assigned course → complete modules and inline quizzes.
  6. Upon passing, download certificate PDF; manager sees completion in analytics.

- Trainer Creating a Course
  1. Login → Dashboard → Create Button → Course Builder.
  2. Create course metadata, drag reels into timeline, add text blocks and PDFs.
  3. Build quizzes and set pass threshold; preview in Preview Mode.
  4. Save draft, then publish as customer-specific or global; assign to learners or groups.
  5. Monitor course progress via Course analytics.

- Engineer Uploading a Reel
  1. Login with permission → Upload/Create Reel.
  2. Follow Capture Guidance, drag/drop file (resumable upload).
  3. Fill metadata (machine, process, tool, tags), enable auto-transcribe.
  4. Submit for review; processing job transcodes + transcripts + AI tags.
  5. Moderator approves → published to customer's library; notifications sent.

- Admin Moderation & Management
  1. Admin Dashboard shows pending content & flagged reels.
  2. Open moderation queue → review metadata, transcript, video preview.
  3. Approve/reject with audit note and optional request for changes.
  4. Manage users (invite/deactivate), change roles, view subscription and billing, export reports.

- Viewer via Search Engine (Public or Customer-Scoped Discovery)
  1. Clicked link to reel → if public: view landing snippet and trailer; if customer-scoped: prompt to login or request access.
  2. If authorized, play reel and view metadata and related content.

- Billing Lifecycle (Customer)
  1. Admin views subscription page → upgrades seats or adds machines.
  2. Checkout page collects payment via Stripe; webhooks update subscription status.
  3. Invoices generated and available in Subscription & Billing History; billing emails sent.

## 4. UI Guide

- Layout & Structure
  - Global: Vertical left sidebar (always visible), top nav for global actions, main content area centered with 24–32px gutters.
  - Cards: White cards with 8px radius, subtle shadow, no visible borders, consistent spacing.
  - Grid/List: Library results use a responsive grid with 3–4 columns desktop, 1 column mobile.

- Navigation
  - Sidebar: Icon + label items, profile at top, active state uses pill background #F3F4F6 and bold text.
  - Top Nav: search, notifications, help, profile menu with sign out and settings.

- Components
  - Buttons: Primary filled accent blue #2563EB with white text, secondary outline in gray, small/medium/large sizes.
  - Tabs: Underlined active tab in Accent Blue; inactive tabs #6B7280.
  - Chips/Status Labels: Rounded pills; Published: #34D399 filled with white text; Archived: #D1D5DB filled.
  - Forms: Minimalist inputs, clear focus states, inline validation messages.
  - Modals: Centered, white, rounded, drop shadow, clear CTA hierarchy.
  - Video Player Controls: Clean dark controls over poster; captions & speed toggles accessible.
  - Transcript: Scrollable panel, clickable timestamps, highlight on search match.
  - Drag-and-Drop: Drop target with subtle dashed outline and upload guidance text.

---

Visual Style

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
- Font Family: Sans-serif (likely Inter)
- Font Weights: Bold (headings), Medium (navigation and labels), Regular (body)
- Hierarchy: Large bold page titles; medium-weight nav; smaller detail text
- Spacing: 24–32px gutters, generous padding
- Alignment: Left-aligned text and components
- Typography Treatments: Clear distinction between headings and descriptions

### Key Design Elements
- Card Design: White cards, 8px radius, soft shadow, no borders, hover elevation
- Navigation: Vertical sidebar, white, subtle shadow, active pill background #F3F4F6
- Data Visualization: Soft gray placeholders (#F3F4F6) for charts
- Interactive Elements: Accent Blue #2563EB for primary interactions; tabs underlined in blue; chips status colors Green/Gray; minimalist form styles; unobtrusive micro-interactions

### Design Philosophy
- Modern, ultra-minimalist B2B SaaS aesthetic focused on clarity, whitespace, and usability; prioritize scannability and low cognitive load.

---

Implementation Notes:
- Enforce this design system across all pages and components. Use design tokens for colors, spacing, typography and elevation. Validate visuals in QA against the UI Guide.

## Instructions to AI Development Tool
After every development step, refer back to this blueprint to ensure correct implementation. Verify all features and pages are built according to specifications before completing the project. Pay special attention to the UI Guide section and ensure all visual elements follow the design system exactly.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
