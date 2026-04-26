"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_MODE } from "@/lib/demo-data";

export function CTA() {
  return (
    <section className="px-4 py-24">
      <motion.div
        className="mx-auto max-w-3xl rounded-3xl border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent p-12 text-center sm:p-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Protege tu <span className="text-gradient-gold">legado hoy</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
          No dejes tu patrimonio digital al azar. Comienza ahora y asegura el futuro financiero de
          tus seres queridos.
        </p>
        <div className="mt-8">
          <Button
            size="lg"
            className="glow-gold h-12 px-8 text-base font-semibold"
            render={<Link href={DEMO_MODE ? "/panel" : "/registro"} />}
          >
            Comenzar Ahora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
