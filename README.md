# Performance Hub Frontend

Frontend oficial do Performance Hub.

---

## Objetivo

Construir uma interface SaaS moderna para a plataforma Performance Hub.

O backend já existe e está funcional.

Este repositório contém APENAS o frontend.

---

# Arquitetura

Existem dois repositórios:

## Frontend (destino)

https://github.com/isidio908-rgb/performance-hub-frontend

Responsável por:

- Interface React
- UX/UI
- Navegação
- Componentes
- Consumo da API
- Gestão de estado
- Dashboard
- Clientes
- Projetos
- Instalação
- Eventos
- Leads
- E-commerce
- Integrações
- Relatórios

Todo código gerado pelo Lovable deve ser salvo aqui.

---

## Backend (somente leitura)

https://github.com/isidio908-rgb/vps-performance-hub

Este repositório é a fonte de verdade da API.

O frontend deve consultar este projeto para:

- Entender endpoints
- Entender payloads
- Entender respostas
- Entender tipos
- Entender fluxo de negócio
- Entender autenticação

NÃO modificar este repositório.

NÃO criar PRs nele.

NÃO alterar backend.

Usar apenas como documentação e referência.

---

# Produto

Performance Hub é uma plataforma de:

- Tracking
- Analytics
- Attribution
- Marketing Integrations

Fluxo principal:

Cliente
↓
Projeto
↓
Tracking Key
↓
Script Installer
↓
Eventos
↓
Leads
↓
Compras
↓
Integrações

---

# Backend Atual

API Base:

http://13.58.252.123:8080/api

Health:

GET /health

---

# Autenticação

Login:

POST /auth/login

Resposta:

{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "OWNER"
  }
}

Persistir:

- accessToken
- refreshToken
- user

Todas requisições autenticadas:

Authorization: Bearer TOKEN

---

# Funcionalidades Obrigatórias

## Dashboard

KPIs:

- PageViews
- Eventos
- Leads
- WhatsAppClick
- FormSubmit
- AddToCart
- Checkouts
- Purchases
- Receita
- Ticket Médio

---

## Clientes

CRUD completo.

---

## Projetos

CRUD completo.

Projeto pertence a Cliente.

---

## Instalação

Mostrar:

- Tracking Key
- Domínio
- Script

Exemplo:

<script async src="http://13.58.252.123:8080/api/public/tracker.js" data-tracking-key="TRACKING_KEY"></script>

---

## Eventos

Tabela de eventos.

---

## Leads

Tabela de leads.

---

## E-commerce

Tabela de compras.

---

## Integrações

Mostrar:

- Meta CAPI
- GA4
- Google Ads

Status:

- REAL_ENABLED
- SIMULATED
- MISCONFIGURED
- ERROR

---

# Contexto Global

O sistema trabalha sempre com:

Cliente selecionado
+
Projeto selecionado

Persistir:

localStorage:

vps_selected_client_id

vps_selected_project_id

---

# Estrutura Esperada

src/

api/
auth/
components/
hooks/
layouts/
pages/
providers/
routes/
types/
utils/

---

# Restrições

NÃO criar backend.

NÃO criar Supabase.

NÃO criar Firebase.

NÃO criar banco de dados.

NÃO criar APIs mockadas.

NÃO criar autenticação própria.

Consumir apenas os endpoints existentes.

---

# Missão do Lovable

1. Clonar e analisar o backend:
   https://github.com/isidio908-rgb/vps-performance-hub

2. Entender:
   - endpoints
   - payloads
   - autenticação
   - regras de negócio
   - tipos compartilhados

3. Construir frontend profissional neste repositório:
   https://github.com/isidio908-rgb/performance-hub-frontend

4. Salvar TODO código novo apenas neste repositório.

5. Nunca modificar o backend.

---

# Status Atual

Backend:

V3.3.1 estável
validado em VPS

Frontend:

Entrando na fase V3.4

Objetivo:

Transformar o MVP atual em um SaaS profissional completo.
