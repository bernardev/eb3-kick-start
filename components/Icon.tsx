// Ícone Tabler (webfont). Uso: <Icon n="briefcase" />
export function Icon({ n, className }: { n: string; className?: string }) {
  return <i className={`ti ti-${n}${className ? " " + className : ""}`} aria-hidden="true" />;
}
