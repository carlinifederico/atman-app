"use client";

import { motion } from "framer-motion";
import { Wallet, Users, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Registra tus Activos",
    description:
      "Conecta y registra tus billeteras de criptomonedas de forma segura. Soportamos las principales blockchains y tokens del mercado.",
  },
  {
    icon: Users,
    title: "Designa Herederos",
    description:
      "Asigna beneficiarios a tus activos digitales. Define porcentajes, condiciones y prioridades para cada heredero.",
  },
  {
    icon: ShieldCheck,
    title: "Transferencia Segura",
    description:
      "Nuestro protocolo garantiza que tus activos se transfieran de forma segura y automatica cuando sea necesario, sin intermediarios.",
  },
];

export function Features() {
  return (
    <section id="caracteristicas" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Todo lo que necesitas para{" "}
            <span className="text-gradient-gold">proteger tu legado</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Una plataforma completa para gestionar la herencia de tus activos
            digitales
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-colors hover:border-gold/30 hover:bg-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold/15">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
              <p className="leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
