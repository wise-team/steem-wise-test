import { expect } from "chai";
import "mocha";
import { Context } from "./Context";
import { Config } from "./config";
import * as getStream from "get-stream";

import testEnvironmentTests from "./tests/test-environment.test";
import configurationTests from "./tests/configuration.test";
import coreTests from "./tests/core.test";
import cliTests from "./tests/cli.test";
import voterPageTests from "./tests/voter-page.test";
import sqlTests from "./tests/sql.test";
import liveMetricsTest from "./tests/live-metrics.test";


const config = new Config();
const context = new Context(config);

describe("Setup environment", function () {
    it ("Starts cli container", async () => {
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
    });

    testEnvironmentTests(config, context);
    /*configurationTests(config, context);
    coreTests(config, context);
    cliTests(config, context);
    voterPageTests(config, context);
    sqlTests(config, context);*/
    liveMetricsTest(config, context);
});