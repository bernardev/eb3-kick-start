// Contato de atendimento (WhatsApp). Pode ser sobrescrito por env.
const NUMBER = process.env.SUPPORT_WHATSAPP_NUMBER || "18587447190"; // +1 858-744-7190

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
