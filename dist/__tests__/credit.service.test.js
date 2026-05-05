"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const credit_service_1 = require("../services/credit.service");
const stellar_service_1 = require("../services/stellar.service");
const types_1 = require("../types");
jest.mock("../services/stellar.service");
const MockStellar = stellar_service_1.StellarService;
describe("CreditService", () => {
    let service;
    let mockStellar;
    beforeEach(() => {
        MockStellar.mockClear();
        service = new credit_service_1.CreditService();
        mockStellar = MockStellar.mock.instances[0];
        mockStellar.addressToScVal = jest.fn().mockReturnValue({});
        mockStellar.u32ToScVal = jest.fn().mockReturnValue({});
        mockStellar.invokeContract = jest.fn().mockResolvedValue({});
        mockStellar.queryContract = jest.fn();
        mockStellar.scValToNative = jest.fn();
    });
    it("updateScore calls invokeContract with update_score", async () => {
        await service.updateScore("GABC", { tx_history: 500, repayment_rate: 800, wallet_age: 300 });
        expect(mockStellar.invokeContract).toHaveBeenCalledWith(expect.any(String), "update_score", expect.any(Array));
    });
    it("getCreditProfile returns parsed profile", async () => {
        const raw = { score: 750, risk_tier: types_1.RiskTier.Low, updated_at: 500 };
        mockStellar.queryContract.mockResolvedValue({});
        mockStellar.scValToNative.mockReturnValue(raw);
        const result = await service.getCreditProfile("GABC");
        expect(result).toEqual({ score: 750, risk_tier: types_1.RiskTier.Low, updated_at: 500 });
    });
    it("getCreditProfile returns null on error", async () => {
        mockStellar.queryContract.mockRejectedValue(new Error("not found"));
        const result = await service.getCreditProfile("GABC");
        expect(result).toBeNull();
    });
    it("meetsThreshold returns boolean", async () => {
        mockStellar.queryContract.mockResolvedValue({});
        mockStellar.scValToNative.mockReturnValue(true);
        const result = await service.meetsThreshold("GABC", 600);
        expect(result).toBe(true);
    });
    it("getRiskTier returns tier", async () => {
        mockStellar.queryContract.mockResolvedValue({});
        mockStellar.scValToNative.mockReturnValue(types_1.RiskTier.Medium);
        const result = await service.getRiskTier("GABC");
        expect(result).toBe(types_1.RiskTier.Medium);
    });
});
