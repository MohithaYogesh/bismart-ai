# BISmart AI

**Intelligent BIS Standards, Certification & Product Compliance Assistant**

A polished SIH26107 prototype for the **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers** problem statement.

## What is included

- Source-backed BIS Assistant with retrieval-first answer path and explicit uncertainty handling.
- Standard discovery workflow that never fabricates a standard number when the demo retrieval cannot verify it.
- Certification and licensing guidance path with official BIS source links.
- Product scanner demo with image upload, OCR-ready pipeline, editable extracted fields and barcode caveat.
- Product claim verification with **Supported / Cannot Verify / Potentially Not Supported** states.
- Preliminary compliance review dashboard with explainable evidence and careful wording.
- English / Hindi / Kannada language selection scaffold.
- Report workspace with browser print-to-PDF flow.
- Admin knowledge-base status view with document, index and unknown-query metrics.
- Drizzle schema and MySQL/TiDB migration for knowledge documents, queries, scans and reports.
- tRPC procedures for assistant, standard recommendations, scan fallback, knowledge status and report payloads.

## Important prototype boundary

BISmart AI is a guidance and discovery tool. It is **not** an official BIS service, does not grant certification, does not authenticate a product from a barcode, and does not legally certify the truth of a claim. Demo knowledge records are clearly labeled in the UI and all important flows point to official BIS sources for confirmation.

## Architecture

```text
User
  ↓
React + TypeScript + Tailwind workspace
  ↓
tRPC procedures (server/routers.ts)
  ↓
Intent + deterministic demo fallback (server/bismart-data.ts)
  ↓
Trusted BIS source metadata + retrieval scoring
  ↓
Source-backed response / standard discovery / report payload

Product image
  ↓
Local upload preview + OCR-ready provider abstraction
  ↓
Editable extracted fields
  ↓
Claim evidence evaluation
  ↓
Explainable preliminary compliance review
```

The current demo uses a deterministic local fallback so it works without an external LLM or OCR provider. The provider boundary is intentionally isolated in `server/bismart-data.ts`; a production deployment can replace retrieval scoring with embeddings/vector search and the OCR fallback with Tesseract or another vision provider.

## Technology stack

- React 19, TypeScript, Vite
- Tailwind CSS 4 and Lucide icons
- Express + tRPC 11
- Drizzle ORM with MySQL/TiDB
- Manus OAuth scaffold and managed project runtime
- Vitest

## Run locally

```bash
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```

The managed WebDev preview runs the single server process and serves the React application plus tRPC API.

## Environment variables

See `ENVIRONMENT.example.md`. The managed scaffold supplies `DATABASE_URL`, `JWT_SECRET`, Manus OAuth variables and built-in API variables. No API keys are hard-coded in the application. The managed project secret workflow intentionally prevents committing a real `.env.example` file.

## Database setup

The schema lives in `drizzle/schema.ts`. The generated migration is in `drizzle/0001_colossal_namorita.sql` and creates:

- `knowledgeDocuments` — source URLs, metadata, text chunks and indexing status.
- `userQueries` — query text, intent, response, sources and resolution status.
- `productScans` — image reference, OCR output, extracted fields, claims and compliance status.
- `reports` — report metadata and summary references.

For future ingestion, store one document row per source and keep chunk-level metadata in `textChunks` / `metadata`, then add an embedding index behind the retrieval interface.

## Knowledge-base setup

The initial trusted source set is defined in `server/bismart-data.ts` and prioritizes:

- [BIS home](https://www.bis.gov.in/)
- [Know Your Standard](https://www.bis.gov.in/know-your-standard/)
- [Product Certification](https://www.bis.gov.in/product-certification/)
- [Product Certification Process](https://www.bis.gov.in/product-certification/product-certification-process/)
- [Products under Compulsory Certification](https://www.bis.gov.in/product-certification/products-under-compulsory-certification/)
- [BIS Laboratory](https://www.bis.gov.in/laboratory/)

## Demo workflow

1. Open the workspace and review the knowledge-base health card.
2. Open **BIS Assistant** and ask, “What BIS requirements apply to a pressure cooker?”
3. Follow the official source pills in the answer.
4. Open **Find a standard**, edit product context and run discovery.
5. Open **Product scanner**, upload any label image, and review the editable extracted fields.
6. Open **Compliance review** to inspect claim statuses and evidence explanations.
7. Select **Generate report** to open the browser print dialog and save a PDF.
8. Open **Knowledge admin** to inspect source and index status.

## API surface

The tRPC router exposes these public demo procedures:

- `assistant.ask` — query + optional language → source-backed answer and retrieved entries.
- `standards.recommend` — product + description → potential match with confidence and sources.
- `standards.products` — demo product catalog.
- `scanner.demoAnalyze` — OCR/claim/compliance fallback payload.
- `knowledge.status` — knowledge-base health and source records.
- `knowledge.search` — local retrieval results.
- `reports.build` — report metadata and disclaimer sections.

## Testing

```bash
pnpm check
pnpm test
```

The test suite covers the fallback retrieval behavior, safe uncertainty language, standard recommendation guardrails and demo scan claim states. Add integration coverage around database writes when switching the UI from local fallback to persisted records.

## Docker

`docker-compose.yml` is included as a reference for a local MySQL-compatible database. The managed WebDev runtime uses its own database connection and single-process server configuration.

## Limitations and next steps

- Replace deterministic retrieval scoring with chunked embeddings + FAISS, Chroma or pgvector.
- Add a configurable LLM provider behind a server-only environment variable.
- Add Tesseract/OpenCV or a vision provider for production OCR and preprocessing.
- Add persisted tRPC mutations for user queries, scan history and reports.
- Add document ingestion, deduplication, chunking and scheduled source freshness checks.
- Add a full admin permission gate for knowledge mutations.
- Add more Indian language translations and localized answer templates.

## License

Prototype code for hackathon/demo use. Confirm licensing and source terms before ingesting or redistributing official BIS documents in production.
