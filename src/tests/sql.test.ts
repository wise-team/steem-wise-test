import { expect } from "chai";
import "mocha";
import * as npm from "npm";

import { Config } from "../Config";
import { Context } from "../Context";


export default function(config: Config, context: Context) {
    describe("steem-wise-sql (tests/sql.test.ts)", function () {
        this.bail(true);

        if (!config.skipDockerBuild)it("Builds without error", function (done) {
            this.timeout(60 * 1000);
            // TODO build with docker
            done();
        });
    });
}
