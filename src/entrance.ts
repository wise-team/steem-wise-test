import { expect } from "chai";
import "mocha";
import * as getStream from "get-stream";

import { Context } from "./Context";
import { Config } from "./config";
import { FullContext } from "./FullContext";

import testEnvironmentTests from "./tests/test-environment.test";
import configurationTests from "./tests/configuration.test";
import coreTests from "./tests/core.test";
import cliTests from "./tests/cli.test";
import voterPageTests from "./tests/voter-page.test";
import sqlTests from "./tests/sql.test";
import liveMetricsTest from "./tests/live-metrics.test";
import voterDelegatorScenariosTests from "./tests/voter-delegator-scenarios.test";


const config = new Config();
const context = new Context(config);

/*console.log("Building image...");
const buildStream = await context.getContainer().buildImage();

buildStream.on("data", (chunk) => {
    console.log(chunk);
});

buildStream.pipe(process.stdout);
console.log("Awaiting stream...");
const buildOutput: string = await getStream(buildStream, {  });
console.log("Done. Output:");
console.log("------");
console.log(buildOutput);
console.log("------");*/

testEnvironmentTests(config, context);
/*configurationTests(config, context);
coreTests(config, context);
cliTests(config, context);
voterPageTests(config, context);
sqlTests(config, context);
liveMetricsTest(config, context);*/

describe("Tests on fully assembled system", function() {
    const fullContext: FullContext = new FullContext(config);
    before(async function () {
        this.timeout(60 * 1000);
        await fullContext.setup();
        console.log("System assembled");
    });

    // TESTS on fully assembled system
    voterDelegatorScenariosTests(config, fullContext);

    after(async function () {
        console.log("Tests done on fulle assembled system. Disassembling");
        this.timeout(60 * 1000);
        await fullContext.shutdown();
        console.log("System disassembly done");
    });
});
