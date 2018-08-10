package vote.wise.test.docker;

import com.google.common.io.Files;
import com.palantir.docker.compose.DockerComposeRule;
import org.junit.jupiter.api.extension.*;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.Callable;
import java.util.logging.Logger;

import static com.palantir.docker.compose.connection.waiting.HealthChecks.toHaveAllPortsOpen;

public class DockerComposeLoaderExtension implements BeforeAllCallback, AfterAllCallback, ParameterResolver {
    private final Path temporaryComposePath = Paths.get("build", "tmp-docker-compose-" + System.currentTimeMillis()+".yml");
    private final Callable<String> composeFileFactory;
    private final DockerComposeRule.Builder dockerBuilder;
    private DockerComposeRule docker;

    public DockerComposeLoaderExtension(Callable<String> composeFileFactory, DockerComposeRule.Builder dockerBuilder) {
        this.composeFileFactory = composeFileFactory;
        this.dockerBuilder = dockerBuilder;
    }

    public void beforeAll(ExtensionContext extensionContext) throws Exception {
        String dockerComposeContents = composeFileFactory.call();
        Files.write(dockerComposeContents, temporaryComposePath.toFile(), StandardCharsets.UTF_8);
        // temporaryComposePath.toFile().deleteOnExit();
        this.docker = dockerBuilder.file(temporaryComposePath.toString()).build();
        Logger.getLogger(getClass().getName()).info("Starting docker...");
        docker.before();
        Logger.getLogger(getClass().getName()).info("Docker start done");
    }

    public void afterAll(ExtensionContext extensionContext) throws Exception {
        Logger.getLogger(getClass().getName()).info("Stopping docker");
        docker.after();
        Logger.getLogger(getClass().getName()).info("Stopping docker done");
    }

    public boolean supportsParameter(ParameterContext parameterContext, ExtensionContext extensionContext) throws ParameterResolutionException {
        return parameterContext.getParameter().getType().equals(DockerComposeRule.class);
    }

    public Object resolveParameter(ParameterContext parameterContext, ExtensionContext extensionContext) throws ParameterResolutionException {
        return docker;
    }

}