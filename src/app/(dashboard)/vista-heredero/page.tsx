"use client";

import { useState } from "react";
import { useHeirs } from "@/hooks/useHeirs";
import { useWallets } from "@/hooks/useWallets";
import { useDistribution } from "@/hooks/useDistribution";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Wallet, Gift } from "lucide-react";
import type { Distribution } from "@/lib/types";
import { BLOCKCHAINS } from "@/lib/constants";

export default function VistaHerederoPage() {
  const { heirs, loading: heirsLoading } = useHeirs();
  const { wallets, loading: walletsLoading } = useWallets();
  const { distributions, loading: distLoading } = useDistribution();
  const [selectedHeirId, setSelectedHeirId] = useState<string>("");

  const selectedHeir = heirs.find((h) => h.id === selectedHeirId);

  // Get distributions for this heir
  const heirDistributions = distributions.filter((d) => d.heir_id === selectedHeirId);

  // Build wallet info for the preview
  const assignedWallets = heirDistributions.map((d: Distribution) => {
    const wallet = wallets.find((w) => w.id === d.wallet_id);
    return {
      id: d.id,
      label: wallet?.label ?? "Billetera desconocida",
      blockchain: wallet?.blockchain ?? "Desconocida",
      balance: wallet?.balance ?? 0,
      percentage: d.percentage,
      amount: (wallet?.balance ?? 0) * (d.percentage / 100),
    };
  });

  const loading = heirsLoading || walletsLoading || distLoading;

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
        <h2 className="text-2xl font-bold">Vista Heredero</h2>
        <p className="text-sm text-muted-foreground">
          Previsualiza lo que veria cada heredero al recibir su herencia digital
        </p>
      </div>

      {/* Heir selector */}
      <Card className="bg-card border-white/10">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>Seleccionar heredero</Label>
            <Select value={selectedHeirId} onValueChange={(val) => setSelectedHeirId(val ?? "")}>
              <SelectTrigger className="bg-background border-white/10">
                <SelectValue placeholder="Elige un heredero para previsualizar" />
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
        </CardContent>
      </Card>

      {/* Preview card */}
      {selectedHeir && (
        <div className="mx-auto max-w-xl">
          <Card className="overflow-hidden border-gold/20 bg-gradient-to-b from-[#14141F] to-[#0E0E15]">
            {/* Header with gold accent */}
            <div className="bg-gradient-to-r from-gold/20 to-gold/5 px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 ring-2 ring-gold/30">
                <Shield size={32} className="text-gold" />
              </div>
              <h2 className="text-2xl font-bold tracking-wider text-gradient-gold">ATMAN</h2>
              <p className="mt-1 text-xs text-muted-foreground tracking-widest uppercase">
                Herencia Digital Segura
              </p>
            </div>

            <CardContent className="space-y-6 p-6">
              {/* Message */}
              <div className="rounded-lg border border-gold/20 bg-gold/5 p-4 text-center">
                <Gift size={24} className="mx-auto mb-2 text-gold" />
                <p className="text-sm font-medium">Has sido designado como heredero digital</p>
              </div>

              {/* Heir info */}
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold">{selectedHeir.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedHeir.email}</p>
                <span className="inline-block rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                  {selectedHeir.relationship}
                </span>
              </div>

              {/* Assigned wallets */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Activos Asignados
                </h4>

                {assignedWallets.length > 0 ? (
                  <div className="space-y-2">
                    {assignedWallets.map((aw) => (
                      <div
                        key={aw.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10">
                            <Wallet size={14} className="text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{aw.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {aw.blockchain} -{" "}
                              {BLOCKCHAINS.find((b) => b.value === aw.blockchain)?.icon ?? ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{aw.amount.toFixed(4)}</p>
                          <p className="text-xs text-gold">{aw.percentage}%</p>
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="mt-2 rounded-lg border border-gold/20 bg-gold/5 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Porcentaje Total Asignado</span>
                        <span className="text-lg font-bold text-gold">
                          {assignedWallets.reduce((sum, aw) => sum + aw.percentage, 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 p-6 text-center">
                    <Wallet size={32} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Este heredero no tiene activos asignados todavia
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 pt-4 text-center">
                <p className="text-[10px] text-muted-foreground">
                  Este es un mensaje de vista previa generado por ATMAN. La transferencia real se
                  realizara cuando se active el plan de herencia digital.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
