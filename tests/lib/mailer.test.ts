import { describe, it, expect, beforeEach } from "vitest";
import { _newMailerForTest, composeHeirNotification } from "@/lib/notifications/mailer";

describe("StubMailer", () => {
  let mailer: ReturnType<typeof _newMailerForTest>;
  beforeEach(() => {
    mailer = _newMailerForTest();
    mailer.clear();
  });

  it("queues and returns the message with id + timestamp + status", async () => {
    const msg = await mailer.send({
      to: "heir@example.com",
      channel: "email",
      subject: "test",
      body: "hello",
    });
    expect(msg.id).toMatch(/^m_/);
    expect(msg.status).toBe("queued");
    expect(msg.sent_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("outbox lists most recent first", async () => {
    await mailer.send({ to: "a@x", channel: "email", subject: "first", body: "" });
    await mailer.send({ to: "b@x", channel: "email", subject: "second", body: "" });
    const list = mailer.outbox();
    expect(list[0].subject).toBe("second");
    expect(list[1].subject).toBe("first");
  });

  it("clear empties the outbox", async () => {
    await mailer.send({ to: "x@y", channel: "email", subject: "x", body: "" });
    mailer.clear();
    expect(mailer.outbox()).toHaveLength(0);
  });
});

describe("composeHeirNotification", () => {
  it("includes owner, heir, and entry labels", () => {
    const { subject, body } = composeHeirNotification({
      heir: { name: "Maria", email: "m@x.com" },
      ownerName: "Carlos",
      vaultEntryLabels: ["Wallet Bitcoin Ledger", "Acceso exchange Bitso"],
    });
    expect(subject).toBe("Carlos te ha designado como heredero digital");
    expect(body).toContain("Hola Maria");
    expect(body).toContain("1. Wallet Bitcoin Ledger");
    expect(body).toContain("2. Acceso exchange Bitso");
  });

  it("appends decryption URL when provided", () => {
    const { body } = composeHeirNotification({
      heir: { name: "Maria", email: "m@x.com" },
      ownerName: "Carlos",
      vaultEntryLabels: [],
      decryptionUrl: "https://atman.io/heir/abc",
    });
    expect(body).toContain("https://atman.io/heir/abc");
  });
});
