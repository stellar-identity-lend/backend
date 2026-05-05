"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identity_service_1 = require("../services/identity.service");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const identityService = new identity_service_1.IdentityService();
// POST /identity/register
router.post("/register", async (req, res) => {
    const { userAddress, identityHash } = req.body;
    if (!userAddress || !identityHash) {
        return res.status(400).json({ error: "userAddress and identityHash required" });
    }
    try {
        await identityService.registerIdentity(userAddress, identityHash);
        return res.status(201).json({ message: "Identity registered" });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// POST /identity/verify
router.post("/verify", async (req, res) => {
    const { userAddress, status } = req.body;
    if (!userAddress || !status) {
        return res.status(400).json({ error: "userAddress and status required" });
    }
    if (!Object.values(types_1.VerificationStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }
    try {
        await identityService.verifyIdentity(userAddress, status);
        return res.json({ message: "Identity updated" });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET /identity/:address
router.get("/:address", async (req, res) => {
    try {
        const identity = await identityService.getIdentity(req.params.address);
        if (!identity)
            return res.status(404).json({ error: "Identity not found" });
        return res.json(identity);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET /identity/:address/verified
router.get("/:address/verified", async (req, res) => {
    try {
        const verified = await identityService.isVerified(req.params.address);
        return res.json({ verified });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
