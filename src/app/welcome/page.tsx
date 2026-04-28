"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Logo } from "@/components/shared/Logo";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setIdentity, getIdentity, type Identity } from "@/lib/identity";
import { Sparkles, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface GoogleProfile {
  name: string;
  email: string;
  picture?: string;
}

function GoogleButton({ onSuccess }: { onSuccess: (id: Identity) => void }) {
  if (!GOOGLE_CLIENT_ID) return null;

  const handleCredentialResponse = (resp: CredentialResponse) => {
    if (!resp.credential) {
      toast.error("Login con Google falló");
      return;
    }
    try {
      const profile = jwtDecode<GoogleProfile>(resp.credential);
      onSuccess({
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
        source: "google",
      });
    } catch {
      toast.error("No se pudo leer el perfil de Google");
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleCredentialResponse}
          onError={() => toast.error("Login con Google falló")}
          theme="filled_black"
          text="signin_with"
          shape="pill"
          width={280}
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getIdentity()) router.replace("/panel");
  }, [router]);

  const completeSignIn = (identity: Identity) => {
    setIdentity(identity);
    toast.success(`Bienvenido, ${identity.name}`);
    router.replace("/panel");
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Ingresá un nombre");
      return;
    }
    setSubmitting(true);
    completeSignIn({ name: trimmed, source: "demo" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
      <Logo />
      <p className="mt-2 text-sm text-muted-foreground">Demo personalizado</p>

      <Card className="mt-8 w-full max-w-md border-white/10 bg-card">
        <CardContent className="space-y-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Bienvenido a ATMAN</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Cada visitante tiene su propio espacio. Tus billeteras, herederos y configuración se
              guardan localmente en tu navegador.
            </p>
          </div>

          {GOOGLE_CLIENT_ID ? (
            <>
              <GoogleButton onSuccess={completeSignIn} />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">o</span>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-200/90">
              <Sparkles size={12} className="mr-1 inline text-yellow-400" />
              Sign-in con Google está apagado en este demo. Usá tu nombre y avanzás igual.
            </div>
          )}

          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tu nombre</Label>
              <Input
                id="name"
                placeholder="Federico"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-white/10"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="glow-gold w-full bg-gold text-black hover:bg-gold-light"
            >
              <User size={16} />
              Entrar al demo
            </Button>
          </form>

          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={12} className="text-gold" />
            Sin servidor, sin cuentas, sin datos compartidos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
