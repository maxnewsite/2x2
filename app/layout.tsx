import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Il Mondo in Due Dimensioni',
  description: 'Transform complex information into clear 2x2 matrices with AI-powered analysis',
  keywords: ['analysis', '2x2 matrix', 'AI', 'visualization', 'decision making'],
  authors: [{ name: 'Il Mondo in Due Dimensioni Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Il Mondo in Due Dimensioni',
    description: 'Transform complex information into clear 2x2 matrices with AI-powered analysis',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Il Mondo in Due Dimensioni',
    description: 'Transform complex information into clear 2x2 matrices with AI-powered analysis',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}