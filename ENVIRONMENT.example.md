# BISmart AI environment reference

The managed WebDev runtime injects the core variables below. Do not commit real values.

```bash
DATABASE_URL=mysql://user:password@host:3306/bismart
JWT_SECRET=replace-with-a-long-random-secret
LLM_API_KEY=
VECTOR_DB_PATH=./knowledge_base/vector_store
OCR_PROVIDER=demo
OCR_API_KEY=
```

`LLM_API_KEY` and `OCR_API_KEY` are optional in the current deterministic demo fallback. Use the project secret manager for real credentials.
