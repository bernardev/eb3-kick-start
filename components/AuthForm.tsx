"use client";

import { useActionState, useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { GoogleG } from "./GoogleG";
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
          <h2>Seu caminho para o Green Card americano começa aqui.</h2>
          <p>
            A Kick Start conecta profissionais a vagas nos EUA com patrocínio de visto EB-3 — e
            acompanha cada etapa do seu processo, do início à aprovação.
          </p>
          <div className="auth__points">
            <div className="auth__point">
              <Icon n="briefcase" /> Vagas reais com patrocínio EB-3
            </div>
            <div className="auth__point">
              <Icon n="route" /> Acompanhamento transparente do caso
            </div>
            <div className="auth__point">
              <Icon n="shield-check" /> Equipe dedicada do início ao fim
            </div>
          </div>
        </div>
      </aside>

      <div className="auth__form">
        <div className="authcard">
          <Logo variant="word" />
          <span className="freechip">
            <Icon n="gift" /> Cadastro 100% gratuito
          </span>
          <h1>{isSignup ? "Crie sua conta" : "Bem-vindo de volta"}</h1>
          <p className="authcard__sub">
            {isSignup
              ? "Sem custo e sem etapa de pagamento. Explore as vagas EB-3 em minutos."
              : "Acesse sua conta para acompanhar seu processo."}
          </p>

          <div className="seg">
            <button
              type="button"
              className={"seg__btn" + (isSignup ? " is-active" : "")}
              onClick={() => setTab("signup")}
            >
              Criar conta
            </button>
            <button
              type="button"
              className={"seg__btn" + (!isSignup ? " is-active" : "")}
              onClick={() => setTab("login")}
            >
              Entrar
            </button>
          </div>

          <form action={googleSignIn}>
            <button className="gbtn" type="submit">
              <GoogleG /> Continuar com Google
            </button>
          </form>
          <div className="divider">ou com email</div>

          {state.error && (
            <div className="formmsg formmsg--error">
              <Icon n="alert-triangle" /> {state.error}
            </div>
          )}

          {/* form de cadastro */}
          <form action={signupAction} style={{ display: isSignup ? "block" : "none" }}>
            <div className="field">
              <label className="field__label">Nome completo</label>
              <div className="inputwrap">
                <Icon n="user" />
                <input className="input input--icon" name="name" placeholder="Seu Nome" />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Email</label>
              <div className="inputwrap">
                <Icon n="mail" />
                <input className="input input--icon" type="email" name="email" placeholder="voce@email.com" />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Senha</label>
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
              {pending ? "Criando…" : "Criar conta gratuita"} <Icon n="arrow-right" />
            </button>
            <p className="legal">
              Ao criar uma conta, você concorda com os <a href="#">Termos de Uso</a> e a{" "}
              <a href="#">Política de Privacidade</a>.
            </p>
          </form>

          {/* form de login */}
          <form action={loginAction} style={{ display: isSignup ? "none" : "block" }}>
            <div className="field">
              <label className="field__label">Email</label>
              <div className="inputwrap">
                <Icon n="mail" />
                <input className="input input--icon" type="email" name="email" placeholder="voce@email.com" />
              </div>
            </div>
            <div className="field">
              <label className="field__label">Senha</label>
              <div className="inputwrap">
                <Icon n="lock" />
                <input className="input input--icon" type="password" name="password" placeholder="••••••••" />
              </div>
            </div>
            <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={pending} style={{ marginTop: 6 }}>
              {pending ? "Entrando…" : "Entrar"} <Icon n="arrow-right" />
            </button>
            <p className="legal">
              <a href="#">Esqueceu sua senha?</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
