import { Router, Request, Response } from "express";
import { IdentityService } from "../services/identity.service";
import { VerificationStatus } from "../types";

const router = Router();
const identityService = new IdentityService();

// POST /identity/register
router.post("/register", async (req: Request, res: Response) => {
  const { userAddress, identityHash } = req.body;
  if (!userAddress || !identityHash) {
    return res.status(400).json({ error: "userAddress and identityHash required" });
  }
  try {
    await identityService.registerIdentity(userAddress, identityHash);
    return res.status(201).json({ message: "Identity registered" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /identity/verify
router.post("/verify", async (req: Request, res: Response) => {
  const { userAddress, status } = req.body;
  if (!userAddress || !status) {
    return res.status(400).json({ error: "userAddress and status required" });
  }
  if (!Object.values(VerificationStatus).includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    await identityService.verifyIdentity(userAddress, status as VerificationStatus);
    return res.json({ message: "Identity updated" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /identity/:address
router.get("/:address", async (req: Request, res: Response) => {
  try {
    const identity = await identityService.getIdentity(req.params.address);
    if (!identity) return res.status(404).json({ error: "Identity not found" });
    return res.json(identity);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /identity/:address/verified
router.get("/:address/verified", async (req: Request, res: Response) => {
  try {
    const verified = await identityService.isVerified(req.params.address);
    return res.json({ verified });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
