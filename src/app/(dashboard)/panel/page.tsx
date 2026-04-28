"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DEMO_MODE,
  DEMO_WALLETS,
  DEMO_HEIRS,
  DEMO_DISTRIBUTIONS,
  DEMO_ACTIVATION,
  DEMO_ACTIVITIES,
} from "@/lib/demo-data";
import { CHART_COLORS } from "@/lib/constants";
import type { Wallet, Heir, Distribution, ActivationConfig, ActivityLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, Users, Shield, Clock, Activity, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function PanelPage() {
  const supabase = createClient();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [config, setConfig] = useState<ActivationConfig | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (DEMO_MODE) {
      setWallets(DEMO_WALLETS);
      setHeirs(DEMO_HEIRS);
      setDistributions(DEMO_DISTRIBUTIONS);
      setConfig(DEMO_ACTIVATION);
      setActivities(DEMO_ACTIVITIES);
      setLoading(false);
      return;
    }
    const [walletsRes, heirsRes, distRes, configRes, activityRes] = await Promise.all([
      supabase.from("wallets").select("*"),
      supabase.from("heirs").select("*"),
      supabase.from("distributions").select("*"),
      supabase.from("activation_configs").select("*").limit(1).single(),
      supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    setWallets(walletsRes.data ?? []);
    setHeirs(heirsRes.data ?? []);
    setDistributions(distRes.data ?? []);
    setConfig(configRes.data ?? null);
    setActivities(activityRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchData();
    });
  }, [fetchData]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    const now = new Date().toISOString();

    if (DEMO_MODE) {
      setConfig((prev) => (prev ? { ...prev, last_check_in: now } : prev));
      setActivities((prev) => [
        {
          id: `a-${Date.now()}`,
          user_id: "demo-user-001",
          action: "check_in",
          details: { timestamp: now },
          created_at: now,
        },
        ...prev,
      ]);
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

    const { error } = await supabase
      .from("activation_configs")
      .update({ last_check_in: now, updated_at: now })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Error al hacer check-in");
    } else {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: "check_in",
        details: { timestamp: now },
      });
      toast.success("Check-in realizado correctamente");
      setConfig((prev) => (prev ? { ...prev, last_check_in: now } : prev));
      fetchData();
    }
    setCheckingIn(false);
  };

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const daysSinceCheckIn = config?.last_check_in
    ? Math.floor((now - new Date(config.last_check_in).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Build pie chart data weighted by wallet balance (true inheritance share),
  // not by raw percentage points (which would sum to >100% across wallets).
  const heirShares = distributions.reduce<Record<string, number>>((acc, d) => {
    const wallet = wallets.find((w) => w.id === d.wallet_id);
    const balance = wallet?.balance ?? 0;
    const share = balance * (d.percentage / 100);
    acc[d.heir_id] = (acc[d.heir_id] ?? 0) + share;
    return acc;
  }, {});
  const totalAssigned = Object.values(heirShares).reduce((s, v) => s + v, 0);
  const pieData = Object.entries(heirShares)
    .filter(([, share]) => share > 0)
    .map(([heirId, share]) => ({
      name: heirs.find((h) => h.id === heirId)?.name ?? "Sin asignar",
      value: totalAssigned > 0 ? Math.round((share / totalAssigned) * 1000) / 10 : 0,
    }));

  const formatAction = (action: string): string => {
    const map: Record<string, string> = {
      wallet_added: "Billetera agregada",
      wallet_updated: "Billetera actualizada",
      wallet_deleted: "Billetera eliminada",
      heir_added: "Heredero agregado",
      heir_updated: "Heredero actualizado",
      heir_deleted: "Heredero eliminado",
      distribution_updated: "Distribucion actualizada",
      check_in: "Check-in realizado",
      plan_activated: "Plan activado",
      plan_deactivated: "Plan desactivado",
      config_updated: "Configuracion actualizada",
    };
    return map[action] ?? action;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div data-tour="panel-stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Billeteras
            </CardTitle>
            <WalletIcon size={18} className="text-gold" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{wallets.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Herederos
            </CardTitle>
            <Users size={18} className="text-gold" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{heirs.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estado del Plan
            </CardTitle>
            <Shield size={18} className="text-gold" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {config?.is_active ? (
                <span className="text-green-400">Activo</span>
              ) : (
                <span className="text-muted-foreground">Inactivo</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dias desde Check-in
            </CardTitle>
            <Clock size={18} className="text-gold" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {daysSinceCheckIn !== null ? daysSinceCheckIn : "\u2014"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribution pie chart */}
        <Card className="bg-card border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Distribucion</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#14141F",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#F5F5F5",
                    }}
                    formatter={(value) => [`${value}%`, "Porcentaje"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No hay distribuciones configuradas
              </p>
            )}
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="bg-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Actividad Reciente</CardTitle>
            <Activity size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 rounded-lg border border-white/5 p-3"
                  >
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{formatAction(a.action)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No hay actividad registrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Check-in button */}
      <Card className="bg-card border-white/10">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <CheckCircle size={40} className="text-gold" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Prueba de Vida</h3>
            <p className="text-sm text-muted-foreground">
              Realiza un check-in para confirmar que sigues activo
            </p>
          </div>
          <Button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="glow-gold bg-gold text-black hover:bg-gold-light"
          >
            {checkingIn ? "Procesando..." : "Hacer Check-in"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
