import { expect } from "chai";
import "mocha";
import * as path from "path";

import { Context } from "../Context";
import { Config } from "../config";
import { FullContext } from "../FullContext";

import { data as wise } from "../wise-config.gen.js";

import testEnvironmentTests from "../test-environment.test";
import steemTests from "./steem.test";
import wiseSqlMetricsTest from "./wise-sql-metrics.test";
import githubMonitoringTest from "./github-monitoring.test";
import wiseManualTest from "./wise-manual.test";
import websitesTest from "./websites.test";
import testcafeGenerator from "../testCafeGenerator";

console.log("Setting up test environment...");
const config = new Config();
const context = new Context(config);

console.log("Loading tests...");
testEnvironmentTests(config, context);
steemTests(config, context);
wiseSqlMetricsTest(config, context);
wiseManualTest(config, context);
githubMonitoringTest(config, context);
websitesTest(config, context);
if (wise.config.test.live.inBrowserTests.enabled) {
    describe("voterpage-live in testcafe", () => testcafeGenerator(config, context, wise.config.test.live.inBrowserTests.browsers, path.resolve(__dirname, "voterpage-live")));
}

console.log("Loading tests done. Executing...");