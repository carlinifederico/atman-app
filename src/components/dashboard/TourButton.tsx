"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { startTour, hasSeenTour } from "@/lib/tour/runner";

export function TourButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Auto-start the tour on first visit to /panel
  useEffect(() => {
    if (pathname === "/panel" && !hasSeenTour()) {
      // Small delay so the panel content has time to render
      const id = setTimeout(() => startTour(router), 500);
      return () => clearTimeout(id);
    }
  }, [pathname, router]);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => startTour(router)}
      aria-label="Iniciar tour"
      title="Tour del demo"
      className="text-muted-foreground hover:text-gold"
    >
      <Sparkles size={16} />
    </Button>
  );
}
