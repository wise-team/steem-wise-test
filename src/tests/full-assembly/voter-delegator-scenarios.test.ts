import { expect } from "chai";
import "mocha";
import * as yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";
import { Wise } from "steem-wise-core";

import { Config } from "../../Config";
import { FullContext } from "../../FullContext";
import { Container } from "../../Container";



export default function(config: Config, context: FullContext) {
    describe("Voter-delegator relation scenarios (tests/full-assembly/voter-delegator-scenarios.test.ts)", () => {
        let daemon: Container;
        let cli: Container;
        before(() => {
            daemon = context.getDaemonContainer();
            cli = context.getCliContainer();
        });

        const daemonConfigPath = "/wise-daemon-config.json";
        const daemonConfig = {
            username: config.credentials.delegator.account,
            postingWif: config.credentials.delegator.postingKey,
        };

       it("Uploads rules correctly", async function () {
            this.timeout(20 * 1000);

            const rulesFileContents = fs.readFileSync(path.resolve(__dirname, "rules.yml"), "utf8").toString();
            const rules = yaml.safeLoad(rulesFileContents);
            // test if rules file was not corrupted
            expect(rules).to.be.an("array").with.length.greaterThan(0);
            expect(rules[0]).to.haveOwnProperty("voter");
            expect(rules[0]).to.haveOwnProperty("rulesets");

            const escapedConfig = JSON.stringify(daemonConfig);
            const echoRulesOut = await daemon.execToString(["sh", "-c", "echo " + JSON.stringify(escapedConfig) + "> " + daemonConfigPath + ""]);
            expect(echoRulesOut.stdout).to.be.empty;
            expect(echoRulesOut.stderr).to.be.empty;

            const escapedRules = JSON.stringify(rules);
            const cmd = [ "wise", "-c", daemonConfigPath, "upload-rules", escapedRules];
            const out = await daemon.execToString(cmd);
            expect(out.stderr).to.be.empty;
            console.log(JSON.stringify(cmd));
            console.log("STDOUT = " + out.stdout);
        });
    });
}
