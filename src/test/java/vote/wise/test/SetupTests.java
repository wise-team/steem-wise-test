package vote.wise.test;

import org.junit.jupiter.api.*;
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
            dynamicTest("Cleans up the directory", () -> {
                setup.clean();
                assertFalse(setup.getSetupPath().toFile().exists(), "Setup file exists");
            })
        );
    }
}
