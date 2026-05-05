# AI2.md — Frontend Integration Guide

> For the **frontend** team. Describes how to connect to the running backend API.

---

## Base URL

```
http://localhost:3000
```

For production, replace with your deployed backend URL.

---

## Endpoints

### Health Check

```http
GET /health
```

```json
{ "status": "ok" }
```

---

### Identity

#### Register Identity
User submits their KYC document hash (SHA-256). Call this after the user connects their wallet.

```http
POST /identity/register
Content-Type: application/json

{
  "userAddress": "GABC...",
  "identityHash": "sha256-of-kyc-document"
}
```

Response `201`:
```json
{ "message": "Identity registered" }
```

---

#### Get Identity
Fetch a user's identity record to show their verification status.

```http
GET /identity/:address
```

Response `200`:
```json
{
  "identity_hash": "deadbeef...",
  "status": "Verified",
  "registered_at": 12345,
  "updated_at": 12350
}
```

`status` is one of: `Unverified` | `Pending` | `Verified` | `Revoked`

Response `404` — identity not found.

---

#### Check Verified
Quick boolean check. Use this to gate loan-related UI.

```http
GET /identity/:address/verified
```

Response `200`:
```json
{ "verified": true }
```

---

### Credit

#### Get Credit Profile
Fetch a user's credit score and risk tier for the dashboard.

```http
GET /credit/:address
```

Response `200`:
```json
{
  "score": 750,
  "risk_tier": "Low",
  "updated_at": 12345
}
```

`risk_tier` is one of: `Low` | `Medium` | `High`

Response `404` — no score on record yet.

---

#### Check Score Threshold
Check if a user meets a minimum score before showing loan options.

```http
GET /credit/:address/threshold/:minScore
```

Example: `GET /credit/GABC.../threshold/600`

Response `200`:
```json
{ "meets": true }
```

---

## Suggested React Hooks

### `useIdentity`

```typescript
// hooks/useIdentity.ts
import { useEffect, useState } from "react";

interface Identity {
  identity_hash: string;
  status: "Unverified" | "Pending" | "Verified" | "Revoked";
  registered_at: number;
  updated_at: number;
}

export function useIdentity(address: string | null) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/identity/${address}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setIdentity)
      .finally(() => setLoading(false));
  }, [address]);

  return { identity, loading };
}
```

---

### `useCreditProfile`

```typescript
// hooks/useCreditProfile.ts
import { useEffect, useState } from "react";

interface CreditProfile {
  score: number;
  risk_tier: "Low" | "Medium" | "High";
  updated_at: number;
}

export function useCreditProfile(address: string | null) {
  const [profile, setProfile] = useState<CreditProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/credit/${address}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [address]);

  return { profile, loading };
}
```

---

## UI States to Handle

| State | What to show |
|---|---|
| No wallet connected | "Connect your wallet to continue" |
| Identity not found (`404`) | "Complete identity verification to continue" |
| `status: Pending` | "Verification in progress…" |
| `status: Revoked` | "Account suspended" |
| `status: Verified` + score ≥ 600 | Show loan options |
| `status: Verified` + score < 400 | "Build your credit history first" |
| Credit profile not found (`404`) | "No credit history yet" |

---

## User Flow

```
1. User connects wallet (Freighter / Lobstr)
2. GET /identity/:address
   → 404 → prompt user to register
   → Pending → show waiting state
   → Verified → proceed
3. GET /credit/:address
   → show score + risk tier on dashboard
4. GET /credit/:address/threshold/600
   → true → enable "Request Loan" button
   → false → show "improve your score" message
```

---

## Register Identity Flow

```typescript
async function registerIdentity(userAddress: string, kycDocumentHash: string) {
  const res = await fetch("/identity/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userAddress, identityHash: kycDocumentHash }),
  });

  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}
```

> The `identityHash` must be a SHA-256 hex string of the user's KYC document.
> Never send raw PII to the backend.

---

## Error Handling

All error responses follow this shape:

```json
{ "error": "description of what went wrong" }
```

| Status | Meaning |
|---|---|
| `400` | Missing or invalid request fields |
| `404` | Resource not found |
| `500` | Contract or network error |

---

## CORS

If the frontend runs on a different origin, add CORS to the backend:

```typescript
// In src/index.ts — add before routes
import cors from "cors";
app.use(cors({ origin: "http://localhost:5173" })); // your frontend URL
```

Install: `npm install cors @types/cors`

---

## What's Coming (Phase 2)

Once the lending pool and loan manager contracts are built, these endpoints will be added:

| Endpoint | Description |
|---|---|
| `POST /loan/request` | Submit a loan request |
| `GET /loan/:id` | Get loan details |
| `POST /loan/:id/repay` | Make a repayment |
| `GET /loan/user/:address` | List all loans for a user |

The frontend should treat the current identity and credit endpoints as stable — no breaking changes expected.
