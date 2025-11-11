# Civil Defence Department Odisha - Design Guidelines

## Design Approach

**System-Based Approach**: Following Government of India's Guidelines for Indian Government Websites (GIGW) with inspiration from modern government portals like Startup Odisha. This creates a professional, accessible, and trustworthy government interface that balances tradition with contemporary usability.

**Core Design Principles**:
- Accessibility-first: WCAG 2.0 Level AA compliance is mandatory
- Information hierarchy: Clear visual structure for quick scanning
- Trust and authority: Professional government aesthetic
- Bilingual readiness: Support for English and Odia
- Mobile-responsive: Government services accessible everywhere

## Typography System

**Font Stack**:
- Primary: 'Noto Sans' (excellent Odia script support + Latin readability)
- Secondary: 'Inter' for data tables and forms
- Monospace: 'Roboto Mono' for codes and reference numbers

**Type Scale**:
- Mega headlines (Hero): text-5xl md:text-6xl lg:text-7xl, font-bold
- Page titles: text-4xl md:text-5xl, font-bold
- Section headers: text-3xl md:text-4xl, font-semibold
- Card titles: text-xl md:text-2xl, font-semibold
- Body large: text-lg, font-normal
- Body regular: text-base, font-normal
- Small text/captions: text-sm, font-normal
- Metadata/labels: text-xs, font-medium, uppercase tracking-wide

**Hierarchy Rules**: Government names and official titles use heavier weights (font-bold). Department names use font-semibold with slight letter-spacing.

## Layout System

**Spacing Primitives** (Tailwind units):
- Micro spacing: 2, 4 (internal component padding)
- Standard spacing: 6, 8, 12 (card padding, gaps)
- Section spacing: 16, 20, 24 (vertical rhythm between sections)
- Major spacing: 32, 40, 48 (hero sections, major dividers)

**Container Strategy**:
- Full-width sections: w-full with inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Content sections: max-w-6xl mx-auto
- Text content: max-w-4xl for readability
- Forms: max-w-2xl for optimal completion

**Grid Patterns**:
- Personnel cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Feature boxes: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- Gallery: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
- Video embeds: grid-cols-1 md:grid-cols-2 gap-6

## Component Library

### Header Structure
**Top Accessibility Bar**:
- Font size controls (A+, A, A-)
- High contrast toggle
- Screen reader link
- Language switcher (English/Odia)
- Skip to main content
- Height: h-10, always visible

**Primary Header**:
- Left: Odisha state emblem (h-16 md:h-20)
- Center: Department name (text-2xl md:text-3xl font-bold)
- Right: CM photo with name (h-16 md:h-20)
- Background: subtle gradient treatment
- Border-bottom: decorative 4px accent stripe

**Navigation Menu**:
- Horizontal menu for desktop (text-base font-medium)
- Hamburger menu for mobile
- Dropdown menus for sub-sections
- Hover: subtle background change, no animations
- Active state: border-bottom indicator

### Hero Section
**Banner Slider**:
- Full-width carousel, h-96 md:h-[500px] lg:h-[600px]
- Image overlay: subtle gradient for text readability
- Text overlay: backdrop-blur-sm bg-white/30 for buttons
- Navigation: simple arrows + dot indicators
- Auto-rotate: 5 seconds per slide
- Content: Mission-critical messaging, initiatives, achievements

### Personnel Section
**Key Officials Grid**:
- Photo: rounded-lg, aspect-square, grayscale filter
- Name: text-xl font-bold
- Designation: text-sm font-medium uppercase
- Department: text-sm
- Card: border, hover:shadow-lg transition
- Layout: 4 columns on desktop, 2 on tablet, 1 on mobile

### About Section
**Mission & Vision Blocks**:
- Two-column layout (md:grid-cols-2)
- Icon: Large symbolic icon (h-16 w-16)
- Title: text-2xl font-bold
- Content: text-lg leading-relaxed
- Border: Left accent stripe (border-l-4)
- Padding: p-8

### Information Boxes
**Service Cards**:
- Icon + Title + Description format
- Border: 2px solid with rounded-xl
- Shadow: subtle, increases on hover
- Grid: 3 columns desktop, adapts to 1 column mobile
- Internal padding: p-6

### Media Sections
**Photo Gallery**:
- Masonry-style grid (use CSS columns or grid)
- Lightbox functionality for full view
- Caption overlay on hover
- "View All" link to full gallery page

**YouTube Videos**:
- 16:9 aspect ratio embeds
- 2-column grid on desktop
- Thumbnail + play button style
- Title below each video

### Forms (Login & Registration)
**Form Container**:
- Centered card: max-w-md mx-auto
- Government seal at top
- Title: text-3xl font-bold
- Subtle border with shadow

**Input Fields**:
- Label: text-sm font-medium mb-2
- Input: border-2, focus:border-accent, rounded-lg, p-3
- Helper text: text-xs mt-1
- Error state: border-red-500, text-red-600

**Buttons**:
- Primary CTA: px-8 py-3 rounded-lg font-semibold text-lg
- Secondary: border-2 with transparent background
- Disabled: opacity-50 cursor-not-allowed

### Dashboard Components
**Stat Cards**:
- Number: text-4xl font-bold
- Label: text-sm uppercase tracking-wide
- Icon: positioned top-right, h-8 w-8
- Grid: 4 columns on desktop

**Data Tables**:
- Striped rows (alternate background)
- Sticky header
- Sort indicators in column headers
- Export buttons (Excel, CSV, PDF) top-right
- Pagination at bottom

**Charts**:
- Use Chart.js or Recharts
- Minimal styling, focus on data clarity
- Legend positioned below chart
- Responsive width, fixed height ranges

### Footer
**Multi-Column Layout**:
- 4 columns on desktop, stacks on mobile
- Column 1: Department logo + brief description
- Column 2: Quick Links (internal pages)
- Column 3: Important Links (government portals)
- Column 4: Contact Information
- Bottom bar: Copyright, Privacy Policy, Terms, Accessibility Statement
- Social media icons (optional, if department has accounts)

## Images

### Required Images:
1. **Hero Slider** (3-5 images):
   - Civil Defence training sessions
   - Emergency response operations
   - Volunteer activities
   - Modern equipment and facilities
   - State-level events or ceremonies
   - Dimensions: 1920x600px minimum

2. **CM Photo**: Professional portrait, government-standard format, 400x500px

3. **Odisha State Emblem**: Official PNG with transparency, 200x200px

4. **Key Personnel Photos**: Professional headshots, square format, 400x400px each

5. **Gallery Images**: Civil Defence activities, training, community outreach, various sizes

6. **About Section**: Illustrative images showing mission in action (optional but recommended)

## Accessibility Implementation

**Mandatory Features**:
- All images: descriptive alt text
- Form labels: properly associated with inputs
- Focus indicators: visible 2px outline on all interactive elements
- Keyboard navigation: logical tab order throughout
- ARIA labels: for icon-only buttons and complex widgets
- Skip links: "Skip to main content" at page top
- Language attributes: lang="en" or lang="or" as appropriate
- Heading hierarchy: Proper H1-H6 structure, no skipping levels

**Testing Checklist**:
- 4.5:1 contrast ratio for normal text (applied later with color scheme)
- 3:1 for large text and UI components
- Keyboard-only navigation works completely
- Screen reader announces all content meaningfully

## Page-Specific Layouts

**Landing Page Flow**:
1. Accessibility bar (sticky)
2. Primary header with logo/CM photo
3. Navigation menu
4. Hero slider (600px height)
5. Quick stats/highlights (4-card grid)
6. Key personnel (4-column grid)
7. About Civil Defence (2-column mission/vision)
8. Services offered (3-column cards)
9. Gallery preview (masonry grid, 8 images)
10. Video section (2-column embeds)
11. How it works / Process flowchart
12. Footer (4-column)

**Dashboard Layouts**:
- Sidebar navigation (fixed left, 280px wide)
- Top bar (user info, notifications, logout)
- Main content area (remaining width)
- Stat cards row (4 cards)
- Charts/graphs section (responsive grid)
- Data tables with filters
- Action buttons: top-right of each section

This government portal balances professional credibility with modern usability, ensuring all citizens can access critical Civil Defence services efficiently.