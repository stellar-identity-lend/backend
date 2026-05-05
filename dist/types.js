"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeScore = exports.scoreToRiskTier = exports.RiskTier = exports.VerificationStatus = void 0;
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["Unverified"] = "Unverified";
    VerificationStatus["Pending"] = "Pending";
    VerificationStatus["Verified"] = "Verified";
    VerificationStatus["Revoked"] = "Revoked";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var RiskTier;
(function (RiskTier) {
    RiskTier["Low"] = "Low";
    RiskTier["Medium"] = "Medium";
    RiskTier["High"] = "High";
})(RiskTier || (exports.RiskTier = RiskTier = {}));
function scoreToRiskTier(score) {
    if (score >= 700)
        return RiskTier.Low;
    if (score >= 400)
        return RiskTier.Medium;
    return RiskTier.High;
}
exports.scoreToRiskTier = scoreToRiskTier;
function computeScore(input) {
    return Math.round((input.tx_history * 30 + input.repayment_rate * 50 + input.wallet_age * 20) / 100);
}
exports.computeScore = computeScore;
