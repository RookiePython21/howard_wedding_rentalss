import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    id: 'booking',
    question: 'How far in advance should I book?',
    answer:
      'We recommend booking 3–6 months in advance, especially for peak wedding season (May–October). However, we do accommodate shorter timelines when availability allows — reach out and we\'ll do our best to help.',
  },
  {
    id: 'delivery',
    question: 'Do you handle delivery, setup, and teardown?',
    answer:
      'Yes — every package includes white-glove delivery, professional placement, and post-ceremony teardown. You don\'t have to lift a finger. We arrive early to ensure everything is perfectly arranged before your guests arrive.',
  },
  {
    id: 'customize',
    question: 'Can I customize the look of the pews?',
    answer:
      'Absolutely. We offer three wood finishes: natural, walnut, and whitewash. You can add ribbons, sashes, or floral accents — either through your florist or we can assist with basic decorating. Just let us know your vision and we\'ll make it happen.',
  },
  {
    id: 'damage',
    question: 'What if a pew gets damaged during my event?',
    answer:
      'We understand that events happen. Minor scuffs and wear are expected and covered under normal use. In the rare case of significant damage, we\'ll work with you fairly. We\'ll discuss our damage policy in full when you book.',
  },
  {
    id: 'distance',
    question: 'How far do you travel for deliveries?',
    answer:
      'Our Intimate package covers up to 5 miles, the Classic covers up to 25 miles, and the Grand package covers up to 50 miles. For venues beyond those ranges, contact us — we often make exceptions for larger orders.',
  },
  {
    id: 'count',
    question: 'How many pews do I need for my guest count?',
    answer:
      'Each pew comfortably seats 4–6 adults. As a general rule: divide your expected guest count by 5 to estimate the number of pews needed. Our team will help you finalize the exact count and aisle layout during your booking consultation.',
  },
  {
    id: 'deposit',
    question: 'Do you require a deposit to reserve?',
    answer:
      'Yes, we require a 25% deposit at the time of booking to hold your date. The remaining balance is due 30 days before your wedding. We accept all major credit cards and ACH bank transfer.',
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#fdfcf8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
            FAQ
          </p>
          <h2 className="section-title mb-4">Common Questions</h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-6">
            Have a question not listed here?{' '}
            <a href="mailto:hello@howardweddingrentals.com" className="text-[#c9a96e] underline">
              Email us anytime.
            </a>
          </p>
        </div>

        {/* Accordion */}
        <Accordion.Root type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <Accordion.Item
              key={faq.id}
              value={faq.id}
              className="border border-cream-200 rounded-sm bg-white overflow-hidden data-[state=open]:border-[#c9a96e]"
            >
              <Accordion.Header>
                <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-5 text-left group">
                  <span className="font-raleway font-semibold text-[#2c1f0e] text-sm sm:text-base pr-4 group-data-[state=open]:text-[#c9a96e] transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className="text-[#c9a96e] shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="accordion-content overflow-hidden">
                <div className="px-6 pb-5 border-t border-cream-100">
                  <p className="font-raleway text-sm text-[#6b5744] leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  )
}
