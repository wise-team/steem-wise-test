import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";
import * as steem from "steem";

import { Context } from "../Context";
import { Config } from "../config";


export default function(config: Config, context: Context) {
    describe("Steem using steem-js (" + __dirname + ")", function () {
        this.timeout(6000);

        it ("Does get_block correctly for an old block", () => {
            const testBlockNum = 26194848;
            return steem.api.getBlockAsync(testBlockNum)
            .then((block: any) => {
                expect(block.transactions).to.be.an("array").with.length(29);
                expect(block.transactions[0].block_num).to.be.equal(testBlockNum);
                expect(block.timestamp).to.be.equal("2018-09-23T11:22:36");
            });
        });

        it ("Does get_block correctly for HEAD block", async () => {
            const dynamicGlobalProperties = await steem.api.getDynamicGlobalPropertiesAsync();
            if (!dynamicGlobalProperties) throw new Error("Dynamic global properties are undefined");
            const headBlockNum = dynamicGlobalProperties.head_block_number;

            return steem.api.getBlockAsync(headBlockNum)
            .then((block: any) => {
                expect(block.transactions).to.be.an("array").with.length.gt(0);
                expect(block.transactions[0].block_num).to.be.equal(headBlockNum);
            });
        });

        it ("Does get_block correctly for block made during HF20 introduction problems", async () => {
            const blockNum = 26256960; // 26256746, 26256747, 26256748, 26256749 has 0 transactions,

            return steem.api.getBlockAsync(blockNum)
            .then((block: any) => {
                expect(block.transactions).to.be.an("array").with.length.gt(0);
                expect(block.transactions[0].block_num).to.be.equal(blockNum);
            });
        });
    });
}
