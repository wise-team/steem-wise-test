import { Container } from "./Container";
import { Config } from "./config";

export class Context {
    private config: Config;

    public constructor(config: Config) {
        this.config = config;
    }

    public getConfig() {
        return this.config;
    }
}