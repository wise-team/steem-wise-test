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


const config = new Config();
const context = new Context(config);


testEnvironmentTests(config, context);
/*configurationTests(config, context);
coreTests(config, context);
cliTests(config, context);
voterPageTests(config, context);
sqlTests(config, context);*/
// steemTests(config, context);
/*liveMetricsTests(config, context);*/

describe("Tests on fully assembled system", function() {
    const fullContext: FullContext = new FullContext(config);
    before(async function () {
        this.timeout(60 * 1000);
        await fullContext.setup();
        console.log("System assembled");
    });

    // TESTS on fully assembled system
    cliFullAssemblyTests(config, fullContext);
    voterDelegatorScenariosTests(config, fullContext);

    after(async function () {
        console.log("Tests done on fully assembled system. Disassembling");
        this.timeout(60 * 1000);
        await fullContext.shutdown();
        console.log("System disassembly done");
    });
});
