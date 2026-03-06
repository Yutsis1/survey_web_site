'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './contexts/theme-context'
import { AuthProvider } from './contexts/auth-context'
import { AuthGuard } from '@/components/app/auth-guard'
import { AppShell } from '@/components/app/app-shell'
import { ToastProvider } from '@/components/app/toast'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AuthGuard>
                <AppShell>{children}</AppShell>
              </AuthGuard>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
