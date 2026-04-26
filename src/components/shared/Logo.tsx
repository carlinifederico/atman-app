"use client";

import { Shield } from "lucide-react";
import Link from "next/link";

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const iconSize = size === "large" ? 32 : 24;
  const textClass = size === "large" ? "text-3xl" : "text-xl";

  return (
    <Link href="/" className="flex items-center gap-2">
      <Shield className="text-gold" size={iconSize} />
      <span className={`${textClass} font-bold tracking-wider text-gradient-gold`}>ATMAN</span>
    </Link>
  );
}
