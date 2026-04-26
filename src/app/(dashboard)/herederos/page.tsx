"use client";

import { useState } from "react";
import { useHeirs } from "@/hooks/useHeirs";
import { RELATIONSHIPS } from "@/lib/constants";
import type { Heir, RelationshipType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Users, Mail } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const heirSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email invalido"),
  wallet_address: z.string().nullable(),
  relationship: z.string().min(1, "Selecciona una relacion"),
});

type HeirFormData = z.infer<typeof heirSchema>;

export default function HerederosPage() {
  const { heirs, loading, addHeir, updateHeir, deleteHeir } = useHeirs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHeir, setEditingHeir] = useState<Heir | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HeirFormData>({
    resolver: zodResolver(heirSchema),
    defaultValues: {
      name: "",
      email: "",
      wallet_address: "",
      relationship: "",
    },
  });

  const openCreate = () => {
    setEditingHeir(null);
    reset({
      name: "",
      email: "",
      wallet_address: "",
      relationship: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (heir: Heir) => {
    setEditingHeir(heir);
    reset({
      name: heir.name,
      email: heir.email,
      wallet_address: heir.wallet_address ?? "",
      relationship: heir.relationship,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: HeirFormData) => {
    const payload = {
      name: data.name,
      email: data.email,
      wallet_address: data.wallet_address || null,
      relationship: data.relationship as RelationshipType,
    };

    if (editingHeir) {
      const result = await updateHeir(editingHeir.id, payload);
      if (result?.error) {
        toast.error("Error al actualizar el heredero");
        return;
      }
      toast.success("Heredero actualizado");
    } else {
      const result = await addHeir(payload);
      if (!result || result.error) {
        toast.error("Error al agregar el heredero");
        return;
      }
      toast.success("Heredero agregado");
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const result = await deleteHeir(id);
    if (result?.error) {
      toast.error("Error al eliminar el heredero");
    } else {
      toast.success("Heredero eliminado");
    }
    setDeleting(null);
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
          <h2 className="text-2xl font-bold">Herederos</h2>
          <p className="text-sm text-muted-foreground">
            Administra las personas que heredaran tus activos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            onClick={openCreate}
            render={<Button className="glow-gold bg-gold text-black hover:bg-gold-light" />}
          >
            <Plus size={16} />
            Agregar Heredero
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>{editingHeir ? "Editar Heredero" : "Agregar Heredero"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Nombre completo"
                  {...register("name")}
                  className="bg-background border-white/10"
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register("email")}
                  className="bg-background border-white/10"
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet_address">Direccion de billetera (opcional)</Label>
                <Input
                  id="wallet_address"
                  placeholder="0x..."
                  className="bg-background border-white/10 font-mono text-sm"
                  {...register("wallet_address")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relacion</Label>
                <Controller
                  control={control}
                  name="relationship"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(val) => field.onChange(val ?? "")}>
                      <SelectTrigger className="w-full bg-background border-white/10">
                        <SelectValue placeholder="Seleccionar relacion" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10">
                        {RELATIONSHIPS.map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.relationship && (
                  <p className="text-xs text-red-400">{errors.relationship.message}</p>
                )}
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
                  {isSubmitting ? "Guardando..." : editingHeir ? "Actualizar" : "Agregar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {heirs.length === 0 ? (
        <Card className="bg-card border-white/10">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Users size={48} className="text-muted-foreground" />
            <p className="text-lg text-muted-foreground">No tienes herederos registrados</p>
            <Button onClick={openCreate} className="bg-gold text-black hover:bg-gold-light">
              <Plus size={16} />
              Agregar tu primer heredero
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {heirs.map((heir) => (
            <Card
              key={heir.id}
              className="bg-card border-white/10 hover:border-gold/30 transition-colors"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">{heir.name}</CardTitle>
                  <Badge variant="secondary" className="bg-gold/10 text-gold border-0">
                    {heir.relationship}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(heir)}>
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(heir.id)}
                    disabled={deleting === heir.id}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail size={14} />
                  {heir.email}
                </div>
                {heir.wallet_address && (
                  <code className="block truncate rounded bg-white/5 px-2 py-1 font-mono text-xs text-muted-foreground">
                    {heir.wallet_address}
                  </code>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
