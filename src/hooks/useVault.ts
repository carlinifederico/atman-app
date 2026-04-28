"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DEMO_MODE } from "@/lib/demo-data";
import { readScoped, writeScoped } from "@/lib/demo-storage";
import {
  encryptWithPassphrase,
  decryptWithPassphrase,
  type EncryptedBlob,
} from "@/lib/crypto/vault";
import type { VaultEntry } from "@/lib/types";

const BUCKET = "vault_entries";

function readDemoEntries(): VaultEntry[] {
  return readScoped<VaultEntry[]>(BUCKET, []);
}

function writeDemoEntries(entries: VaultEntry[]) {
  writeScoped(BUCKET, entries);
}

export function useVault() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (DEMO_MODE) {
      setEntries(readDemoEntries());
      setLoading(false);
      return;
    }
    const { data, error: fetchError } = await supabase
      .from("vault_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
      toast.error("No se pudo cargar el vault");
    }
    setEntries(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchEntries();
    });
  }, [fetchEntries]);

  const addEntry = async (
    heir_id: string,
    label: string,
    plaintext: string,
    passphrase: string
  ) => {
    const blob = await encryptWithPassphrase(plaintext, passphrase);

    if (DEMO_MODE) {
      const newEntry: VaultEntry = {
        id: `v${Date.now()}`,
        user_id: "demo-user-001",
        heir_id,
        label,
        algo: blob.algo,
        ciphertext: blob.ciphertext,
        nonce: blob.nonce,
        salt: blob.salt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const next = [newEntry, ...entries];
      setEntries(next);
      writeDemoEntries(next);
      return { data: newEntry, error: null };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("No autenticado") };

    const { data, error: insertError } = await supabase
      .from("vault_entries")
      .insert({
        user_id: user.id,
        heir_id,
        label,
        algo: blob.algo,
        ciphertext: blob.ciphertext,
        nonce: blob.nonce,
        salt: blob.salt,
      })
      .select()
      .single();

    if (insertError) {
      toast.error("Error al guardar la instrucción cifrada");
      return { data: null, error: insertError };
    }

    await supabase.from("activity_log").insert({
      user_id: user.id,
      action: "vault_entry_added",
      details: { label, heir_id },
    });
    setEntries((prev) => [data as VaultEntry, ...prev]);
    return { data, error: null };
  };

  const deleteEntry = async (id: string) => {
    if (DEMO_MODE) {
      const next = entries.filter((e) => e.id !== id);
      setEntries(next);
      writeDemoEntries(next);
      return { error: null };
    }
    const { error: deleteError } = await supabase.from("vault_entries").delete().eq("id", id);
    if (deleteError) {
      toast.error("Error al eliminar");
      return { error: deleteError };
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    return { error: null };
  };

  const decryptEntry = async (entry: VaultEntry, passphrase: string): Promise<string> => {
    const blob: EncryptedBlob = {
      algo: entry.algo as EncryptedBlob["algo"],
      ciphertext: entry.ciphertext,
      nonce: entry.nonce,
      salt: entry.salt,
    };
    return decryptWithPassphrase(blob, passphrase);
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    deleteEntry,
    decryptEntry,
    refetch: fetchEntries,
  };
}
