import { Metadata } from 'next'
import Link from 'next/link'
import { blogConfig } from '@/config/blog'
import { siteConfig } from '@/config/site'
import { formatDate, truncate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Stay updated with the latest fitness trends, health tips, and platform updates from our expert team.',
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description: 'Stay updated with the latest fitness trends, health tips, and platform updates from our expert team.',
  },
}

export default function BlogPage() {
  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            {blogConfig.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {blogConfig.subtitle}
          </p>
        </div>

        {/* Blog posts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {blogConfig.posts.map((post) => (
            <article key={post.id} className="group">
              <Link 
                href={`/blog/${post.slug}`}
                className="block bg-background dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:translate-y-[-4px]"
              >
                {/* Featured image placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background/90 text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta */}
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                    <span className="mx-2">·</span>
                    <span>{post.readTime} min read</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Author */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-purple-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary font-semibold text-sm">
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {post.author.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {truncate(post.author.bio, 50)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Get the latest fitness tips, health insights, and platform updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-foreground placeholder-muted-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-6 py-3 bg-background text-primary font-medium rounded-lg hover:bg-muted transition-colors duration-200 whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}