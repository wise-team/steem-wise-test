import { expect } from "chai";
import "mocha";
import * as fs from "fs";

import { Context } from "../Context";

export default function(context: Context) {
    describe("Repositories configuration (tests/configuration.test.ts)", () => {
        context.getConfig().repositories.forEach(repositoryPath => {
            it(repositoryPath + " has LICENSE file", () => {
                expect(fs.existsSync(repositoryPath + "/LICENSE")).to.be.true;
            });

            it(repositoryPath + " has CODE_OF_CONDUCT.md file", () => {
                expect(fs.existsSync(repositoryPath + "/CODE_OF_CONDUCT.md")).to.be.true;
            });

            it(repositoryPath + " has README.md file", () => {
                expect(fs.existsSync(repositoryPath + "/README.md")).to.be.true;
            });
        });

        context.getConfig().nodeRepositories.forEach(repositoryPath => {
            it(repositoryPath + " has .nvmrc file that contains correct node version", () => {
                expect(fs.existsSync(repositoryPath + "/.nvmrc")).to.be.true;
                expect(fs.readFileSync(repositoryPath + "/.nvmrc", "UTF-8")).contains(context.getConfig().requiredNodeJsVersion);
            });

            it(repositoryPath + " has package.json file", () => {
                expect(fs.existsSync(repositoryPath + "/package.json")).to.be.true;
            });

            it(repositoryPath + " has package-lock.json file", () => {
                expect(fs.existsSync(repositoryPath + "/package-lock.json")).to.be.true;
            });
        });
    });
}
