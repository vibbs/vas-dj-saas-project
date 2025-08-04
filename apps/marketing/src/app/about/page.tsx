import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about our mission to streamline business operations through innovative technology and data-driven insights.',
  openGraph: {
    title: `About Us | ${siteConfig.name}`,
    description: 'Learn about our mission to streamline business operations through innovative technology and data-driven insights.',
  },
}

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            About <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Our Company</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to streamline business operations through innovative technology, 
            making it easier for companies to achieve their productivity goals.
          </p>
        </div>

        {/* Mission section */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Business operations shouldn't be complicated. We believe that with the right tools, 
              data-driven insights, and intelligent automation, any organization can streamline 
              their processes and achieve their business goals.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our platform combines cutting-edge technology with proven business methodologies 
              to create an experience that's both powerful and intuitive. Whether you're a 
              startup or an enterprise, we're here to support your growth every step of the way.
            </p>
          </div>
        </div>

        {/* Values section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Simplicity</h3>
              <p className="text-muted-foreground">
                We believe business tools should be intuitive and easy to use, not overwhelming.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Data-Driven</h3>
              <p className="text-muted-foreground">
                Every feature is built on proven methodologies and validated through customer feedback.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Community</h3>
              <p className="text-muted-foreground">
                We foster a supportive community where everyone can learn and grow together.
              </p>
            </div>
          </div>
        </div>

        {/* Story section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>
              Our company was founded in 2024 by a team of business experts, data scientists, 
              and software engineers who were frustrated with the complexity of existing 
              business management solutions.
            </p>
            <p>
              We noticed that most business platforms either oversimplified the experience or 
              overwhelmed users with too many features. There had to be a better way—a 
              platform that could provide powerful insights while remaining approachable 
              for businesses of all sizes.
            </p>
            <p>
              Starting with simple analytics tools, we've grown into a comprehensive 
              business platform that serves thousands of companies worldwide. Our 
              focus remains the same: making business operations accessible, efficient, 
              and effective for everyone.
            </p>
          </div>
        </div>

        {/* Team section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "CEO & Co-founder",
                bio: "Former business consultant turned tech entrepreneur with a passion for data-driven business solutions.",
              },
              {
                name: "Mike Chen",
                role: "CTO & Co-founder",
                bio: "Full-stack engineer with 10+ years experience building scalable business platforms.",
              },
              {
                name: "Dr. Lisa Rodriguez",
                role: "Head of Product",
                bio: "Business strategist and UX designer focused on creating intuitive business experiences.",
              },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Mission?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Be part of the community that's transforming business operations through technology.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact">Get Started Today</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}