"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { GoogleG } from "./GoogleG";
import { LocaleToggle } from "./LocaleToggle";
import { PasswordStrength } from "./PasswordStrength";
import { passwordChecks } from "@/lib/util";
import {
  googleSignIn,
  loginWithCredentials,
  registerUser,
  type AuthFormState,
} from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function AuthForm() {
  const t = useTranslations("auth");
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const isSignup = tab === "signup";

  const [loginState, loginAction, loginPending] = useActionState(loginWithCredentials, initial);
  const [signupState, signupAction, signupPending] = useActionState(registerUser, initial);
  const [signupPw, setSignupPw] = useState("");
  const pwStrong = passwordChecks(signupPw).strong;

  const state = isSignup ? signupState : loginState;
  const pending = isSignup ? signupPending : loginPending;

  return (
    <div className="auth">
      <aside className="auth__aside">
        <Logo className="auth__aside-logo" />
        <div className="auth__aside-body">
          <h2>{t("asideTitle")}</h2>
          <p>{t("asideText")}</p>
          <div className="auth__points">
            <div className="auth__point">
              <Icon n="briefcase" /> {t("point1")}
            </div>
            <div className="auth__point">
              <Icon n="route" /> {t("point2")}
            </div>
            <div className="auth__point">
              <Icon n="shield-check" /> {t("point3")}
            </div>
          </div>
        </div>
      </aside>

      <div className="auth__form">
        <div className="authcard">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Logo variant="word" />
            <LocaleToggle />
          </div>
          <span className="freechip">
            <Icon n="gift" /> {t("freeBadge")}
          </span>
          <h1>{isSignup ? t("createTitle") : t("welcomeTitle")}</h1>
          <p className="authcard__sub">{isSignup ? t("createSub") : t("loginSub")}</p>

          <div className="seg">
            <button
              type="button"
              className={"seg__btn" + (isSignup ? " is-active" : "")}
              onClick={() => setTab("signup")}
            >
              {t("tabCreate")}
            </button>
            <button
              type="button"
              className={"seg__btn" + (!isSignup ? " is-active" : "")}
              onClick={() => setTab("login")}
            >
              {t("tabLogin")}
            </button>
          </div>

          <form action={googleSignIn}>
            <button className="gbtn" type="submit">
              <GoogleG /> {t("google")}
            </button>
          </form>
          <div className="divider">{t("orEmail")}</div>

          {state.error && (
            <div className="formmsg formmsg--error">
              <Icon n="alert-triangle" /> {state.error}
            </div>
          )}

          {/* cadastro */}
          <form action={signupAction} style={{ display: isSignup ? "block" : "none" }}>
            <div className="field">
              <label className="field__label">{t("fullName")}</label>
              <div className="inputwrap">
                <Icon n="user" />
                <input className="input input--icon" name="name" placeholder={t("namePlaceholder")} />
              </div>
            </div>
            <div className="field">
              <label className="field__label">{t("email")}</label>
              <div className="inputwrap">
                <Icon n="mail" />
                <input className="input input--icon" type="email" name="email" placeholder="voce@email.com" />
              </div>
            </div>
            <div className="field">
              <label className="field__label">{t("password")}</label>
              <div className="inputwrap">
                <Icon n="lock" />
                <input
                  className="input input--icon"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={signupPw}
                  onChange={(e) => setSignupPw(e.target.value)}
                />
              </div>
              <PasswordStrength value={signupPw} />
            </div>
            <button
              className="btn btn--primary btn--block btn--lg"
              type="submit"
              disabled={pending || !pwStrong}
              style={{ marginTop: 6 }}
            >
              {pending ? t("creating") : t("createBtn")} <Icon n="arrow-right" />
            </button>
            <p className="legal">
              {t.rich("terms", {
                terms: (c) => <a href="#">{c}</a>,
                privacy: (c) => <a href="#">{c}</a>,
              })}
            </p>
          </form>

          {/* login */}
          <form action={loginAction} style={{ display: isSignup ? "none" : "block" }}>
            <div className="field">
              <label className="field__label">{t("email")}</label>
              <div className="inputwrap">
                <Icon n="mail" />
                <input className="input input--icon" type="email" name="email" placeholder="voce@email.com" />
              </div>
            </div>
            <div className="field">
              <label className="field__label">{t("password")}</label>
              <div className="inputwrap">
                <Icon n="lock" />
                <input className="input input--icon" type="password" name="password" placeholder="••••••••" />
              </div>
            </div>
            <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={pending} style={{ marginTop: 6 }}>
              {pending ? t("loggingIn") : t("loginBtn")} <Icon n="arrow-right" />
            </button>
            <p className="legal">
              <a href="#">{t("forgot")}</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
