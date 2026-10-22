// Copy for the Meta ad landing pages, one per persona (business-profile.md "Root causes & personas").
// Root cause for all four: folding chairs make an outdoor ceremony look like a cookout and leave
// no real aisle. Each page answers what that persona blames instead. The FAQ walks the awareness
// ladder (unaware -> problem -> solution -> product -> most aware), one stage per question.
//
// Compliance (owner rules): no prices, minimums, "starting at" or "free" anywhere in this file.
// The quote tool is the only place numbers appear.

export type AwarenessStage = 'unaware' | 'problem' | 'solution' | 'product' | 'most'

export interface PersonaFAQ {
  id: string
  stage: AwarenessStage
  question: string
  answer: string
}

export interface Persona {
  key: 'backyard' | 'church-feel' | 'parent' | 'planner'
  path: string
  seoTitle: string
  seoDescription: string
  heroImage: string
  eyebrow: string
  headline: string
  headlineAccent: string
  subhead: string
  blame: string
  reframeTitle: string
  reframe: string
  benefits: { title: string; body: string }[]
  closingTitle: string
  closingBody: string
  faqs: PersonaFAQ[]
}

const howMany =
  'Each pew seats 6–7 adults, and we bring up to 14 pews, which covers about 84–98 guests. Expecting more? Give us a call and we\'ll talk it through.'
const serviceArea =
  'We deliver within about 120 miles of Owensboro, KY, including Nashville, TN. Delivery, setup and teardown are included. Enter your venue in the estimate tool above and it will estimate travel for you.'
const holdDate =
  'Get your instant estimate above, then call 270.903.5890 and we\'ll confirm the details and hold your date. In peak season (May–October) we recommend booking 3–6 months ahead.'

export const personas: Persona[] = [
  {
    key: 'backyard',
    path: '/pews/backyard-wedding',
    seoTitle: 'Church Pews for Backyard Weddings',
    seoDescription:
      'Turn a backyard or family land into a real ceremony: wooden church pews in rows with a true aisle, delivered, set up and taken down for you.',
    heroImage: '/images/pew2.jpg',
    eyebrow: 'Backyard & family-land weddings',
    headline: "It's your backyard.",
    headlineAccent: 'It can still look like a wedding.',
    subhead:
      'Real wooden church pews in straight rows, with a true aisle down the middle. We deliver, set up and take down, so the yard you love feels like a ceremony, not a cookout.',
    blame: '"It\'s just a backyard. It\'ll never look like a real wedding."',
    reframeTitle: "The yard isn't the problem. The folding chairs are.",
    reframe:
      'Rows of metal folding chairs are what make a backyard ceremony read as a cookout, and they never quite make a proper aisle. Pews do. Fourteen wooden pews give you straight rows, a center aisle and the shape of a church, right on your own grass.',
    benefits: [
      { title: 'A real aisle to walk down', body: 'Pews line up into clean rows with a center aisle built in, so the walk feels like a wedding walk.' },
      { title: 'Fewer pieces on your lawn', body: 'About 14 pews instead of roughly 90 folding chairs to haul, line up and fold away.' },
      { title: 'We do the heavy part', body: 'Delivery, setup and teardown are included. Your family gets to be guests.' },
    ],
    closingTitle: 'Make the backyard feel like the big day',
    closingBody: 'Tell us your guest count and where you are, and get your instant estimate.',
    faqs: [
      {
        id: 'real-wedding',
        stage: 'unaware',
        question: 'Can a backyard ceremony really look like a "real" wedding?',
        answer:
          'Yes. What makes a ceremony look like a ceremony is mostly the seating: rows facing forward and an aisle down the middle. Wooden pews give you both, so the setting does the rest.',
      },
      {
        id: 'cookout',
        stage: 'problem',
        question: 'Why do so many backyard ceremonies end up looking like a cookout?',
        answer:
          'Folding chairs. Around 90 separate chairs drift out of line, never quite form an aisle, and look like every picnic and graduation party in the neighborhood.',
      },
      {
        id: 'nicer-chairs',
        stage: 'solution',
        question: 'Couldn\'t we just rent nicer chairs or add chair covers?',
        answer:
          'Covers dress chairs up, but it is still about 90 separate pieces to set, straighten and keep in line. Pews are about 14 pieces, the rows stay straight, and the aisle is part of the layout.',
      },
      { id: 'how-many', stage: 'product', question: 'How many pews will we need?', answer: howMany },
      { id: 'area', stage: 'product', question: 'Will you come out to us?', answer: serviceArea },
      { id: 'hold-date', stage: 'most', question: 'How do we hold our date?', answer: holdDate },
    ],
  },
  {
    key: 'church-feel',
    path: '/pews/outdoor-church-wedding',
    seoTitle: 'The Church Feel for Your Outdoor Wedding',
    seoDescription:
      'Marrying outdoors but missing the church feel? Real wooden church pews and a center aisle, delivered and set up wherever you say "I do."',
    heroImage: '/images/pew1.jpg',
    eyebrow: 'Outdoor ceremonies',
    headline: 'Married outside,',
    headlineAccent: 'with the feel of a church.',
    subhead:
      "You chose the open sky. You don't have to give up the pews. Real wooden church pews in rows, with a center aisle, delivered and set up wherever you say \"I do.\"",
    blame: '"If we marry outdoors, we give up the church feel."',
    reframeTitle: "Outdoors isn't what takes the church feel away.",
    reframe:
      'Folding chairs are. The feeling of a church comes from wooden pews in rows and an aisle down the middle, and those can come outside with you. Keep the sky, the trees and the view, and still walk down a real aisle.',
    benefits: [
      { title: 'Real church pews', body: 'Authentic wooden church pews, not plastic look-alikes.' },
      { title: 'A true center aisle', body: 'Rows of pews frame the aisle the way a church does.' },
      { title: 'Set up and taken down for you', body: 'Delivery, setup and teardown are included, wherever the ceremony is.' },
    ],
    closingTitle: 'Bring the church feel outside',
    closingBody: 'Tell us your guest count and venue, and get your instant estimate.',
    faqs: [
      {
        id: 'give-up',
        stage: 'unaware',
        question: 'Do we have to give up the church feel to marry outdoors?',
        answer:
          'No. Most of what makes a church ceremony feel like one is the pews and the aisle. Bring those outside and the feeling comes with them.',
      },
      {
        id: 'feels-off',
        stage: 'problem',
        question: 'Why do outdoor ceremonies often feel less like a wedding?',
        answer:
          'Because the seating usually ends up being folding chairs in loose rows. That is the part of the picture guests sit in for the whole ceremony, and it reads as an event, not a sanctuary.',
      },
      {
        id: 'decor',
        stage: 'solution',
        question: "Won't an arch and flowers be enough?",
        answer:
          'An arch dresses the front. Your guests, and most of your photos from the back, still see rows of folding chairs. Pews change the whole space, not just the altar.',
      },
      {
        id: 'real-pews',
        stage: 'product',
        question: 'Are these real church pews, and how many guests do they hold?',
        answer: `Yes, they are real wooden church pews. ${howMany}`,
      },
      { id: 'area', stage: 'product', question: 'How far will you travel?', answer: serviceArea },
      { id: 'hold-date', stage: 'most', question: 'How do we reserve the pews?', answer: holdDate },
    ],
  },
  {
    key: 'parent',
    path: '/pews/for-parents',
    seoTitle: 'Ceremony Pews for Parents Planning a Wedding',
    seoDescription:
      'Planning your child\'s outdoor wedding? Fourteen wooden pews replace a sea of folding chairs, with delivery, setup and teardown included.',
    heroImage: '/images/pew3.jpg',
    eyebrow: 'For parents helping plan the big day',
    headline: 'One rental that makes',
    headlineAccent: 'the whole ceremony look finished.',
    subhead:
      'You want it beautiful, and you want it sensible. Wooden church pews replace a sea of folding chairs, come with delivery, setup and teardown, and put a real aisle under your child\'s feet.',
    blame: '"We can just borrow the folding chairs from the church basement."',
    reframeTitle: 'Borrowed chairs come with a lot of hidden work.',
    reframe:
      'About 90 chairs still have to be picked up, hauled, set out, straightened, folded and returned, usually by family on the wedding day. And they still look like folding chairs. Pews are far fewer pieces, they make a real aisle, and our team does the hauling.',
    benefits: [
      { title: 'Less work for the family', body: 'About 14 pews instead of roughly 90 chairs. Nobody spends the morning setting up rows.' },
      { title: 'Delivered, set up, taken down', body: 'Included with every booking, so you can be the parent, not the crew.' },
      { title: 'An honest estimate up front', body: 'Get an instant estimate online. Travel is confirmed on a quick call, so there are no surprises.' },
    ],
    closingTitle: 'See what it would take',
    closingBody: 'Enter the guest count and venue for an instant estimate. No commitment until you call.',
    faqs: [
      {
        id: 'good-enough',
        stage: 'unaware',
        question: "Aren't borrowed folding chairs good enough?",
        answer:
          'They will seat everyone. But the ceremony is the part everyone remembers and photographs, and folding chairs are the first thing you notice in those pictures.',
      },
      {
        id: 'whats-wrong',
        stage: 'problem',
        question: "What's actually wrong with folding chairs?",
        answer:
          'Two things: how they look (rows of metal chairs read as a picnic, not a wedding) and the labor (about 90 pieces to collect, set, straighten and return, usually by family).',
      },
      {
        id: 'family-setup',
        stage: 'solution',
        question: 'Couldn\'t family just set the chairs up neatly?',
        answer:
          'They could, on the morning of the wedding, when everyone has somewhere else to be. Even set neatly, they still look like folding chairs. Pews arrive and are placed by our team.',
      },
      {
        id: 'cost',
        stage: 'product',
        question: 'What will it cost?',
        answer:
          'Every wedding is different in guest count and distance, so use the instant estimate tool above. It is an estimate only, and travel is confirmed when you call. We are happy to walk you through it.',
      },
      { id: 'how-many', stage: 'product', question: 'How many pews would we need?', answer: howMany },
      { id: 'hold-date', stage: 'most', question: 'How do we hold the date?', answer: holdDate },
    ],
  },
  {
    key: 'planner',
    path: '/pews/for-planners',
    seoTitle: 'Ceremony Pew Rentals for Wedding Planners',
    seoDescription:
      'Wooden church pews for outdoor ceremonies, booked in one call and delivered, placed and picked up by our team. For planners and venue coordinators.',
    heroImage: '/images/pew1.jpg',
    eyebrow: 'For wedding planners & venue coordinators',
    headline: 'Ceremony seating that\'s one call,',
    headlineAccent: 'not one more vendor to chase.',
    subhead:
      'Wooden church pews for outdoor ceremonies, delivered, placed and picked up by our team. About 14 pieces instead of roughly 90 chairs, with the aisle built in.',
    blame: '"Another vendor is just one more thing to wrangle."',
    reframeTitle: 'We keep it to one phone call.',
    reframe:
      'Guest count, venue and date: that is all we need. We deliver, set the rows and the aisle, and take everything away after. Fewer pieces means less for your team to place, straighten and count.',
    benefits: [
      { title: 'One call to book', body: 'Guest count, venue and date. We handle the rest and confirm travel on the call.' },
      { title: 'Delivery, placement, pickup', body: 'Our team brings, places and removes the pews, so your crew isn\'t setting rows.' },
      { title: 'Wide service area', body: 'Within about 120 miles of Owensboro, KY, including Nashville, TN.' },
    ],
    closingTitle: 'Add pews to your next ceremony',
    closingBody: 'Run your client\'s guest count and venue through the instant estimate, then call to hold the date.',
    faqs: [
      {
        id: 'worth-it',
        stage: 'unaware',
        question: 'Is ceremony seating worth adding another vendor for?',
        answer:
          'Seating is the biggest single element in the ceremony space and in the photos. Pews change the look of the whole space, and we handle delivery, placement and pickup, so it adds little to your plate.',
      },
      {
        id: 'wrangling',
        stage: 'problem',
        question: 'Why do folding-chair ceremonies take so much wrangling?',
        answer:
          'Roughly 90 separate pieces to unload, place, align into rows, re-straighten and fold. Pews cut that to about 14 pieces, and the aisle is set by the rows themselves.',
      },
      {
        id: 'usual-vendor',
        stage: 'solution',
        question: "Can't the venue's chairs or our usual rental company cover it?",
        answer:
          'They can cover seats. They usually can\'t deliver the church look your couple is after. Pews are a specialty piece that sits alongside whatever else your rental company provides.',
      },
      {
        id: 'capacity',
        stage: 'product',
        question: "What's your capacity and lead time?",
        answer: `${howMany} We recommend booking 3–6 months ahead in peak season (May–October), and we accommodate shorter timelines when availability allows.`,
      },
      { id: 'area', stage: 'product', question: 'Where do you deliver?', answer: serviceArea },
      { id: 'book', stage: 'most', question: 'How do I book for a client?', answer: holdDate },
    ],
  },
]
