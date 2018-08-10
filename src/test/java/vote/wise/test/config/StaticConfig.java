package vote.wise.test.config;

import java.nio.file.Path;
import java.nio.file.Paths;

public class StaticConfig {
    public static final Path CREDENTIALS_FILE_PATH = Paths.get(".", "credentials.json");
    public static final Path CONFIG_SH_PATH = Paths.get(".", "config.sh");
}
