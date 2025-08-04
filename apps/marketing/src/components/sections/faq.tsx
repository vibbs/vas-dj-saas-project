'use client'

import { useState } from 'react'
import { pricingConfig } from '@/config/pricing'
import { cn } from '@/lib/utils'

export function FAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <section className="py-16 sm:py-20 bg-muted/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about our platform and pricing.
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {pricingConfig.faq.map((item, index) => (
            <div
              key={index}
              className="bg-background rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-foreground pr-4">
                  {item.question}
                </span>
                <div className="flex-shrink-0">
                  <svg
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-200",
                      openItems.has(index) && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                openItems.has(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  )
}