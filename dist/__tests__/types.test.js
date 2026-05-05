"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
describe("types helpers", () => {
    describe("scoreToRiskTier", () => {
        it("returns Low for score >= 700", () => {
            expect((0, types_1.scoreToRiskTier)(700)).toBe(types_1.RiskTier.Low);
            expect((0, types_1.scoreToRiskTier)(1000)).toBe(types_1.RiskTier.Low);
        });
        it("returns Medium for 400–699", () => {
            expect((0, types_1.scoreToRiskTier)(400)).toBe(types_1.RiskTier.Medium);
            expect((0, types_1.scoreToRiskTier)(699)).toBe(types_1.RiskTier.Medium);
        });
        it("returns High for < 400", () => {
            expect((0, types_1.scoreToRiskTier)(0)).toBe(types_1.RiskTier.High);
            expect((0, types_1.scoreToRiskTier)(399)).toBe(types_1.RiskTier.High);
        });
    });
    describe("computeScore", () => {
        it("computes weighted score correctly", () => {
            // (500*30 + 600*50 + 400*20) / 100 = (15000+30000+8000)/100 = 530
            expect((0, types_1.computeScore)({ tx_history: 500, repayment_rate: 600, wallet_age: 400 })).toBe(530);
        });
        it("returns 0 for all-zero input", () => {
            expect((0, types_1.computeScore)({ tx_history: 0, repayment_rate: 0, wallet_age: 0 })).toBe(0);
        });
        it("returns 1000 for all-max input", () => {
            expect((0, types_1.computeScore)({ tx_history: 1000, repayment_rate: 1000, wallet_age: 1000 })).toBe(1000);
        });
    });
});
