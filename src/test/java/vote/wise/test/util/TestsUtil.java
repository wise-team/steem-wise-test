package vote.wise.test.util;

import com.google.common.io.Resources;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class TestsUtil {
    public static String readResource(Class<?> clazz, String path) throws IOException {
        return Resources.asCharSource(Resources.getResource(clazz, path), StandardCharsets.UTF_8).read();
    }
}
