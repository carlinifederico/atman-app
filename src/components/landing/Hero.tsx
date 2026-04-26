"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_MODE } from "@/lib/demo-data";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-gold/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-20">
        {/* Text content */}
        <motion.div
          className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.span
            className="mb-4 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Herencia Digital para Criptoactivos
          </motion.span>

          <motion.h1
            className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Tu legado digital,{" "}
            <span className="text-gradient-gold">protegido para siempre</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            Asegura la transferencia de tus criptoactivos a tus herederos de
            forma segura y automatizada. Porque tu patrimonio digital merece el
            mismo cuidado que el fisico.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="glow-gold h-12 px-8 text-base font-semibold"
              render={<Link href={DEMO_MODE ? "/panel" : "/registro"} />}
            >
              Comenzar Ahora
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base font-semibold border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
              render={<a href="#como-funciona" />}
            >
              Conocer Mas
            </Button>
          </motion.div>
        </motion.div>

        {/* Decorative shield/lock visual */}
        <motion.div
          className="relative flex flex-1 items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <div className="relative h-64 w-64 sm:h-80 sm:w-80">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-gold/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            {/* Middle ring */}
            <motion.div
              className="absolute inset-6 rounded-full border border-gold/15"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner glow */}
            <div className="absolute inset-12 rounded-full bg-gold/5 backdrop-blur-sm" />

            {/* Central shield icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Shield className="h-20 w-20 text-gold/80 sm:h-24 sm:w-24" strokeWidth={1.2} />
                <Lock className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-gold sm:h-10 sm:w-10" strokeWidth={1.5} />
              </div>
            </div>

            {/* Orbiting icons */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-card">
                <KeyRound className="h-5 w-5 text-gold" />
              </div>
            </motion.div>

            <motion.div
              className="absolute right-0 top-1/4 translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-card">
                <Shield className="h-5 w-5 text-gold" />
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-0 right-1/4 translate-y-1/2"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-card">
                <Lock className="h-5 w-5 text-gold" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
