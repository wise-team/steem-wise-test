package vote.wise.test.tests.cli_cli;

import com.google.common.io.Resources;
import com.palantir.docker.compose.connection.Container;
import eu.bittrade.libs.steemj.SteemJ;
import eu.bittrade.libs.steemj.base.models.DynamicGlobalProperty;
import eu.bittrade.libs.steemj.exceptions.SteemCommunicationException;
import eu.bittrade.libs.steemj.exceptions.SteemResponseException;
import org.junit.jupiter.api.*;

import com.palantir.docker.compose.DockerComposeRule;
import org.junit.jupiter.api.extension.RegisterExtension;
import vote.wise.test.config.Credentials;
import vote.wise.test.docker.DockerComposeLoaderExtension;
import vote.wise.test.docker.Setup;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CliCliTests {
    static final Setup setup = new Setup();
    static final Path logsPath = setup.getSetupPath().resolve("docker-logs");

    static long getHeadSteemBlockNum() throws SteemResponseException, SteemCommunicationException {
        SteemJ steemJ = new SteemJ();
        DynamicGlobalProperty dgp =  steemJ.getDynamicGlobalProperties();
        return dgp.getHeadBlockNumber();
    }

    static String prepareDockerCompose() throws SteemResponseException, SteemCommunicationException, IOException {
        long headBlockNum = getHeadSteemBlockNum();
        String template = Resources.asCharSource(Resources.getResource(CliCliTests.class, "docker-compose.template.yml"), StandardCharsets.UTF_8).read();

        String newYml = template
                .replace("{{head-block-num}}", "" + headBlockNum)
                .replace("{{delegator-username}}", Credentials.get(Credentials.Role.STEEM_DELEGATOR_A).getLeft())
                .replace("{{delegator-keywif}}", Credentials.get(Credentials.Role.STEEM_DELEGATOR_A).getRight());

        assertTrue(newYml.contains(headBlockNum + ""), "generated yml file contains newly appended headBlockNum");
        assertTrue(newYml.contains("context: /"), "generated yml file has absolute context");

        return newYml;
    }

    @RegisterExtension
    static DockerComposeLoaderExtension dockerExtension = new DockerComposeLoaderExtension(
            () -> prepareDockerCompose(),
            DockerComposeRule.builder()
                .pullOnStartup(true)
                .saveLogsTo(logsPath.toString())
    );

    @BeforeAll
    void beforeAll() throws IOException {
        setup.init();
    }

    @TestFactory
    Iterable<DynamicTest> cliCliTests(DockerComposeRule docker) {
        return Arrays.asList(
            dynamicTest("Test sth docker", () -> {
                Set<Container> containers = docker.containers().allContainers();
                System.out.printf("Containers:");
                containers.stream().forEach(c -> System.out.println("c: " + c.getContainerName()));
                assertTrue(containers.size() > 0);
            })
        );
    }

    @AfterAll
    void afterAll() throws IOException {
        // setup.clean();
    }
}
