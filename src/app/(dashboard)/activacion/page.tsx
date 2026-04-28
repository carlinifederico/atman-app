"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DEMO_MODE,
  DEMO_ACTIVATION,
  DEMO_WALLETS,
  DEMO_HEIRS,
  DEMO_DISTRIBUTIONS,
} from "@/lib/demo-data";
import { ACTIVATION_METHODS } from "@/lib/constants";
import type { ActivationConfig } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Clock, Hand, Users, CheckCircle, Zap, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getMailer, composeHeirNotification } from "@/lib/notifications/mailer";
import { DEMO_USER } from "@/lib/demo-data";

const methodIcons: Record<string, React.ElementType> = {
  inactivity: Clock,
  manual: Hand,
  multisig: Users,
};

interface SimulationResult {
  transfers: {
    wallet_label: string;
    blockchain: string;
    heir_name: string;
    heir_email: string;
    percentage: number;
    amount: number;
  }[];
  total_wallets: number;
  total_heirs: number;
}

export default function ActivacionPage() {
  const supabase = createClient();
  const [config, setConfig] = useState<ActivationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState(-1);

  // Local form state
  const [method, setMethod] = useState<"inactivity" | "manual" | "multisig">("inactivity");
  const [inactivityDays, setInactivityDays] = useState(365);
  const [isActive, setIsActive] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    if (DEMO_MODE) {
      setConfig(DEMO_ACTIVATION);
      setMethod(DEMO_ACTIVATION.method);
      setInactivityDays(DEMO_ACTIVATION.inactivity_days);
      setIsActive(DEMO_ACTIVATION.is_active);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("activation_configs").select("*").limit(1).single();

    if (data) {
      setConfig(data);
      setMethod(data.method);
      setInactivityDays(data.inactivity_days);
      setIsActive(data.is_active);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);

    if (DEMO_MODE) {
      const now = new Date().toISOString();
      setConfig((prev) =>
        prev
          ? {
              ...prev,
              method,
              inactivity_days: inactivityDays,
              is_active: isActive,
              updated_at: now,
            }
          : prev
      );
      toast.success("Configuracion guardada");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("No se pudo verificar tu sesion");
      setSaving(false);
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      method,
      inactivity_days: inactivityDays,
      is_active: isActive,
      updated_at: now,
    };

    if (config) {
      const { error } = await supabase
        .from("activation_configs")
        .update(payload)
        .eq("id", config.id);

      if (error) {
        toast.error("Error al guardar la configuracion");
      } else {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          action:
            isActive !== config.is_active
              ? isActive
                ? "plan_activated"
                : "plan_deactivated"
              : "config_updated",
          details: payload,
        });
        toast.success("Configuracion guardada");
        setConfig((prev) => (prev ? { ...prev, ...payload } : prev));
      }
    } else {
      const { data, error } = await supabase
        .from("activation_configs")
        .insert({
          user_id: user.id,
          ...payload,
          last_check_in: now,
        })
        .select()
        .single();

      if (error) {
        toast.error("Error al crear la configuracion");
      } else {
        toast.success("Configuracion creada");
        setConfig(data);
      }
    }
    setSaving(false);
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    const now = new Date().toISOString();

    if (DEMO_MODE) {
      setConfig((prev) => (prev ? { ...prev, last_check_in: now } : prev));
      toast.success("Check-in realizado correctamente");
      setCheckingIn(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("No se pudo verificar tu sesion");
      setCheckingIn(false);
      return;
    }

    if (config) {
      await supabase
        .from("activation_configs")
        .update({ last_check_in: now, updated_at: now })
        .eq("id", config.id);
    }

    await supabase.from("activity_log").insert({
      user_id: user.id,
      action: "check_in",
      details: { timestamp: now },
    });

    setConfig((prev) => (prev ? { ...prev, last_check_in: now } : prev));
    toast.success("Check-in realizado correctamente");
    setCheckingIn(false);
  };

  const handleSimulate = async () => {
    setSimulating(true);

    if (DEMO_MODE) {
      const transfers = DEMO_DISTRIBUTIONS.map((d) => {
        const wallet = DEMO_WALLETS.find((w) => w.id === d.wallet_id);
        const heir = DEMO_HEIRS.find((h) => h.id === d.heir_id);
        return {
          wallet_label: wallet?.label ?? "",
          blockchain: wallet?.blockchain ?? "",
          heir_name: heir?.name ?? "",
          heir_email: heir?.email ?? "",
          percentage: d.percentage,
          amount: (wallet?.balance ?? 0) * (d.percentage / 100),
        };
      });
      const result: SimulationResult = {
        transfers,
        total_wallets: new Set(DEMO_DISTRIBUTIONS.map((d) => d.wallet_id)).size,
        total_heirs: new Set(DEMO_DISTRIBUTIONS.map((d) => d.heir_id)).size,
      };
      setSimulationResult(result);
      setShowSimModal(true);
      setAnimatingIndex(-1);
      for (let i = 0; i < result.transfers.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setAnimatingIndex(i);
      }
      // Queue notification preview per heir who is receiving anything
      const mailer = getMailer();
      const ownerName = DEMO_USER.user_metadata?.full_name ?? DEMO_USER.email ?? "Tu usuario ATMAN";
      const heirIds = new Set(DEMO_DISTRIBUTIONS.map((d) => d.heir_id));
      for (const heirId of heirIds) {
        const heir = DEMO_HEIRS.find((h) => h.id === heirId);
        if (!heir) continue;
        const labels = DEMO_DISTRIBUTIONS.filter((d) => d.heir_id === heirId).map((d) => {
          const w = DEMO_WALLETS.find((w) => w.id === d.wallet_id);
          return `${w?.label ?? "Billetera"} (${d.percentage}%)`;
        });
        const { subject, body } = composeHeirNotification({
          heir,
          ownerName,
          vaultEntryLabels: labels,
        });
        await mailer.send({ to: heir.email, channel: "email", subject, body });
      }
      toast.success(`${heirIds.size} notificación(es) encoladas al outbox`);
      setSimulating(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("No se pudo verificar tu sesion");
      setSimulating(false);
      return;
    }

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!res.ok) {
        throw new Error("Error en simulacion");
      }

      const result: SimulationResult = await res.json();
      setSimulationResult(result);
      setShowSimModal(true);
      setAnimatingIndex(-1);

      for (let i = 0; i < result.transfers.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setAnimatingIndex(i);
      }
    } catch {
      toast.error("Error al simular la activacion");
    }
    setSimulating(false);
  };

  const daysSinceCheckIn = config?.last_check_in
    ? Math.floor((Date.now() - new Date(config.last_check_in).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activacion</h2>
        <p className="text-sm text-muted-foreground">
          Configura como y cuando se activara la transferencia de tus activos
        </p>
      </div>

      {/* Method selector */}
      <div data-tour="activation-methods" className="grid gap-4 sm:grid-cols-3">
        {ACTIVATION_METHODS.map((m) => {
          const Icon = methodIcons[m.value] ?? Shield;
          const selected = method === m.value;
          return (
            <Card
              key={m.value}
              className={`cursor-pointer bg-card border-white/10 transition-all ${
                selected
                  ? "border-gold/50 ring-1 ring-gold/30"
                  : m.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-white/20"
              }`}
              onClick={() => {
                if (!m.disabled) setMethod(m.value);
              }}
            >
              <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                <Icon size={32} className={selected ? "text-gold" : "text-muted-foreground"} />
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="font-semibold">{m.label}</h3>
                    {m.disabled && (
                      <Badge
                        variant="secondary"
                        className="bg-gold/10 text-gold border-0 text-[10px]"
                      >
                        proximamente
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
                </div>
                {selected && <div className="h-1 w-8 rounded-full bg-gold" />}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inactivity days */}
      {method === "inactivity" && (
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Periodo de Inactividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inactivity_days">Dias de inactividad antes de activar</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="inactivity_days"
                  type="number"
                  min={1}
                  max={3650}
                  value={inactivityDays}
                  onChange={(e) => setInactivityDays(parseInt(e.target.value) || 365)}
                  className="w-32 bg-background border-white/10"
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Si no realizas un check-in en {inactivityDays} dias, el plan se activara
                automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan toggle & check-in */}
      <Card className="bg-card border-white/10">
        <CardContent className="space-y-6 pt-6">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Activar Plan</h3>
              <p className="text-sm text-muted-foreground">
                {isActive ? "Tu plan esta activo y monitoreando" : "Tu plan esta desactivado"}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Last check-in */}
          <div className="rounded-lg border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Ultimo Check-in</p>
                <p className="text-xs text-muted-foreground">
                  {config?.last_check_in
                    ? new Date(config.last_check_in).toLocaleString("es-ES", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "Nunca"}
                </p>
              </div>
              {daysSinceCheckIn !== null && (
                <span
                  className={`text-2xl font-bold ${
                    daysSinceCheckIn > inactivityDays * 0.8
                      ? "text-red-400"
                      : daysSinceCheckIn > inactivityDays * 0.5
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                >
                  {daysSinceCheckIn}d
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="bg-gold text-black hover:bg-gold-light glow-gold"
            >
              {checkingIn ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Hacer Check-in
            </Button>

            <Button
              onClick={handleSimulate}
              disabled={simulating}
              variant="outline"
              data-tour="simulate-button"
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              {simulating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Simular Activacion
            </Button>

            <Button onClick={handleSave} disabled={saving} variant="secondary">
              {saving ? "Guardando..." : "Guardar Configuracion"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulation modal */}
      <Dialog open={showSimModal} onOpenChange={setShowSimModal}>
        <DialogContent className="bg-card border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap size={20} className="text-gold" />
              Simulacion de Activacion
            </DialogTitle>
          </DialogHeader>
          {simulationResult && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Billeteras: {simulationResult.total_wallets}</span>
                <span>Herederos: {simulationResult.total_heirs}</span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {simulationResult.transfers.map((t, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all duration-500 ${
                      i <= animatingIndex
                        ? "border-gold/30 bg-gold/5 opacity-100 translate-x-0"
                        : "border-white/5 opacity-30 translate-x-4"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{t.wallet_label}</span>
                        <span className="text-xs text-muted-foreground">({t.blockchain})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{t.amount.toFixed(4)}</span>
                        <ArrowRight size={12} className="text-gold" />
                        <span className="text-xs font-medium">{t.heir_name}</span>
                        <span className="text-xs text-muted-foreground">({t.percentage}%)</span>
                      </div>
                    </div>
                    {i <= animatingIndex && (
                      <CheckCircle size={16} className="text-green-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {simulationResult.transfers.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay distribuciones configuradas para simular
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
