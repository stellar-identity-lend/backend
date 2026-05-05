"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const identity_routes_1 = __importDefault(require("./api/identity.routes"));
const credit_routes_1 = __importDefault(require("./api/credit.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/identity", identity_routes_1.default);
app.use("/credit", credit_routes_1.default);
if (require.main === module) {
    app.listen(config_1.config.port, () => {
        console.log(`Server running on port ${config_1.config.port}`);
    });
}
exports.default = app;
