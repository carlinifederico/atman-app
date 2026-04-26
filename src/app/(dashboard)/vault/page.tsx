"use client";

import { useState } from "react";
import { useVault } from "@/hooks/useVault";
import { useHeirs } from "@/hooks/useHeirs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Lock, Eye, EyeOff, Trash2, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { VaultEntry } from "@/lib/types";

export default function VaultPage() {
  const { entries, loading, addEntry, deleteEntry, decryptEntry } = useVault();
  const { heirs, loading: heirsLoading } = useHeirs();

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ heir_id: "", label: "", plaintext: "", passphrase: "" });

  const [viewing, setViewing] = useState<VaultEntry | null>(null);
  const [viewPass, setViewPass] = useState("");
  const [revealedText, setRevealedText] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const resetForm = () => setForm({ heir_id: "", label: "", plaintext: "", passphrase: "" });

  const handleCreate = async () => {
    if (!form.heir_id || !form.label || !form.plaintext || !form.passphrase) {
      toast.error("Completá todos los campos");
      return;
    }
    if (form.passphrase.length < 12) {
      toast.error("La passphrase debe tener al menos 12 caracteres");
      return;
    }
    setCreating(true);
    try {
      const { error } = await addEntry(form.heir_id, form.label, form.plaintext, form.passphrase);
      if (error) throw error;
      toast.success("Instrucción cifrada y guardada");
      setCreateOpen(false);
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cifrar");
    } finally {
      setCreating(false);
    }
  };

  const handleDecrypt = async () => {
    if (!viewing || !viewPass) return;
    setDecrypting(true);
    try {
      const text = await decryptEntry(viewing, viewPass);
      setRevealedText(text);
    } catch {
      toast.error("Passphrase incorrecta o ciphertext alterado");
    } finally {
      setDecrypting(false);
    }
  };

  const closeView = () => {
    setViewing(null);
    setViewPass("");
    setRevealedText(null);
    setShowPass(false);
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Borrar la instrucción "${label}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await deleteEntry(id);
    if (!error) toast.success("Instrucción borrada");
  };

  const heirById = (id: string) => heirs.find((h) => h.id === id);

  if (loading || heirsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Vault de Instrucciones</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guardá instrucciones cifradas para tus herederos. La passphrase nunca sale de tu
            navegador — ATMAN sólo ve texto cifrado.
          </p>
        </div>

        <Dialog
          open={createOpen}
          onOpenChange={(o) => (o ? setCreateOpen(true) : (setCreateOpen(false), resetForm()))}
        >
          <DialogTrigger
            render={<Button className="glow-gold bg-gold text-black hover:bg-gold-light" />}
          >
            <Plus size={16} />
            Nueva Instrucción
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>Nueva Instrucción Cifrada</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Heredero destinatario</Label>
                <Select
                  value={form.heir_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, heir_id: v ?? "" }))}
                >
                  <SelectTrigger className="w-full bg-background border-white/10">
                    <SelectValue placeholder="Seleccionar heredero" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10">
                    {heirs.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name} ({h.relationship})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Etiqueta</Label>
                <Input
                  id="label"
                  placeholder="Ej: Acceso a wallet Ledger"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="bg-background border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plaintext">Instrucciones (texto plano)</Label>
                <Textarea
                  id="plaintext"
                  placeholder="Ej: Mi seed phrase está en la caja fuerte detrás del cuadro azul. La combinación es..."
                  value={form.plaintext}
                  onChange={(e) => setForm((f) => ({ ...f, plaintext: e.target.value }))}
                  className="min-h-32 bg-background border-white/10 font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passphrase">
                  Passphrase del vault
                  <span className="ml-2 text-xs text-muted-foreground">(mín 12 caracteres)</span>
                </Label>
                <Input
                  id="passphrase"
                  type="password"
                  placeholder="frase larga que vas a recordar y compartir con tu heredero"
                  value={form.passphrase}
                  onChange={(e) => setForm((f) => ({ ...f, passphrase: e.target.value }))}
                  className="bg-background border-white/10 font-mono"
                />
                <p className="text-xs text-yellow-200/80">
                  <AlertTriangle className="mr-1 inline" size={12} />
                  Si perdés esta passphrase, el contenido es irrecuperable. ATMAN no la guarda.
                </p>
              </div>

              <Button
                onClick={handleCreate}
                disabled={creating}
                className="w-full bg-gold text-black hover:bg-gold-light glow-gold"
              >
                <Lock size={16} />
                {creating ? "Cifrando..." : "Cifrar y guardar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trust banner */}
      <Card className="border-gold/20 bg-gold/5">
        <CardContent className="flex items-start gap-3 py-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-gold" size={20} />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">AES-GCM-256 + PBKDF2-SHA256</strong> con 600.000
            iteraciones. La passphrase se deriva en tu navegador y nunca se transmite. ATMAN
            almacena ciphertext opaco; ni siquiera nosotros podemos leerlo.
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {entries.length === 0 ? (
        <Card className="bg-card border-white/10">
          <CardContent className="py-16 text-center">
            <Lock className="mx-auto mb-4 text-muted-foreground" size={32} />
            <p className="mb-4 text-sm text-muted-foreground">
              Todavía no tenés instrucciones cifradas. Empezá creando una para alguno de tus
              herederos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const heir = heirById(entry.heir_id);
            return (
              <Card
                key={entry.id}
                className="bg-card border-white/10 transition-colors hover:border-gold/20"
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10">
                    <Lock size={16} className="text-gold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Para <span className="text-gold">{heir?.name ?? "(heredero borrado)"}</span>{" "}
                      &middot; creada {new Date(entry.created_at).toLocaleDateString("es-AR")}{" "}
                      &middot; <span className="font-mono">{entry.algo}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewing(entry)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye size={14} />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(entry.id, entry.label)}
                    className="text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View / decrypt dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && closeView()}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>{viewing?.label}</DialogTitle>
          </DialogHeader>
          {revealedText === null ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ingresá la passphrase para descifrar. Si te equivocás, AES-GCM rechaza la operación
                — no hay forma de saber la passphrase a partir del ciphertext.
              </p>
              <div className="space-y-2">
                <Label htmlFor="view-pass">Passphrase</Label>
                <div className="relative">
                  <Input
                    id="view-pass"
                    type={showPass ? "text" : "password"}
                    value={viewPass}
                    onChange={(e) => setViewPass(e.target.value)}
                    className="bg-background border-white/10 pr-10 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleDecrypt();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPass ? "Ocultar" : "Mostrar"}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button
                onClick={handleDecrypt}
                disabled={decrypting || !viewPass}
                className="w-full bg-gold text-black hover:bg-gold-light glow-gold"
              >
                {decrypting ? "Descifrando..." : "Descifrar"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">
                  Texto descifrado
                </p>
                <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">
                  {revealedText}
                </pre>
              </div>
              <Button onClick={closeView} variant="ghost" className="w-full">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
