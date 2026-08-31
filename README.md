# FinControl — Sistema de Controle Financeiro Pessoal

> "Controle seu dinheiro de forma simples e entenda para onde ele está indo."

MVP funcional de um sistema de controle financeiro pessoal, com backend em Java/Spring Boot e frontend em Next.js. Este README cobre a **Fase 1** do roadmap (auth, contas, categorias, transações e dashboard).

## 1. Funcionalidades da Fase 1

- Cadastro e login com JWT (senha com hash BCrypt)
- Dashboard mensal: receitas, despesas, saldo, % de economia, gráfico de despesas por categoria, últimas transações
- Contas bancárias/carteiras com saldo calculado automaticamente
- Categorias padrão pré-cadastradas no primeiro acesso + criação de categorias próprias
- Lançamento de receitas e despesas com formulário rápido (máscara monetária, seleção de categoria/conta/forma de pagamento)
- Listagem de transações com filtros (tipo, categoria, conta, valor, período), busca por descrição e ordenação
- Layout responsivo mobile-first (bottom nav no celular, sidebar no desktop) com suporte a PWA (instalável, ícones, service worker)

Cartões de crédito, faturas, parcelamento, despesas recorrentes, orçamentos, metas, relatórios comparativos e insights ficam para as Fases 2 e 3 (arquitetura já preparada — ver seção 7).

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
| ✅ 1 | Auth, contas, categorias, transações, dashboard (este README) |
| 2 | Cartões de crédito, faturas, parcelamento, despesas recorrentes, orçamento por categoria |
| 3 | Metas financeiras, relatórios comparativos, insights por regras, notificações |
| Futuro | Conta familiar, OCR de notas, Open Finance, assistente de IA, apps nativos |


