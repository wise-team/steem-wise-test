package vote.wise.test.test_control;

import org.junit.jupiter.api.*;
import vote.wise.test.config.Env;
import vote.wise.test.config.StaticConfig;
import vote.wise.test.docker.Setup;

import java.io.IOException;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SetupTests {
    private final Setup setup = new Setup();

    @TestFactory
    Iterable<DynamicTest> setupTests() {
        return Arrays.asList(
            dynamicTest("Init without error", () -> {
                setup.init();
                assertTrue(setup.getSetupPath().toFile().exists(), "Setup file exists");
            }),
            dynamicTest("Sets $PATH env", () -> {
                String out = setup.exec("echo $PATH");
                assertTrue(out.toLowerCase().contains("bin"));
            }),
            dynamicTest("Git cmd is on the path", () -> {
                String out = setup.exec( "git --version");
                assertTrue(out.toLowerCase().contains("git version"));
            }),
            dynamicTest("Config.sh is loaded in exec context", () -> {
                String out = setup.exec( "echo \"$WISETEST_CONFIG_LOADED\"");
                assertEquals(out.trim().toLowerCase(), "yes", "Output of echo $WISETEST_CONFIG_LOADED");
            }),
            dynamicTest("Config.sh is loaded in System.getenv context", () -> {
                assertEquals(System.getenv("WISETEST_CONFIG_LOADED"), "yes", "WISETEST_CONFIG_LOADED equals yes");
            }),
                dynamicTest("All ENV exists in System.getenv context", () -> {
                    for (Env e : Env.values()) {
                        assertTrue(e.get().length() > 0, e.name() + " has length > 0");
                    }
                }),
            dynamicTest("Cleans up the directory", () -> {
                setup.clean();
                assertFalse(setup.getSetupPath().toFile().exists(), "Setup file exists");
            })
        );
    }
}
