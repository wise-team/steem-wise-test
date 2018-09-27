import { expect } from "chai";
import "mocha";
import * as yaml from "js-yaml";
import * as path from "path";
import * as stream from "stream";
import * as fs from "fs";
import * as Docker from "dockerode";
import * as _ from "lodash";
import { Wise } from "steem-wise-core";
import * as getStream from "get-stream";
import * as BluebirdPromise from "bluebird";
import * as steem from "steem";

import { Config } from "../../Config";
import { FullContext } from "../../FullContext";
import { Container } from "../../Container";


export default function(config: Config, context: FullContext) {
    describe("Cli on fully assembled system (tests/full-assembly/cli.test.ts)", () => {
        let cli: Container;
        before(() => {
            cli = context.getCliContainer();
        });

        describe("Wise cli called with no arguments", () => {
            let wiseOut: Container.Output;
            before (async () => {
                wiseOut = await cli.execToString([ "wise" ]);
                expect(wiseOut.stderr.trim()).to.be.empty;
            });

            it("prints help", () => {
                expect(wiseOut.stdout).to.match(/^[\s\S]*usage: wise[\s\S]*options:[\s\S]*commands:[\s\S]*$/giu);
            });

            it("help contains all commands", () => {
                expect(wiseOut.stdout.indexOf("send-voteorder") !== -1).to.be.true;
                expect(wiseOut.stdout.indexOf("upload-rules") !== -1).to.be.true;
                expect(wiseOut.stdout.indexOf("download-rules") !== -1).to.be.true;
                expect(wiseOut.stdout.indexOf("daemon") !== -1).to.be.true;
                expect(wiseOut.stdout.indexOf("init") !== -1).to.be.true;
            });
        });

        describe("Wise cli called with invalid command", () => {
            let wiseOut: Container.Output;
            before (async () => {
                wiseOut = await cli.execToString([ "wise", Date.now() + "a" ]);
                expect(wiseOut.stderr.trim()).to.be.empty;
            });

            it("prints help", () => {
                expect(wiseOut.stdout).to.match(/^[\s\S]*usage: wise[\s\S]*options:[\s\S]*commands:[\s\S]*$/giu);
            });
        });

        describe("cmd: init", function () {
            const tmpDir = "/tmp/" + Date.now();

            before(async () => {
                const mkdirCmd = "mkdir -p \"" + tmpDir + "\""
                           + " && touch \"" + path.resolve(tmpDir, "test-file") + "\""
                           + " && ls \"" + tmpDir + "\"";
                const mkdirOut: Container.Output = await cli.execToString(["sh", "-c", mkdirCmd]);
                expect(mkdirOut.stderr.trim()).to.be.empty;
                expect(mkdirOut.stdout).to.be.a("string").and.not.be.empty;
                expect(mkdirOut.stdout.split("\n")).to.be.an("array").with.length.gte(1).that.includes("test-file");
                await BluebirdPromise.delay(20); // so that the dir names differ
            });

            const cmdInitLocalParams = "wise init"
                                     + " --username " + config.guestAccountCredentials.account
                                     + " --dont-save-posting-key"
                                     + " \"" + tmpDir + "\"";
            it("Executes '" + cmdInitLocalParams + "' without error", async () => {
                const cmd_ = "cd \"" + tmpDir + "\" && " + cmdInitLocalParams + " && echo \"-----\"";
                const wiseOut: Container.Output = await cli.execToString(["sh", "-c", cmd_]);
                expect(wiseOut.stderr.trim()).to.be.empty;
                expect(wiseOut.stdout.indexOf("Your settings") !== -1).to.be.true;
                expect(wiseOut.stdout.indexOf("HEAB block number is") !== -1).to.be.true;
                expect(wiseOut.stdout.indexOf("Done\n") !== -1).to.be.true;
                expect(wiseOut.stdout.indexOf("Wise successfully set up") !== -1).to.be.true;
            });

            it("Created rules.yml, config.yml and synced-block-num.txt", async () => {
                const lsOut: Container.Output = await cli.execToString(["ls", tmpDir]);
                expect(lsOut.stderr.trim()).to.be.empty;
                expect(lsOut.stdout.split("\n")).to.be.an("array").that.includes("rules.yml");
                expect(lsOut.stdout.split("\n")).to.be.an("array").that.includes("config.yml");
                expect(lsOut.stdout.split("\n")).to.be.an("array").that.includes("synced-block-num.txt");
            });

            describe("config.yml", () => {
                let configYml: any = {};
                before(async () => {
                    const catOutput = await cli.execToString(["cat", tmpDir + "/config.yml"]);
                    expect(catOutput.stderr.trim()).to.be.empty;
                    configYml = yaml.safeLoad(catOutput.stdout);
                });

                it("has correct username", () => expect(configYml.username).to.be.equal(config.guestAccountCredentials.account));
                it("has empty posting wif", () => expect(configYml.postingWif).to.be.empty);
                it("has link to local rules file", () => {
                    expect(configYml.defaultRulesPath.indexOf("rules.yml") !== -1).to.be.true;
                    expect(configYml.defaultRulesPath.indexOf("/") !== 0).to.be.true;
                    expect(configYml.defaultRulesPath.indexOf("..") === -1).to.be.true;
                });
                it("has link to local synced block num file", () => {
                    expect(configYml.syncedBlockNumFile.indexOf("synced-block-num.txt") !== -1).to.be.true;
                    expect(configYml.syncedBlockNumFile.indexOf("/") !== 0).to.be.true;
                    expect(configYml.syncedBlockNumFile.indexOf("..") === -1).to.be.true;
                });
            });

            describe("rules.yml", () => {
                let rulesYml: any = {};
                before(async () => {
                    const catOutput = await cli.execToString(["cat", tmpDir + "/rules.yml"]);
                    expect(catOutput.stderr.trim()).to.be.empty;
                    rulesYml = yaml.safeLoad(catOutput.stdout);
                });

                it("contains more than one ruleset", () => expect(rulesYml).to.be.an("array").with.length.gt(1));
                it("rulesetForVoter has voter and rulesets", () => {
                    expect(rulesYml[0]).to.haveOwnProperty("voter");
                    expect(rulesYml[0]).to.haveOwnProperty("rulesets");
                });
            });

            describe("synced-block-num.txt", () => {
                let syncedBlockNum: number = -1;
                before(async () => {
                    const catOutput = await cli.execToString(["cat", tmpDir + "/synced-block-num.txt"]);
                    expect(catOutput.stderr.trim()).to.be.empty;
                    syncedBlockNum = parseInt(catOutput.stdout.trim().replace(/\D/g, ""), 10);
                });

                it("is an actual block number", async () => {
                    const dynamicGlobalProperties = await steem.api.getDynamicGlobalPropertiesAsync();
                    if (!dynamicGlobalProperties) throw new Error("Dynamic global properties are undefined");
                    const headBlockNum = dynamicGlobalProperties.head_block_number;
                    expect(syncedBlockNum).to.be.a("number").that.is.greaterThan(headBlockNum - 10);
                });
            });
        });
    });
}
