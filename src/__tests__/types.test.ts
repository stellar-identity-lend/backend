import { computeScore, scoreToRiskTier, RiskTier } from "../types";

describe("types helpers", () => {
  describe("scoreToRiskTier", () => {
    it("returns Low for score >= 700", () => {
      expect(scoreToRiskTier(700)).toBe(RiskTier.Low);
      expect(scoreToRiskTier(1000)).toBe(RiskTier.Low);
    });
    it("returns Medium for 400–699", () => {
      expect(scoreToRiskTier(400)).toBe(RiskTier.Medium);
      expect(scoreToRiskTier(699)).toBe(RiskTier.Medium);
    });
    it("returns High for < 400", () => {
      expect(scoreToRiskTier(0)).toBe(RiskTier.High);
      expect(scoreToRiskTier(399)).toBe(RiskTier.High);
    });
  });

  describe("computeScore", () => {
    it("computes weighted score correctly", () => {
      // (500*30 + 600*50 + 400*20) / 100 = (15000+30000+8000)/100 = 530
      expect(computeScore({ tx_history: 500, repayment_rate: 600, wallet_age: 400 })).toBe(530);
    });
    it("returns 0 for all-zero input", () => {
      expect(computeScore({ tx_history: 0, repayment_rate: 0, wallet_age: 0 })).toBe(0);
    });
    it("returns 1000 for all-max input", () => {
      expect(computeScore({ tx_history: 1000, repayment_rate: 1000, wallet_age: 1000 })).toBe(1000);
    });
  });
});
