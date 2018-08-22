package vote.wise.test.tests.cli;

import com.palantir.docker.compose.execution.*;
import eu.bittrade.libs.steemj.SteemJ;
import eu.bittrade.libs.steemj.base.models.DynamicGlobalProperty;
import eu.bittrade.libs.steemj.exceptions.SteemCommunicationException;
import eu.bittrade.libs.steemj.exceptions.SteemResponseException;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.*;

import com.palantir.docker.compose.DockerComposeRule;
import org.junit.jupiter.api.extension.RegisterExtension;
import vote.wise.test.config.Credentials;
import vote.wise.test.config.Env;
import vote.wise.test.docker.DockerComposeLoaderExtension;
import vote.wise.test.docker.Setup;
import vote.wise.test.util.DynamicLogFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;
import static org.assertj.core.api.Assertions.*;
import static vote.wise.test.util.TestsUtil.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CliTests {
    static final Setup setup = new Setup("cli");
    static final Path logsPath = setup.getSetupPath().resolve("docker-logs");
    static final Path wiseCliLogPath = logsPath.resolve("wise-cli.log");
    static final Path wiseDaemonLogPath = logsPath.resolve("wise-daemon.log");
    static final DynamicLogFile cliLog = new DynamicLogFile(logsPath);
    static final DynamicLogFile daemonLog = new DynamicLogFile(wiseDaemonLogPath);
    static final String rulesetSuffix = "-integration-test-" + System.currentTimeMillis();

    static long getHeadSteemBlockNum() throws SteemResponseException, SteemCommunicationException {
        SteemJ steemJ = new SteemJ();
        DynamicGlobalProperty dgp =  steemJ.getDynamicGlobalProperties();
        return dgp.getHeadBlockNumber();
    }
    static String processTemplate(String template) throws IOException {
        String out = template
                .replace("{{ruleset-suffix}}", rulesetSuffix);

        for (Env e : Env.values()) {
            out = out.replace("{{env-" + e.name() + "}", e.get());
        }

        for (Credentials.Role r : Credentials.Role.values()) {
            out = out.replace("{{credential-" + r.name() + "-login}}", Credentials.get(r).getLeft());
            out = out.replace("{{credential-" + r.name() + "-password}}", Credentials.get(r).getRight());
        }

        return out;
    }

    static String prepareDockerCompose() throws SteemResponseException, SteemCommunicationException, IOException {
        long headBlockNum = getHeadSteemBlockNum();
        String template = readResource(CliTests.class, "docker-compose.template.yml");

        String newYml = processTemplate(template)
                .replace("{{head-block-num}}", "" + headBlockNum)
                ;

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

        tests.add(dynamicTest("Wise cli works and outputs proper wise version " + Env.WISE_CLI_REQUIRED_VERSION.get(), () -> {
            String out = docker.run(DockerComposeRunOption.options("-T"), "wise-cli", DockerComposeRunArgument.arguments("wise", "--version"));
            assertEquals(out.trim(), Env.WISE_CLI_REQUIRED_VERSION.get());
            TimeUnit.SECONDS.sleep(1);
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

                    TimeUnit.MILLISECONDS.sleep(1000);
                }),

                dynamicTest("Voteorder send fails on nonexistent ruleset", () -> {
                    String voteorder = readResource(getClass(), "invalid-voteorder.json")
                            .replace("{{ruleset-name}}", "nonexistent-ruleset-" + System.currentTimeMillis());
                    try {
                         docker.run(DockerComposeRunOption.options("-T"), "wise-cli", DockerComposeRunArgument.arguments("wise", "send-voteorder", voteorder));
                        throw new RuntimeException("Voteorder sending should fail");
                    }
                    catch(DockerExecutionException ex) {
                        assertThat(ex.getMessage()).containsIgnoringCase("Validation error: Delegator had no such ruleset");
                    }
                    TimeUnit.MILLISECONDS.sleep(250);
                }),

                dynamicTest("Successfuly synchronises rules", () -> {
                    String rules = processTemplate(readResource(getClass(), "rules-1.json"));

                    Pair<String, String> delegator = Credentials.get(Credentials.Role.STEEM_DELEGATOR_A);

                    String out = docker.run(DockerComposeRunOption.options("-T", "-e WISE_STEEM_USERNAME=" + delegator.getLeft(), "-e WISE_STEEM_POSTINGWIF=" + delegator.getRight()),
                                "wise-cli", DockerComposeRunArgument.arguments("wise", "sync-rules", rules));

                    System.out.println("Sync out:");
                    System.out.println(out);

                    TimeUnit.MILLISECONDS.sleep(250);
                })
        );
    }

    @AfterAll
    void afterAll() throws IOException {
        // setup.clean();
    }
}
