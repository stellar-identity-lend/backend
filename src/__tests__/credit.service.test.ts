import { CreditService } from "../services/credit.service";
import { StellarService } from "../services/stellar.service";
import { RiskTier, CreditProfile } from "../types";

jest.mock("../services/stellar.service");

const MockStellar = StellarService as jest.MockedClass<typeof StellarService>;

describe("CreditService", () => {
  let service: CreditService;
  let mockStellar: jest.Mocked<StellarService>;

  beforeEach(() => {
    MockStellar.mockClear();
    service = new CreditService();
    mockStellar = MockStellar.mock.instances[0] as jest.Mocked<StellarService>;
    mockStellar.addressToScVal = jest.fn().mockReturnValue({} as any);
    mockStellar.u32ToScVal = jest.fn().mockReturnValue({} as any);
    mockStellar.invokeContract = jest.fn().mockResolvedValue({} as any);
    mockStellar.queryContract = jest.fn();
    mockStellar.scValToNative = jest.fn();
  });

  it("updateScore calls invokeContract with update_score", async () => {
    await service.updateScore("GABC", { tx_history: 500, repayment_rate: 800, wallet_age: 300 });
    expect(mockStellar.invokeContract).toHaveBeenCalledWith(
      expect.any(String),
      "update_score",
      expect.any(Array)
    );
  });

  it("getCreditProfile returns parsed profile", async () => {
    const raw = { score: 750, risk_tier: RiskTier.Low, updated_at: 500 };
    mockStellar.queryContract.mockResolvedValue({} as any);
    mockStellar.scValToNative.mockReturnValue(raw);

    const result = await service.getCreditProfile("GABC");
    expect(result).toEqual<CreditProfile>({ score: 750, risk_tier: RiskTier.Low, updated_at: 500 });
  });

  it("getCreditProfile returns null on error", async () => {
    mockStellar.queryContract.mockRejectedValue(new Error("not found"));
    const result = await service.getCreditProfile("GABC");
    expect(result).toBeNull();
  });

  it("meetsThreshold returns boolean", async () => {
    mockStellar.queryContract.mockResolvedValue({} as any);
    mockStellar.scValToNative.mockReturnValue(true);
    const result = await service.meetsThreshold("GABC", 600);
    expect(result).toBe(true);
  });

  it("getRiskTier returns tier", async () => {
    mockStellar.queryContract.mockResolvedValue({} as any);
    mockStellar.scValToNative.mockReturnValue(RiskTier.Medium);
    const result = await service.getRiskTier("GABC");
    expect(result).toBe(RiskTier.Medium);
  });
});
