/* eslint-disable @next/next/no-img-element */

// Logo da Kick Start.
// variant "light": logo completo com wordmark branco (fundos escuros:
// appbar, rodapé, aside do login).
// variant "word": só o emblema (recortado) + "Kick Start" em bordô, para
// uso sobre fundo claro (ex.: card de login).
export function Logo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "word";
}) {
  if (variant === "word") {
    return (
      <span className={`authcard__mark ${className ?? ""}`}>
        <span className="authcard__emblem">
          <img src="/logo-kickstart.png" alt="" />
        </span>
        Kick Start
      </span>
    );
  }
  return <img className={className} src="/logo-kickstart.png" alt="Kick Start" />;
}
