package vote.wise.test.docker;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.google.common.base.Joiner;
import com.google.common.collect.Lists;
import com.google.common.io.CharStreams;
import com.google.common.io.MoreFiles;
import com.google.common.io.RecursiveDeleteOption;
import vote.wise.test.config.StaticConfig;

public class Setup {
    private final Path setupPath = Paths.get("build", "setup-" + System.currentTimeMillis());

    public Setup() {

    }

    public void init() throws IOException {
        if (!setupPath.toFile().exists()) {
            System.out.println("Creating " + setupPath);
            if (!setupPath.toAbsolutePath().toFile().mkdirs())
                throw new IOException("Could not create dirs: " + setupPath.toAbsolutePath().toString());
        }
    }

    public Path putFile(String filename, String contents) throws IOException {
        Path childPath = setupPath.resolve(filename);
        Files.write(childPath, contents.getBytes(StandardCharsets.UTF_8));
        return childPath;
    }

    public String exec(String cmd) throws IOException {
        if(!setupPath.toFile().exists()) throw new RuntimeException("Setup directory does not exist. Maybe you forgot to init?");

        List<String> cmdParts = new LinkedList<>();
        cmdParts.add("bash");
        cmdParts.add("-o");
        cmdParts.add("pipefail");
        cmdParts.add("-c");
        cmdParts.add(StaticConfig.CONFIG_SH_PATH.toString() + " && cd " + setupPath.toFile().getAbsolutePath() + " && " + cmd);

        String cmdStr = Joiner.on(" ").join(cmdParts.toArray());

        ProcessBuilder pb = new ProcessBuilder(cmdParts.toArray(new String [] {}));

        //pb.directory(setupPath.toFile().getAbsoluteFile());
        //pb.environment().put("PATH", System.getenv("PATH"));

        Process p = pb.start();
        BufferedReader osReader = new BufferedReader(new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8));
        BufferedReader esReader = new BufferedReader(new InputStreamReader(p.getErrorStream(), StandardCharsets.UTF_8));

        try {
            p.waitFor(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        if (p.isAlive()) {
            p.destroy();
            p.destroyForcibly();
            throw new IOException("Command '"+cmd+"' timeout. Process was destroyed forcibly.");
        }

        String stdOut = CharStreams.toString(osReader);
        String stdErr = CharStreams.toString(esReader);

        System.out.println("Setup exec $> '" + cmdStr + "'");
        System.out.println("STDOUT: '"+stdOut+"'");
        System.out.println("STDERR: '"+stdErr+"'");
        System.out.println("Exit code: " + p.exitValue());
        System.out.println();

        if (p.exitValue() != 0) throw new IOException("Process '"+cmd+"' exited with non-zero code: " + p.exitValue());

        return stdOut;
    }

    public void clean() throws IOException {
        MoreFiles.deleteRecursively(setupPath, RecursiveDeleteOption.ALLOW_INSECURE);
    }

    public Path getSetupPath() {
        return setupPath;
    }
}
