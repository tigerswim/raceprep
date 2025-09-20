// app/layout.tsx
import '@/app/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kinetic Brand Partners',
  description: 'Strategic Marketing Leadership | Brand Transformation | Revenue Growth Acceleration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}