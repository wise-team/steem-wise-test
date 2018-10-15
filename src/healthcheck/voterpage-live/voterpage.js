import { Selector } from "testcafe"; // first import testcafe selectors

if (!process.env.WISE_TEST_CONFIG) throw new Error("Wise test config is not available through WISE_TEST_CONFIG env");
const config = JSON.parse(process.env.WISE_TEST_CONFIG);

fixture("Voter page").page(config.voterPageUrl);

test("Page is loaded correctly", async t => {
    await t
        //.typeText("#developer-name", "John Smith")
        //.click("#submit-button")

        // Use the assertion to check if the actual header text is equal to the expected one
        .expect(Selector(".steemconnect-container span a").innerText).eql("login with SteemConnect");
});

test("Loads rulesets properly", async t => {
    await t
        .typeText("#username-input-voter-username", "steemprojects1")
        .typeText("#username-input-delegator-username", "steemprojects3")
        .expect(Selector(".load-ruleset-btn").innerText).eql("Load rules from @steemprojects3")
        .click(".load-ruleset-btn")
        .wait(2000)
        .expect(Selector(".load-ruleset-btn").innerText).eql("Load rules from @steemprojects3")

        // Use the assertion to check if the actual header text is equal to the expected one
        .expect(Selector(".steemconnect-container span a").innerText).eql("login with SteemConnect");
});

