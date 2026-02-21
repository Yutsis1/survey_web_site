"use client"

/**
 * AppShell Component
 * 
 * Main application shell that provides layout, navigation, and authentication UI.
 * Renders a sticky header with navigation links and user menu when authenticated.
 * Includes responsive mobile menu toggle and theme switching functionality.
 * 
 * Features:
 * - Sticky navigation header with responsive design
 * - Auth-aware navigation (hidden on auth/survey pages)
 * - User dropdown menu with logout and theme toggle
 * - Mobile-friendly hamburger menu
 * - Renders main content via children prop
 */

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { LayoutDashboard, LogOut, Menu, PanelsTopLeft, X } from "lucide-react"

import { useAuth } from "@/app/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LampToggle } from "@/components/theme-lamp-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

function NavLink({
  href,
  isActive,
  icon,
  label,
}: {
  href: string
  isActive: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const hideNav = useMemo(() => {
    if (!pathname) return false
    return pathname.startsWith("/auth") || pathname.startsWith("/survey/")
  }, [pathname])

  const showNav = !hideNav && isAuthenticated && !isLoading

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth")
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  return (
    <div className="min-h-screen">
      {showNav && (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-sm font-semibold tracking-wide text-foreground">
                SurveyFlow
              </Link>
              <nav className="hidden items-center gap-2 md:flex">
                <NavLink
                  href="/dashboard"
                  isActive={pathname === "/dashboard"}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Dashboard"
                />
                <NavLink
                  href="/survey-builder"
                  isActive={pathname.startsWith("/survey-builder")}
                  icon={<PanelsTopLeft className="h-4 w-4" />}
                  label="Builder"
                />
              </nav>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback>SF</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex items-center justify-between">
                      <span>Theme</span>
                      <LampToggle />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
          {mobileOpen && (
            <div className="border-t border-border px-4 py-3 md:hidden">
              <div className="flex flex-col gap-2">
                <NavLink
                  href="/dashboard"
                  isActive={pathname === "/dashboard"}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Dashboard"
                />
                <NavLink
                  href="/survey-builder"
                  isActive={pathname.startsWith("/survey-builder")}
                  icon={<PanelsTopLeft className="h-4 w-4" />}
                  label="Builder"
                />
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm">Theme</span>
                  <LampToggle />
                </div>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </header>
      )}
      <main>{children}</main>
    </div>
  )
}
