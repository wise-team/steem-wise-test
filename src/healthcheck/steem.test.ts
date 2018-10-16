import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";
import * as steem from "steem";
import * as BluebirdPromise from "bluebird";
import * as httpProxy from "http-proxy";
import { semverCompare } from "../util/semverCompare.js";

import { data as wise } from "../wise-config.gen.js";
import { Context } from "../Context";
import { Config } from "../config";


export default function(config: Config, context: Context) {
    describe("Steem using steem-js", function () {
        this.timeout(3500);

        before(() => steem.api.setOptions({ url: wise.config.steem.defaultApiUrl, /*uri: wise.config.steem.defaultApiUrl*/ }));

        it ("Does get_block correctly for an old block", () => {
            const testBlockNum = 26194848;
            return steem.api.getBlockAsync(testBlockNum)
            .then((block: any) => {
                expect(block.transactions).to.be.an("array").with.length(29);
                expect(block.transactions[0].block_num).to.be.equal(testBlockNum);
                expect(block.timestamp).to.be.equal("2018-09-23T11:22:36");
            });
        });

        it ("Does get_block correctly for HEAD block", async () => {
            const dynamicGlobalProperties = await steem.api.getDynamicGlobalPropertiesAsync();
            if (!dynamicGlobalProperties) throw new Error("Dynamic global properties are undefined");
            const obtainedBlock = dynamicGlobalProperties.head_block_number - 200;

            return steem.api.getBlockAsync(obtainedBlock)
            .then((block: any) => {
                expect(block.transactions).to.be.an("array").with.length.gt(0);
                expect(block.transactions[0].block_num).to.be.equal(obtainedBlock);
            });
        });

        it ("Does get_block correctly for block made during HF20 introduction problems", async () => {
            const blockNum = 26256960; // 26256746, 26256747, 26256748, 26256749 has 0 transactions,

            return steem.api.getBlockAsync(blockNum)
            .then((block: any) => {
                expect(block.transactions).to.be.an("array").with.length.gt(0);
                expect(block.transactions[0].block_num).to.be.equal(blockNum);
            });
        });

        wise.config.steem.apis.forEach(api => describe ("Steem api " + api.url, () => {
            const port = 9014;
            let proxiedUrl: string = api.url;
            let proxyServer: any;

            const errors: any [] = [];
            const requests: any [] = [];
            const responses: any [] = [];
            const assertProperRequest = async () => {
                if (wise.config.test.healthcheck.api.testThroughProxy) {
                    await BluebirdPromise.delay(80);
                    if (errors.length > 0) throw new Error(errors.pop());
                    expect(requests).to.be.an("array").with.length.gt(0);
                    expect(responses).to.be.an("array").with.length.gt(0);

                    while (errors.length > 0) errors.pop();
                    while (requests.length > 0) requests.pop();
                    while (responses.length > 0) responses.pop();
                await BluebirdPromise.delay(80);
                }
            };
            if (wise.config.test.healthcheck.api.testThroughProxy) before(async () => {
                if (api.url.indexOf("http") === 0) {
                    proxyServer = httpProxy.createProxyServer({
                        target: api.url,
                        changeOrigin: true,
                    });
                    proxiedUrl = "http://localhost:" + port;
                }
                else if (api.url.indexOf("ws") === 0) {
                    proxyServer = httpProxy.createProxyServer({
                        target: api.url,
                        changeOrigin: true,
                        ws: true
                    });
                    proxiedUrl = "ws://localhost:" + port;
                }
                else throw new Error("Unknown api protocol: " + api.url);

                proxyServer.on("error", (err: any, req: any, res: any) => { console.error(err); errors.push(err); });
                proxyServer.on("proxyReq", (err: any, req: any, res: any) => { /*console.log(req);*/ requests.push(req); });
                proxyServer.on("proxyReqWs", (err: any, req: any, res: any) => { /*console.log(req);*/ requests.push(req); });
                proxyServer.on("proxyRes", (err: any, req: any, res: any) => { /*console.log(res);*/ responses.push(res); });

                // proxyServer.listen(port);
                proxiedUrl = api.url;
            });

            it ("responds correctly to get_accounts", async () => {
                steem.api.setOptions({ url: proxiedUrl, /*uri: proxiedUrl*/ });
                const accounts = await steem.api.getAccountsAsync([ "nicniezgrublem" ]);
                expect(accounts).to.be.an("array").with.length(1);

                await assertProperRequest();
            });

            it ("has required minimal blockchain version", async () => {
                steem.api.setOptions({ url: proxiedUrl, /*uri: proxiedUrl*/ });
                const versionOpts = await steem.api.getVersionAsync();
                expect(semverCompare(versionOpts.blockchain_version, wise.config.steem.minimalApiBlockchainVersion)).to.be.gte(0);

                await assertProperRequest();
            });

            it ("has required minimal hardfork version", async () => {
                steem.api.setOptions({ url: proxiedUrl, /*uri: proxiedUrl*/ });
                const hfVersion = await steem.api.getHardforkVersionAsync();
                expect(semverCompare(hfVersion, wise.config.steem.minimalApiHardforkVersion)).to.be.gte(0);

                await assertProperRequest();
            });

            it ("responds correctly to get_block", async () => {
                steem.api.setOptions({ url: proxiedUrl, /*uri: proxiedUrl*/ });
                const dynamicGlobalProperties = await steem.api.getDynamicGlobalPropertiesAsync();
                if (!dynamicGlobalProperties) throw new Error("Dynamic global properties are undefined");
                const headBlockNum = dynamicGlobalProperties.head_block_number;

                const block = await steem.api.getBlockAsync(headBlockNum);
                expect(block.transactions[0].block_num).to.be.equal(headBlockNum);

                 await assertProperRequest();
            });

            if (wise.config.test.healthcheck.api.testThroughProxy) after(() => {
                proxyServer.close();
            });
        }));
    });
}
