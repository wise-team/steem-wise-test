import { Container } from "./Container";
import { Config } from "./config";

export class Context {
    private config: Config;
    private container: Container;

    public constructor(config: Config) {
        this.config = config;
        this.container = new Container(config);
    }

    public getContainer() {
        return this.container;
    }

    public getConfig() {
        return this.config;
    }
}