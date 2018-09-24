import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";

import { Context } from "../Context";
import { Config } from "../config";

export default function(context: Context) {
    describe("Repositories configuration (tests/configuration.test.ts)", () => {
        _.forOwn(context.getConfig().repositories, (repo: Config.Repository) => {
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

                it(repo.path + repo.nodePath + " has package-lock.json file", () => {
                    expect(fs.existsSync(repo.path + repo.nodePath + "/package-lock.json")).to.be.true;
                });
            }
        });
    });
}
