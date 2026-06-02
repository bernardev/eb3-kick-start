# Kick Start — Portal EB-3

Aplicação **standalone** (Next.js) do Portal EB-3 da Kick Start: vagas com
patrocínio de visto EB-3 com **acesso gratuito**, fluxo **"Aplique aqui"** com
questionário + consentimento, portal **"Meu Processo EB-3"** (somente leitura
para o cliente) e **painel da equipe** para gerenciar casos e vagas.

O site institucional **kick-start.us (WordPress/BuddyPress) não é alterado** —
ele apenas aponta um link/redirect para esta aplicação (ex.: subdomínio
`eb3.kick-start.us` ou um botão em `kick-start.us/eb3`).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Banco | Neon (Postgres) via Prisma |
| Autenticação | Auth.js (NextAuth v5) — Google OAuth + email/senha |
| E-mail | Resend (transacional, entrega confiável com domínio verificado) |
| Hospedagem | Vercel |

Identidade visual portada **1:1** do design aprovado (tema claro, bordô
`#730027` / navy `#043C8C`, fontes Inter / Space Grotesk / DM Sans, ícones
Tabler). O sistema de cores de status é fixo:
🟡 Em análise · 🟠 Pendência · 🔴 Negado · 🟢 Aprovado.

---

## Estrutura

```
app/
  login/                  Tela de acesso (Google + email/senha)
  (portal)/               Área autenticada (header + rodapé)
    bem-vindo/            Boas-vindas pós-cadastro
    vagas/                Lista de vagas EB-3
    vagas/[id]/           Detalhe + "Aplique aqui"
    vagas/[id]/aplicar/   Questionário + aviso + consentimento
    meu-processo/         Portal do cliente (somente leitura)
    admin/                Lista de casos (equipe)
    admin/casos/[id]/     Editor de caso (status/sub-etapas/notas + respostas)
    admin/vagas/          Gestão de vagas
    admin/vagas/nova/     Cadastro de vaga + perguntas
    admin/vagas/[id]/     Edição de vaga + perguntas
  api/auth/[...nextauth]/ Endpoints do Auth.js
components/               AppBar, ProcessView, PhaseCard, JobsList, ApplyForm, JobForm…
lib/                      auth, db (Prisma), email (Resend), status, guards, actions/
prisma/                   schema.prisma + seed.ts
```

---

## Rodando localmente

Pré-requisitos: Node 20+ e uma conta no [Neon](https://neon.tech).

```bash
# 1. instalar dependências
npm install

# 2. variáveis de ambiente  (use .env — o Prisma CLI lê .env, não .env.local)
cp .env.example .env
#    edite .env (veja a seção "Variáveis de ambiente" abaixo)

# 3. criar as tabelas no banco
npm run db:push

# 4. popular com dados de exemplo (vagas + casos)
npm run db:seed

# 5. subir em desenvolvimento
npm run dev
# http://localhost:3000
```

### Credenciais de teste (criadas pelo seed)

| Papel | Email | Senha |
|---|---|---|
| Equipe (admin) | `daia@kick-start.us` | `kickstart123` |
| Cliente | `eduardo@example.com` | `kickstart123` |

> Troque/remova esses usuários antes de ir para produção.

---

## Variáveis de ambiente

Use um arquivo **`.env`** na raiz (o Prisma CLI lê `.env`; o Next também).
Veja `.env.example`. Resumo:

- `DATABASE_URL` — connection string do Neon (use a *pooled* com `?sslmode=require`).
- `AUTH_SECRET` — segredo do Auth.js. Gere com `openssl rand -base64 32`.
- `AUTH_URL` — URL pública (em prod: `https://eb3.kick-start.us`).
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — credenciais do Google OAuth.
- `RESEND_API_KEY` — API key do Resend.
- `MAIL_FROM` — remetente em domínio verificado (ex.: `Kick Start EB-3 <portal@kick-start.us>`).
- `MAIL_TO` — destino das aplicações (`info@kick-start.us`).

### Login com Google

1. Em [console.cloud.google.com](https://console.cloud.google.com) → *APIs & Services* → *Credentials* → **Create OAuth client ID** (tipo **Web application**).
2. Em **Authorized redirect URIs**, adicione:
   - Dev: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://eb3.kick-start.us/api/auth/callback/google`
3. Copie o *Client ID* e *Client secret* para `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`.

---

## E-mail confiável (Resend) — importante

A Kick teve histórico de e-mails não chegando. Para garantir a entrega em
`info@kick-start.us`:

1. Crie conta no [Resend](https://resend.com) e gere uma **API key** → `RESEND_API_KEY`.
2. Em **Domains**, adicione `kick-start.us` e publique no DNS os registros
   **SPF** e **DKIM** que o Resend fornece (e, recomendado, **DMARC**).
   Sem domínio verificado o e-mail pode cair em spam ou ser recusado.
3. Defina `MAIL_FROM` com um remetente **desse domínio** (ex.:
   `Kick Start EB-3 <portal@kick-start.us>`).
4. `MAIL_TO=info@kick-start.us`.

### Como testar o envio

1. Configure as variáveis acima e rode `npm run dev`.
2. Entre como cliente, abra uma vaga → **Aplique aqui**, preencha o
   **Formulário G1** (intake), aceite a Declaração + o consentimento e envie.
3. Confira a caixa `info@kick-start.us` — deve chegar um e-mail com assunto
   `Nova aplicação G1 — {Vaga} — {Cliente}`, com um **resumo no corpo** e o
   **PDF do G1 preenchido em anexo**, além do registro de consentimento
   (data/hora + IP). No admin, cada candidatura tem o botão **"Baixar PDF do G1"**.
4. No painel da equipe (`/admin/casos/[id]`) cada aplicação mostra também se o
   e-mail foi **enviado** ou **não enviado**.

> A aplicação é **sempre salva no banco**, mesmo que o e-mail falhe — assim a
> equipe nunca perde uma submissão. Erros de envio aparecem no log do servidor.

---

## Deploy na Vercel

1. Suba o repositório no GitHub e importe em [vercel.com](https://vercel.com).
2. Em **Settings → Environment Variables**, configure todas as variáveis acima
   (com a `AUTH_URL` de produção e os redirect URIs do Google de produção).
3. **Build command** padrão (`npm run build`) já roda `prisma generate`.
4. Após o primeiro deploy, aplique o schema no banco de produção
   (`npm run db:push` apontando para a `DATABASE_URL` de produção) e, se quiser,
   rode o seed.

### Ligando ao kick-start.us

Sem mexer no WordPress, escolha uma das opções:

- **Subdomínio (recomendado):** crie um registro DNS `eb3.kick-start.us`
  apontando para a Vercel e adicione esse domínio ao projeto. No site WP, basta
  um link/botão para `https://eb3.kick-start.us`.
- **Redirect a partir de uma página:** crie uma página em
  `kick-start.us/eb3` que redirecione para o app.

---

## Decisões de produto (em relação ao protótipo)

- A palavra **"garantido" não é usada em lugar nenhum** (decisão da cliente).
- Os controles **"Tweaks"** e o seletor **Cliente/Admin** do protótipo eram
  recursos de demonstração — foram substituídos por **papéis reais** (um
  usuário é cliente *ou* equipe) e pela identidade visual padrão aprovada
  (navegação no topo, timeline de pontos, layout em cards).
- **Fora do escopo desta versão:** upload de documentos pelo cliente e
  notificações por WhatsApp.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (Prisma generate + Next) |
| `npm run start` | Servidor de produção |
| `npm run db:push` | Cria/atualiza as tabelas no banco |
| `npm run db:seed` | Popula dados de exemplo |
| `npm run db:studio` | Abre o Prisma Studio (inspecionar o banco) |
