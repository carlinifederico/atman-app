"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { DEMO_MODE } from "@/lib/demo-data";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Trust } from "@/components/landing/Trust";
import { CTA } from "@/components/landing/CTA";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            {DEMO_MODE ? (
              <Button
                size="sm"
                className="glow-gold font-semibold"
                render={<Link href="/panel" />}
              >
                Entrar al Demo
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  render={<Link href="/login" />}
                >
                  Iniciar Sesion
                </Button>
                <Button
                  size="sm"
                  className="glow-gold font-semibold"
                  render={<Link href="/registro" />}
                >
                  Registro
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Trust />
        <CTA />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-col items-center gap-2 md:items-start">
              <Logo />
              <p className="text-sm text-muted-foreground">
                Herencia digital para criptoactivos
              </p>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a
                href="#caracteristicas"
                className="transition-colors hover:text-foreground"
              >
                Caracteristicas
              </a>
              <a
                href="#como-funciona"
                className="transition-colors hover:text-foreground"
              >
                Como funciona
              </a>
              <a
                href="#seguridad"
                className="transition-colors hover:text-foreground"
              >
                Seguridad
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ATMAN. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
