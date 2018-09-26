import { expect } from "chai";
import "mocha";
import * as yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";
import { Wise } from "steem-wise-core";

import { Config } from "../../Config";
import { FullContext } from "../../FullContext";


export default function(config: Config, context: FullContext) {
    describe("Voter-delegator relation scenarios (tests/full-assembly/voter-delegator-scenarios.test.ts)", () => {
        it("Uploads rules correctly", () => {
            const rulesFileContents = fs.readFileSync(path.resolve(__dirname, "rules.yml"), "utf8").toString();
            const rules = yaml.safeLoad(rulesFileContents);

            // test if rules file was not corrupted
            expect(rules).to.be.an("array").with.length.greaterThan(0);
            expect(rules[0]).to.haveOwnProperty("voter");
            expect(rules[0]).to.haveOwnProperty("rulesets");

            // const wise = new Wise();

            console.log(JSON.stringify(rules, undefined, 2));
        });
    });
}
