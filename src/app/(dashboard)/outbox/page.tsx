"use client";

import { useEffect, useState } from "react";
import { getMailer, type OutboxMessage } from "@/lib/notifications/mailer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Trash2, Inbox, AlertTriangle } from "lucide-react";

export default function OutboxPage() {
  const [messages, setMessages] = useState<OutboxMessage[]>([]);
  const [selected, setSelected] = useState<OutboxMessage | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setMessages(getMailer().outbox());
    });
  }, []);

  const handleClear = () => {
    if (!confirm("Vaciar todo el outbox?")) return;
    getMailer().clear();
    setMessages([]);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Outbox</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Notificaciones que ATMAN enviaría a tus herederos cuando se active el plan. Por ahora
            son sólo previews — no se envía nada real hasta que conectes un proveedor de email.
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="text-muted-foreground hover:text-red-400"
          >
            <Trash2 size={14} />
            Vaciar
          </Button>
        )}
      </div>

      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="flex items-start gap-3 py-4 text-sm text-yellow-200/90">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-yellow-400" />
          <div>
            <strong className="text-foreground">Stub de notificaciones.</strong> Estos mensajes se
            generan cuando simulás la activación. Ningún proveedor externo (Resend, Postmark,
            Twilio) está conectado — cuando lo conectes, este mismo flujo enviará emails reales.
          </div>
        </CardContent>
      </Card>

      {messages.length === 0 ? (
        <Card className="bg-card border-white/10">
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto mb-4 text-muted-foreground" size={32} />
            <p className="text-sm text-muted-foreground">
              No hay notificaciones aún. Probá en <span className="text-gold">Activación</span>{" "}
              &rarr; <span className="text-gold">Simular activación</span> para generar previews.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selected?.id === m.id
                    ? "border-gold/50 bg-gold/5"
                    : "border-white/10 bg-card hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail size={14} className="shrink-0 text-gold" />
                  <span className="truncate text-sm font-medium">{m.subject}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  Para {m.to} · {new Date(m.sent_at).toLocaleString("es-AR")}
                </p>
              </button>
            ))}
          </div>
          <Card className="bg-card border-white/10">
            <CardContent className="py-4">
              {selected ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Para</p>
                    <p className="text-sm">{selected.to}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Asunto</p>
                    <p className="text-sm font-semibold">{selected.subject}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                      Cuerpo
                    </p>
                    <pre className="whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-background p-3 font-sans text-sm">
                      {selected.body}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Seleccioná un mensaje para previsualizar
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
