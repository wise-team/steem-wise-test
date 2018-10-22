import * as path from "path";
import * as fs from "fs";
import * as lib from "./lib";
import axios from "axios";
import { config } from "./config";

async function run() {
    const out = {
        short: "",
        logLinks: "",
        notify: false
    };

    if (!config.webhookUrlFile || config.webhookUrlFile.length === 0) throw new Error("Webhook url file not specified");
    if (!fs.existsSync(config.webhookUrlFile)) throw new Error("Webhook url file does not exist");
    const webHookUrl = fs.readFileSync(config.webhookUrlFile, "UTF-8").trim();

    try {
        const logBaseDir = process.env.LOG_BASE_DIR;
        if (!logBaseDir) throw new Error("LOG_BASE_DIR env must be defined");

        const currentLogDir = process.env.CURRENT_LOG_DIR;
        if (!currentLogDir) throw new Error("CURRENT_LOG_DIR env must be defined");

        const hostedLogsBaseUrl = process.env.HOSTED_LOGS_URL;
        if (!hostedLogsBaseUrl) throw new Error("HOSTED_LOGS_URL env must be defined");

        let currentJsonResult: any | undefined = undefined;
        let currenTxtOutput: string | undefined = undefined;
        let lastJsonResult: any | undefined = undefined;
        let lastResultDir: string = "";

        const currentJsonResultFile = path.resolve(currentLogDir, "result.json");
        if (fs.existsSync(currentJsonResultFile)) {
            currentJsonResult = JSON.parse(fs.readFileSync(currentJsonResultFile, "UTF-8"));
            out.logLinks += " <" + hostedLogsBaseUrl + currentJsonResultFile + ">";
        }

        const txtOutputFile = path.resolve(currentLogDir, "output.txt");
        if (fs.existsSync(txtOutputFile)) {
            currenTxtOutput = fs.readFileSync(txtOutputFile, "UTF-8");
            out.logLinks += " <" + hostedLogsBaseUrl + txtOutputFile + ">";
        }

        const logBaseDirChildren = fs.readdirSync(logBaseDir)
        .filter(name => name.indexOf(".") !== 0)
        .filter(name => name !== path.basename(currentLogDir))
        .sort().reverse();
        if (logBaseDirChildren.length > 0) {
            lastResultDir = path.resolve(logBaseDir, logBaseDirChildren[0]);
            if (fs.existsSync(lastResultDir)) {
                const lastJsonResultDir = path.resolve(logBaseDir, logBaseDirChildren[0]);
                const lastJsonResultFile = path.resolve(lastJsonResultDir, "result.json");
                if (fs.existsSync(lastJsonResultFile)) {
                    lastJsonResult = JSON.parse(fs.readFileSync(lastJsonResultFile, "UTF-8"));
                    console.log("Loaded last json result from '" + lastJsonResultFile + "'");
                }
            }
        }

        if (!currentJsonResult) {
            if (currenTxtOutput) {
                out.short = "Error: Tests did not produce correct JSON output. Here is the output log:";
                out.notify = true;
            }
            else {
                out.short = "Fatal error: Tests did not produce any output. You have to check it manually";
                out.notify = true;
            }
        }
        else {
            out.short = "Healthcheck tests performed (previous->current): "
                    + "[total: " + (lastJsonResult ? lastJsonResult.stats.total + "->*" : "") + currentJsonResult.stats.total + "*] "
                    + "[passes: " + (lastJsonResult ? lastJsonResult.stats.passes + "->*" : "") + currentJsonResult.stats.passes + "*] "
                    + "[pending: " + (lastJsonResult ? lastJsonResult.stats.pending + "->*" : "") + currentJsonResult.stats.pending + "*] "
                    + "[failures: " + (lastJsonResult ? lastJsonResult.stats.failures + "->*" : "") + currentJsonResult.stats.failures + "*] \n";
            if (lastJsonResult) out.short += "_Changes since previous test (one that finished at " + lastJsonResult.endTime + ". Its results are in " + lastResultDir + "):_\n\n";
            else out.short += "_Previous test not found._\n\n";

            let changes: boolean = false;
            currentJsonResult.tests.forEach((test: { name: string; state: "pass" | "fail" | "pending"; message: string }) => {
                let previousTest: { name: string; state: "pass" | "fail" | "pending"; message: string } | undefined = undefined;
                if (lastJsonResult) {
                    const prevMatches = lastJsonResult.tests.filter((prevTest: any) => prevTest.name === test.name);
                    if (prevMatches.length > 0) previousTest = prevMatches[0];
                }

                if (test.state !== "pass" || (previousTest && previousTest.state !== test.state)) {
                    out.short += " - " + (test.state === "pass" ? ":shamrock:" : (test.state === "fail" ? ":x:" : (test.state === "pending" ? ":lock:" : ":question:")));
                    if (!previousTest || previousTest.state !== test.state) out.short += ":zap:";

                    if (!previousTest) out.short += " _new_ ";
                    else if (previousTest.state !== test.state) {
                        out.short += " [" + previousTest.state + " -> " + test.state + "]";
                    }
                    else out.short += " [" + test.state + "]";
                    out.short +=  " *" + test.name + "*: " + test.message + "\n";

                    changes = true;
                }

                if (!previousTest || previousTest.state !== test.state) {
                    console.log("NOTIFY: reason: " + (previousTest ?  "test state changed " + previousTest.state + " -> " + test.state : "new test") + " ; test.name=" + test.name);
                    out.notify = true;
                }
            });
            out.short += "\n";
            out.short += "Start time: " + currentJsonResult.startTime + ", end time: " + currentJsonResult.endTime + ". Tests: \n";

            out.short += "\n";
            if (!changes) out.short += "*No changes since previous healthcheck* \n";
        }
    }
    catch (error) {
        console.error(error);
        out.short = "Error: " + error;
        out.short += "*" + error.message + "*\n" + error.stack;
    }

    /**
     * Send to slack
     */
    console.log("Sending to slack...");
    const mentions = "\n" + config.mentions.map((mention: string) => "<@" + mention + ">").join(" ");

    const title = "*Wise healthckeck finished at " + (new Date().toISOString()) + "* \n";
    const slackMessage = {
        text: (out.notify ? "Notification to: " + mentions + "\n" : "")  + lib.sanitizeForSlack(title + out.short) + "\n" + out.logLinks,
        color: (out.notify ? "#ff264f" : "#36a64f")
    };
    const response = await axios.post(webHookUrl, slackMessage);
    console.log("Message to slack sent. Got response: " + JSON.stringify(response.data, undefined, 2));
    console.log("Done. Exitting with code 0");
    process.exit(0);
}

run();