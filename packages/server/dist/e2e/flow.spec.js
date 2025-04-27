"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
(0, test_1.test)("basic user flow", async ({ page }) => {
    test_1.test.setTimeout(60_000);
    await page.goto("/");
    (0, test_1.expect)(await page.title()).toBeTruthy();
});
//# sourceMappingURL=flow.spec.js.map