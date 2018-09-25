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
        this.cliContainer = new Container(config, "steem-wise-cli-" + Date.now());
        this.daemonContainer = new Container(config, "steem-wise-cli-daemon-" + Date.now());
    }

    public async setup(): Promise<void> {
        await this.cliContainer.buildImage(this.config.repositories.cli.path);
        await this.cliContainer.start(Container.KEEP_RUNNING_CMD);
        await this.daemonContainer.buildImage(this.config.repositories.cli.path);
        await this.daemonContainer.start(Container.KEEP_RUNNING_CMD);
    }

    public shutdown(): Promise<void> {
        return BluebirdPromise.resolve()
        .then(() => this.cliContainer.cleanup())
        .then(() => this.daemonContainer.cleanup())
        .then(() => console.log("FullContext cleanup done"));
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