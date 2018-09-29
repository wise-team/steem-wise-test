import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";
import * as blc from "broken-link-checker";
import axios from "axios";

import { Context } from "../Context";
import { Config } from "../config";


export default function(config: Config, context: Context) {
    describe("Wise manual (" + __dirname + ")", () => {
        it ("Has correct operations-count badge", async () => {
            const res = await axios.get(config.wiseManualUrl, { responseType: "text" });

            const apiUrl = "http://" + config.sqlEndpointHost + ":" + config.sqlEndpointApiPort + "/operations?select=count";
            const jsonPathQuery = "$[0].count";
            const apiLink = "http://" + config.sqlEndpointHost + ":" + config.sqlEndpointApiPort + "/operations?select=moment,delegator,voter,operation_type&order=moment.desc";

            const correctWiseOperationsCountBadgeUrl = "https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url="
                + encodeURIComponent(apiUrl) + "&query=" + encodeURIComponent(jsonPathQuery) + "&colorB=blue&style=flat-square";


            expect(res.data.indexOf(correctWiseOperationsCountBadgeUrl) !== -1).to.be.true;
            expect(res.data.indexOf(apiLink) !== -1).to.be.true;
        });
    });
}
