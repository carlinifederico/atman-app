/**
 * Notification stub.
 *
 * For Phase 2 we don't pay for an email/SMS provider yet. Instead, we
 * queue the messages locally so the user can see exactly what would have
 * been sent when activation fires. Swapping in Resend/Postmark/Twilio is
 * a single class change behind this interface.
 */

import type { Heir } from "@/lib/types";

export type Channel = "email" | "sms";

export interface OutboxMessage {
  id: string;
  to: string;
  channel: Channel;
  subject: string;
  body: string;
  sent_at: string;
  status: "queued" | "sent" | "failed";
}

export interface Mailer {
  send(msg: Omit<OutboxMessage, "id" | "sent_at" | "status">): Promise<OutboxMessage>;
  outbox(): OutboxMessage[];
  clear(): void;
}

const STORAGE_KEY = "atman_outbox_demo";

function readOutbox(): OutboxMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OutboxMessage[]) : [];
  } catch {
    return [];
  }
}

function writeOutbox(msgs: OutboxMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}

class StubMailer implements Mailer {
  private memory: OutboxMessage[] = [];

  constructor() {
    this.memory = readOutbox();
  }

  async send(msg: Omit<OutboxMessage, "id" | "sent_at" | "status">): Promise<OutboxMessage> {
    const queued: OutboxMessage = {
      ...msg,
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sent_at: new Date().toISOString(),
      status: "queued",
    };
    this.memory = [queued, ...this.memory];
    writeOutbox(this.memory);
    return queued;
  }

  outbox(): OutboxMessage[] {
    return [...this.memory];
  }

  clear(): void {
    this.memory = [];
    writeOutbox(this.memory);
  }
}

let _instance: StubMailer | null = null;
export function getMailer(): Mailer {
  if (!_instance) _instance = new StubMailer();
  return _instance;
}

// For tests only — fresh instance, no persistence
export function _newMailerForTest(): Mailer {
  return new StubMailer();
}

/**
 * Compose the heir notification body. Plain text, deliberately minimal —
 * the instructions are encrypted vault entries that travel separately.
 */
export function composeHeirNotification(args: {
  heir: Pick<Heir, "name" | "email">;
  ownerName: string;
  vaultEntryLabels: string[];
  decryptionUrl?: string;
}): { subject: string; body: string } {
  const { heir, ownerName, vaultEntryLabels, decryptionUrl } = args;

  const subject = `${ownerName} te ha designado como heredero digital`;

  const lines: string[] = [
    `Hola ${heir.name},`,
    "",
    `${ownerName} configuró ATMAN para protegerte el acceso a sus criptoactivos en caso de inactividad prolongada. La condición se cumplió y, según las instrucciones que dejó cifradas, hoy te corresponden las siguientes piezas:`,
    "",
    ...vaultEntryLabels.map((label, i) => `  ${i + 1}. ${label}`),
    "",
    `Para descifrar las instrucciones necesitás la passphrase que ${ownerName} debió haberte compartido por separado (testamento, abogado/a, conversación previa).`,
  ];

  if (decryptionUrl) {
    lines.push("", `Abrí: ${decryptionUrl}`);
  }

  lines.push(
    "",
    "Si esto es una sorpresa, contactanos antes de seguir: hola@atman.io.",
    "",
    "— ATMAN"
  );

  return { subject, body: lines.join("\n") };
}
