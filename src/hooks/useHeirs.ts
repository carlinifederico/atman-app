"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEMO_MODE, DEMO_HEIRS } from "@/lib/demo-data";
import type { Heir } from "@/lib/types";

export function useHeirs() {
  const [heirs, setHeirs] = useState<Heir[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchHeirs = useCallback(async () => {
    setLoading(true);
    if (DEMO_MODE) {
      setHeirs(DEMO_HEIRS);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("heirs")
      .select("*")
      .order("created_at", { ascending: false });
    setHeirs(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchHeirs();
    });
  }, [fetchHeirs]);

  const addHeir = async (heir: Omit<Heir, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (DEMO_MODE) {
      const newHeir: Heir = {
        ...heir,
        id: `h${Date.now()}`,
        user_id: "demo-user-001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setHeirs((prev) => [newHeir, ...prev]);
      return { data: newHeir, error: null };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("heirs")
      .insert({ ...heir, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: "heir_added",
        details: { name: heir.name, relationship: heir.relationship },
      });
      setHeirs((prev) => [data, ...prev]);
    }
    return { data, error };
  };

  const updateHeir = async (id: string, updates: Partial<Heir>) => {
    if (DEMO_MODE) {
      setHeirs((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, ...updates, updated_at: new Date().toISOString() } : h
        )
      );
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from("heirs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          action: "heir_updated",
          details: { name: data.name },
        });
      }
      setHeirs((prev) => prev.map((h) => (h.id === id ? data : h)));
    }
    return { data, error };
  };

  const deleteHeir = async (id: string) => {
    if (DEMO_MODE) {
      setHeirs((prev) => prev.filter((h) => h.id !== id));
      return { error: null };
    }

    const heir = heirs.find((h) => h.id === id);
    const { error } = await supabase.from("heirs").delete().eq("id", id);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && heir) {
        await supabase.from("activity_log").insert({
          user_id: user.id,
          action: "heir_deleted",
          details: { name: heir.name },
        });
      }
      setHeirs((prev) => prev.filter((h) => h.id !== id));
    }
    return { error };
  };

  return { heirs, loading, addHeir, updateHeir, deleteHeir, refetch: fetchHeirs };
}
