"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEMO_MODE, DEMO_USER } from "@/lib/demo-data";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Wallet,
  Users,
  PieChart,
  Shield,
  Eye,
  Lock,
  Inbox,
  LogOut,
  Menu,
  Loader2,
} from "lucide-react";

const navLinks = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/billeteras", label: "Billeteras", icon: Wallet },
  { href: "/herederos", label: "Herederos", icon: Users },
  { href: "/distribucion", label: "Distribucion", icon: PieChart },
  { href: "/vault", label: "Vault", icon: Lock },
  { href: "/activacion", label: "Activacion", icon: Shield },
  { href: "/vista-heredero", label: "Vista Heredero", icon: Eye },
  { href: "/outbox", label: "Outbox", icon: Inbox },
];

function SidebarContent({
  pathname,
  onLogout,
  onNavClick,
}: {
  pathname: string;
  onLogout: () => void;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0E0E15]">
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <a
              key={link.href}
              href={link.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-red-400"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Cerrar sesion
        </Button>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      if (DEMO_MODE) {
        setEmail(DEMO_USER.email);
        setLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? "");
      setLoading(false);
    };
    checkAuth();
  }, [supabase, router]);

  const handleLogout = async () => {
    if (DEMO_MODE) {
      router.replace("/");
      return;
    }
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const currentPage = navLinks.find((l) => l.href === pathname);
  const pageTitle = currentPage?.label ?? "Panel";

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/10 md:block">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-white/10 bg-[#0E0E15] px-4 md:px-6">
          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent
                pathname={pathname}
                onLogout={handleLogout}
                onNavClick={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold">{pageTitle}</h1>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{email}</span>
            <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-xs font-bold text-gold">{email?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
