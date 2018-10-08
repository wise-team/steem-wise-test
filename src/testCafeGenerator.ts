import { expect } from "chai";
import "mocha";
import * as stream from "stream";
import * as Docker from "dockerode";
import * as BluebirdPromise from "bluebird";
import * as path from "path";

import { Config } from "./Config";
import { Context } from "./Context";
import { Container } from "./Container";


export default function(config: Config, context: Context, browsers: string [], testsDirPath: string) {
    describe("testcafe tests", function () {
        this.timeout(10 * 60 * 1000);
        let docker: Docker;
        // let volume: Docker.Volume;

        before(async () => {
            docker = new Docker();
            /* volume = await docker.createVolume({ Name: volumeName });

            const codeEscaped = testCode.split("\\").join("\\\\").split("\r").join("\\r").split("\n").join("\\n").split("\"").join("\\\"").split("`").join("\\`");
            const cmd = "echo \"" + codeEscaped + "\" > /volmnt/test.js && cat /volmnt/test.js";
            console.log(cmd);
            const volumes: any = {};
            volumes[volumeName] = {};
            console.log("Pulling alpine");
            const pullRes = await docker.pull("alpine", {});
            console.log("Pull done. Filling the volume with test files");
            const out = await Container.runToString("alpine", [ "sh", "-c", cmd ], volumes, [ volumeName + ":/volmnt" ]);
            console.log("============");
            console.log(out);
            console.log("============");
            expect(out).to.be.equal(testCode);*/
        });


        it("Passes all browser tests", async () => {
            const image = "testcafe/testcafe";
            const cmd: string [] = [ "--no-color", "--reporter", "json", browsers.join(","), "/tests/*.js"];
            console.log(cmd);

            let stdoutStr = "";
            const stdoutEchoStream = new stream.Writable();
            stdoutEchoStream._write = function (chunk, encoding, done) {
                const str = chunk.toString();
                str.substring(0, str.length - 2).split("\n").forEach((line: string) => console.log("testcafe > " + line));
                stdoutStr += str;
                done();
            };

            const binds = [ path.resolve(testsDirPath) + "/:/tests" ];
            const env = [ "CI=true", "WISE_TEST_CONFIG=" + JSON.stringify(config) ];
            // const execStream = await Container.run("alpine", [ "ls", "/tests" ], stdoutEchoStream, {}, binds);
            const execStream = await Container.run(image, cmd, stdoutEchoStream, {}, binds, env);
            await BluebirdPromise.delay(100);

            const result: any = JSON.parse(stdoutStr);
            expect(result.passed).to.be.equal(result.total);
        });

        after(async () => {
            /*if (volume) {
                await volume.remove();
                console.log("Volume " + volumeName + " removed");
            }*/
        });
    });
}
