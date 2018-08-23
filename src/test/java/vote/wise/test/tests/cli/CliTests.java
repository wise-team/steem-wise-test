package vote.wise.test.tests.cli;

import com.jayway.jsonpath.JsonPath;
import com.palantir.docker.compose.execution.*;
import eu.bittrade.libs.steemj.SteemJ;
import eu.bittrade.libs.steemj.base.models.AccountName;
import eu.bittrade.libs.steemj.base.models.AppliedOperation;
import eu.bittrade.libs.steemj.base.models.DynamicGlobalProperty;
import eu.bittrade.libs.steemj.base.models.operations.CustomJsonOperation;
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
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;
import static org.assertj.core.api.Assertions.*;
import static vote.wise.test.util.TestsUtil.*;
import static org.junit.jupiter.api.Assertions.fail;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CliTests {
    static final Setup setup = new Setup("cli");
    static final Path logsPath = setup.getSetupPath().resolve("docker-logs");
    static final Path wiseDaemonLogPath = logsPath.resolve(Constants.CONTAINER_DAEMON + ".log");
    static final DynamicLogFile daemonLog = new DynamicLogFile(wiseDaemonLogPath);
    static final String rulesetSuffix = "-integration-test-" + System.currentTimeMillis();
    static final Logger log = Logger.getLogger(CliTests.class.getName());

    static long getHeadSteemBlockNum() throws SteemResponseException, SteemCommunicationException {
        SteemJ steemJ = new SteemJ();
        DynamicGlobalProperty dgp =  steemJ.getDynamicGlobalProperties();
        return dgp.getHeadBlockNumber();
    }
    static String processTemplate(String template) throws IOException, IllegalAccessException {
        String out = template
                .replace("{{ruleset-suffix}}", rulesetSuffix);

        for (Env e : Env.values()) {
            out = out.replace("{{env-" + e.name() + "}", e.get());
        }

        for (Credentials.Role r : Credentials.Role.values()) {
            out = out.replace("{{credential-" + r.name() + "-login}}", Credentials.get(r).getLeft());
            out = out.replace("{{credential-" + r.name() + "-password}}", Credentials.get(r).getRight());
        }

        for (Field f : Constants.class.getFields()) {
            out = out.replace("{{" + f.getName() + "}}", f.get(null).toString());
        }

        return out;
    }

    static String prepareDockerCompose() throws SteemResponseException, SteemCommunicationException, IOException, IllegalAccessException {
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
            assertTrue(wiseDaemonLogPath.toFile().exists(), wiseDaemonLogPath + " exists");
        }));

        tests.add(dynamicTest("Wise cli works and outputs proper wise version " + Env.WISE_CLI_REQUIRED_VERSION.get(), () -> {
            String out = docker.run(DockerComposeRunOption.options("-T"), Constants.CONTAINER_CLI, DockerComposeRunArgument.arguments("wise", "--version"));
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
                         docker.run(DockerComposeRunOption.options("-T"), Constants.CONTAINER_CLI, DockerComposeRunArgument.arguments("wise", "send-voteorder", voteorder));
                        throw new RuntimeException("Voteorder sending should fail");
                    }
                    catch(DockerExecutionException ex) {
                        assertThat(ex.getMessage()).containsIgnoringCase("Validation error: Delegator had no such ruleset");
                    }
                    TimeUnit.MILLISECONDS.sleep(250);
                }),

                dynamicTest("Successfuly synchronises rules", () -> {
                    daemonLog.markCheckpoint();

                    String rules = processTemplate(readResource(getClass(), "rules-1.json"));

                    Pair<String, String> delegator = Credentials.get(Credentials.Role.STEEM_DELEGATOR_A);

                    String out = docker.run(DockerComposeRunOption.options("-T", "-e", "WISE_STEEM_USERNAME=" + delegator.getLeft(), "-e", "WISE_STEEM_POSTINGWIF=" + delegator.getRight()),
                            Constants.CONTAINER_CLI, DockerComposeRunArgument.arguments("wise", "sync-rules", rules));

                    log.info("---\"Successfuly synchronises rules\" output ---\n" + out + "\n---\n");

                    assertThat(out).containsIgnoringCase("Done updating rules");
                    assertThat(out).containsPattern(Pattern.compile("[2-9] operations to send", Pattern.MULTILINE)); // minimum two operations

                    TimeUnit.MILLISECONDS.sleep(250);
                }),

                dynamicTest("Updated rules are present on blockchain", () -> {
                    Pair<String, String> delegator = Credentials.get(Credentials.Role.STEEM_DELEGATOR_A);
                    SteemJ steemJ = new SteemJ();
                    Map<Integer, AppliedOperation> ops = steemJ.getAccountHistory(new AccountName(delegator.getLeft()), -1, 10);
                    String[] setRulesOps = ops.values().stream()
                            .filter(op -> op.getOp() instanceof CustomJsonOperation)
                            .map(op -> (CustomJsonOperation) op.getOp())
                            .filter(cjop -> cjop.getId().equals("wise")).map(cjop -> cjop.getJson()).filter(json -> json.contains("v2:set_rules")).toArray(String[]::new);
                    assertThat(setRulesOps.length).isGreaterThanOrEqualTo(2);
                }),

                dynamicTest("Updated rules are fetched by the daemon", () -> {
                    for (int i = 0; i < 5;i++) {
                        TimeUnit.SECONDS.sleep(1);

                        String [] daemonLogLines = this.daemonLog.getLogLinesSinceCheckpoint();
                        String [] synchronizerEvents = Arrays.stream(daemonLogLines)
                                .filter(line -> line.contains("SYNCHRONIZER_EVENT="))
                                .map(line -> line.split("SYNCHRONIZER_EVENT=")[1])
                                .toArray(String[]::new);
                        String [] rulesUpdatedEvents = Arrays.stream(synchronizerEvents)
                                .map(json -> JsonPath.read(json, "$.type"))
                                .filter(elem -> elem.equals("rules-updated"))
                                .toArray(String[]::new);
                        if(rulesUpdatedEvents.length >= 2 ) return; // passed
                    }
                    fail("Updated rules were not fetched");

                }),

                dynamicTest("Does not update rules the second time", () -> {
                    String rules = processTemplate(readResource(getClass(), "rules-1.json"));

                    Pair<String, String> delegator = Credentials.get(Credentials.Role.STEEM_DELEGATOR_A);

                    String out = docker.run(DockerComposeRunOption.options("-T", "-e WISE_STEEM_USERNAME=" + delegator.getLeft(), "-e WISE_STEEM_POSTINGWIF=" + delegator.getRight()),
                            Constants.CONTAINER_CLI, DockerComposeRunArgument.arguments("wise", "sync-rules", rules));

                    System.out.println("'Does not update rules the second time' output:");
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
