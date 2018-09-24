
export class Config {
    public requiredNodeJsVersion = "9.11";
    public corePath: string = "../steem-wise-core";
    public cliPath: string = "../steem-wise-cli";
    public voterPagePath: string = "../steem-wise-voter-page";
    public manualPath: string = "../steem-wise-manual";
    public sqlPath: string = "../steem-wise-sql";
    public testPath: string = "../steem-wise-test";
    public repositories: string [] = [
        this.corePath, this.cliPath, this.voterPagePath, this.manualPath, this.sqlPath, this.testPath
    ];
    public nodeRepositories: string [] = [
        this.corePath, this.cliPath, this.voterPagePath, this.sqlPath, this.testPath
    ];
}