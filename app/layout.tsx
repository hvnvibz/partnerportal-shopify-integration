import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon_io/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/favicon_io/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
      </head>
      <body>
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
