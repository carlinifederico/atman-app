"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DEMO_MODE, DEMO_DISTRIBUTIONS } from "@/lib/demo-data";
import { readScopedOrSeed, writeScoped } from "@/lib/demo-storage";
import { totalPercentage as sumPercentages } from "@/lib/distribution";
import type { Distribution } from "@/lib/types";

const BUCKET = "distributions";

export function useDistribution(walletId?: string) {
  const [distributions, setDistributionsState] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Wrapper persists ALL distributions (unfiltered) to localStorage in DEMO_MODE,
  // even when the hook is filtered by walletId. State holds only the filtered slice.
  const setDistributions = useCallback(
    (next: Distribution[]) => {
      setDistributionsState(next);
      if (DEMO_MODE) {
        // Re-merge into the full set: drop entries for walletId (if filtered) and append new
        if (walletId) {
          const all = readScopedOrSeed<Distribution[]>(BUCKET, DEMO_DISTRIBUTIONS);
          const others = all.filter((d) => d.wallet_id !== walletId);
          writeScoped(BUCKET, [...others, ...next]);
        } else {
          writeScoped(BUCKET, next);
        }
      }
    },
    [walletId]
  );

  const fetchDistributions = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (DEMO_MODE) {
      const all = readScopedOrSeed<Distribution[]>(BUCKET, DEMO_DISTRIBUTIONS);
      const filtered = walletId ? all.filter((d) => d.wallet_id === walletId) : all;
      setDistributionsState(filtered);
      setLoading(false);
      return;
    }
    let query = supabase.from("distributions").select("*");
    if (walletId) {
      query = query.eq("wallet_id", walletId);
    }
    const { data, error: fetchError } = await query.order("created_at", { ascending: true });
    if (fetchError) {
      setError(fetchError.message);
      toast.error("No se pudieron cargar las distribuciones");
    }
    setDistributions(data ?? []);
    setLoading(false);
  }, [supabase, walletId, setDistributions]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchDistributions();
    });
  }, [fetchDistributions]);

  const saveDistributions = async (
    wId: string,
    entries: { heir_id: string; percentage: number }[]
  ) => {
    if (DEMO_MODE) {
      const newDists: Distribution[] = entries
        .filter((e) => e.percentage > 0)
        .map((e, i) => ({
          id: `d-new-${Date.now()}-${i}`,
          user_id: "demo-user-001",
          wallet_id: wId,
          heir_id: e.heir_id,
          percentage: e.percentage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      setDistributions(newDists);
      return { data: newDists, error: null };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    await supabase.from("distributions").delete().eq("wallet_id", wId);

    const inserts = entries
      .filter((e) => e.percentage > 0)
      .map((e) => ({
        user_id: user.id,
        wallet_id: wId,
        heir_id: e.heir_id,
        percentage: e.percentage,
      }));

    if (inserts.length === 0) {
      setDistributions([]);
      return { data: [], error: null };
    }

    const { data, error } = await supabase.from("distributions").insert(inserts).select();

    if (!error) {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: "distribution_updated",
        details: { wallet_id: wId, entries: inserts.length },
      });
      if (data) setDistributions(data);
    }
    return { data, error };
  };

  const totalPercentage = sumPercentages(distributions);

  return {
    distributions,
    loading,
    error,
    saveDistributions,
    totalPercentage,
    refetch: fetchDistributions,
  };
}
