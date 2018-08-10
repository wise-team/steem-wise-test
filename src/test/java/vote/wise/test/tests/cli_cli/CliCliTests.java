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
import vote.wise.test.util.DynamicLogFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;
import static org.assertj.core.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CliCliTests {
    static final Setup setup = new Setup();
    static final Path logsPath = setup.getSetupPath().resolve("docker-logs");
    static final Path wiseCliLogPath = logsPath.resolve("wise-cli.log");
    static final Path wiseDaemonLogPath = logsPath.resolve("wise-daemon.log");
    static final DynamicLogFile cliLog = new DynamicLogFile(logsPath);
    static final DynamicLogFile daemonLog = new DynamicLogFile(wiseDaemonLogPath);

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
                .replace("{{delegator-keywif}}", Credentials.get(Credentials.Role.STEEM_DELEGATOR_A).getRight())
                .replace("{{voter-username}}", Credentials.get(Credentials.Role.STEEM_VOTER_A).getLeft())
                .replace("{{voter-keywif}}", Credentials.get(Credentials.Role.STEEM_VOTER_A).getRight());

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
    Iterable<DynamicTest> cliCliTests(DockerComposeRule docker) throws InterruptedException {
        List<DynamicTest> tests =  new LinkedList<>();

        tests.add(dynamicTest("Log files exists", () -> {
            assertTrue(wiseCliLogPath.toFile().exists(), wiseCliLogPath + " exists");
            assertTrue(wiseDaemonLogPath.toFile().exists(), wiseDaemonLogPath + " exists");
        }));

        tests.add(dynamicTest("Test sth docker", () -> {
            Set<Container> containers = docker.containers().allContainers();
            System.out.printf("Containers:");
            containers.stream().forEach(c -> System.out.println("c: " + c.getContainerName()));
            assertTrue(containers.size() > 0);
        }));

        tests.addAll(synchronisationTests(docker));
        return tests;
    }

    public List<DynamicTest> synchronisationTests(DockerComposeRule docker) throws InterruptedException {
        return Arrays.asList(
                dynamicTest("Synchronisation starts with debug mode", () -> {
                    TimeUnit.MILLISECONDS.sleep(1000);
                    Files.lines(wiseDaemonLogPath).forEach(l -> System.out.println(wiseDaemonLogPath + "<> " + l));
                    String daemonLogSinceCheckpoint = daemonLog.getLogSinceCheckpoint();
                    assertThat(daemonLogSinceCheckpoint).contains("Setting steem-wise-core log level to \"debug\"");
                    assertThat(daemonLogSinceCheckpoint.toLowerCase()).doesNotContain("error");
                    //assertTrue(log.getLine(0).contains("Setting steem-wise-core log level to \"debug\""), "First line of docker log contains info about debug mode");
                    /*log.markCheckpoint();
                    while (true) {
                        TimeUnit.SECONDS.sleep(1);
                    }*/
                })
        );
    }

    @AfterAll
    void afterAll() throws IOException {
        // setup.clean();
    }
}
