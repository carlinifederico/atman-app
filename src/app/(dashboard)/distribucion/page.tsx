"use client";

import { useEffect, useState } from "react";
import { useWallets } from "@/hooks/useWallets";
import { useHeirs } from "@/hooks/useHeirs";
import { useDistribution } from "@/hooks/useDistribution";
import { CHART_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { PieChart as PieChartIcon, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function DistribucionPage() {
  const { wallets, loading: walletsLoading } = useWallets();
  const { heirs, loading: heirsLoading } = useHeirs();
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const {
    distributions,
    loading: distLoading,
    saveDistributions,
  } = useDistribution(selectedWalletId || undefined);
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  // Initialize percentages from fetched distributions
  useEffect(() => {
    if (!distLoading && heirs.length > 0) {
      const map: Record<string, number> = {};
      heirs.forEach((h) => {
        const dist = distributions.find((d) => d.heir_id === h.id);
        map[h.id] = dist?.percentage ?? 0;
      });
      queueMicrotask(() => setPercentages(map));
    }
  }, [distributions, heirs, distLoading]);

  const totalPercentage = Object.values(percentages).reduce<number>((sum, p) => sum + p, 0);

  const handleSliderChange = (heirId: string, value: number | readonly number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setPercentages((prev) => ({ ...prev, [heirId]: val }));
  };

  const handleSave = async () => {
    if (!selectedWalletId) {
      toast.error("Selecciona una billetera");
      return;
    }
    if (totalPercentage !== 100) {
      toast.error("La distribucion debe sumar exactamente 100%");
      return;
    }

    setSaving(true);
    const entries = Object.entries(percentages)
      .filter(([, pct]) => pct > 0)
      .map(([heir_id, percentage]) => ({ heir_id, percentage }));

    const result = await saveDistributions(selectedWalletId, entries);
    if (result?.error) {
      toast.error("Error al guardar la distribucion");
    } else {
      toast.success("Distribucion guardada correctamente");
    }
    setSaving(false);
  };

  const pieData = Object.entries(percentages)
    .filter(([, pct]) => pct > 0)
    .map(([heirId, value]) => ({
      name: heirs.find((h) => h.id === heirId)?.name ?? "Desconocido",
      value,
    }));

  const loading = walletsLoading || heirsLoading;

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
        <h2 className="text-2xl font-bold">Distribucion</h2>
        <p className="text-sm text-muted-foreground">
          Configura como se distribuiran tus activos entre herederos
        </p>
      </div>

      {/* Wallet selector */}
      <Card className="bg-card border-white/10">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>Seleccionar billetera</Label>
            <Select
              value={selectedWalletId}
              onValueChange={(val) => setSelectedWalletId(val ?? "")}
            >
              <SelectTrigger className="bg-background border-white/10">
                <SelectValue placeholder="Elige una billetera" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {wallets.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.label} ({w.blockchain}) - {w.balance}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedWalletId && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sliders */}
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Asignar Porcentajes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {heirs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay herederos registrados. Agrega herederos primero.
                </p>
              ) : (
                <>
                  {heirs.map((heir) => (
                    <div key={heir.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          {heir.name}{" "}
                          <span className="text-muted-foreground">({heir.relationship})</span>
                        </Label>
                        <span className="min-w-[3rem] text-right text-sm font-bold text-gold">
                          {percentages[heir.id] ?? 0}%
                        </span>
                      </div>
                      <Slider
                        value={[percentages[heir.id] ?? 0]}
                        onValueChange={(val) => handleSliderChange(heir.id, val)}
                        max={100}
                        step={1}
                        className="[&_[role=slider]]:bg-gold [&_[data-slot=range]]:bg-gold"
                      />
                    </div>
                  ))}

                  {/* Total indicator */}
                  <div className="rounded-lg border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total</span>
                      <span
                        className={`text-lg font-bold ${
                          totalPercentage === 100
                            ? "text-green-400"
                            : totalPercentage > 100
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {totalPercentage}%
                      </span>
                    </div>
                    {totalPercentage !== 100 && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-yellow-400">
                        <AlertTriangle size={14} />
                        {totalPercentage > 100
                          ? "La suma excede el 100%"
                          : `Faltan ${100 - totalPercentage}% por asignar`}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={saving || totalPercentage !== 100}
                    className="w-full bg-gold text-black hover:bg-gold-light glow-gold"
                  >
                    <Save size={16} />
                    {saving ? "Guardando..." : "Guardar Distribucion"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pie chart */}
          <Card className="bg-card border-white/10">
            <CardHeader className="flex flex-row items-center gap-2">
              <PieChartIcon size={18} className="text-gold" />
              <CardTitle className="text-base">Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
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
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <PieChartIcon size={48} className="mb-4 opacity-50" />
                  <p className="text-sm">Asigna porcentajes para ver la distribucion</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
