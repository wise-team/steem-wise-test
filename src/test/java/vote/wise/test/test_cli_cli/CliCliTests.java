package vote.wise.test.test_cli_cli;

import com.google.common.io.Files;
import com.google.common.io.Resources;
import eu.bittrade.libs.steemj.SteemJ;
import eu.bittrade.libs.steemj.base.models.DynamicGlobalProperty;
import eu.bittrade.libs.steemj.exceptions.SteemCommunicationException;
import eu.bittrade.libs.steemj.exceptions.SteemResponseException;
import org.junit.jupiter.api.*;

import com.palantir.docker.compose.DockerComposeRule;
import org.junit.jupiter.api.extension.RegisterExtension;
import vote.wise.test.docker.DockerComposeLoaderExtension;
import vote.wise.test.docker.Setup;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CliCliTests {
    /*static long getHeadSteemBlockNum() throws SteemResponseException, SteemCommunicationException {
        SteemJ steemJ = new SteemJ();
        DynamicGlobalProperty dgp =  steemJ.getDynamicGlobalProperties();
        return dgp.getHeadBlockNumber();
    }

    static String prepareDockerCompose() throws SteemResponseException, SteemCommunicationException {
        long headBlockNum = CliCliTests.getHeadSteemBlockNum();
        String originalYml = Files.asCharSource(f, StandardCharsets.UTF_8).read();
    }

    @RegisterExtension
    static DockerComposeLoaderExtension dockerExtension = new DockerComposeLoaderExtension(
            () -> {
                return Resources.toString(
                        Resources.getResource(CliCliTests.class, "docker-compose.template.yml"),
                        StandardCharsets.UTF_8
                )
                .replace();
            },
            DockerComposeRule.builder()
                    .pullOnStartup(true)
                    .saveLogsTo("build/logs/test-docker-logs")
                    .waitingForService("postgres", )
                    .waitingForService("nginx", toHaveAllPortsOpen())
    );

    final Setup setup = new Setup();

    @BeforeAll
    void beforeAll() throws IOException {
        setup.init();
    }

    @TestFactory
    Iterable<DynamicTest> cliCliTests() {
        return Arrays.asList(
            //dynamicTest("Repository was cloned", () -> {
            //    assertTrue(setup.getSetupPath().resolve("steem-wise-cli").toFile().exists(), "Path {setup}/steem-wise-cli exists");
            //})
        );
    }

    @AfterAll
    void afterAll() throws IOException {
        setup.clean();
    }*/
}
