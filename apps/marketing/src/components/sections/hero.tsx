import Link from 'next/link'
import { Button } from '../ui/button'
import { contentConfig } from '@/config/content'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <span className="flex w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
            {contentConfig.hero.badge}
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up">
            <span className="block">{contentConfig.hero.title.split(',')[0]},</span>
            <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {contentConfig.hero.title.split(', ')[1]}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-up animation-delay-200">
            {contentConfig.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up animation-delay-400">
            <Button size="lg" asChild className="min-w-[180px]">
              <Link href={contentConfig.hero.primaryCta.href}>
                {contentConfig.hero.primaryCta.text}
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="min-w-[180px]">
              <Link href={contentConfig.hero.secondaryCta.href}>
                {contentConfig.hero.secondaryCta.text}
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="mt-16 sm:mt-20 lg:mt-24 animate-fade-up animation-delay-600">
          <div className="relative max-w-5xl mx-auto">
            {/* Main dashboard mockup */}
            <div className="relative bg-background dark:bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
              {/* Browser chrome */}
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="bg-background rounded-md px-4 py-1 text-sm text-muted-foreground max-w-md mx-auto">
                      app.yourcompany.com/dashboard
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-8 bg-gradient-to-br from-muted/50 to-background min-h-[400px]">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Good Morning 👋</h2>
                    <p className="text-muted-foreground">Here's your business overview for today</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Monthly Target</div>
                    <div className="text-2xl font-bold text-primary">8 days left</div>
                  </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-background dark:bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <div className="w-5 h-5 bg-blue-500 rounded"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">$12.4K</div>
                        <div className="text-sm text-muted-foreground">revenue</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background dark:bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <div className="w-5 h-5 bg-green-500 rounded"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">324</div>
                        <div className="text-sm text-muted-foreground">new leads</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background dark:bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <div className="w-5 h-5 bg-orange-500 rounded"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">94.2%</div>
                        <div className="text-sm text-muted-foreground">uptime</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tasks preview */}
                <div className="bg-background dark:bg-card rounded-xl p-6 shadow-sm border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Today's Tasks</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">2 pm - Team standup meeting</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Review quarterly reports</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Client presentation prep</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-full opacity-80 animate-bounce animation-delay-1000"></div>
            <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-purple-400 rounded-full opacity-80 animate-bounce animation-delay-1500"></div>
          </div>
        </div>
      </div>
    </section>
  )
}