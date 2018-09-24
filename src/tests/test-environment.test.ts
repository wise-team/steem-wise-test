import { expect } from "chai";
import "mocha";
import { Context } from "../Context";

export default function(context: Context) {
    describe("Test environment (tests/test-environment.test.ts)", () => {
        it("Runs in correct version of nodejs", () => {
            expect(process.version).contains(context.getConfig().requiredNodeJsVersion);
        });
    });
}
