# Performance Hub Frontend

Frontend oficial do **Performance Hub** — produto **Performify** para
tracking, atribuição e analytics de performance. Aplicação 100% desacoplada
do backend, consumindo a API REST configurada via `VITE_API_BASE_URL`.

- App URL esperada: **https://app.performify.shop**
- API URL esperada: **https://api.performify.shop/api**

## 1. Visão geral

Painel SaaS multi-cliente / multi-projeto para acompanhamento de eventos,
leads, compras, atribuição multi-canal e saúde de integrações. Suporta
diagnóstico operacional do ambiente e checklist E2E guiado para validação
em produção.

## 2. Stack

- React 19 + TypeScript (strict)
- TanStack Router v1 (file-based routing, SSR-ready)
- TanStack Query (cache, invalidations)
- Vite 7
- Tailwind CSS v4 + shadcn/ui
- Dark mode SaaS premium (padrão)

## 3. Requisitos

- Node 20+ ou Bun 1.1+
- Backend Performance Hub V3.4+ acessível por HTTPS válido

## 4. Instalação local

```bash
bun install
bun run dev
```

Ou com npm:

```bash
npm install
npm run dev
```

## 5. Variáveis de ambiente

Copie `.env.example` para `.env`:

```
VITE_API_BASE_URL=https://api.performify.shop/api
```

A URL **deve** incluir o prefixo `/api`. Em produção é obrigatório HTTPS
válido — navegadores bloqueiam requisições HTTP a partir de páginas HTTPS
(mixed content). Não há tokens nem segredos no frontend; a sessão é mantida
em `localStorage` por meio dos tokens emitidos pelo backend.

## 6. Exemplo

```
VITE_API_BASE_URL=https://api.performify.shop/api
```

## 7. Scripts

```bash
bun install
bun run dev        # ambiente de desenvolvimento
bun run build      # build de produção
bun run preview    # serve o build localmente
bun run lint       # ESLint
bun run format     # Prettier
```

## 8. Rotas principais

| Rota            | Função                                           |
| --------------- | ------------------------------------------------ |
| `/login`        | Autenticação                                     |
| `/dashboard`    | KPIs, gráficos e resumo de status                |
| `/clients`      | Gestão de clientes                               |
| `/projects`     | Gestão de projetos                               |
| `/install`      | Snippet de tracking e evento teste               |
| `/events`       | Stream de eventos recebidos                      |
| `/leads`        | Leads capturados                                 |
| `/ecommerce`    | Compras / receita (e-commerce)                   |
| `/reports`      | Attribution, conversion paths, assisted channels |
| `/integrations` | Configurações de integração e entregas           |
| `/settings`     | Conta, ambiente, diagnóstico e checklist E2E     |

## 9. Contratos consumidos (Backend V3.4 / V3.4.2)

**Auth**

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /me`

**Clients & Projects**

- `GET/POST /clients`, `GET/PATCH/DELETE /clients/:id`
- `GET/POST /projects`, `GET/PATCH/DELETE /projects/:id`

**Bootstrap / Dashboard / Install / Health**

- `GET /app/bootstrap`
- `GET /dashboard/kpis`
- `GET /projects/:id/install`
- `POST /projects/:id/test-event`
- `GET /projects/:id/health`
- `GET /onboarding/status`
- `GET /health`

**Analytics**

- `GET /analytics/overview`
- `GET /analytics/events`
- `GET /analytics/leads`
- `GET /analytics/purchases`
- `GET /analytics/revenue-timeline`
- `GET /analytics/funnel-summary`
- `GET /analytics/revenue-by-channel`
- `GET /analytics/revenue-by-campaign`
- `GET /analytics/attribution`
- `GET /analytics/attribution-models`
- `GET /analytics/conversion-paths`
- `GET /analytics/assisted-conversions`
- `GET /analytics/attribution-credits`
- `GET /analytics/top-conversion-paths`
- `GET /analytics/assisted-channels`
- `GET /analytics/integrations`

**Integrations**

- `GET /integrations/health`
- `GET /integrations/deliveries`
- `POST /integrations/deliveries/:id/retry`
- `POST /integrations/process-pending`
- `GET/POST /integrations/configs`
- `PATCH/DELETE /integrations/configs/:id`

**Tracker (público)**

- `GET /public/tracker.js`

Contratos não devem ser alterados a partir do frontend. Endpoints
inexistentes não devem ser invocados — toda a integração é centralizada em
`src/api/`.

## 10. Deploy estático

`bun run build` gera artefatos otimizados que podem ser servidos por
qualquer CDN/edge (Cloudflare Pages, Vercel, S3+CloudFront). O TanStack
Start já cuida do SSR/SSG quando aplicável. Garanta que o domínio servido
esteja em HTTPS e que `VITE_API_BASE_URL` foi injetado no build.

## 11. Observação sobre HTTPS / mixed content

- Backend e frontend **devem** estar atrás de HTTPS válido (não use IP
  bruto nem certificado self-signed em produção).
- Chamadas HTTP a partir de páginas HTTPS são bloqueadas pelo navegador.
- O componente `ApiEnvironmentAlert` detecta e exibe o diagnóstico de
  ambiente; em `/settings` há um painel completo com export JSON.

## 12. Smoke test recomendado

Roteiro completo em [`docs/smoke-test.md`](docs/smoke-test.md). Cobre login,
criação de cliente/projeto, instalação de tracking, evento teste, diagnóstico
e logout/login.

## 13. Limitações conhecidas

- A logomarca textual é renderizada por estilo (sem asset SVG dedicado) —
  trocar pelo logotipo Performify oficial quando disponível.
- O frontend não fornece favicon customizado (usa o default do template);
  adicionar `public/favicon.ico` para branding completo.
- Alguns warnings de Fast Refresh permanecem em arquivos de shadcn/ui,
  providers e helpers — são não bloqueantes e exigiriam refactor maior.
- Não há mocks permanentes nem fallback de dados falsos: qualquer
  indisponibilidade do backend é refletida fielmente na UI.
