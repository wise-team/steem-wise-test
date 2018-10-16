import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";
import axios from "axios";
import * as steem from "steem";
import * as BluebirdPromise from "bluebird";

import { data as wise } from "../wise-config.gen.js";
import { Context } from "../Context";
import { Config } from "../config";


export default function(config: Config, context: Context) {
    describe("Steemconnect", function () {
        this.retries(2);

        before(() => steem.api.setOptions({ url: wise.config.steem.defaultApiUrl, /*uri: wise.config.steem.defaultApiUrl*/ }));

        describe ("Steemconnect owner account", () => {
            const ownerAccountName = wise.config.steemconnect.owner.account;
            let ownerAccount: any = undefined;
            before(async () => ownerAccount = (await steem.api.getAccountsAsync([ ownerAccountName ]))[0]);

            it ("had owner never updated", () => expect(ownerAccount.last_owner_update).is.equal(wise.config.steemconnect.owner.last_owner_update));

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
                expect(ownerAccount.active.key_auths).is.an("array").with.length(1);
                expect(ownerAccount.active.key_auths[0][0]).is.equal(wise.config.steemconnect.owner.keys.active);
                expect(ownerAccount.active.key_auths[0][1]).is.equal(1);

                expect(ownerAccount.posting.weight_threshold).is.equal(1);
                expect(ownerAccount.posting.account_auths).is.an("array").with.length(0);
                expect(ownerAccount.posting.key_auths).is.an("array").with.length(1);
                expect(ownerAccount.posting.key_auths[0][0]).is.equal(wise.config.steemconnect.owner.keys.posting);
                expect(ownerAccount.posting.key_auths[0][1]).is.equal(1);

                expect(ownerAccount.memo_key).is.equal(wise.config.steemconnect.owner.keys.memo);
            });

           it("has never posted", () => expect(ownerAccount.last_post).is.equal("1970-01-01T00:00:00"));

           it("has never voted", () => expect(ownerAccount.last_vote_time).is.equal("1970-01-01T00:00:00"));

           it("is voting for our witness", () => expect(ownerAccount.witness_votes).is.an("array").that.includes(wise.config.witness.account));
        });

        describe ("Steemconnect app account", () => {
            const appAccountName = wise.config.steemconnect.app.account;
            let appAccount: any = undefined;
            before(async () => appAccount = (await steem.api.getAccountsAsync([ appAccountName ]))[0]);

            it ("had owner never updated", () => expect(appAccount.last_owner_update).is.equal(wise.config.steemconnect.app.last_owner_update));

            it ("has not been silently updated", () => expect(appAccount.last_account_update).is.equal(wise.config.steemconnect.app.last_account_update));

            it ("has proper recovery_account", () => expect(appAccount.recovery_account).is.equal(wise.config.steemconnect.app.recovery_account));

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
                expect(appAccount.owner.key_auths[0][0]).is.equal(wise.config.steemconnect.app.keys.owner);
                expect(appAccount.owner.key_auths[0][1]).is.equal(1);

                expect(appAccount.active.weight_threshold).is.equal(1);
                expect(appAccount.active.account_auths).is.an("array").with.length(1);
                expect(appAccount.active.account_auths[0][0]).is.equal("steemconnect");
                expect(appAccount.active.account_auths[0][1]).is.equal(1);
                expect(appAccount.active.key_auths).is.an("array").with.length(1);
                expect(appAccount.active.key_auths[0][0]).is.equal(wise.config.steemconnect.app.keys.active);
                expect(appAccount.active.key_auths[0][1]).is.equal(1);

                expect(appAccount.posting.weight_threshold).is.equal(1);
                expect(appAccount.posting.account_auths).is.an("array").with.length(1);
                expect(appAccount.posting.account_auths[0][0]).is.equal("steemconnect");
                expect(appAccount.posting.account_auths[0][1]).is.equal(1);
                expect(appAccount.posting.key_auths).is.an("array").with.length(1);
                expect(appAccount.posting.key_auths[0][0]).is.equal(wise.config.steemconnect.app.keys.posting);
                expect(appAccount.posting.key_auths[0][1]).is.equal(1);

                expect(appAccount.memo_key).is.equal(wise.config.steemconnect.app.keys.memo);
            });

           it("has never posted", () => expect(appAccount.last_post).is.equal("1970-01-01T00:00:00"));

           it("has never voted", () => expect(appAccount.last_vote_time).is.equal("1970-01-01T00:00:00"));
        });

        describe ("Steemconnect settings", () => {
           it("Steemconnect settings match those in config at wise.config.steemconnect.settings", async () => {
                const result: { data: any } = await axios.get("https://steemconnect.com/api/apps/@" + wise.config.steemconnect.settings.client_id);
                const settings = result.data;
                expect(settings).to.deep.equal(wise.config.steemconnect.settings);
            });
        });
    });
}
