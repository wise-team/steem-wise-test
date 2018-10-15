import * as Mocha from "mocha";
import * as fs from "fs";
import * as path from "path";

const config = {
    logFile: process.env.WISE_TEST_LOG_FILE || "",
};


/**
 * Check config
 */
if (!config.logFile || config.logFile.length === 0) throw new Error("WISE_TEST_LOG_FILE env must be specified.");

/**
 * Run mocha
 */

const mocha = new Mocha({
    require: [ "ts-node/register" ]
} as any);
mocha.addFile(__dirname + "/healthcheck/entrance.ts");

const runner = mocha.run(function(failures) {
    process.exitCode = failures ? -1 : 0;  // exit with non-zero status if there were failures
});

const results: {
    startTime: string, endTime: string,
    stats: { total: number, passes: number, failures: number, pending: number },
    tests: { name: string; state: "pass" | "fail" | "pending"; message: string } []
} = {
    startTime: (new Date()).toISOString(), endTime: "-1",
    stats: { total: 0, passes: 0, failures: 0, pending: 0 },
    tests: []
};

function logTest(name: string, state: "pass" | "fail" | "pending", message: string): void {
    results.tests.push({
        name: name,
        state: state, message: message
    });
}

runner.on("start", () => { console.log(">>> start"); });

runner.on("pass", (test) => { logTest(test.titlePath().join(" / "), "pass", ""); });
runner.on("fail", (test, error) => { logTest(test.titlePath().join(" / "), "fail", error + ""); });
runner.on("pending", (test) => { logTest(test.titlePath().join(" / "), "pending", ""); });

runner.on("end", () => {
    results.stats.total = runner.total;
    if (runner.stats) {
        results.stats.passes = runner.stats.passes;
        results.stats.failures = runner.stats.failures;
        results.stats.pending = runner.stats.pending;
    }
    results.endTime = (new Date()).toISOString();
    console.log(">>> end, saving results to file");

    fs.writeFileSync(config.logFile, JSON.stringify(results, undefined, 2), "UTF-8");
    console.log(">>> Results saved to file " + config.logFile);
});
// runner.on("suite", (suite) => { console.log(suite); });
// runner.on("suite end", (suite) => { console.log(suite); });
// runner.on("test", (test) => { console.log(test); });
// runner.on("test end", (test) => { console.log(test); test. });
// runner.on("hook", (hook) => { console.log(hook); });
// runner.on("hook end", (hook) => { console.log(hook); });

// runner.on("fail", (test, error) => { console.log(test); console.error(error); });
// runner.on("pending", (test) => { console.log(test); });
