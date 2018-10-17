import { expect } from "chai";
import "mocha";
import axios from "axios";
import * as _ from "lodash";
import * as steem from "steem";

import { data as wise } from "../wise-config.gen.js";

import { Config } from "../Config";
import { Context } from "../Context";



export default function(config: Config, context: Context) {
    const endpoint = wise.config.sql.endpoint.schema + "://" + wise.config.sql.endpoint.host + "/";

    describe("Wise SQL metrics", function () {
        this.timeout(9000);
        this.retries(1);

        let operations: any [] = [];
        let properties: { key: string, value: string } [] = [];

        const operationsUrl = endpoint + "operations?order=moment.desc&timestamp=gt." + new Date((Date.now() - wise.config.test.healthcheck.metrics.periodMs)).toISOString();
        before(async function () {
            this.timeout(8000);

            steem.api.setOptions({ url: wise.config.steem.defaultApiUrl, /*uri: wise.config.steem.defaultApiUrl*/ });

            const operationsResp = await axios.get(operationsUrl);
            expect(operationsResp.data).to.be.an("array").with.length.greaterThan(0);
            operations = operationsResp.data;

            const propertiesResp = await axios.get(endpoint + "properties");
            expect(propertiesResp.data).to.be.an("array").with.length.greaterThan(0);
            properties = propertiesResp.data;
        });

        it("Sql endpoint has lag lower than 10 seconds", () => {
            expect(parseInt(properties.filter(prop => prop.key === "lag")[0].value)).to.be.lessThan(10);
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
            const result = await axios.get(endpoint);
            const swaggerSpecs: any = result.data;

            expect(swaggerSpecs.host.indexOf(wise.config.sql.endpoint.host)).to.be.equal(0);
            expect(swaggerSpecs.basePath).to.be.equal("/");
            expect(swaggerSpecs.schemes).to.deep.equal(["https"]);

            expect(swaggerSpecs.paths).to.include.all.keys("/", "/last_confirmation", "/operations", "/properties", "/rulesets");

            expect(swaggerSpecs.definitions.last_confirmation.properties).to.include.all.keys("id", "block_num", "transaction_num", "transaction_id", "timestamp", "voter", "delegator", "operation_type", "json_str");
            expect(swaggerSpecs.definitions.operations.properties).to.include.all.keys("id", "block_num", "transaction_num", "transaction_id", "timestamp", "voter", "delegator", "operation_type", "json_str");
            expect(swaggerSpecs.definitions.properties.properties).to.include.all.keys("key", "value");
        });

        it("Sql endpoint hosts swagger UI that points correctly to the api", async () => {
            const resp = await axios.get(endpoint + "doc", { responseType: "text" });
            expect(resp.data.indexOf("id=\"swagger-ui\"") !== -1).to.be.true;
        });

        it("Sql endpoint [GET /operations] responds with a header with proper protocol version", async () => {
            const response = await axios.get(endpoint + "operations?limit=1");
            expect(response.headers).to.include.keys("wisesql-protocol-version");
            expect(response.headers["wisesql-protocol-version"]).to.be.equal(wise.config.sql.protocol.version);
        });

        it("Sql endpoint [GET /rpc/rulesets_by_delegator_at_moment] responds with a header with proper protocol version", async () => {
            const response = await axios.get(endpoint + "rpc/rulesets_by_delegator_at_moment?delegator=noisy&moment=999999999999");
            expect(response.headers).to.include.keys("wisesql-protocol-version");
            expect(response.headers["wisesql-protocol-version"]).to.be.equal(wise.config.sql.protocol.version);
        });

        it("Sql endpoint [POST /rpc/rulesets_by_delegator_at_moment] responds with a header with proper protocol version", async () => {
            const response = await axios.post(endpoint + "rpc/rulesets_by_delegator_at_moment",
                { delegator: "noisy", moment: "999999999999" });
            expect(response.headers).to.include.keys("wisesql-protocol-version");
            expect(response.headers["wisesql-protocol-version"]).to.be.equal(wise.config.sql.protocol.version);
        });
    });
}
