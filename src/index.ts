import express from "express";
import { config } from "./config";
import identityRoutes from "./api/identity.routes";
import creditRoutes from "./api/credit.routes";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/identity", identityRoutes);
app.use("/credit", creditRoutes);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

export default app;
