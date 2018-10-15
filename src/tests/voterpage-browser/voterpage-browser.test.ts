import { expect } from "chai";
import "mocha";
import * as path from "path";

import { Config } from "../../Config";
import { Context } from "../../Context";
import { Container } from "../../Container";
import testCafeGenerator from "../../testCafeGenerator";


export default function(config: Config, context: Context) {
    describe.only("voter-page in browser (tests/voterpage-browser.test.ts)", function () {
        testCafeGenerator(config, context, path.resolve(__dirname, "testcafe"));
        /*if (!config.skipBrowser)it("Passes all browser tests", () => {
            this.timeout(2 * 60 * 1000);
            let out = "";
            const outStream = new stream.Writable();
            outStream._write = function (chunk, encoding, done) {
                console.log(" > " + chunk.toString());
                out += chunk.toString();
                done();
            };
            // Container.run("testcafe/testcafe", [ "--no-color firefox" ], outStream);
        });*/
    });
}
