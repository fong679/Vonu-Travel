import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Vonu-Travel — Ferry Booking Fiji',
  description: 'Book ferry tickets across Fiji',
  manifest: '/manifest.json',
  themeColor: '#071e30',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#071e30"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Vonu-Travel"/>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
