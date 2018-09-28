import { expect } from "chai";
import "mocha";
import axios from "axios";
import * as _ from "lodash";
import * as steem from "steem";

import { Config } from "../Config";
import { Context } from "../Context";



export default function(config: Config, context: Context) {
    const endpoint = "http://" + config.sqlEndpointHost + ":" + config.sqlEndpointApiPort + "/";

    describe("Live metrics (tests/live-metrics.test.ts)", () => {
        let operations: any [] = [];
        let properties: { key: string, value: string } [] = [];

        const operationsUrl = endpoint + "operations?order=moment.desc&timestamp=gt." + new Date((Date.now() - config.liveMetricsPeriodMs)).toISOString();

        before(
            () => axios.get(operationsUrl)
            .then((resp: any) => {
                // expect(resp.data).to.be.an("array").with.length.greaterThan(0);
                operations = resp.data;
            })
            .then(() => axios.get(endpoint + "properties")
            .then((resp: any) => {
                // expect(resp.data).to.be.an("array").with.length.greaterThan(0);
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

        it("There were more than 4 operations in last metrics period", () => {
            expect(operations).to.be.an("array").with.length.gte(4);
        });

        it("Less than 20% of confirm_vote were rejections", () => {
            const confirmVotes = operations.filter((op: any) => op.operation_type === "confirm_vote");
            const rejections = confirmVotes.map(op => JSON.parse(op.json_str)).filter((confirmVote: any) => !confirmVote.accepted);
            expect(rejections.length).to.be.lte(confirmVotes.length / 5);
        });

        it("More than 60% of voteorders are confirmed", () => {
            const confirmVotes = operations.filter((op: any) => op.operation_type === "confirm_vote");
            const voteorders = operations.filter((op: any) => op.operation_type === "send_voteorder");
            expect(confirmVotes.length).to.be.gte(voteorders.length * 0.6);
        });

        it("Sql endpoint hosts swagger specs", async () => {
            const swaggerSpecs: any = (await axios.get(endpoint)).data;

            expect(swaggerSpecs.host).to.be.equal(config.sqlEndpointHost + ":" + config.sqlEndpointApiPort);
            expect(swaggerSpecs.basePath).to.be.equal("/");

            expect(swaggerSpecs.paths).to.have.all.keys("/", "/last_confirmation", "/operations", "/properties", "/rulesets");

            expect(swaggerSpecs.definitions.last_confirmation.properties).to.include.all.keys("id", "block_num", "transaction_num", "transaction_id", "timestamp", "voter", "delegator", "operation_type", "json_str");
            expect(swaggerSpecs.definitions.operations.properties).to.include.all.keys("id", "block_num", "transaction_num", "transaction_id", "timestamp", "voter", "delegator", "operation_type", "json_str");
            expect(swaggerSpecs.definitions.properties.properties).to.include.all.keys("key", "value");
        });

        /*it("Sql endpoint hosts swagger UI that points correctly to the api", async () => {
            const resp = await axios.get("http://sql.wise.vote:80/", { responseType: "text" });
            expect(resp.data.indexOf("id=\"swagger-ui\"") !== -1).to.be.true;
        });*/
    });
}
