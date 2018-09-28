
import * as yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";

export class Config {
    public requiredNodeJsVersion = "9.11";
    public skipBuild: boolean = false;

    public repositories: { [x: string]: Config.Repository } = {
        core: {
            path: "../steem-wise-core",
            isNode: true,
            isNpm: true,
            nodePath: ""
        },
        cli: {
            path: "../steem-wise-cli",
            isNode: true,
            isNpm: true,
            nodePath: ""
        },
        voterPage: {
            path: "../steem-wise-voter-page",
            isNode: false,
            isNpm: true,
            nodePath: ""
        },
        manual: {
            path: "../steem-wise-manual",
            isNode: false,
            isNpm: false,
            nodePath: ""
        },
        sql: {
            path: "../steem-wise-sql",
            isNode: true,
            isNpm: true,
            nodePath: "/pusher"
        },
        test: {
            path: "../steem-wise-test",
            isNode: true,
            isNpm: true,
            nodePath: ""
        }
    };

    public sqlEndpointHost: string = "sql.wise.vote";
    public sqlEndpointApiPort: number = 80;
    public liveMetricsPeriodMs: number = 3 * 24 * 3600 * 1000; // 4 days

    public guestAccountCredentials: Config.Credentials = {
        account: "guest123", postingKey: "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg"
    };
    public credentials: { [role: string]: Config.Credentials } = {
        delegator: { account: "guest123", postingKey: "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg" },
        voter1: { account: "guest123", postingKey: "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg" },
        voter2: { account: "guest123", postingKey: "5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg" },
    };
    public requiredCredentialRoles: string [] = [ "delegator", "voter1", "voter2" ];
    public credentialsFilePath = "credentials.yml";

    public skipBrowser: boolean = false;
    public testBrowsers: string [] = [ "firefox" ];

    public constructor() {
        if (fs.existsSync(this.credentialsFilePath)) {
            const credentialsFileContents = fs.readFileSync(this.credentialsFilePath, "utf8").toString();
            this.credentials = yaml.safeLoad(credentialsFileContents);
        }
    }
}

export namespace Config {
    export interface Repository {
        path: string;
        isNode: boolean;
        isNpm: boolean;
        nodePath: string;
    }

    export interface Credentials {
        account: string;
        postingKey: string;
    }
}