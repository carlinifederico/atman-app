/**
 * Tour steps. Each step targets a CSS selector (anchored via `data-tour` attribute)
 * and may navigate to a route before/after. The runner handles waiting for
 * the target element to exist after navigation.
 */

export interface TourStep {
  /** CSS selector of the element to highlight. Optional for no-target steps. */
  element?: string;
  /** Path to navigate to before this step. If already there, no-op. */
  navigateTo?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
  };
}

export const TOUR_STEPS: TourStep[] = [
  {
    navigateTo: "/panel",
    element: '[data-tour="panel-stats"]',
    popover: {
      title: "1. Panel general",
      description:
        "Acá ves el resumen: cuántas billeteras y herederos tenés cargados, estado del plan, días desde el último check-in.",
      side: "bottom",
    },
  },
  {
    navigateTo: "/billeteras",
    element: '[data-tour="wallet-card"]',
    popover: {
      title: "2. Billeteras",
      description:
        "Registrás cada billetera que querés que herede tu plan. Acepta Bitcoin, Ethereum, Solana, Polygon, Avalanche y BNB Chain.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="wallet-refresh"]',
    popover: {
      title: "3. Lectura on-chain en vivo",
      description:
        "El botón ↻ consulta un RPC público gratuito y trae el balance real. No requiere API key.",
      side: "left",
    },
  },
  {
    navigateTo: "/herederos",
    element: '[data-tour="heir-card"]',
    popover: {
      title: "4. Herederos",
      description:
        "Designás a quién va cada porcentaje cuando se dispare la activación. Cónyuge, hijos, socios, lo que necesites.",
      side: "bottom",
    },
  },
  {
    navigateTo: "/distribucion",
    element: '[data-tour="distribution-selector"]',
    popover: {
      title: "5. Distribución",
      description:
        "Por cada billetera, asignás qué porcentaje recibe cada heredero. La suma tiene que dar 100% para que se pueda guardar.",
      side: "bottom",
    },
  },
  {
    navigateTo: "/vault",
    element: '[data-tour="vault-banner"]',
    popover: {
      title: "6. Vault de instrucciones",
      description:
        "Acá guardás claves, seed phrases, instrucciones — todo cifrado en tu navegador con AES-GCM-256 y tu passphrase. ATMAN nunca las ve en claro.",
      side: "bottom",
    },
  },
  {
    navigateTo: "/activacion",
    element: '[data-tour="activation-methods"]',
    popover: {
      title: "7. Método de activación",
      description:
        "Inactividad (no hacés check-in en X días), manual, o multifirma. El demo soporta inactividad — los otros vienen en próximas versiones.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="simulate-button"]',
    popover: {
      title: "8. Simular activación",
      description:
        "Click acá para ver paso a paso lo que pasaría: transferencias por heredero y emails que se enviarían.",
      side: "top",
    },
  },
  {
    navigateTo: "/outbox",
    element: '[data-tour="outbox-banner"]',
    popover: {
      title: "9. Outbox",
      description:
        "Cuando simulás, los emails para tus herederos quedan acá. En producción real saldrían vía Resend o similar — por ahora son previews.",
      side: "bottom",
    },
  },
  {
    popover: {
      title: "Listo ✨",
      description:
        "Eso es todo. Toda esta data se guarda solo en tu navegador, asociada a tu nombre. Podés re-correr el tour desde el botón ✨ arriba a la derecha cuando quieras.",
    },
  },
];
