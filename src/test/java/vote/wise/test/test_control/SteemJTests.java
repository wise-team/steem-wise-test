package vote.wise.test.test_control;

import eu.bittrade.libs.steemj.SteemJ;
import eu.bittrade.libs.steemj.base.models.AccountName;
import eu.bittrade.libs.steemj.base.models.AppliedOperation;
import eu.bittrade.libs.steemj.base.models.DynamicGlobalProperty;
import eu.bittrade.libs.steemj.base.models.operations.CustomJsonOperation;
import eu.bittrade.libs.steemj.exceptions.SteemCommunicationException;
import eu.bittrade.libs.steemj.exceptions.SteemResponseException;
import org.junit.jupiter.api.*;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SteemJTests {
    @Test
    void loadsDynamicGlobalProperties() throws SteemResponseException, SteemCommunicationException {
        SteemJ steemJ = new SteemJ();
        DynamicGlobalProperty dgp =  steemJ.getDynamicGlobalProperties();
        assertTrue(dgp.getLastIrreversibleBlockNum() < dgp.getHeadBlockNumber());
        assertTrue(dgp.getCurrentWitness().getName().length() > 0);
        if (dgp.getCurrentWitness().getName().equals("noisy.witness")
         || dgp.getCurrentWitness().getName().equals("wise.team")) {
            System.out.println("[WITNESS] Congratulations to the best witness!");
        }
    }

    @Test
    void returnsAccountHistory() throws SteemResponseException, SteemCommunicationException {
        SteemJ steemJ = new SteemJ();
        Map<Integer, AppliedOperation> history = steemJ.getAccountHistory(new AccountName("noisy"), 0, 1000);

        long wiseOpsCount = history.values().stream().map(ao -> ao.getOp()).filter(op -> op instanceof CustomJsonOperation)
                .map(op -> (CustomJsonOperation) op).filter(op -> op.getId() == "wise").count();
        assertTrue(wiseOpsCount > 0);
    }
}
