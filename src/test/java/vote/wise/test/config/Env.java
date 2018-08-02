package vote.wise.test.config;

public enum Env {
    WORKDIR,
    DEFAULT_REPO_PATH_CORE,
    DEFAULT_REPO_PATH_CLI,
    DEFAULT_REPO_PATH_VOTER_PAGE,
    REPOSITORIES_DIR,
    REPO_DIRNAME_CORE,
    REPO_DIRNAME_CLI,
    REPO_DIRNAME_VOTER_PAGE,
    WISETEST_CONFIG_LOADED;

    public String get() {
        return System.getenv(this.name());
    }
}
