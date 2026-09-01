import type { ReactNode } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'

interface ServiceFAQItem {
  id: string
  question: string
  answer: ReactNode
}

interface ServiceFAQProps {
  faqs: ServiceFAQItem[]
}

export default function ServiceFAQ({ faqs }: ServiceFAQProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
          Common Questions
        </p>
        <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] leading-tight">
          Frequently Asked
        </h2>
      </div>

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
  )
}
