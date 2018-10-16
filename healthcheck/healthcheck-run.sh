#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}/.."

# Config: (generated based on wise.config.ts in wise-ci repository)
LOG_VOLUME="wise.test.logs" #§< 'LOG_VOLUME="' + data.config.test.healthcheck.log.dockerVolume + '"'
NODE_VERSION="9.11" #§< 'NODE_VERSION="' + d(data.config.npm.node.version) + '"'
WEBHOOK_FILE="/opt/wise/slackWebhook.url" #§< 'WEBHOOK_FILE="' + d(data.config.test.healthcheck.slack.webhookUrlFilePath) + '"'
if [ -f "${DIR}/slackWebhook.url" ]
then
  echo "Using local webhook file at ${DIR}/slackWebhook.url"
  WEBHOOK_FILE="${DIR}/slackWebhook.url"
fi



echo "Running healthcheck inside docker container"
docker run -w "/app" -v "${WEBHOOK_FILE}:/slackWebhook.url:ro" -v "${DIR}/..:/app:ro" -v "${LOG_VOLUME}:/logs" "node:${NODE_VERSION}" /app/healthcheck/healthcheck-entrypoint.sh
echo "Healthcheck run finished"
