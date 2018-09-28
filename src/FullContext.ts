import * as getStream from "get-stream";
import * as BluebirdPromise from "bluebird";

import { Container } from "./Container";
import { Config } from "./config";

export class FullContext {
    private config: Config;
    private cliContainer: Container;
    private daemonContainer: Container;

    public constructor(config: Config) {
        this.config = config;
        const imageName = "steem-wise-cli-" + Date.now();
        this.cliContainer = new Container(config, imageName);
        this.daemonContainer = new Container(config, imageName);
    }

    public async setup(): Promise<void> {
        await this.cliContainer.buildImage(this.config.repositories.cli.path);
        await this.cliContainer.start(Container.KEEP_RUNNING_CMD);
        // daemon container uses the same image, so there is no need to build it again
        await this.daemonContainer.start(Container.KEEP_RUNNING_CMD);
    }

    public async shutdown(): Promise<void> {
        await this.daemonContainer.cleanup();
        await this.cliContainer.cleanup();
        console.log("FullContext cleanup done");
    }

    public getCliContainer() {
        return this.cliContainer;
    }

    public getDaemonContainer() {
        return this.daemonContainer;
    }

    public getConfig() {
        return this.config;
    }
}