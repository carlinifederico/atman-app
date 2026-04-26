"use client";

import { motion } from "framer-motion";
import { Lock, KeyRound, Code, Fingerprint } from "lucide-react";

const badges = [
  {
    icon: Lock,
    title: "Cifrado End-to-End",
    description:
      "Toda tu informacion esta cifrada en transito y en reposo con los estandares mas altos de la industria.",
  },
  {
    icon: KeyRound,
    title: "Sin Acceso a tus Claves",
    description:
      "Nunca almacenamos ni tenemos acceso a tus claves privadas. Tu mantienes el control total de tus activos.",
  },
  {
    icon: Code,
    title: "Codigo Abierto",
    description:
      "Nuestro protocolo es de codigo abierto. Cualquiera puede auditarlo y verificar la seguridad de la plataforma.",
  },
  {
    icon: Fingerprint,
    title: "Multifirma",
    description:
      "Utilizamos esquemas de multifirma para garantizar que ninguna parte pueda actuar de forma unilateral.",
  },
];

export function Trust() {
  return (
    <section id="seguridad" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Seguridad en la que puedes{" "}
            <span className="text-gradient-gold">confiar</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tu seguridad es nuestra prioridad. Cada capa de nuestra plataforma
            esta disenada para proteger tus activos.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              className="group flex flex-col items-center rounded-2xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm transition-colors hover:border-gold/20 hover:bg-card/60"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold transition-colors group-hover:bg-gold/15">
                <badge.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-base font-semibold">{badge.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {badge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
