import * as Docker from "dockerode";
import * as exitHook from "exit-hook";
import { Config } from "./config";

export class Container {
    private config: Config;
    private docker: Docker;
    private imageName: string;

    public constructor(config: Config) {
        this.config = config;
        this.docker = new Docker();

        this.imageName = "steem-wise-test-cli-" + Date.now();
    }

    /*public async buildImage(): Promise<NodeJS.ReadableStream> {
        const contextDir = this.config.cliPath;

        console.log("Building image. Context=" + contextDir + "/Dockerfile");
        // let tarStream = tar.pack(process.cwd());
        return this.docker.buildImage(contextDir + "/Dockerfile",
            {
                t: this.imageName
            }
        );
    }*/
}