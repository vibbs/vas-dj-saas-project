import { Hero } from '@/components/sections/hero'
import { Stats } from '@/components/sections/stats'
import { Features } from '@/components/sections/features'
import { Testimonials } from '@/components/sections/testimonials'
import { CTA } from '@/components/sections/cta'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <CTA />
    </>
  )
}