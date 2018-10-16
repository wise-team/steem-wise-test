import { expect } from "chai";
import "mocha";
import * as _ from "lodash";
import * as steem from "steem";
import * as BluebirdPromise from "bluebird";
import { data as wise } from "./wise-config.gen.js";

import { Config } from "./Config";
import { Context } from "./Context";


export default function(config: Config, context: Context) {
    describe("Test environment (tests/test-environment.test.ts)", () => {
       it("Runs in correct version of nodejs", () => {
            expect(process.version).contains(wise.config.npm.node.version);
        });

       it("Required credential roles are satisfied", () => {
            config.requiredCredentialRoles.forEach(roleName => {
                expect(config.credentials).to.haveOwnProperty(roleName)
                .that.has.ownProperty("account");
            });
        });

       it.skip("Each credentials role is distinct", () => {
            const accounts: string [] = [];
            _.forOwn(config.credentials, (role, roleName) => {
                if (accounts.filter(name => name === role.account).length > 0) throw new Error("More than one role uses account @" + role.account);
                accounts.push(role.account);
            });
        });

       it("Each credentials role account exists and has correct key", async function () {
            this.timeout(4000);

            const roles: { account: string; postingKey: string; } [] = [];
            _.forOwn(config.credentials, (role, roleName) => roles.push(role));

            return BluebirdPromise.resolve(roles)
            .mapSeries((role: any) => {
                return steem.api.getAccountsAsync([ role.account ])
                .then((result: any []) => {
                    if (result.length < 1) throw new Error("Account @" + role.account + " does not exist");

                    const pubWif = result[0].posting.key_auths[0][0];
                    const isValid = steem.auth.wifIsValid(role.postingKey, pubWif);
                    expect(isValid, "Private key for @" + role.account + " is valid").to.be.true;
                });
            });
        });
    });
}
