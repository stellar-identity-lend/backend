"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identity_service_1 = require("../services/identity.service");
const stellar_service_1 = require("../services/stellar.service");
const types_1 = require("../types");
jest.mock("../services/stellar.service");
const MockStellar = stellar_service_1.StellarService;
describe("IdentityService", () => {
    let service;
    let mockStellar;
    beforeEach(() => {
        MockStellar.mockClear();
        service = new identity_service_1.IdentityService();
        mockStellar = MockStellar.mock.instances[0];
        mockStellar.addressToScVal = jest.fn().mockReturnValue({});
        mockStellar.bytesToScVal = jest.fn().mockReturnValue({});
        mockStellar.invokeContract = jest.fn().mockResolvedValue({});
        mockStellar.queryContract = jest.fn();
        mockStellar.scValToNative = jest.fn();
    });
    it("registerIdentity calls invokeContract with correct method", async () => {
        await service.registerIdentity("GABC", "deadbeef");
        expect(mockStellar.invokeContract).toHaveBeenCalledWith(expect.any(String), "register_identity", expect.any(Array));
    });
    it("verifyIdentity calls invokeContract with verify_identity", async () => {
        await service.verifyIdentity("GABC", types_1.VerificationStatus.Verified);
        expect(mockStellar.invokeContract).toHaveBeenCalledWith(expect.any(String), "verify_identity", expect.any(Array));
    });
    it("getIdentity returns parsed identity", async () => {
        const raw = {
            identity_hash: Buffer.from("deadbeef", "hex"),
            status: types_1.VerificationStatus.Verified,
            registered_at: 100,
            updated_at: 200,
        };
        mockStellar.queryContract.mockResolvedValue({});
        mockStellar.scValToNative.mockReturnValue(raw);
        const result = await service.getIdentity("GABC");
        expect(result).toEqual({
            identity_hash: "deadbeef",
            status: types_1.VerificationStatus.Verified,
            registered_at: 100,
            updated_at: 200,
        });
    });
    it("getIdentity returns null on error", async () => {
        mockStellar.queryContract.mockRejectedValue(new Error("not found"));
        const result = await service.getIdentity("GABC");
        expect(result).toBeNull();
    });
    it("isVerified returns boolean from contract", async () => {
        mockStellar.queryContract.mockResolvedValue({});
        mockStellar.scValToNative.mockReturnValue(true);
        const result = await service.isVerified("GABC");
        expect(result).toBe(true);
    });
});
