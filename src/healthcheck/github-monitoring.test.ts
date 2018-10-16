import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";
import { data as wise } from "../wise-config.gen.js";

import { Context } from "../Context";
import { Config } from "../config";
import Axios from "axios";


export default function(config: Config, context: Context) {
    describe("Github monitoring", () => {
        _.forOwn(wise.config.repository.repositories, (repo: { name: string }) => {
            const githubPath = wise.config.repository.github.organization + "/" + repo.name;
            describe (githubPath, () => {
                let issues: any = {};

                before(async () => {
                    const issuesRes = await Axios.get("https://api.github.com/search/issues?q=repo:" + githubPath);
                    issues = issuesRes.data;
                    expect(issues.incomplete_results).to.be.false;
                    expect(issues.total_count).to.be.gte(0);
                    expect(issues.items).to.be.an("array").with.length.gte(0);
                    expect(issues.items).to.be.an("array").with.length.gte(issues.total_count * 0.75 /* this is strange */);
                });

               it("Has no open and unassigned issues/pulls", () => {
                    const openAndUnassignedUrls: string [] = issues.items.filter((item: any) => (item.state !== "closed") && (item.assignees.length === 0)).map((item: any) => item.html_url);
                    if (openAndUnassignedUrls.length > 0) throw new Error("Issues:  [" + openAndUnassignedUrls.join(",") + "] is not closed and has no assignees.");
                });

               it("If there are more than 10 issues, the open/total issues ratio is lower than 20%", () => {
                    if (issues.items.length > 10) {
                        const open = issues.items.filter((item: any) => item.state !== "closed");
                        const total = issues.items;

                        expect(open).to.have.length.lessThan(total.length * 0.2);
                    }
                });
            });
        });
    });
}
