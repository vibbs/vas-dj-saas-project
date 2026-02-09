import { Metadata } from 'next'
import { PricingPlans } from '@/components/sections/pricing-plans'
import { FAQ } from '@/components/sections/faq'
import { CTA } from '@/components/sections/cta'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the perfect plan for your fitness journey. Flexible pricing options for individuals, fitness enthusiasts, and teams.',
  openGraph: {
    title: `Pricing | ${siteConfig.name}`,
    description: 'Choose the perfect plan for your fitness journey. Flexible pricing options for individuals, fitness enthusiasts, and teams.',
  },
}

export default function PricingPage() {
  return (
    <>
      <PricingPlans />
      <FAQ />
      <CTA />
    </>
  )
}