"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: "./e2e",
    webServer: {
        command: "pnpm dev:test",
        port: 3000,
        timeout: 120_000,
        reuseExistingServer: true
    }
});
//# sourceMappingURL=playwright.config.js.map