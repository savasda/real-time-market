# Real-Time Stock App

A real-time stock price tracker built with **Angular 21** and **NestJS**, structured as an **NX monorepo**.

> **Note:** This monorepo structure is implemented as part of a technical assessment to demonstrate
> knowledge of enterprise-grade frontend architecture. In a production project of this size a simpler
> setup would be appropriate; the NX + NestJS approach is justified here once the server grows into
> a real backend (see rationale below).

---

## Workspace Structure

```text
real-time-stock-app/
├── apps/
│   ├── client/          # Angular 21 SPA — zoneless, signals, OnPush
│   └── server/          # NestJS proxy server — WebSocket gateway + REST
├── libs/
│   ├── shared-models/   # StockQuote, StockSymbol, MessageType — used by BOTH apps
│   ├── ui/              # StockToggleComponent — reusable, zero business logic
│   └── utils/           # Pure TS mock-data utilities — no Angular dependencies
├── tsconfig.base.json   # Workspace-level TS config with @stock-app/* path aliases
└── nx.json              # NX build orchestration
```

### Library boundaries

| Library | Consumers | What it contains |
| --- | --- | --- |
| `@stock-app/shared-models` | Angular client + NestJS server | `StockQuote`, `StockSymbol`, `MessageType`, parse functions |
| `@stock-app/ui` | Angular client | `StockToggleComponent` |
| `@stock-app/utils` | Angular client | Mock-data state & price-update helpers |

---

## Why NX?

The key question is always: **what does the monorepo tooling actually buy you?**

With a plain Node.js proxy there was no real sharing — the client and server lived in separate
folders but had no common TypeScript contract. Migrating the server to NestJS created a genuine
shared boundary:

- `libs/shared-models` contains the `StockQuote` interface and `StockSymbol` type that are now
  imported by **both** the Angular services and the NestJS gateway. If the data contract changes,
  the compiler catches mismatches in both apps simultaneously.
- The `@stock-app/*` path aliases (defined once in `tsconfig.base.json`) make cross-project imports
  clean and refactor-friendly.
- NX's dependency graph ensures that `apps/client` and `apps/server` cannot import each other's
  internals — only through published lib boundaries.

---

## Setup

1. **Install dependencies (all in one step):**
   ```bash
   npm install
   ```

2. **Environment — create `.env` in the project root:**
   ```text
   FINNHUB_TOKEN=your_finnhub_token_here
   ```

---

## Run

Open two terminals:

```bash
# Terminal 1 — NestJS server (WebSocket + REST proxy)
npm run start:server

# Terminal 2 — Angular client
npm start
```

The app is available at `http://localhost:4200`.

If the server is unavailable the Angular client automatically falls back to local mock data after
three retries and displays the appropriate status message.

---

## Commands

| Command | Description |
| --- | --- |
| `npm start` | Serve Angular client (dev) |
| `npm run start:server` | Serve NestJS server via `ts-node` |
| `npm run build` | Production build of Angular client |
| `npm run build:server` | Compile NestJS server to `dist/` |
| `npm test` | Run Angular client unit tests (Karma, ChromeHeadless) |
| `npm run test:all` | Run unit tests across **all projects and libraries** (ChromeHeadless) |

NX targets can also be invoked directly:

```bash
npx nx run client:serve
npx nx run server:serve
npx nx run client:build
npx nx run client:test
npx nx run shared-models:test
npx nx run ui:test
```

---

## Architecture overview

```text
Browser
  └── Angular (apps/client)
        ├── StockStreamService  — orchestrates real/mock streams, manages retries
        ├── StockWsService      — WebSocket client → server:8080
        ├── StockQuoteService   — HTTP GET /api/metric/:symbol → server:8080
        └── StockMockService    — interval-based fallback, uses @stock-app/utils

NestJS (apps/server) :8080
  ├── StockGateway       — @WebSocketGateway, routes subscribe/unsubscribe events
  ├── FinnhubService     — upstream wss://ws.finnhub.io, ref-counted subscriptions
  └── StockMetricController — GET /api/metric/:symbol → Finnhub REST (token hidden)

Finnhub API
  ├── wss://ws.finnhub.io   — real-time trade stream
  └── https://finnhub.io/api/v1/stock/metric — 52-week high/low data
```
