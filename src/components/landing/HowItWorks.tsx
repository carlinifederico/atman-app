"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "Crea tu cuenta",
    description:
      "Registrate en minutos con tu correo electronico. Verificamos tu identidad para garantizar la seguridad de tu cuenta.",
  },
  {
    number: 2,
    title: "Agrega tus billeteras",
    description:
      "Conecta tus billeteras de criptomonedas. No necesitamos acceso a tus claves privadas, solo la informacion publica.",
  },
  {
    number: 3,
    title: "Configura herederos",
    description:
      "Define quienes seran tus beneficiarios, que porcentaje recibira cada uno y bajo que condiciones se activara la transferencia.",
  },
  {
    number: 4,
    title: "Activa tu plan",
    description:
      "Elige el plan que mejor se adapte a tus necesidades y activa la proteccion de tu legado digital. Nosotros nos encargamos del resto.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient-gold">Como funciona</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            En cuatro simples pasos, protege tu patrimonio digital
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-gold/50 via-gold/20 to-transparent md:left-1/2 md:block md:-translate-x-px" />

          <div className="flex flex-col gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative flex gap-6 md:gap-0"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
              >
                {/* Mobile timeline dot */}
                <div className="relative z-10 flex-shrink-0 md:hidden">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold bg-background text-lg font-bold text-gold">
                    {step.number}
                  </div>
                </div>

                {/* Desktop layout */}
                <div
                  className={`flex flex-1 items-start md:gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content card */}
                  <div
                    className={`flex-1 ${
                      index % 2 === 0
                        ? "md:text-right md:pr-12"
                        : "md:text-left md:pl-12"
                    }`}
                  >
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Desktop timeline dot (centered) */}
                  <div className="relative z-10 hidden flex-shrink-0 md:flex">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold bg-background text-lg font-bold text-gold">
                      {step.number}
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden flex-1 md:block" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
