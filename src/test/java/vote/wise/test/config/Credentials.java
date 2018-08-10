package vote.wise.test.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.tuple.Pair;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class Credentials {
    private static Map<String, String> credentialsMap = new HashMap<>();
    public static Pair<String, String> get(Role role) throws IOException {
        String loginEnvName = "WISE_TEST_" + role.name() + "_LOGIN";
        String passEnvName = "WISE_TEST_" + role.name() + "_PASSWORD";

        String loginEnv = System.getenv(loginEnvName);
        if (loginEnv != null && loginEnv.length() > 0) {
            String passEnv = System.getenv(passEnvName);
            if (passEnv.isEmpty()) throw new RuntimeException(loginEnvName + " env is present, but " + passEnvName + " is missing");
            else return Pair.of(loginEnv, passEnv);
        }
        else if(StaticConfig.CREDENTIALS_FILE_PATH.toFile().exists()) {
            if (credentialsMap.isEmpty()) {
                ObjectMapper om = new ObjectMapper();
                credentialsMap.putAll(
                        om.readValue(StaticConfig.CREDENTIALS_FILE_PATH.toFile(), new HashMap<String, String>().getClass())
                );
            }
            if (credentialsMap.containsKey(loginEnvName)) {
                if (!credentialsMap.containsKey(passEnvName)) throw new RuntimeException("In credentials json file: " + loginEnvName + " env is present, but " + passEnvName + " is missing");
                return Pair.of(credentialsMap.get(loginEnvName), credentialsMap.get(passEnvName));
            }
            else throw new RuntimeException("Credentials for role " + role.name() + " could not be loaded (missing " + loginEnvName + ")");
        }
        else {
            throw new RuntimeException("No source for credentials is present.");
        }
    }

    public static enum Role {
        STEEM_DELEGATOR_A, STEEM_DELEGATOR_B,
        STEEM_VOTER_A, STEEM_VOTER_B, STEEM_VOTER_C
    }
}
