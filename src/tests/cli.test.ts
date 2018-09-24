import { expect } from "chai";
import "mocha";

import { Config } from "../Config";
import { Context } from "../Context";


export default function(config: Config, context: Context) {
    describe("steem-wise-cli (tests/cli.test.ts)", function () {
        this.bail(true);

        if (!config.skipBuild) it("Builds without error", async function () {
            this.timeout(60 * 1000);
            const npm: any = await import("npm");
            return new Promise((resolve, reject) => {
                npm.load({ parseable: true, prefix: config.repositories.cli.path }, (error: Error, npm_: any) => {
                    npm_.prefix = config.repositories.cli.path;
                    if (error) reject(error);
                    else npm_.commands["run-script"](["build"], (error: Error | undefined, result: any) => {
                        console.log("<B> " + JSON.stringify(result));
                        if (error) reject(error);
                        else resolve();
                    });
                });
            });

        });
    });
}
