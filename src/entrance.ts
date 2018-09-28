import { expect } from "chai";
import "mocha";

import { Context } from "./Context";
import { Config } from "./config";
import { FullContext } from "./FullContext";

import testEnvironmentTests from "./tests/test-environment.test";
import configurationTests from "./tests/configuration.test";
import coreTests from "./tests/core.test";
import cliTests from "./tests/cli.test";
import voterPageTests from "./tests/voter-page.test";
import sqlTests from "./tests/sql.test";
import steemTests from "./tests/steem.test";
import liveMetricsTests from "./tests/live-metrics.test";
import cliFullAssemblyTests from "./tests/full-assembly/cli.test";
import voterDelegatorScenariosTests from "./tests/full-assembly/voter-delegator-scenarios.test";


console.log("Setting up test environment...");
const config = new Config();
const context = new Context(config);

console.log("Loading tests...");
testEnvironmentTests(config, context);
configurationTests(config, context);
coreTests(config, context);
cliTests(config, context);
voterPageTests(config, context);
sqlTests(config, context);
steemTests(config, context);
liveMetricsTests(config, context);

describe("Tests on fully assembled system", function() {
    const fullContext: FullContext = new FullContext(config);
    before(async function () {
        console.log("Assembling full system... (may take a while)");
        this.timeout(60 * 1000);
        await fullContext.setup();
        console.log("System assembled");
    });

    // TESTS on fully assembled system
    // cliFullAssemblyTests(config, fullContext);
    voterDelegatorScenariosTests(config, fullContext);

    after(async function () {
        this.timeout(60 * 1000);
        console.log("Tests done on fully assembled system. Disassembling... (may take a while)");
        await fullContext.shutdown();
        console.log("System disassembly done");
    });
});

console.log("Loading tests done. Executing...");