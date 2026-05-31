// Avalia a força da senha (mesmas regras do servidor).
export type PasswordChecks = {
  len: boolean;
  upper: boolean;
  num: boolean;
  special: boolean;
  score: number; // 0..4
  strong: boolean;
  tier: "weak" | "medium" | "strong";
};

export function passwordChecks(pw: string): PasswordChecks {
  const len = pw.length >= 8;
  const upper = /[A-Z]/.test(pw);
  const num = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  const score = [len, upper, num, special].filter(Boolean).length;
  const strong = score === 4;
  const tier = score <= 1 ? "weak" : score <= 3 ? "medium" : "strong";
  return { len, upper, num, special, score, strong, tier };
}

// Iniciais a partir de um nome (ex.: "Eduardo Henrique" → "EH").
export function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}
