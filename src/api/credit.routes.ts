import { Router, Request, Response } from "express";
import { CreditService } from "../services/credit.service";

const router = Router();
const creditService = new CreditService();

// POST /credit/score
router.post("/score", async (req: Request, res: Response) => {
  const { userAddress, tx_history, repayment_rate, wallet_age } = req.body;
  if (!userAddress || tx_history == null || repayment_rate == null || wallet_age == null) {
    return res.status(400).json({ error: "userAddress, tx_history, repayment_rate, wallet_age required" });
  }
  try {
    await creditService.updateScore(userAddress, { tx_history, repayment_rate, wallet_age });
    return res.json({ message: "Score updated" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /credit/:address
router.get("/:address", async (req: Request, res: Response) => {
  try {
    const profile = await creditService.getCreditProfile(req.params.address);
    if (!profile) return res.status(404).json({ error: "Credit profile not found" });
    return res.json(profile);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /credit/:address/threshold/:minScore
router.get("/:address/threshold/:minScore", async (req: Request, res: Response) => {
  const minScore = parseInt(req.params.minScore, 10);
  if (isNaN(minScore)) return res.status(400).json({ error: "Invalid minScore" });
  try {
    const meets = await creditService.meetsThreshold(req.params.address, minScore);
    return res.json({ meets });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
