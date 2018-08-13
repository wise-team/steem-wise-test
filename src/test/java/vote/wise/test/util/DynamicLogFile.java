package vote.wise.test.util;

import com.google.common.base.Joiner;
import org.apache.commons.io.input.Tailer;
import org.apache.commons.io.input.TailerListenerAdapter;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

public class DynamicLogFile {
    private static final long delayMillis = 100/* ms */;
    private final List<String> lines = new ArrayList<>();
    private LogListener listener = null;

    private int checkpoint = 0;
    private final Tailer t;

    public DynamicLogFile(Path path) {
        t = new Tailer(path.toFile(), new TailerListenerAdapter() {
            public void handle(String line) {
                synchronized (lines) {
                    if (DynamicLogFile.this.listener != null) {
                        if (!DynamicLogFile.this.listener.line(line)) DynamicLogFile.this.listener = null;
                    }
                    System.out.println("[" + path.toString() + "]> "+ line);
                    lines.add(line);
                }
            }
        } ,delayMillis);
        Executors.newSingleThreadExecutor().execute(t);
    }

    public void stop() {
        t.stop();
    }

    public String getLastLine() {
        synchronized (lines) {
            return lines.get(lines.size() - 1);
        }
    }

    public String getLine(int num) {
        synchronized (lines) {
            return lines.get(num);
        }
    }

    public String [] getLogLinesSinceLine(int lineNum) {
        synchronized (lines) {
            return lines.stream().skip(lineNum).toArray(String[]::new);
        }
    }

    public String getLogSinceLine(int lineNum) {
        synchronized (lines) {
            return lines.stream().skip(lineNum).reduce("", (whole, line) -> whole + "\n" + line);
        }
    }

    public void markCheckpoint() {
        synchronized (lines) {
            this.checkpoint = this.getLineNum();
        }
    }

    public String [] getLogLinesSinceCheckpoint() {
        synchronized (lines) {
            return this.getLogLinesSinceLine(this.checkpoint);
        }
    }

    public String getLogSinceCheckpoint() {
        synchronized (lines) {
            return this.getLogSinceLine(this.checkpoint);
        }
    }

    public int getLineNum() {
        synchronized (lines) {
            return lines.size() - 1;
        }
    }

    public String getFullLog() {
        synchronized (lines) {
            return Joiner.on("\n").join(lines);
        }
    }

    public void setListener(LogListener listener) {
        synchronized (lines) {
            this.listener = listener;
        }
    }

    @FunctionalInterface
    public static interface LogListener {
        /**
         *
         * @param msg
         * @return if should receive next notifications, or is done.
         */
        boolean line(String msg);
    }
}
