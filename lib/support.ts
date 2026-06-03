// Contato de atendimento (WhatsApp). Pode ser sobrescrito por env.
const NUMBER = process.env.SUPPORT_WHATSAPP_NUMBER || "5541999475635"; // +55 41 99947-5635

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
