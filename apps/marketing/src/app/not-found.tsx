import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page not found
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">Go back home</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
        
        {/* Decorative elements */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-64 h-64 bg-gradient-to-br from-primary to-purple-600 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}