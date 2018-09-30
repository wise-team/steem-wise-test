import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";

import { Context } from "../Context";
import { Config } from "../config";


export default function(config: Config, context: Context) {
    describe("Repositories configuration (tests/configuration.test.ts)", () => {
        _.forOwn(context.getConfig().repositories, (repo: Config.Repository) => {
            describe (repo.githubPath, () => {
                it(repo.path + " has LICENSE file", () => {
                    expect(fs.existsSync(repo.path + "/LICENSE")).to.be.true;
                });

                it(repo.path + " has CODE_OF_CONDUCT.md file", () => {
                    expect(fs.existsSync(repo.path + "/CODE_OF_CONDUCT.md")).to.be.true;
                });

                it(repo.path + " has README.md file", () => {
                    expect(fs.existsSync(repo.path + "/README.md")).to.be.true;
                });

                if (repo.isNode) {
                    it(repo.path + repo.nodePath + " has .nvmrc file that contains correct node version", () => {
                        expect(fs.existsSync(repo.path + repo.nodePath + "/.nvmrc")).to.be.true;
                        expect(fs.readFileSync(repo.path + repo.nodePath + "/.nvmrc", "UTF-8")).contains(context.getConfig().requiredNodeJsVersion);
                    });
                }

                if (repo.isNpm) {
                    it(repo.path + repo.nodePath + " has package.json file", () => {
                        expect(fs.existsSync(repo.path + repo.nodePath + "/package.json")).to.be.true;
                    });

                    describe("package.json file", () => {
                        const packageObj: any = JSON.parse(fs.readFileSync(repo.path + repo.nodePath + "/package.json", "UTF-8"));

                        it("has correct homepage", () => {
                            expect(packageObj.homepage).to.be.equal(config.homepage);
                        });
                    });

                    it(repo.path + repo.nodePath + " has package-lock.json file", () => {
                        expect(fs.existsSync(repo.path + repo.nodePath + "/package-lock.json")).to.be.true;
                    });
                }

                describe("README.md file", () => {
                    const readmeContents = fs.readFileSync(repo.path + "/README.md", "UTF-8");

                    const prWelcomeBadge = "[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)";
                    it("has \"PRs Welcome\" badge: '" + prWelcomeBadge + "'",
                        () => expect(readmeContents.indexOf(prWelcomeBadge) !== -1).to.be.true
                    );

                    const licenceBadge = "[![License](https://img.shields.io/github/license/" + repo.githubPath + ".svg?style=flat-square)](https://github.com/" + repo.githubPath + "/blob/master/LICENSE)";
                    it("has \"LICENSE\" badge: '" + licenceBadge + "'", () => {
                        expect(readmeContents.indexOf(licenceBadge) !== -1).to.be.true;
                    });

                    const chatBadge = "[![Chat](https://img.shields.io/badge/chat-on%20steem.chat-6b11ff.svg?style=flat-square)](https://steem.chat/channel/wise)";
                    it("has \"chat\" badge: '" + chatBadge + "'", () => {
                        expect(readmeContents.indexOf(chatBadge) !== -1).to.be.true;
                    });

                    const apiUrl = "http://" + config.sqlEndpointHost + ":" + config.sqlEndpointApiPort + "/operations?select=count";
                    const jsonPathQuery = "$[0].count";
                    const apiLink = "http://" + config.sqlEndpointHost + ":" + config.sqlEndpointApiPort + "/operations?select=moment,delegator,voter,operation_type&order=moment.desc";

                    const correctWiseOperationsCountBadge = "[![Wise operations count](https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url="
                        + encodeURIComponent(apiUrl) + "&query=" + encodeURIComponent(jsonPathQuery) + "&colorB=blue&style=flat-square)](" + apiLink + ")";

                    it("has \"wise operations count\" badge: '" + correctWiseOperationsCountBadge + "'", () => {
                        expect(readmeContents.indexOf(correctWiseOperationsCountBadge) !== -1).to.be.true;
                    });

                    if (repo.npmPackageName) {
                        const correctNpmBadge = "[![npm](https://img.shields.io/npm/v/" + repo.npmPackageName + ".svg?style=flat-square)](https://www.npmjs.com/package/" + repo.npmPackageName + ")";
                        it("has \"npm\" badge: '" + correctNpmBadge + "'", () => {
                            expect(readmeContents.indexOf(correctNpmBadge) !== -1).to.be.true;
                        });
                    }
                });
            });
        });
    });
}
