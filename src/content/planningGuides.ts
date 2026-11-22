import type { GuideLink } from '../components/sections/PlanningGuides'

// Contextual links from the home page and the service pages to the blog.
// Added 2026-11-10 (ops to-do #35): Google had not discovered the blog posts
// because nothing but the paginated /blog index linked to them.
//
// Claims rules (business-profile.md) apply to every blurb: no prices or
// minimums, no "free" (except "free quote"), no timing promises.

// Home page: one pillar post per article pillar.
export const homeGuides: GuideLink[] = [
  {
    slug: 'church-pew-rental-for-wedding',
    blurb: 'What a church pew rental includes, from delivery and setup to teardown, and what to know before you book.',
  },
  {
    slug: 'wedding-ceremony-seating-guide',
    blurb: 'How to plan the aisle, the rows and the family sections without the overwhelm.',
  },
  {
    slug: 'how-to-make-a-wedding-seating-chart',
    blurb: 'A step-by-step path from closed RSVPs to assigned tables to a printed display.',
  },
  {
    slug: 'wedding-place-cards-guide',
    blurb: 'What to write on place cards, styles that work, and how many to order.',
  },
  {
    slug: 'wedding-seating-chart-basics',
    blurb: 'What a seating chart is, whether you need one, and how to pick a display.',
  },
]

// /services (church pews).
export const pewGuides: GuideLink[] = [
  {
    slug: 'church-pew-rental-for-wedding',
    blurb: 'What comes with a pew rental, and the questions worth asking before you book.',
  },
  {
    slug: 'what-is-a-church-pew',
    blurb: 'Where pews come from, why couples choose them, and how a rented set works.',
  },
  {
    slug: 'how-much-does-a-church-pew-weigh',
    blurb: 'Why pews are heavier than they look, and why delivery and setup should not fall on you.',
  },
  {
    slug: 'wedding-aisle-ideas',
    blurb: 'Aisle styles for church-feel, rustic and outdoor ceremonies, and how seating shapes the walk.',
  },
  {
    slug: 'outdoor-wedding-ceremony-ideas',
    blurb: 'The spot, the layout, shade, ground and weather, plus seating that holds up outside.',
  },
  {
    slug: 'church-wedding-decor-ideas',
    blurb: 'Get the chapel feel in a barn, backyard or garden, starting with the rows.',
  },
]

// /chair-rentals.
export const chairGuides: GuideLink[] = [
  {
    slug: 'wedding-ceremony-seating-guide',
    blurb: 'Plan the aisle, the rows and the family sections before you count chairs.',
  },
  {
    slug: 'outdoor-wedding-ceremony-ideas',
    blurb: 'Layout, shade, ground and weather: what to settle before seating goes outside.',
  },
  {
    slug: 'table-by-table-wedding-seating-chart',
    blurb: 'Organize your reception seating table by table, then turn it into a display.',
  },
  {
    slug: 'how-to-make-a-wedding-seating-chart',
    blurb: 'A step-by-step guide from closed RSVPs to a finished, printed chart.',
  },
]

// /table-rentals.
export const tableGuides: GuideLink[] = [
  {
    slug: 'table-by-table-wedding-seating-chart',
    blurb: 'Assign guests table by table instead of alphabetically, then build the display.',
  },
  {
    slug: 'wedding-table-numbers-guide',
    blurb: 'Pick a table number style, size it right, and match it to your place cards.',
  },
  {
    slug: 'wedding-place-cards-guide',
    blurb: 'What to write on place cards, styles that work, and how many to order.',
  },
  {
    slug: 'wedding-seating-chart-basics',
    blurb: 'What a seating chart is, whether you need one, and how to pick a display.',
  },
]
