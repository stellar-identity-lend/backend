# Stellar Identity Lending — Backend

Backend services for indexing Stellar data, computing credit scores, managing APIs, and orchestrating identity and lending workflows. Provides the off-chain logic layer for the Stellar Identity Lending protocol.

## Overview

This backend connects to Soroban smart contracts (`identity-registry` and `credit-engine`) to enable identity-linked, reputation-based lending on Stellar. It indexes on-chain transaction history, computes credit scores, and exposes REST APIs for frontend integration.

## Architecture

```
Frontend → Backend API → Soroban Contracts → Stellar Network
                ↓
         Horizon Indexer
```

**Key Components:**
- **Services** — Contract interaction layer (identity, credit scoring)
- **Indexers** — On-chain data aggregation (transaction history, wallet age)
- **API Routes** — REST endpoints for identity verification and credit profiles
- **Tests** — 31 passing tests with mocked contract calls

## Tech Stack

- **Runtime:** Node.js 24+ / TypeScript 5
- **Framework:** Express
- **Blockchain:** Stellar SDK 13 (Soroban RPC + Horizon)
- **Testing:** Jest + Supertest

## Project Status

✅ **40% Complete** — Identity & credit scoring infrastructure  
🔜 **60% Remaining** — Lending pool & loan manager contracts + integration

### What's Built

| Component | Status |
|---|---|
| Identity registry integration | ✅ |
| Credit engine integration | ✅ |
| Transaction indexer | ✅ |
| API routes (identity, credit) | ✅ |
| Test suite (31 tests) | ✅ |
| Lending pool integration | 🔜 |
| Loan manager integration | 🔜 |

## Setup

### Prerequisites

- Node.js 24+
- Stellar testnet account with admin privileges
- Deployed Soroban contracts (identity-registry, credit-engine)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```env
IDENTITY_REGISTRY_CONTRACT_ID=CAAAA...
CREDIT_ENGINE_CONTRACT_ID=CAAAA...
ADMIN_SECRET_KEY=SCZANG...
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
PORT=3000
```

⚠️ **Never commit `.env` to version control**

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Testing

```bash
npm test
```

## API Reference

### Health Check

```http
GET /health
```

Returns `{"status": "ok"}`

---

### Identity Endpoints

#### Register Identity

```http
POST /identity/register
Content-Type: application/json

{
  "userAddress": "GABC...",
  "identityHash": "deadbeef..."  // SHA-256 of KYC document
}
```

**Response:** `201 Created`

#### Verify Identity

```http
POST /identity/verify
Content-Type: application/json

{
  "userAddress": "GABC...",
  "status": "Verified"  // Verified | Pending | Revoked
}
```

**Response:** `200 OK` (Admin only)

#### Get Identity

```http
GET /identity/:address
```

**Response:**
```json
{
  "identity_hash": "deadbeef",
  "status": "Verified",
  "registered_at": 12345,
  "updated_at": 12350
}
```

#### Check Verification Status

```http
GET /identity/:address/verified
```

**Response:** `{"verified": true}`

---

### Credit Endpoints

#### Update Credit Score

```http
POST /credit/score
Content-Type: application/json

{
  "userAddress": "GABC...",
  "tx_history": 500,      // 0-1000
  "repayment_rate": 800,  // 0-1000
  "wallet_age": 300       // 0-1000
}
```

**Response:** `200 OK` (Admin only)

#### Get Credit Profile

```http
GET /credit/:address
```

**Response:**
```json
{
  "score": 750,
  "risk_tier": "Low",
  "updated_at": 12345
}
```

#### Check Score Threshold

```http
GET /credit/:address/threshold/:minScore
```

**Response:** `{"meets": true}`

---

## Credit Scoring Formula

```
score = (tx_history × 30% + repayment_rate × 50% + wallet_age × 20%)
```

**Risk Tiers:**
- `700–1000` → Low
- `400–699` → Medium
- `0–399` → High

**Inputs:**
- `tx_history` — Payment volume/frequency (indexed from Horizon)
- `repayment_rate` — Loan repayment ratio (tracked by loan-manager)
- `wallet_age` — Ledger sequences since first transaction

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── identity.routes.ts
│   │   └── credit.routes.ts
│   ├── services/
│   │   ├── stellar.service.ts    # Soroban RPC client
│   │   ├── identity.service.ts
│   │   └── credit.service.ts
│   ├── indexers/
│   │   └── transaction.indexer.ts
│   ├── __tests__/
│   │   ├── types.test.ts
│   │   ├── identity.service.test.ts
│   │   ├── credit.service.test.ts
│   │   └── routes.test.ts
│   ├── config.ts
│   ├── types.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── jest.config.json
```

## Development Workflow

1. **Register user identity** (off-chain KYC → hash → on-chain)
2. **Verify identity** (admin approval)
3. **Index wallet activity** (Horizon → transaction history)
4. **Compute credit score** (formula → on-chain storage)
5. **Check eligibility** (score threshold for loan approval)

## Integration with Contracts

### Identity Registry

- `register_identity(user, hash)` — Store identity hash
- `verify_identity(user, status)` — Update verification status
- `get_identity(user)` — Retrieve identity record
- `is_verified(user)` — Boolean check

### Credit Engine

- `update_score(user, input)` — Push new score
- `get_score(user)` — Retrieve credit profile
- `meets_threshold(user, min)` — Eligibility check

## Testing Strategy

- **Unit tests** — Service logic with mocked Stellar SDK
- **Integration tests** — API routes with mocked services
- **No live network calls** — All tests run offline

Run with: `npm test`

## Roadmap

### Phase 1 (Current — 40%)
- ✅ Identity verification system
- ✅ Credit scoring engine
- ✅ Transaction indexer
- ✅ REST API foundation

### Phase 2 (Next — 60%)
- 🔜 Lending pool contract integration
- 🔜 Loan manager contract integration
- 🔜 Loan request/approval flow
- 🔜 Repayment tracking
- 🔜 Liquidation logic

### Phase 3 (Future)
- 🔜 WebSocket real-time updates
- 🔜 Event streaming (contract events → backend)
- 🔜 Analytics dashboard
- 🔜 Multi-asset support

## Security Considerations

- **Admin key** — Stored server-side only, never exposed to frontend
- **Identity hashing** — SHA-256 of KYC documents, no raw PII on-chain
- **Input validation** — All API endpoints validate request bodies
- **Error handling** — Contract errors caught and returned as HTTP 500

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/name`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

## License

MIT

## Related Repositories

- **Contracts:** `stellar-identity-lend/contracts` (Soroban smart contracts)
- **Frontend:** `stellar-identity-lend/frontend` (React + Freighter wallet)
- **SDK:** `stellar-identity-lend/sdk` (TypeScript client library)

## Support

For questions or issues, open a GitHub issue or contact the team.

---

**Built for Stellar** — Expanding financial access through identity-linked lending
