import { contentConfig } from '@/config/content'

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {contentConfig.testimonials.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {contentConfig.testimonials.subtitle}
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contentConfig.testimonials.items.map((testimonial, index) => (
            <div key={index} className="bg-background rounded-2xl p-8 shadow-sm border border-border hover:shadow-lg transition-shadow duration-300">
              {/* Content */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-200 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-semibold text-sm">
                    {testimonial.author.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author.name}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {testimonial.author.handle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}