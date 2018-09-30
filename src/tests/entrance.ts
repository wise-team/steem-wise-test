import { expect } from "chai";
import "mocha";
import * as fs from "fs";

import { Context } from "../Context";
import { Config } from "../config";
import { FullContext } from "../FullContext";

import testEnvironmentTests from "../test-environment.test";
import configurationTests from "./configuration.test";
import coreTests from "./core.test";
import cliTests from "./cli.test";
import voterPageTests from "./voter-page.test";
import sqlTests from "./sql.test";
import cliFullAssemblyTests from "./full-assembly/cli.test";
import voterDelegatorScenariosTests from "./full-assembly/voter-delegator-scenarios.test";

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

describe("Tests on fully assembled system", function() {
    const fullContext: FullContext = new FullContext(config);
    before(async function () {
        console.log("Assembling full system... (may take a while)");
        this.timeout(60 * 1000);
        await fullContext.setup();
        console.log("System assembled");
    });

    // TESTS on fully assembled system
    cliFullAssemblyTests(config, fullContext);
    voterDelegatorScenariosTests(config, fullContext);

    after(async function () {
        this.timeout(60 * 1000);
        console.log("Tests done on fully assembled system. Disassembling... (may take a while)");
        await fullContext.shutdown();
        console.log("System disassembly done");
    });
});

console.log("Loading tests done. Executing...");