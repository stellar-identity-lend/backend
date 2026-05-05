import { IdentityService } from "../services/identity.service";
import { StellarService } from "../services/stellar.service";
import { VerificationStatus, Identity } from "../types";

jest.mock("../services/stellar.service");

const MockStellar = StellarService as jest.MockedClass<typeof StellarService>;

describe("IdentityService", () => {
  let service: IdentityService;
  let mockStellar: jest.Mocked<StellarService>;

  beforeEach(() => {
    MockStellar.mockClear();
    service = new IdentityService();
    mockStellar = MockStellar.mock.instances[0] as jest.Mocked<StellarService>;
    mockStellar.addressToScVal = jest.fn().mockReturnValue({} as any);
    mockStellar.bytesToScVal = jest.fn().mockReturnValue({} as any);
    mockStellar.invokeContract = jest.fn().mockResolvedValue({} as any);
    mockStellar.queryContract = jest.fn();
    mockStellar.scValToNative = jest.fn();
  });

  it("registerIdentity calls invokeContract with correct method", async () => {
    await service.registerIdentity("GABC", "deadbeef");
    expect(mockStellar.invokeContract).toHaveBeenCalledWith(
      expect.any(String),
      "register_identity",
      expect.any(Array)
    );
  });

  it("verifyIdentity calls invokeContract with verify_identity", async () => {
    await service.verifyIdentity("GABC", VerificationStatus.Verified);
    expect(mockStellar.invokeContract).toHaveBeenCalledWith(
      expect.any(String),
      "verify_identity",
      expect.any(Array)
    );
  });

  it("getIdentity returns parsed identity", async () => {
    const raw = {
      identity_hash: Buffer.from("deadbeef", "hex"),
      status: VerificationStatus.Verified,
      registered_at: 100,
      updated_at: 200,
    };
    mockStellar.queryContract.mockResolvedValue({} as any);
    mockStellar.scValToNative.mockReturnValue(raw);

    const result = await service.getIdentity("GABC");
    expect(result).toEqual<Identity>({
      identity_hash: "deadbeef",
      status: VerificationStatus.Verified,
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
    mockStellar.queryContract.mockResolvedValue({} as any);
    mockStellar.scValToNative.mockReturnValue(true);
    const result = await service.isVerified("GABC");
    expect(result).toBe(true);
  });
});
