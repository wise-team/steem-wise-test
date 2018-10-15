import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";
import * as blc from "broken-link-checker";
import Axios from "axios";

import { data as wise } from "../wise-config.gen.js";

import { Context } from "../Context";
import { Config } from "../config";


export default function(config: Config, context: Context) {
    describe.skip("Websites tests (" + __dirname + ")", function () {
        this.timeout(6 * 60 * 1000);

        wise.config.websites.forEach(website => {
            if (website.checkBrokenLinks) describe (website.url, () => {
               it("Has no broken links and forbidden phrases", (done) => {
                    const errors: string [] = [];
                    const brokenLinks: string [] = [];
                    const forbiddenWords: string [] = [];

                    let iterateTreeForForbiddenWords: (tree: any, pageUrl: string) => void  = (tree: any, pageUrl: string): void => {};
                    iterateTreeForForbiddenWords = (node: any, pageUrl: string) => {
                        if (node.data || node.value) {
                            const text = node.data ? node.data : node.value;
                            wise.config.test.websites.forbiddenPhrases.forEach(forbiddenPhrase => {
                                if (text.indexOf(forbiddenPhrase) !== -1) forbiddenWords.push(pageUrl + ": " + forbiddenPhrase);
                            });
                        }
                        if (node.childNodes) node.childNodes.forEach((child: any) => iterateTreeForForbiddenWords(child, pageUrl));
                    };

                    const options: any = {
                        filterLevel: 3, // 3 = clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms, metadata
                        honorRobotExclusions: false,
                        maxSocketsPerHost: 50,
                        excludedKeywords: wise.config.test.websites.brokenLinks.excludes
                    };
                    let siteChecker: blc.SiteChecker;
                    siteChecker = new blc.SiteChecker(options, {
                        robots: (robots: any, customData: any) => { /*  */ },
                        html: (tree: any, robots: any, response: any, pageUrl: string, customData: any) => {
                            console.log("Checking page: " + pageUrl);
                            iterateTreeForForbiddenWords(tree, pageUrl);
                        },
                        junk: (result: any, customData: any) => { /* excluded link*/ },
                        link: (result: any, customData: any) => {
                            if (result.broken) {
                                brokenLinks.push(result.url.resolved + " (original: " + result.url.original + " ;; base: " + result.base.resolved + "): " + result.brokenReason);
                            }
                        },
                        page: (error: any, pageUrl: any, customData: any) => {
                            if (error) errors.push(pageUrl + ": " + error);
                        },
                        site: (error: any, siteUrl: any, customData: any) => {
                            if (error) errors.push(siteUrl + ": " + error);
                        },
                        end: () => {
                            if (errors.length === 0 && brokenLinks.length === 0 && forbiddenWords.length === 0) {
                                done();
                            }
                            else {
                                let errorStr = "Website " + website + ":\n";
                                if (errors.length > 0) {
                                    errorStr += "- has errors: ";
                                    errorStr += errors.join("\n  - ");
                                    errorStr += "\n";
                                }

                                if (brokenLinks.length > 0) {
                                    errorStr += "- has broken links: \n";
                                    errorStr += brokenLinks.join("\n  - ");
                                    errorStr += "\n";
                                }

                                if (forbiddenWords.length > 0) {
                                    errorStr += "- has forbidden phrases: \n";
                                    errorStr += forbiddenWords.join("\n  - ");
                                    errorStr += "\n";
                                }

                                done(new Error(errorStr));
                            }
                        }
                    });

                    siteChecker.enqueue(website, {});
                });
            });
        });
    });
}
