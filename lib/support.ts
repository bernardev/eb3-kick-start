// Contato de atendimento (WhatsApp). Pode ser sobrescrito por env.
const NUMBER = process.env.SUPPORT_WHATSAPP_NUMBER || "18587447190"; // +1 858-744-7190

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Link do Telegram de atendimento. Aceita, via env:
//  - SUPPORT_TELEGRAM = "kickstart"  -> https://t.me/kickstart
//  - SUPPORT_TELEGRAM = "https://t.me/..."  -> usa direto
//  - senão usa o telefone (SUPPORT_TELEGRAM_PHONE) -> https://t.me/+<telefone>
export function telegramLink(): string {
  const direct = process.env.SUPPORT_TELEGRAM;
  if (direct) {
    return direct.startsWith("http") ? direct : `https://t.me/${direct.replace(/^@/, "")}`;
  }
  const phone = (process.env.SUPPORT_TELEGRAM_PHONE || "18582652222").replace(/\D/g, "");
  return `https://t.me/+${phone}`;
}
