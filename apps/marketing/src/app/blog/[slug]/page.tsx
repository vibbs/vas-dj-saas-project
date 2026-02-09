import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { blogConfig } from '@/config/blog'
import { siteConfig } from '@/config/site'
import { formatDate } from '@/lib/utils'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return blogConfig.posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogConfig.posts.find(p => p.slug === slug)
  
  if (!post) {
    return {
      title: 'Post not found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | ${siteConfig.name}`,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = blogConfig.posts.find(p => p.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link 
          href="/blog"
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-200 mb-8"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Article header */}
        <header className="mb-12">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center text-muted-foreground text-lg mb-8">
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            <span className="mx-3">·</span>
            <span>{post.readTime} min read</span>
          </div>

          {/* Author */}
          <div className="flex items-center p-6 bg-muted/50 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-200 rounded-full flex items-center justify-center mr-4">
              <span className="text-primary font-bold text-lg">
                {post.author.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="font-semibold text-foreground text-lg">
                {post.author.name}
              </div>
              <p className="text-muted-foreground mt-1">
                {post.author.bio}
              </p>
            </div>
          </div>
        </header>

        {/* Article content */}
        <article className="prose prose-lg max-w-none">
          <div 
            className="leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ 
              __html: post.content.replace(/\n/g, '<br />').replace(/^# /gm, '<h1>').replace(/<\/h1>/g, '</h1><br />') 
            }} 
          />
        </article>

        {/* Article footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            {/* Share buttons placeholder */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Share this article</h3>
              <div className="flex space-x-4">
                <button className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <span className="sr-only">Share on Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <span className="sr-only">Share on LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Related articles link */}
            <Link 
              href="/blog"
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              View all articles →
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}