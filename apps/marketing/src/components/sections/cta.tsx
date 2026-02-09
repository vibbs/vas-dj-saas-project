import Link from 'next/link'
import { Button } from '../ui/button'
import { contentConfig } from '@/config/content'

export function CTA() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-purple-600 dark:from-blue-950/20 dark:to-purple-950/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          {contentConfig.cta.title}
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
          {contentConfig.cta.subtitle}
        </p>

        {/* CTA Button */}
        <Button 
          size="lg" 
          variant="secondary" 
          asChild 
          className="bg-background text-primary hover:bg-muted shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Link href={contentConfig.cta.primaryCta.href}>
            {contentConfig.cta.primaryCta.text}
          </Link>
        </Button>

        {/* App store badges mockup */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="text-blue-100 text-sm">Available on iOS and Android</div>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm">
            <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}