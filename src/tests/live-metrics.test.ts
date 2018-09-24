import { expect } from "chai";
import "mocha";
import axios from "axios";
import * as _ from "lodash";
import * as steem from "steem";

import { Config } from "../Config";
import { Context } from "../Context";


export default function(config: Config, context: Context) {
    const endpoint = config.sqlEndpointUrl;

    describe("Live metrics (tests/live-metrics.test.ts)", () => {
        let operations: {} [] = [];
        let properties: { key: string, value: string } [] = [];

        before(
            () => axios.get(endpoint + "operations")
            .then((resp: any) => {
                expect(resp.data).to.be.an("array").with.length.greaterThan(0);
                operations = resp.data;
            })
            .then(() => axios.get(endpoint + "properties")
            .then((resp: any) => {
                expect(resp.data).to.be.an("array").with.length.greaterThan(0);
                properties = resp.data;
            }))
        );

        it("Sql endpoint has lag lower than 5 seconds", () => {
            expect(parseInt(properties.filter(prop => prop.key === "lag")[0].value)).to.be.lessThan(5);
        });

        it("Sql endpoint has lag updated at most 5 minutes ago", () => {
            const lagUpdatedAgoMs = Date.now() - new Date(properties.filter(prop => prop.key === "lag_update_time")[0].value).getTime();
            expect(lagUpdatedAgoMs).to.be.lessThan(5 * 60 * 1000);
        });

        it("Sql endpoint is at most 10 blocks away from the head block", () => {
            const lastProcessedBlock = parseInt(properties.filter(prop => prop.key === "last_processed_block")[0].value);
            return steem.api.getDynamicGlobalPropertiesAsync()
            .then((resp: any) => {
                const headBlockNum: number = resp.head_block_number;
                expect(lastProcessedBlock).to.be.greaterThan(headBlockNum - 10);
            });
        });

        it("Sql endpoint has more than one source of blocks", () => {
            const blockSources = JSON.parse(properties.filter(prop => prop.key === "block_sources")[0].value);
            expect(blockSources).to.be.an("array").with.length.greaterThan(1);
        });

        // TODO test if:
        // > xx% of rejections
        // > no confirmations
        // no operations
    });
}
