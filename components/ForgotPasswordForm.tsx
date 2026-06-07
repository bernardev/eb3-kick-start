"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { LocaleToggle } from "./LocaleToggle";
import { requestPasswordReset, type PasswordState } from "@/lib/actions/password";

const initial: PasswordState = {};

export function ForgotPasswordForm() {
  const t = useTranslations("reset");
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  return (
    <div className="authcard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo variant="word" />
        <LocaleToggle />
      </div>

      {state.ok ? (
        <>
          <h1>{t("sentTitle")}</h1>
          <p className="authcard__sub">{t("sentMsg")}</p>
          <Link className="btn btn--ghost btn--block btn--lg" href="/login">
            <Icon n="arrow-left" /> {t("backToLogin")}
          </Link>
        </>
      ) : (
        <>
          <h1>{t("forgotTitle")}</h1>
          <p className="authcard__sub">{t("forgotSub")}</p>
          {state.error && (
            <div className="formmsg formmsg--error">
              <Icon n="alert-triangle" /> {state.error}
            </div>
          )}
          <form action={action}>
            <div className="field">
              <label className="field__label">{t("emailLabel")}</label>
              <div className="inputwrap">
                <Icon n="mail" />
                <input className="input input--icon" type="email" name="email" placeholder="voce@email.com" />
              </div>
            </div>
            <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={pending}>
              {pending ? t("sending") : t("send")} <Icon n="arrow-right" />
            </button>
          </form>
          <p className="legal">
            <Link href="/login">{t("backToLogin")}</Link>
          </p>
        </>
      )}
    </div>
  );
}
