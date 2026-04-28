"use client";

import { useState } from "react";
import { useWallets } from "@/hooks/useWallets";
import { BLOCKCHAINS } from "@/lib/constants";
import type { Wallet, BlockchainType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Wallet as WalletIcon, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchBalance, BalanceFetchError } from "@/lib/onchain/balance";

const walletSchema = z.object({
  label: z.string().min(1, "El nombre es requerido"),
  blockchain: z.string().min(1, "Selecciona una blockchain"),
  address: z.string().min(1, "La direccion es requerida"),
  balance: z.number().min(0, "El balance no puede ser negativo"),
  encrypted_notes: z.string().nullable(),
});

type WalletFormData = z.infer<typeof walletSchema>;

export default function BilleterasPage() {
  const { wallets, loading, addWallet, updateWallet, deleteWallet } = useWallets();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema) as never,
    defaultValues: {
      label: "",
      blockchain: "",
      address: "",
      balance: 0,
      encrypted_notes: "",
    },
  });

  const openCreate = () => {
    setEditingWallet(null);
    reset({
      label: "",
      blockchain: "",
      address: "",
      balance: 0,
      encrypted_notes: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    reset({
      label: wallet.label,
      blockchain: wallet.blockchain,
      address: wallet.address,
      balance: wallet.balance,
      encrypted_notes: wallet.encrypted_notes ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: WalletFormData) => {
    const payload = {
      label: data.label,
      blockchain: data.blockchain as BlockchainType,
      address: data.address,
      balance: data.balance,
      encrypted_notes: data.encrypted_notes || null,
    };

    if (editingWallet) {
      const result = await updateWallet(editingWallet.id, payload);
      if (result?.error) {
        toast.error("Error al actualizar la billetera");
        return;
      }
      toast.success("Billetera actualizada");
    } else {
      const result = await addWallet(payload);
      if (!result || result.error) {
        toast.error("Error al agregar la billetera");
        return;
      }
      toast.success("Billetera agregada");
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const result = await deleteWallet(id);
    if (result?.error) {
      toast.error("Error al eliminar la billetera");
    } else {
      toast.success("Billetera eliminada");
    }
    setDeleting(null);
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Direccion copiada");
  };

  const handleRefreshBalance = async (wallet: Wallet) => {
    setRefreshing(wallet.id);
    try {
      const liveBalance = await fetchBalance(wallet.blockchain, wallet.address);
      // Round to 6 significant digits for display
      const rounded = Math.round(liveBalance * 1e6) / 1e6;
      const result = await updateWallet(wallet.id, { balance: rounded });
      if (result?.error) {
        toast.error("Balance leído pero no se pudo guardar");
        return;
      }
      toast.success(`Balance on-chain: ${rounded} ${wallet.blockchain}`);
    } catch (e) {
      const msg =
        e instanceof BalanceFetchError ? e.message : "No se pudo leer el balance on-chain";
      toast.error(msg);
    } finally {
      setRefreshing(null);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Billeteras</h2>
          <p className="text-sm text-muted-foreground">
            Administra tus billeteras de criptomonedas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            onClick={openCreate}
            render={<Button className="glow-gold bg-gold text-black hover:bg-gold-light" />}
          >
            <Plus size={16} />
            Agregar Billetera
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>{editingWallet ? "Editar Billetera" : "Agregar Billetera"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Nombre</Label>
                <Input
                  id="label"
                  placeholder="Ej: Mi Bitcoin principal"
                  {...register("label")}
                  className="bg-background border-white/10"
                />
                {errors.label && <p className="text-xs text-red-400">{errors.label.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="blockchain">Blockchain</Label>
                <Controller
                  control={control}
                  name="blockchain"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(val) => field.onChange(val ?? "")}>
                      <SelectTrigger className="w-full bg-background border-white/10">
                        <SelectValue placeholder="Seleccionar blockchain" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10">
                        {BLOCKCHAINS.map((bc) => (
                          <SelectItem key={bc.value} value={bc.value}>
                            {bc.icon} - {bc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.blockchain && (
                  <p className="text-xs text-red-400">{errors.blockchain.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Direccion</Label>
                <Input
                  id="address"
                  placeholder="0x..."
                  className="bg-background border-white/10 font-mono text-sm"
                  {...register("address")}
                />
                {errors.address && <p className="text-xs text-red-400">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="bg-background border-white/10"
                  {...register("balance", { valueAsNumber: true })}
                />
                {errors.balance && <p className="text-xs text-red-400">{errors.balance.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="encrypted_notes">Notas</Label>
                <Textarea
                  id="encrypted_notes"
                  placeholder="Notas privadas (se cifran)"
                  className="bg-background border-white/10"
                  {...register("encrypted_notes")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold text-black hover:bg-gold-light"
                >
                  {isSubmitting ? "Guardando..." : editingWallet ? "Actualizar" : "Agregar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {wallets.length === 0 ? (
        <Card className="bg-card border-white/10">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <WalletIcon size={48} className="text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No tienes billeteras registradas</p>
            <Button onClick={openCreate} className="bg-gold text-black hover:bg-gold-light">
              <Plus size={16} />
              Agregar tu primera billetera
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet, idx) => (
            <Card
              key={wallet.id}
              data-tour={idx === 0 ? "wallet-card" : undefined}
              className="bg-card border-white/10 hover:border-gold/30 transition-colors"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">{wallet.label}</CardTitle>
                  <span className="inline-block rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                    {wallet.blockchain}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(wallet)}>
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(wallet.id)}
                    disabled={deleting === wallet.id}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-white/5 px-2 py-1 font-mono text-xs text-muted-foreground">
                    {truncateAddress(wallet.address)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => copyAddress(wallet.address)}
                  >
                    <Copy size={12} />
                  </Button>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{wallet.balance}</span>
                    <span className="text-sm text-muted-foreground">
                      {BLOCKCHAINS.find((b) => b.value === wallet.blockchain)?.icon ?? ""}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRefreshBalance(wallet)}
                    disabled={refreshing === wallet.id}
                    aria-label="Refrescar balance on-chain"
                    title="Leer balance on-chain"
                    data-tour={wallet.id === wallets[0]?.id ? "wallet-refresh" : undefined}
                  >
                    <RefreshCw
                      size={14}
                      className={refreshing === wallet.id ? "animate-spin" : ""}
                    />
                  </Button>
                </div>
                {wallet.encrypted_notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {wallet.encrypted_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
