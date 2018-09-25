
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

    public sqlEndpointUrl: string = "http://muon.jblew.pl:3000/";
    public liveMetricsPeriodMs: number = 3 * 24 * 3600 * 1000; // 4 days
}

export namespace Config {
    export interface Repository {
        path: string;
        isNode: boolean;
        isNpm: boolean;
        nodePath: string;
    }
}