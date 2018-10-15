export const config = {
    logFile: process.env.WISE_TEST_LOG_FILE || "",
    webhookUrlFile: "/slackWebhook.url", // remember we are inside a docker container
    mentions: /*§ '[' + d(data.config.test.healthcheck.slack.mentionUsers).map(mention => '"' + mention + '"').join(", ") + '], ' §*/["jblew"], /*§ §.*/
};