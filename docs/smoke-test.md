# Smoke Test — Performance Hub Frontend

Roteiro mínimo de validação end-to-end após cada publicação do frontend
(`https://app.performify.shop`) contra a API de produção
(`https://api.performify.shop/api`).

## Pré-requisitos

- Frontend publicado em URL HTTPS válida.
- API respondendo em HTTPS válido (sem certificado self-signed).
- `VITE_API_BASE_URL` configurado no build do frontend.
- Usuário de teste disponível (e-mail + senha).
- Navegador desktop atualizado (Chrome/Edge/Firefox) com DevTools.

## Teste rápido de API

```bash
curl -i https://api.performify.shop/api/health
```

Esperado: `HTTP/2 200` com payload JSON simples. Qualquer outro status (000,
401, 403, 404, 5xx) indica que o backend está fora do ar ou que a base URL
está incorreta — pare aqui e corrija antes de prosseguir.

## Fluxo E2E manual

1. Acessar `/login`.
2. Fazer login com o usuário de teste.
3. Validar que `GET /me` foi chamado e retornou 200 (Network tab).
4. Criar um cliente em `/clients`.
5. Criar um projeto em `/projects` vinculado ao cliente recém-criado.
6. Selecionar cliente e projeto no seletor do topo (header).
7. Abrir `/install` (Instalação do tracking).
8. Copiar o script de instalação.
9. Disparar **Enviar evento teste**.
10. Abrir `/events` e confirmar que o evento aparece na lista.
11. Abrir `/dashboard` e validar KPIs / onboarding atualizados.
12. Abrir `/leads` e revisar listagem (pode estar vazia em projetos novos).
13. Abrir `/ecommerce` (Compras) e revisar listagem.
14. Abrir `/integrations` e criar uma configuração de integração.
15. Conferir a aba de entregas (`deliveries`) e o card de saúde.
16. Abrir `/reports` e validar atribuição, conversion paths e canais assistidos.
17. Abrir `/settings` → **Diagnóstico do Sistema** e validar todos os checks.
18. Clicar em **Exportar diagnóstico (JSON)** e verificar download.
19. Marcar itens do **Checklist E2E** conforme apropriado.
20. Fazer logout em `/settings`.
21. Refazer login e confirmar que sessão é restaurada corretamente.
22. Validar refresh token: deixe a aba aberta por mais de 1h ou force um 401
    (DevTools → Network → Block request) e confirme que o cliente API repete
    a chamada com novo `accessToken` (single-flight).

## Problemas comuns

| Sintoma                            | Causa provável                                   | Ação                                                         |
| ---------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `ERR_CERT_AUTHORITY_INVALID`       | Certificado self-signed / Let's Encrypt expirado | Renovar certificado da API                                   |
| `Mixed Content` no console         | API em HTTP servida a partir de página HTTPS     | Ajustar `VITE_API_BASE_URL` para HTTPS                       |
| `CORS` bloqueando preflight        | Backend não libera `Origin` do frontend          | Configurar CORS no backend incluindo o domínio publicado     |
| `401` repetido sem refresh         | `refreshToken` ausente ou inválido               | Limpar `localStorage`, refazer login; checar `/auth/refresh` |
| `403`                              | Usuário sem role/permitido                       | Validar `role` em `/me`                                      |
| `404` no Traefik / gateway         | Rota `/api/...` não roteada                      | Conferir labels Traefik / Nginx                              |
| Base URL errada                    | `.env` apontando para host antigo                | Reconfigurar `VITE_API_BASE_URL` e rebuild                   |
| `projectId` ausente / KPIs vazios  | Projeto não selecionado no header                | Selecionar cliente/projeto                                   |
| Tracking key ausente em `/install` | Projeto recém-criado sem chave gerada            | Recriar projeto ou checar endpoint `/projects/:id/install`   |
| Diagnóstico todo vermelho          | API inacessível                                  | Validar `curl /health`, certificado, CORS                    |

## Checklist final antes de promover release

- [ ] `curl /api/health` retorna 200.
- [ ] Login + refresh + logout funcionam.
- [ ] Evento teste chega em `/events`.
- [ ] Dashboard renderiza KPIs.
- [ ] Diagnóstico do Sistema sem itens em erro.
- [ ] Checklist E2E ≥ 80% concluído.
- [ ] `ApiEnvironmentAlert` ausente (sem mixed content / sem base URL faltando).
