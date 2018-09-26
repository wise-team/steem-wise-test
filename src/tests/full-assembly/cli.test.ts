import { expect } from "chai";
import "mocha";
import * as yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";
import * as Docker from "dockerode";
import * as _ from "lodash";
import { Wise } from "steem-wise-core";

import { Config } from "../../Config";
import { FullContext } from "../../FullContext";
import { Container } from "../../Container";


export default function(config: Config, context: FullContext) {
    describe("Cli on fully assembled system (tests/full-assembly/cli.test.ts)", () => {
        describe("cmd: init", () => {
            const tmpDir = "/tmp/" + Date.now();
            let container: Container;

            before(() => {
                container = context.getCliContainer();
            });

            it("Creates temporary directory", () => {
                container.exec(["mkdir", "-p", tmpDir])
                .then((result: any) => {
                    console.log(result);
                    _.forOwn(result, (own, ownName) => {
                        console.log(">  " + ownName);
                    });
                });
            });
        });
    });
}
