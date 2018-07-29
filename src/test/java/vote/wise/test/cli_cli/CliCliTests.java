package vote.wise.test.cli_cli;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

import com.palantir.docker.compose.DockerComposeRule;
import com.palantir.docker.compose.connection.waiting.HealthChecks;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.extension.RegisterExtension;
import vote.wise.test.config.StaticConfig;
import vote.wise.test.docker.DockerComposeLoaderExtension;
import vote.wise.test.docker.Setup;

import java.io.IOException;
import java.util.Arrays;

class CliCliTests {
    private static final Setup setup = new Setup();

    /*@RegisterExtension
    static DockerComposeLoaderExtension dockerExtension = new DockerComposeLoaderExtension(
            () -> {
                return ;
            },
            DockerComposeRule.builder()
                    .pullOnStartup(true)
                    .saveLogsTo("build/logs/test-docker-logs")
                    .waitingForService("postgres", )
                    .waitingForService("nginx", toHaveAllPortsOpen())
    );*/

    @BeforeAll
    public static void beforeAll() throws IOException {
        setup.init();
        System.out.println("Cloning repository");
        String cloneOut = setup.exec("git clone " + StaticConfig.STEEM_WISE_CLI_REPO_CLONE_URL);
    }

    @TestFactory
    Iterable<DynamicTest> cliCliTests() {
        return Arrays.asList(
            dynamicTest("Repository was cloned", () -> {
                assertTrue(setup.getSetupPath().resolve("steem-wise-cli").toFile().exists(), "Path {setup}/steem-wise-cli exists");
            })
        );
    }

    @AfterAll
    public static void afterAll() throws IOException {
        setup.clean();
    }
}
