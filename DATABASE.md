# Database and API-key Operations

TruthLayer uses PostgreSQL through Prisma. The data model in `prisma/schema.prisma` contains users, organizations, memberships, API keys, and verification receipts.

## Local setup

1. Start PostgreSQL and copy `apps/platform/.env.example` to `apps/platform/.env.local`.
2. Set a strong `TRUTHLAYER_BOOTSTRAP_TOKEN` and `AUTH_SECRET`. The bootstrap token protects initial operations; dashboard authentication is provided by Auth.js credentials.
3. Apply the schema:

```powershell
$env:DATABASE_URL='postgresql://truthlayer:truthlayer@localhost:5432/truthlayer?schema=public'
npx prisma migrate dev --schema prisma/schema.prisma --name init
```

## API-key lifecycle (bootstrap only)

Create an organization and its first key. The returned `secret` is shown once and is never stored in plaintext.

```text
POST /api/v1/keys
x-truthlayer-bootstrap-token: <bootstrap token>

{
  "organizationName": "Acme",
  "organizationSlug": "acme",
  "name": "Production key"
}
```

Pass the returned secret through the SDK as `apiKey`. Authenticated verification calls persist their full receipts. A supplied invalid/revoked bearer token is rejected with `401`.

## Security boundary

The bootstrap token is a temporary operations mechanism, not the final dashboard authorization system. Replace it with authenticated user/organization authorization before production. API-key secrets are SHA-256 hashed before persistence; only their non-sensitive prefix is displayed later.
