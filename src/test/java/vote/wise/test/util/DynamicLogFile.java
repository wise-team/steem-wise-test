package vote.wise.test.util;

import com.google.common.base.Joiner;
import org.apache.commons.io.input.Tailer;
import org.apache.commons.io.input.TailerListenerAdapter;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class DynamicLogFile {
    private static final long delayMillis = 100/* ms */;
    private final List<String> lines = new ArrayList<>();
    private final Tailer t;

    public DynamicLogFile(Path path) {
        t = new Tailer(path.toFile(), new TailerListenerAdapter() {
            public void handle(String line) {
                synchronized (lines) {
                    lines.add(line);
                }
            }
        } ,delayMillis);
    }

    public void stop() {
        t.stop();
    }

    public String getLastLine() {
        return lines.get(lines.size() - 1);
    }

    public String getFullLog() {
        synchronized (lines) {
            return Joiner.on("\n").join(lines);
        }
    }
}
