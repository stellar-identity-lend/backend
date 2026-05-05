import request from "supertest";
import { VerificationStatus, RiskTier } from "../types";

// Mock services BEFORE importing app
const mockRegisterIdentity = jest.fn();
const mockVerifyIdentity = jest.fn();
const mockGetIdentity = jest.fn();
const mockIsVerified = jest.fn();
const mockUpdateScore = jest.fn();
const mockGetCreditProfile = jest.fn();
const mockMeetsThreshold = jest.fn();

jest.mock("../services/identity.service", () => ({
  IdentityService: jest.fn().mockImplementation(() => ({
    registerIdentity: mockRegisterIdentity,
    verifyIdentity: mockVerifyIdentity,
    getIdentity: mockGetIdentity,
    isVerified: mockIsVerified,
  })),
}));

jest.mock("../services/credit.service", () => ({
  CreditService: jest.fn().mockImplementation(() => ({
    updateScore: mockUpdateScore,
    getCreditProfile: mockGetCreditProfile,
    meetsThreshold: mockMeetsThreshold,
  })),
}));

import app from "../index";

describe("API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /health", () => {
    it("returns ok", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("POST /identity/register", () => {
    it("returns 400 when fields missing", async () => {
      const res = await request(app).post("/identity/register").send({});
      expect(res.status).toBe(400);
    });

    it("returns 201 on success", async () => {
      mockRegisterIdentity.mockResolvedValue(undefined);
      const res = await request(app)
        .post("/identity/register")
        .send({ userAddress: "GABC", identityHash: "deadbeef" });
      expect(res.status).toBe(201);
    });

    it("returns 500 on service error", async () => {
      mockRegisterIdentity.mockRejectedValue(new Error("contract error"));
      const res = await request(app)
        .post("/identity/register")
        .send({ userAddress: "GABC", identityHash: "deadbeef" });
      expect(res.status).toBe(500);
    });
  });

  describe("POST /identity/verify", () => {
    it("returns 400 for invalid status", async () => {
      const res = await request(app)
        .post("/identity/verify")
        .send({ userAddress: "GABC", status: "INVALID" });
      expect(res.status).toBe(400);
    });

    it("returns 200 on success", async () => {
      mockVerifyIdentity.mockResolvedValue(undefined);
      const res = await request(app)
        .post("/identity/verify")
        .send({ userAddress: "GABC", status: VerificationStatus.Verified });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /identity/:address", () => {
    it("returns 404 when not found", async () => {
      mockGetIdentity.mockResolvedValue(null);
      const res = await request(app).get("/identity/GABC");
      expect(res.status).toBe(404);
    });

    it("returns identity when found", async () => {
      const identity = {
        identity_hash: "deadbeef",
        status: VerificationStatus.Verified,
        registered_at: 100,
        updated_at: 200,
      };
      mockGetIdentity.mockResolvedValue(identity);
      const res = await request(app).get("/identity/GABC");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(identity);
    });
  });

  describe("GET /identity/:address/verified", () => {
    it("returns verified status", async () => {
      mockIsVerified.mockResolvedValue(true);
      const res = await request(app).get("/identity/GABC/verified");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ verified: true });
    });
  });

  describe("POST /credit/score", () => {
    it("returns 400 when fields missing", async () => {
      const res = await request(app).post("/credit/score").send({ userAddress: "GABC" });
      expect(res.status).toBe(400);
    });

    it("returns 200 on success", async () => {
      mockUpdateScore.mockResolvedValue(undefined);
      const res = await request(app)
        .post("/credit/score")
        .send({ userAddress: "GABC", tx_history: 500, repayment_rate: 800, wallet_age: 300 });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /credit/:address", () => {
    it("returns 404 when not found", async () => {
      mockGetCreditProfile.mockResolvedValue(null);
      const res = await request(app).get("/credit/GABC");
      expect(res.status).toBe(404);
    });

    it("returns profile when found", async () => {
      const profile = { score: 750, risk_tier: RiskTier.Low, updated_at: 500 };
      mockGetCreditProfile.mockResolvedValue(profile);
      const res = await request(app).get("/credit/GABC");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(profile);
    });
  });

  describe("GET /credit/:address/threshold/:minScore", () => {
    it("returns 400 for invalid minScore", async () => {
      const res = await request(app).get("/credit/GABC/threshold/abc");
      expect(res.status).toBe(400);
    });

    it("returns meets result", async () => {
      mockMeetsThreshold.mockResolvedValue(true);
      const res = await request(app).get("/credit/GABC/threshold/600");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ meets: true });
    });
  });
});
