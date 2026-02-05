"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Users, BookOpen, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

const navigation = [
  { name: "Calendario", href: "/", icon: CalendarDays },
  { name: "Docenti", href: "/teachers", icon: Users },
  { name: "Moduli", href: "/modules", icon: BookOpen },
];

interface HeaderProps {
  onNewLesson?: () => void;
}

export function Header({ onNewLesson }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0047FF] transition-transform group-hover:scale-105">
              <CalendarDays className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl text-foreground tracking-tight">
                ITS
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#999990]">
                Calendar
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-1.5 text-sm font-semibold transition-colors rounded-lg",
                    isActive
                      ? "text-[#0047FF]"
                      : "text-[#6B6B6B] hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-[17px] left-3 right-3 h-[2.5px] bg-[#0047FF] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {onNewLesson && (
            <Button
              size="sm"
              className="gap-1.5 bg-[#0047FF] text-white hover:bg-[#003AD6] rounded-lg shadow-md font-semibold"
              onClick={onNewLesson}
            >
              <Plus className="h-4 w-4" />
              Nuova Lezione
            </Button>
          )}
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-[#6B6B6B] hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Esci</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
