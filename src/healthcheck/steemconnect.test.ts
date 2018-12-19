import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";
import axios from "axios";
import * as steemJs from "steem";
import * as BluebirdPromise from "bluebird";

import { data as wise } from "../wise-config.gen.js";
import { Context } from "../Context";
import { Config } from "../config";


export default function(config: Config, context: Context) {
    describe("Steemconnect", function () {
        this.retries(2);
        this.timeout(4000);

        const steem = new steemJs.api.Steem({ url: wise.config.steem.defaultApiUrl });

        describe ("Steemconnect owner account", () => {
            const ownerAccountName = wise.config.steemconnect.owner.account;
            let ownerAccount: any = undefined;
            before(async () => ownerAccount = (await steem.getAccountsAsync([ ownerAccountName ]))[0]);

            it ("has not been silently changed", () => expect(ownerAccount.last_owner_update).is.equal(wise.config.steemconnect.owner.last_owner_update));

            it ("has not been silently updated", () => expect(ownerAccount.last_account_update).is.equal(wise.config.steemconnect.owner.last_account_update));

            it ("has proper recovery_account", () => expect(ownerAccount.recovery_account).is.equal(wise.config.steemconnect.owner.recovery_account));

            it ("has correct profile settings", () => {
                const metadata = JSON.parse(ownerAccount.json_metadata);
                expect(metadata.profile.name).is.equal(wise.config.steemconnect.owner.profile.name);
                expect(metadata.profile.website).is.equal(wise.config.steemconnect.owner.profile.website);
            });

            it ("has proper keys and threshold thresholds", () => {
                expect(ownerAccount.owner.weight_threshold).is.equal(1);
                expect(ownerAccount.owner.account_auths).is.an("array").with.length(0);
                expect(ownerAccount.owner.key_auths).is.an("array").with.length(1);
                expect(ownerAccount.owner.key_auths[0][0]).is.equal(wise.config.steemconnect.owner.keys.owner);
                expect(ownerAccount.owner.key_auths[0][1]).is.equal(1);

                expect(ownerAccount.active.weight_threshold).is.equal(1);
                expect(ownerAccount.active.account_auths).is.an("array").with.length(0);
                expect(ownerAccount.active.key_auths).is.an("array").with.length(wise.config.steemconnect.owner.keys.active.length);
                expect(
                    ownerAccount.active.key_auths.filter((kA: [string, number]) => wise.config.steemconnect.owner.keys.active.indexOf(kA[0]) !== -1 && kA[1] === 1)
                ).to.have.length(ownerAccount.active.key_auths.length);

                expect(ownerAccount.posting.weight_threshold).is.equal(1);
                expect(ownerAccount.posting.account_auths).is.an("array").with.length(0);
                expect(ownerAccount.posting.key_auths).is.an("array").with.length(wise.config.steemconnect.owner.keys.posting.length);
                expect(
                    ownerAccount.posting.key_auths.filter((kA: [string, number]) => wise.config.steemconnect.owner.keys.posting.indexOf(kA[0]) !== -1 && kA[1] === 1)
                ).to.have.length(ownerAccount.posting.key_auths.length);

                expect(ownerAccount.memo_key).is.equal(wise.config.steemconnect.owner.keys.memo);
            });

           it("has never posted", () => expect(ownerAccount.last_post).is.equal("1970-01-01T00:00:00"));

           it("has never voted", () => expect(ownerAccount.last_vote_time).is.equal("1970-01-01T00:00:00"));

           it("is voting for our witness", () => expect(ownerAccount.witness_votes).is.an("array").that.includes(wise.config.witness.account));
        });

        [ "staging", "production" ].forEach((envType: string) => describe(`Steemconnect ${envType} app account`, () => {
            const appObj = (wise.config.steemconnect.app as any)[envType].app;
            const appAccountName = appObj.account;
            let appAccount: any = undefined;
            before(async () => {
                const resp = await steem.getAccountsAsync([ appAccountName ]);
                // console.log(JSON.stringify(resp[0], undefined, 2));
                appAccount = resp[0];
                if (!appAccount) throw new Error("Undefined appAccount response for @" + appAccountName);
            });

            it ("had owner never updated", () => expect(appAccount.last_owner_update).is.equal(appObj.last_owner_update));

            it ("has not been silently updated", () => expect(appAccount.last_account_update).is.equal(appObj.last_account_update));

            it ("has proper recovery_account", () => expect(appAccount.recovery_account).is.equal(appObj.recovery_account));

            it ("has proper owner account in metadata", () => {
                const metadata = JSON.parse(appAccount.json_metadata);
                expect(metadata.owner).is.equal(wise.config.steemconnect.owner.account);
            });

            it ("has proper keys and threshold thresholds", () => {
                expect(appAccount.owner.weight_threshold).is.equal(1);
                expect(appAccount.owner.account_auths).is.an("array").with.length(1);
                expect(appAccount.owner.account_auths[0][0]).is.equal("steemconnect");
                expect(appAccount.owner.account_auths[0][1]).is.equal(1);
                expect(appAccount.owner.key_auths).is.an("array").with.length(1);
                expect(appAccount.owner.key_auths[0][0]).is.equal(appObj.keys.owner);
                expect(appAccount.owner.key_auths[0][1]).is.equal(1);

                expect(appAccount.active.weight_threshold).is.equal(1);
                expect(appAccount.active.account_auths).is.an("array").with.length(1);
                expect(appAccount.active.account_auths[0][0]).is.equal("steemconnect");
                expect(appAccount.active.account_auths[0][1]).is.equal(1);
                expect(appAccount.active.key_auths).is.an("array").with.length(1);
                expect(appAccount.active.key_auths[0][0]).is.equal(appObj.keys.active);
                expect(appAccount.active.key_auths[0][1]).is.equal(1);

                expect(appAccount.posting.weight_threshold).is.equal(1);
                expect(appAccount.posting.account_auths).is.an("array").with.length(1);
                expect(appAccount.posting.account_auths[0][0]).is.equal("steemconnect");
                expect(appAccount.posting.account_auths[0][1]).is.equal(1);
                expect(appAccount.posting.key_auths).is.an("array").with.length(1);
                expect(appAccount.posting.key_auths[0][0]).is.equal(appObj.keys.posting);
                expect(appAccount.posting.key_auths[0][1]).is.equal(1);

                expect(appAccount.memo_key).is.equal(appObj.keys.memo);
            });

           it("has never posted", () => expect(appAccount.last_post).is.equal("1970-01-01T00:00:00"));

           it("has never voted", () => expect(appAccount.last_vote_time).is.equal("1970-01-01T00:00:00"));
        }));

        [ "staging", "production" ].forEach((envType: string) => describe (`Steemconnect settings for ${envType} app`, () => {
            const settingsObj: any = (wise.config.steemconnect.app as any)[envType].settings;
           it("Steemconnect settings match those in config at wise.config.steemconnect.settings", async () => {
                const result: { data: any } = await axios.get("https://steemconnect.com/api/apps/@" + settingsObj.client_id);
                const settings = result.data;
                expect(settings).to.deep.equal(settingsObj);
            });
        }));
    });
}
