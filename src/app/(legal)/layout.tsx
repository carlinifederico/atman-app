import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { AlertTriangle } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terminos" className="hover:text-foreground">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:text-foreground">
              Privacidad
            </Link>
            <Link href="/disclaimer-cripto" className="hover:text-foreground">
              Cripto
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-200">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-yellow-400" />
          <div>
            <strong className="block font-semibold">Borrador — pendiente de revisión legal</strong>
            <p className="mt-1 text-yellow-200/80">
              Este texto es un esqueleto de referencia y no constituye un contrato vigente ni
              asesoría legal. Antes de cualquier uso comercial, requiere revisión por abogado/a en
              cada jurisdicción donde ATMAN opere.
            </p>
          </div>
        </div>

        <article className="space-y-4 text-muted-foreground leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-2 [&_p]:text-base [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-base [&_strong]:text-foreground [&_strong]:font-semibold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-gold-light">
          {children}
        </article>

        <footer className="mt-16 border-t border-border/50 pt-8 text-center text-xs text-muted-foreground">
          <p>
            &copy; ATMAN. Versión draft. Última revisión interna: 2026-04-26.{" "}
            <Link href="/" className="hover:text-foreground">
              Volver al inicio
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
