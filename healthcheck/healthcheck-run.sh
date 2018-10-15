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

docker run -w "/app" -v "${DIR}/slackWebhook.url:/slackWebhook.url:ro" -v "${DIR}/..:/app:ro" -v "${LOG_VOLUME}:/logs" "node:${NODE_VERSION}" /app/healthcheck/healthcheck-entrypoint.sh \
##§ '' + d(data.config.docker.labels.defaultLabels).map(label => '  --label ' + label(data)).join(" \\\n") + '\n' §##  --label maintainer="The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>" \
  --label vote.wise.wise-version="1.2.2" \
  --label vote.wise.license="MIT" \
  --label vote.wise.repository="steem-wise-test"
##§ §.##

