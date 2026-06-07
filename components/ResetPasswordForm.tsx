"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { LocaleToggle } from "./LocaleToggle";
import { PasswordStrength } from "./PasswordStrength";
import { passwordChecks } from "@/lib/util";
import { resetPassword, type PasswordState } from "@/lib/actions/password";

const initial: PasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("reset");
  const [state, action, pending] = useActionState(resetPassword, initial);
  const [pw, setPw] = useState("");
  const strong = passwordChecks(pw).strong;

  if (!token) {
    return (
      <div className="authcard">
        <Logo variant="word" />
        <h1>{t("resetTitle")}</h1>
        <div className="formmsg formmsg--error" style={{ marginTop: 16 }}>
          <Icon n="alert-triangle" /> {t("missingToken")}
        </div>
        <Link className="btn btn--ghost btn--block btn--lg" href="/esqueci-senha">
          {t("forgotTitle")}
        </Link>
      </div>
    );
  }

  if (state.ok) {
    return (
      <div className="authcard">
        <Logo variant="word" />
        <h1>{t("successTitle")}</h1>
        <p className="authcard__sub">{t("successMsg")}</p>
        <Link className="btn btn--primary btn--block btn--lg" href="/login">
          <Icon n="arrow-right" /> {t("goLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="authcard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo variant="word" />
        <LocaleToggle />
      </div>
      <h1>{t("resetTitle")}</h1>
      <p className="authcard__sub">{t("resetSub")}</p>
      {state.error && (
        <div className="formmsg formmsg--error">
          <Icon n="alert-triangle" /> {state.error}
        </div>
      )}
      <form action={action}>
        <input type="hidden" name="token" value={token} />
        <div className="field">
          <label className="field__label">{t("newPassword")}</label>
          <div className="inputwrap">
            <Icon n="lock" />
            <input
              className="input input--icon"
              type="password"
              name="password"
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <PasswordStrength value={pw} />
        </div>
        <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={pending || !strong}>
          {pending ? t("saving") : t("save")}
        </button>
      </form>
      <p className="legal">
        <Link href="/login">{t("backToLogin")}</Link>
      </p>
    </div>
  );
}
