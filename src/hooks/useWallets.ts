"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEMO_MODE, DEMO_WALLETS } from "@/lib/demo-data";
import type { Wallet } from "@/lib/types";

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    if (DEMO_MODE) {
      setWallets(DEMO_WALLETS);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("wallets")
      .select("*")
      .order("created_at", { ascending: false });
    setWallets(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const addWallet = async (wallet: Omit<Wallet, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (DEMO_MODE) {
      const newWallet: Wallet = {
        ...wallet,
        id: `w${Date.now()}`,
        user_id: "demo-user-001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setWallets((prev) => [newWallet, ...prev]);
      return { data: newWallet, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("wallets")
      .insert({ ...wallet, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: "wallet_added",
        details: { label: wallet.label, blockchain: wallet.blockchain },
      });
      setWallets((prev) => [data, ...prev]);
    }
    return { data, error };
  };

  const updateWallet = async (id: string, updates: Partial<Wallet>) => {
    if (DEMO_MODE) {
      setWallets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w))
      );
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from("wallets")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          action: "wallet_updated",
          details: { label: data.label },
        });
      }
      setWallets((prev) => prev.map((w) => (w.id === id ? data : w)));
    }
    return { data, error };
  };

  const deleteWallet = async (id: string) => {
    if (DEMO_MODE) {
      setWallets((prev) => prev.filter((w) => w.id !== id));
      return { error: null };
    }

    const wallet = wallets.find((w) => w.id === id);
    const { error } = await supabase.from("wallets").delete().eq("id", id);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && wallet) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          action: "wallet_deleted",
          details: { label: wallet.label },
        });
      }
      setWallets((prev) => prev.filter((w) => w.id !== id));
    }
    return { error };
  };

  return { wallets, loading, addWallet, updateWallet, deleteWallet, refetch: fetchWallets };
}
