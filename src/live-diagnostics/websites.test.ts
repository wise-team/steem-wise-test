import { expect } from "chai";
import "mocha";
import * as fs from "fs";
import * as _ from "lodash";
import * as blc from "broken-link-checker";
import Axios from "axios";

import { Context } from "../Context";
import { Config } from "../config";


export default function(config: Config, context: Context) {
    describe("Websites tests (" + __dirname + ")", function () {
        this.timeout(6 * 60 * 1000);

        config.websites.forEach(website => {
            describe (website, () => {
                it("Has no broken links and forbidden phrases", (done) => {
                    const errors: string [] = [];
                    const brokenLinks: string [] = [];
                    const forbiddenWords: string [] = [];

                    let iterateTreeForForbiddenWords: (tree: any, pageUrl: string) => void  = (tree: any, pageUrl: string): void => {};
                    iterateTreeForForbiddenWords = (node: any, pageUrl: string) => {
                        if (node.data || node.value) {
                            const text = node.data ? node.data : node.value;
                            config.forbiddenPhrases.forEach(forbiddenPhrase => {
                                if (text.indexOf(forbiddenPhrase) !== -1) forbiddenWords.push(pageUrl + ": " + forbiddenPhrase);
                            });
                        }
                        if (node.childNodes) node.childNodes.forEach((child: any) => iterateTreeForForbiddenWords(child, pageUrl));
                    };

                    const options: any = {
                        filterLevel: 3, // 3 = clickable links, media, iframes, meta refreshes, stylesheets, scripts, forms, metadata
                        honorRobotExclusions: false,
                        maxSocketsPerHost: 10,
                        excludedKeywords: config.brokenLinkCheckerExcludes
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

/*
 ===== link.result:
{ url:
   { original: 'https://github.com/perduta',
     resolved: 'https://github.com/perduta',
     redirected: null },
  base:
   { original: 'https://wise-team.io/',
     resolved: 'https://wise-team.io/' },
  html:
   { index: 28,
     offsetIndex: 27,
     location: { line: 124, col: 24, startOffset: 6500, endOffset: 6533 },
     selector: 'html > body > div:nth-child(2) > div:nth-child(3) > div:nth-child(3) > div:nth-child(5) > a:nth-child(1)',
     tagName: 'a',
     attrName: 'href',
     attrs: { href: 'https://github.com/perduta' },
     text: '',
     tag: '<a href="https://github.com/perduta">' },
  http:
   { cached: false,
     response:
      { headers: [Object],
        httpVersion: '1.1',
        statusCode: 200,
        statusMessage: 'OK',
        url: 'https://github.com/perduta',
        redirects: [] } },
  broken: false,
  internal: false,
  samePage: false,
  excluded: false,
  brokenReason: null,
  excludedReason: null }
====


===== html.tree:
{ nodeName: '#document',
  mode: 'no-quirks',
  childNodes:
   [ { nodeName: '#documentType',
       name: 'html',
       publicId: null,
       systemId: null,
       parentNode: [Circular],
       __location: [Object] },
     { nodeName: 'html',
       tagName: 'html',
       attrs: [Array],
       namespaceURI: 'http://www.w3.org/1999/xhtml',
       childNodes: [Array],
       parentNode: [Circular],
       attrMap: [Object],
       __location: [Object] } ] }
== html.response:
{ headers:
   { server: 'GitHub.com',
     'content-type': 'text/html; charset=utf-8',
     'last-modified': 'Fri, 28 Sep 2018 12:57:06 GMT',
     etag: '"5bae2522-7cdf"',
     'access-control-allow-origin': '*',
     expires: 'Sat, 29 Sep 2018 12:38:24 GMT',
     'cache-control': 'max-age=600',
     'x-github-request-id': '5270:0ED4:53B59FC:68C5650:5BAF6FE8',
     'content-length': '31967',
     'accept-ranges': 'bytes',
     date: 'Sat, 29 Sep 2018 12:28:25 GMT',
     via: '1.1 varnish',
     age: '0',
     connection: 'close',
     'x-served-by': 'cache-fra19136-FRA',
     'x-cache': 'MISS',
     'x-cache-hits': '0',
     'x-timer': 'S1538224105.918294,VS0,VE104',
     vary: 'Accept-Encoding',
     'x-fastly-request-id': '005e6ecbe81b05100775e17f71c408be2d646584' },
  httpVersion: '1.1',
  statusCode: 200,
  statusMessage: 'OK',
  url: 'https://wise-team.io/',
  redirects: [] }
====

 */
