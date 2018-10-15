import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";
import * as blc from "broken-link-checker";
import axios from "axios";

import { data as wise } from "../wise-config.gen.js";

import { Context } from "../Context";
import { Config } from "../config";


export default function(config: Config, context: Context) {
    describe("Wise manual", () => {
        it ("Has correct operations-count badge", async () => {
            const res = await axios.get(wise.config.manual.url, { responseType: "text" });

            const apiUrl = wise.config.sql.endpoint.schema + "://" + wise.config.sql.endpoint.host + "/operations?select=count";
            const jsonPathQuery = "$[0].count";
            const apiLink = wise.config.sql.endpoint.schema + "://" + wise.config.sql.endpoint.host + "/operations?select=moment,delegator,voter,operation_type&order=moment.desc";

            const correctWiseOperationsCountBadgeUrl = "https://img.shields.io/badge/dynamic/json.svg?label=wise%20operations%20count&url="
                + encodeURIComponent(apiUrl) + "&query=" + encodeURIComponent(jsonPathQuery) + "&colorB=blue&style=flat-square";


            expect(res.data.indexOf(correctWiseOperationsCountBadgeUrl) !== -1).to.be.true;
            expect(res.data.indexOf(apiLink) !== -1).to.be.true;
        });
    });
}
