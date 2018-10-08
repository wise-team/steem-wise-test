
import * as yaml from "js-yaml";
import * as path from "path";
import * as fs from "fs";

export class Config {
    public repositories = {
        core: {
            path: "../steem-wise-core",
        },
        cli: {
            path: "../steem-wise-cli",
        },
        voterPage: {
            path: "../steem-wise-voter-page",
        },
        manual: {
            path: "../steem-wise-manual",
        },
        sql: {
            path: "../steem-wise-sql",
        },
        test: {
            path: "../steem-wise-test",
        },
        hub: {
            path: "../wise-hub",
        },
        ci: {
            path: "../wise-ci",
        }
    };

    public skipDockerBuild: boolean = false;

    public wiseManualUrl: string = "https://wise.vote/";

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

    /**
     * Loads credentials into config
     */
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
        githubPath: string;
        npmPackageName?: string;
        isNode: boolean;
        isNpm: boolean;
        nodePath: string;
    }

    export interface Credentials {
        account: string;
        postingKey: string;
    }
}