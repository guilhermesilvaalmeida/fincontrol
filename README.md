# FinControl — Sistema de Controle Financeiro Pessoal

> "Controle seu dinheiro de forma simples e entenda para onde ele está indo."

MVP funcional de um sistema de controle financeiro pessoal, com backend em Java/Spring Boot e frontend em Next.js. Este README cobre a **Fase 1** do roadmap (auth, contas, categorias, transações e dashboard).

## 1. Funcionalidades

**Fase 1:**
- Cadastro e login com JWT (senha com hash BCrypt), sessão via cookie `httpOnly` (padrão BFF)
- Dashboard mensal: receitas, despesas, saldo, % de economia, gráfico de despesas por categoria, últimas transações
- Contas bancárias/carteiras com saldo calculado automaticamente
- Categorias padrão pré-cadastradas no primeiro acesso + criação de categorias próprias
- Lançamento de receitas e despesas com formulário rápido (máscara monetária)
- Listagem de transações com filtros (tipo, categoria, conta, valor, período), busca e ordenação
- Layout responsivo mobile-first (bottom nav no celular, sidebar no desktop), PWA instalável

**Fase 2 (novo):**
- **Cartões de crédito**: cadastro com limite, dia de fechamento e vencimento; card visual mostra limite comprometido vs. disponível
- **Compras parceladas**: registre o valor total e o número de parcelas — o sistema gera automaticamente uma transação de despesa por parcela, distribuída mês a mês, com o resto do arredondamento absorvido na última parcela (ex.: R$100 em 3x → R$33,33 + R$33,33 + R$33,34)
- **Modo escuro**: Claro / Escuro / Sistema, persistido no navegador, acessível em Configurações
- Página de **Configurações** com dados da conta, tema e botão de sair

Cartões de crédito ainda não têm o conceito de "fatura fechada/paga" (isso é a próxima peça natural — ver seção 9); hoje o valor comprometido é sempre a soma das parcelas com vencimento a partir do início do mês atual. Orçamentos, despesas recorrentes, metas e relatórios comparativos ficam para a Fase 3.

## 2. Stack

**Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · React Hook Form · Zod · Recharts · SWR
**Backend:** Java 21 · Spring Boot 3 · Spring Web · Spring Data JPA · Spring Security · JWT (jjwt) · Bean Validation · Flyway
**Banco:** PostgreSQL 16

## 3. Estrutura de pastas

```
fincontrol/
├── backend/     → API Spring Boot (monólito modular por domínio)
├── frontend/    → App Next.js
└── docker-compose.yml
```

Veja a árvore detalhada de cada módulo nos comentários de pacote — o backend segue `auth / users / accounts / categories / transactions / dashboard`, cada um com `controller / service / repository / dto`. O frontend segue `app/` (rotas), `components/` (ui, layout, dashboard, transactions, accounts), `lib/` (api, auth, currency, validators), `types/`.

## 4. Como executar

### Opção A — Docker (recomendado para o backend + banco)

```bash
# na raiz do projeto
cp backend/.env.example .env   # ajuste JWT_SECRET em produção
docker compose up --build
```

Isso sobe PostgreSQL na porta `5432` e a API na porta `8080` (as migrations do Flyway rodam automaticamente na primeira subida).

### Opção B — Backend local (sem Docker)

Pré-requisitos: Java 21, Maven, PostgreSQL rodando localmente.

```bash
cd backend
cp .env.example .env
createdb fincontrol   # ou crie via psql/pgAdmin
export $(cat .env | xargs)
mvn spring-boot:run
```

### Frontend

Pré-requisitos: Node.js 20+.

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Acesse `http://localhost:3000`. O frontend chama a API através das suas próprias rotas (`/api/*`), que por sua vez repassam a chamada para o backend real usando `BACKEND_API_URL`.

## 5. Variáveis de ambiente

**Backend** (`backend/.env.example`):
| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL JDBC do PostgreSQL |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | Credenciais do banco |
| `JWT_SECRET` | Chave usada para assinar os tokens — **troque em produção** |
| `JWT_EXPIRATION_MINUTES` | Tempo de expiração do token (padrão: 1440 = 24h) |
| `CORS_ORIGINS` | Origens permitidas, separadas por vírgula |
| `PORT` | Porta da API (padrão 8080) |

**Frontend** (`frontend/.env.local.example`):
| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | *(não usado mais — ver `BACKEND_API_URL` abaixo)* |
| `BACKEND_API_URL` | URL do backend, usada **apenas no servidor** (rotas `app/api/*`) — nunca chega ao navegador |

## 6. Banco de dados

Schema criado via Flyway (`backend/src/main/resources/db/migration/V1__init.sql`): `users`, `accounts`, `categories`, `transactions`. Todas as tabelas de dados do usuário referenciam `user_id`; UUID como PK; `created_at`/`updated_at` automáticos; `deleted_at` para soft delete em `accounts` e `transactions`; valores monetários em `NUMERIC(14,2)` (no código Java, sempre `BigDecimal`).

Não há endpoint de seed de demonstração exposto — ao se registrar, o usuário já recebe automaticamente o conjunto de categorias padrão (ver `DefaultCategorySeeder`). Para popular dados de exemplo (saldo, aluguel, mercado etc. como no briefing do produto), crie as transações manualmente pela UI após o cadastro, ou insira via SQL usando os IDs de conta/categoria do seu usuário.

## 7. Arquitetura e decisões

- **Monólito modular**: um único deployável no backend, mas pacotes isolados por domínio (`auth`, `accounts`, `categories`, `transactions`, `dashboard`), preparados para virar módulos/serviços independentes no futuro sem reescrever regra de negócio.
- **Saldo calculado, não persistido**: o saldo de cada conta é `saldo_inicial + Σ(receitas) - Σ(despesas)`, calculado sob demanda. Evita inconsistência entre um campo `balance` cacheado e as transações reais.
- **Ownership em toda query**: nenhum service busca um recurso só pelo ID — sempre `id + userId`, prevenindo que um usuário acesse dado de outro mesmo manipulando a URL.
- **JWT stateless com token invisível ao navegador**: o token carrega o `userId`; um filtro (`JwtAuthFilter`) valida e popula o contexto de segurança a cada requisição. O frontend usa o padrão **BFF** (Backend For Frontend): as rotas `app/api/*` do Next.js recebem login/registro, guardam o JWT num cookie `httpOnly` + `secure` + `sameSite=lax`, e todas as chamadas seguintes passam por uma rota-proxy (`app/api/[...path]/route.ts`) que injeta o header `Authorization` no servidor. O JavaScript do navegador **nunca tem acesso ao token** — mesmo numa falha de XSS, não há token para roubar.
- **Rate limiting em `/auth/login` e `/auth/register`**: limite por IP (10 tentativas/5min no login, 5/hora no registro) usando uma janela deslizante em memória (`RateLimiter`). Para múltiplas réplicas do backend, troque por um contador centralizado (Redis) — hoje o limite vale por instância.
- **Categorias por usuário**: para simplificar o MVP, cada usuário recebe sua própria cópia das categorias padrão (em vez de categorias globais compartilhadas), podendo editá-las/renomeá-las livremente sem afetar outros usuários.

## 8. Testes

Backend: `mvn test` executa testes unitários com JUnit 5 + Mockito + AssertJ cobrindo:
- Cálculo de saldo de conta (`AccountServiceTest`)
- Cálculo de dashboard: saldo e % de economia (`DashboardServiceTest`)
- Autenticação: hash de senha, e-mail duplicado, credenciais inválidas (`AuthServiceTest`)

## 9. Roadmap e próximos passos

| Fase | Escopo |
|---|---|
| ✅ 1 | Auth, contas, categorias, transações, dashboard |
| ✅ 2 | Cartões de crédito, parcelamento, orçamentos por categoria, modo escuro |
| ✅ 3 | Metas financeiras, relatórios (evolução mensal, comparação de categorias, maiores gastos), dashboard com 12 widgets (saldo real, "quanto posso gastar", insights por regras, próximos vencimentos) |
| Falta na Fase 2/3 | Fatura com status aberta/fechada/paga (hoje a fatura é sempre "aberta", calculada em tempo real pelas transações — não há como marcar como paga ainda), despesas recorrentes automáticas, notificações |
| Futuro | Conta familiar, OCR de notas, Open Finance, assistente de IA, apps nativos |

## 10. Checklist de segurança antes de publicar

**Já implementado no código:**
- [x] Senhas com hash BCrypt
- [x] Token JWT em cookie `httpOnly` (nunca exposto ao JS do navegador) via padrão BFF
- [x] Rate limiting em `/auth/login` e `/auth/register`
- [x] Toda query filtrada por `userId` (isolamento entre usuários)
- [x] Queries parametrizadas (sem risco de SQL Injection)
- [x] Headers de segurança (`X-Frame-Options: DENY`, `X-Content-Type-Options`, HSTS)
- [x] CORS restrito por variável de ambiente (não aberto por padrão)

**Você precisa fazer antes de ir ao ar (checklist de deploy):**
- [ ] Gerar um `JWT_SECRET` forte e único — **nunca** use o valor de exemplo do `.env.example`:
  ```bash
  openssl rand -base64 48
  ```
- [ ] Definir `CORS_ORIGINS` no backend com o domínio **exato** do seu frontend em produção (ex.: `https://fincontrol.vercel.app`), nunca com `*`
- [ ] Garantir que o banco gerenciado (Railway/Supabase/RDS) só aceita conexões via SSL e não está com a porta aberta publicamente sem senha forte
- [ ] Confirmar que `backend/.env` e `frontend/.env.local` **nunca** vão parar num repositório Git público (já estão no `.gitignore`, mas confira antes do primeiro `git push`)
- [ ] Ativar HTTPS em frontend e backend (Vercel já entrega por padrão; no backend, o provedor de hospedagem geralmente também entrega — confirme antes de publicar)

**Limitações conhecidas da Fase 1 (não bloqueiam o "ir ao ar", mas valem planejar):**
- Não há verificação de e-mail no cadastro
- Não há fluxo de recuperação/troca de senha (estava no escopo original, fica para a Fase 2)
- O logout invalida a sessão no navegador, mas o JWT em si continua tecnicamente válido até expirar (24h) caso alguém já o tenha copiado antes — para revogação imediata, seria necessário JWT com estado (blacklist) ou sessões no banco
- `/api/transactions` retorna a lista completa filtrada, sem paginação — se o histórico crescer muito, isso pode ficar lento

## 11. Como publicar de verdade (produção)

Recomendo o combo mais simples e barato para começar:

**Banco de dados — Railway, Supabase ou Neon (PostgreSQL gerenciado)**
1. Crie um banco PostgreSQL gerenciado em um desses provedores
2. Copie a `DATABASE_URL`/credenciais fornecidas

**Backend — Railway ou Render (suportam Docker)**
1. Crie um novo serviço apontando para a pasta `backend/` (ele vai usar o `Dockerfile` já pronto)
2. Configure as variáveis de ambiente no painel do serviço:
   - `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` (do banco criado acima)
   - `JWT_SECRET` (o valor forte gerado no checklist acima)
   - `CORS_ORIGINS` (o domínio do seu frontend — você vai preencher depois de criar o frontend na Vercel)
   - `SPRING_PROFILES_ACTIVE=prod` *(opcional — crie um `application-prod.yml` se quiser logs menos verbosos)*
3. Ao subir, o Flyway roda as migrations automaticamente. Anote a URL pública gerada (ex.: `https://fincontrol-api.up.railway.app`)

**Frontend — Vercel**
1. Importe o repositório (pasta `frontend/`) na Vercel
2. Configure a variável de ambiente:
   - `BACKEND_API_URL` = a URL pública do backend que você anotou acima
3. Deploy. A Vercel te dá um domínio `https://seu-projeto.vercel.app` com HTTPS automático

**Por último, feche o ciclo do CORS:**
Volte no serviço do backend (Railway/Render) e atualize `CORS_ORIGINS` com o domínio real da Vercel. Redeploy o backend.

Pronto — a partir daí o sistema fica acessível de qualquer lugar, para você e para o pessoal de casa, com HTTPS em ambas as pontas e o token JWT nunca exposto ao navegador.

