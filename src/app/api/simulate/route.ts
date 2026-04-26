import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json({ error: "user_id es requerido" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify the requesting user matches
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Fetch wallets, heirs, distributions for this user
    const [walletsRes, heirsRes, distributionsRes] = await Promise.all([
      supabase.from("wallets").select("*").eq("user_id", user_id),
      supabase.from("heirs").select("*").eq("user_id", user_id),
      supabase.from("distributions").select("*").eq("user_id", user_id),
    ]);

    const wallets = walletsRes.data ?? [];
    const heirs = heirsRes.data ?? [];
    const distributions = distributionsRes.data ?? [];

    // Build simulated transfers
    const transfers = distributions.map((d) => {
      const wallet = wallets.find((w) => w.id === d.wallet_id);
      const heir = heirs.find((h) => h.id === d.heir_id);

      return {
        wallet_label: wallet?.label ?? "Billetera desconocida",
        blockchain: wallet?.blockchain ?? "Desconocida",
        heir_name: heir?.name ?? "Heredero desconocido",
        heir_email: heir?.email ?? "",
        percentage: d.percentage,
        amount: (wallet?.balance ?? 0) * (d.percentage / 100),
      };
    });

    // Count unique wallets and heirs involved
    const uniqueWalletIds = new Set(distributions.map((d) => d.wallet_id));
    const uniqueHeirIds = new Set(distributions.map((d) => d.heir_id));

    const result = {
      transfers,
      total_wallets: uniqueWalletIds.size,
      total_heirs: uniqueHeirIds.size,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
